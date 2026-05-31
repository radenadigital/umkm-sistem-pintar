import React, { useState, useMemo, useEffect } from 'react';
import { 
  Wallet, Plus, Download, FileText, ArrowUpRight, ArrowDownRight, 
  Printer, Search, Filter, Calendar, Edit2, Trash2, ArrowUpDown,
  PieChart, TrendingUp, DollarSign, Receipt, FileCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import RefreshButton from '../../components/ui/RefreshButton';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { cn, formatCurrency } from '../../lib/utils';
import ReceiptsTab from './components/ReceiptsTab';
import InvoicesTab from './components/InvoicesTab';
import { useDb } from '../../contexts/DatabaseContext';
import { useAuth } from '../../contexts/AuthContext';
import { Transaction } from '../../services/database';

const CATEGORIES = {
  Income: ['Penjualan', 'Investasi', 'Lainnya'],
  Expense: ['Operasional', 'Gaji', 'Sewa', 'Peralatan', 'Bahan Baku', 'Lainnya']
};

interface FinanceProps {
  openModal?: boolean;
  setOpenModal?: (open: boolean) => void;
}

export default function Finance({ openModal = false, setOpenModal }: FinanceProps) {
  const { db, updateTransactions } = useDb();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('transactions');
  const [transactions, setTransactions] = useState<Transaction[]>(db.transactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Income' | 'Expense'>('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [form, setForm] = useState({
    description: '',
    type: 'Income' as 'Income' | 'Expense',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Penjualan',
    status: 'Completed' as 'Completed' | 'Pending' | 'Cancelled'
  });

  // Watch for openModal prop changes
  useEffect(() => {
    if (openModal) {
      setIsModalOpen(true);
      setOpenModal?.(false);
    }
  }, [openModal, setOpenModal]);

  // Sync transactions to database
  useEffect(() => {
    updateTransactions(transactions);
  }, [transactions, updateTransactions]);

  // Load data from database on mount
  useEffect(() => {
    setTransactions(db.transactions);
  }, [db.transactions]);

  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
  };

  const handleOpenModal = (trx?: Transaction) => {
    if (trx) {
      setEditingTransaction(trx);
      setForm({
        description: trx.description,
        type: trx.type,
        amount: trx.amount.toString(),
        date: trx.date,
        category: trx.category,
        status: trx.status
      });
    } else {
      setEditingTransaction(null);
      setForm({
        description: '',
        type: 'Income',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: 'Penjualan',
        status: 'Completed'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trxData = {
      description: form.description,
      type: form.type,
      amount: Number(form.amount),
      date: form.date,
      category: form.category,
      status: form.status
    };

    if (editingTransaction) {
      setTransactions(prev => prev.map(t => t.id === editingTransaction.id ? { ...t, ...trxData } : t));
    } else {
      const newTrx: Transaction = {
        id: `TRX-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        userId: user?.id || '',
        ...trxData
      };
      setTransactions(prev => [newTrx, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus transaksi ini?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const totals = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'Income' && t.status === 'Completed')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter(t => t.type === 'Expense' && t.status === 'Completed')
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const filteredAndSorted = useMemo(() => {
    let result = transactions.filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           t.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'All' || t.type === filterType;
      const matchesCategory = filterCategory === 'All' || t.category === filterCategory;
      return matchesSearch && matchesType && matchesCategory;
    });

    result.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
    });

    return result;
  }, [transactions, searchTerm, filterType, filterCategory, sortBy, sortOrder]);

  const toggleSort = (key: 'date' | 'amount') => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="text-indigo-600" />
            Keuangan & Kas
          </h1>
          <p className="text-slate-500 text-sm">Pantau arus kas, buat invoice, dan catat pengeluaran bisnis Anda.</p>
        </div>
        <div className="flex items-center gap-3">
          <RefreshButton onRefresh={handleRefresh} />
          <div className="flex gap-3">
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all text-sm">
              <Download size={18} />
              Export
            </button>
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 text-sm"
            >
              <Plus size={18} />
              Transaksi Baru
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200 overflow-x-auto">
        {[
          { id: 'transactions', label: 'Transaksi' },
          { id: 'invoices', label: 'Faktur (Invoice)' },
          { id: 'receipts', label: 'Kuitansi' },
          { id: 'reports', label: 'Laporan Keuangan' },
          { id: 'tax', label: 'Perpajakan' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 text-sm font-bold transition-all relative ${
              activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="finTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
            )}
          </button>
        ))}
      </div>

      {activeTab === 'transactions' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <ArrowUpRight size={20} />
                </div>
                <p className="text-sm font-medium text-slate-500">Total Pendapatan</p>
              </div>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(totals.income)}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                  <ArrowDownRight size={20} />
                </div>
                <p className="text-sm font-medium text-slate-500">Total Pengeluaran</p>
              </div>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(totals.expense)}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Wallet size={20} />
                </div>
                <p className="text-sm font-medium text-slate-500">Saldo Akhir</p>
              </div>
              <p className={cn("text-2xl font-bold", totals.balance >= 0 ? "text-indigo-600" : "text-rose-600")}>
                {formatCurrency(totals.balance)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Cari transaksi atau ID..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                />
              </div>
              <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0">
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-slate-400" />
                  <select 
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-600 outline-none hover:bg-slate-50 transition-colors"
                  >
                    <option value="All">Semua Tipe</option>
                    <option value="Income">Pemasukan</option>
                    <option value="Expense">Pengeluaran</option>
                  </select>
                </div>
                <button 
                  onClick={() => toggleSort('date')}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition-colors border whitespace-nowrap",
                    sortBy === 'date' ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <Calendar size={14} />
                  Tanggal {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                <button 
                  onClick={() => toggleSort('amount')}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition-colors border whitespace-nowrap",
                    sortBy === 'amount' ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <ArrowUpDown size={14} />
                  Nominal {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
              </div>
            </div>
            
            {transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider font-bold">
                      <th className="px-6 py-4">Transaksi</th>
                      <th className="px-6 py-4">Kategori</th>
                      <th className="px-6 py-4">Jumlah</th>
                      <th className="px-6 py-4">Tanggal</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAndSorted.map((trx) => (
                      <tr key={trx.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-bold text-slate-900">{trx.description}</p>
                            <p className="text-[10px] font-mono text-slate-400">{trx.id}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold uppercase">
                            {trx.category}
                          </span>
                        </td>
                        <td className={cn(
                          "px-6 py-4 font-bold",
                          trx.type === 'Income' ? 'text-emerald-600' : 'text-rose-600'
                        )}>
                          {trx.type === 'Income' ? '+' : '-'} {formatCurrency(trx.amount)}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">{trx.date}</td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider",
                            trx.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                            trx.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                            'bg-rose-100 text-rose-700'
                          )}>
                            {trx.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleOpenModal(trx)}
                              className="p-1.5 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors" 
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(trx.id)}
                              className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors" 
                              title="Hapus"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState 
                icon={Wallet}
                title="Buku Kas Masih Kosong"
                description="Catat transaksi penjualan atau pengeluaran pertama Anda untuk mulai memantau arus kas bisnis."
                action={
                  <button 
                    onClick={() => handleOpenModal()}
                    className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                  >
                    Buat Transaksi Baru
                  </button>
                }
              />
            )}
          </div>
        </div>
      ) : activeTab === 'invoices' ? (
        <InvoicesTab />
      ) : activeTab === 'receipts' ? (
        <ReceiptsTab />
      ) : activeTab === 'reports' ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Laba Bersih</p>
              <p className={cn("text-xl font-bold", totals.balance >= 0 ? "text-emerald-600" : "text-rose-600")}>
                {formatCurrency(totals.balance)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Pemasukan</p>
              <p className="text-xl font-bold text-slate-900">{formatCurrency(totals.income)}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Pengeluaran</p>
              <p className="text-xl font-bold text-slate-900">{formatCurrency(totals.expense)}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Efisiensi Biaya</p>
              <p className="text-xl font-bold text-slate-900">
                {totals.income > 0 ? Math.round(((totals.income - totals.expense) / totals.income) * 100) : 0}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <PieChart size={18} className="text-indigo-600" />
                  Alokasi Pengeluaran
                </h3>
              </div>
              <div className="space-y-4">
                {CATEGORIES.Expense.map((cat) => {
                  const amount = transactions
                    .filter(t => t.category === cat && t.type === 'Expense')
                    .reduce((sum, t) => sum + t.amount, 0);
                  const percentage = totals.expense > 0 ? Math.round((amount / totals.expense) * 100) : 0;
                  
                  if (amount === 0) return null;

                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-600">{cat}</span>
                        <span className="text-slate-900">{formatCurrency(amount)}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {transactions.filter(t => t.type === 'Expense').length === 0 && (
                  <p className="text-center py-8 text-slate-400 text-sm italic">Belum ada data pengeluaran</p>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <TrendingUp size={18} className="text-emerald-600" />
                  Sumber Pendapatan
                </h3>
              </div>
              <div className="space-y-4">
                {CATEGORIES.Income.map((cat) => {
                  const amount = transactions
                    .filter(t => t.category === cat && t.type === 'Income')
                    .reduce((sum, t) => sum + t.amount, 0);
                  const percentage = totals.income > 0 ? Math.round((amount / totals.income) * 100) : 0;
                  
                  if (amount === 0) return null;

                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-600">{cat}</span>
                        <span className="text-slate-900">{formatCurrency(amount)}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {transactions.filter(t => t.type === 'Income').length === 0 && (
                  <p className="text-center py-8 text-slate-400 text-sm italic">Belum ada data pendapatan</p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
                <Receipt size={32} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Estimasi Kewajiban Pajak</h2>
                <p className="text-slate-500 text-sm">Ringkasan perhitungan pajak berdasarkan data transaksi Anda.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-2xl">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Basis Pajak (Pendapatan)</p>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(totals.income)}</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Estimasi PPh Final (0.5%)</span>
                    <span className="font-bold text-slate-900">{formatCurrency(totals.income * 0.005)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600">Estimasi PPN (Jika PKP)</span>
                    <span className="font-bold text-slate-900">{formatCurrency(totals.income * 0.11)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-600 p-8 rounded-3xl text-white relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-sm font-medium opacity-80 mb-2">Pajak yang Harus Disetor</p>
                  <p className="text-4xl font-bold mb-6">{formatCurrency(totals.income * 0.005)}</p>
                  <button className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold text-sm shadow-xl shadow-indigo-900/20 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                    <Download size={18} />
                    Download Laporan Pajak
                  </button>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
                  <FileText size={160} />
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-4">
              <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                <FileText size={20} />
              </div>
              <p className="text-sm text-amber-800 leading-relaxed">
                <span className="font-bold">Penting:</span> Perhitungan di atas adalah estimasi sederhana berdasarkan PP No. 23 Tahun 2018 untuk UMKM. Silakan konsultasikan dengan ahli pajak untuk perhitungan yang lebih akurat.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingTransaction ? "Edit Transaksi" : "Transaksi Baru"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Deskripsi / Keterangan</label>
              <input 
                required
                type="text" 
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                placeholder="Misal: Penjualan Kopi, Pembayaran Listrik"
                className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Tipe Transaksi</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForm({...form, type: 'Income', category: CATEGORIES.Income[0]})}
                  className={cn(
                    "py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all",
                    form.type === 'Income' ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-500" : "bg-slate-100 text-slate-500 border-2 border-transparent"
                  )}
                >
                  <ArrowUpRight size={14} />
                  Pemasukan
                </button>
                <button
                  type="button"
                  onClick={() => setForm({...form, type: 'Expense', category: CATEGORIES.Expense[0]})}
                  className={cn(
                    "py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all",
                    form.type === 'Expense' ? "bg-rose-100 text-rose-700 border-2 border-rose-500" : "bg-slate-100 text-slate-500 border-2 border-transparent"
                  )}
                >
                  <ArrowDownRight size={14} />
                  Pengeluaran
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nominal</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">Rp</span>
                <input 
                  required
                  type="number" 
                  value={form.amount}
                  onChange={e => setForm({...form, amount: e.target.value})}
                  placeholder="0"
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Kategori</label>
              <select 
                value={form.category}
                onChange={e => setForm({...form, category: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
              >
                {CATEGORIES[form.type].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Tanggal</label>
              <input 
                required
                type="date" 
                value={form.date}
                onChange={e => setForm({...form, date: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 py-3 text-slate-600 font-bold text-sm bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all"
            >
              Batal
            </button>
            <button 
              type="submit"
              className="flex-1 py-3 text-white font-bold text-sm bg-indigo-600 hover:bg-indigo-700 rounded-2xl transition-all shadow-lg shadow-indigo-200"
            >
              {editingTransaction ? "Simpan Perubahan" : "Simpan Transaksi"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

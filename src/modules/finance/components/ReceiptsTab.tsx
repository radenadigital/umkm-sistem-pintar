import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, Search, Filter, Printer, Download, Edit2, Trash2, 
  Receipt, Calendar, User, DollarSign, FileText, CheckCircle2, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { APP_NAME } from '../../../constants';
import { cn, formatCurrency } from '../../../lib/utils';
import { exportToJSON, exportToCSV, exportToExcel, exportToPDF } from '../../../lib/export';
import RefreshButton from '../../../components/ui/RefreshButton';
import EmptyState from '../../../components/ui/EmptyState';
import Modal from '../../../components/ui/Modal';
import { useDb } from '../../../contexts/DatabaseContext';
import { useAuth } from '../../../contexts/AuthContext';
import { ReceiptData } from '../../../services/database';

export default function ReceiptsTab() {
  const { db, updateReceipts } = useDb();
  const { user } = useAuth();
  const INITIAL_RECEIPTS: ReceiptData[] = [];

  const [receipts, setReceipts] = useState<ReceiptData[]>(db.receipts);

  // Sync receipts to database
  useEffect(() => {
    updateReceipts(receipts);
  }, [receipts, updateReceipts]);

  // Load data from database on mount
  useEffect(() => {
    setReceipts(db.receipts);
  }, [db.receipts]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const [editingReceipt, setEditingReceipt] = useState<ReceiptData | null>(null);
  
  const [form, setForm] = useState({
    receiptNumber: `KUI/2026/05/${(receipts.length + 1).toString().padStart(3, '0')}`,
    date: new Date().toISOString().split('T')[0],
    customerName: '',
    amount: '',
    description: '',
    receivedFrom: '',
    paymentMethod: 'Transfer Bank'
  });

  const handleRefresh = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const filteredReceipts = useMemo(() => {
    return receipts.filter(r => 
      r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [receipts, searchTerm]);

  const handleOpenModal = (receipt?: ReceiptData) => {
    if (receipt) {
      setEditingReceipt(receipt);
      setForm({
        receiptNumber: receipt.receiptNumber,
        date: receipt.date,
        customerName: receipt.customerName,
        amount: receipt.amount.toString(),
        description: receipt.description,
        receivedFrom: receipt.receivedFrom,
        paymentMethod: receipt.paymentMethod
      });
    } else {
      setEditingReceipt(null);
      setForm({
        receiptNumber: `KUI/2026/05/${(receipts.length + 1).toString().padStart(3, '0')}`,
        date: new Date().toISOString().split('T')[0],
        customerName: '',
        amount: '',
        description: '',
        receivedFrom: '',
        paymentMethod: 'Transfer Bank'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: ReceiptData = {
      id: editingReceipt?.id || `RCP-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      userId: user?.id || '',
      receiptNumber: form.receiptNumber,
      date: form.date,
      customerName: form.customerName,
      amount: Number(form.amount),
      description: form.description,
      receivedFrom: form.receivedFrom,
      paymentMethod: form.paymentMethod
    };

    if (editingReceipt) {
      setReceipts(prev => prev.map(r => r.id === editingReceipt.id ? data : r));
    } else {
      setReceipts(prev => [data, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus kuitansi ini?')) {
      setReceipts(prev => prev.filter(r => r.id !== id));
    }
  };

  const handlePreview = (receipt: ReceiptData) => {
    setSelectedReceipt(receipt);
    setIsPreviewOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Cari kuitansi, nama, atau deskripsi..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
            />
          </div>
          <RefreshButton onRefresh={handleRefresh} />
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all text-sm">
              <Download size={18} />
              Export
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <button
                onClick={() => exportToJSON(receipts, `kuitansi-${new Date().toISOString().split('T')[0]}.json`)}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <span>📄</span> Export JSON
              </button>
              <button
                onClick={() => exportToCSV(receipts, `kuitansi-${new Date().toISOString().split('T')[0]}.csv`)}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <span>📊</span> Export CSV
              </button>
              <button
                onClick={() => exportToExcel(receipts, `kuitansi-${new Date().toISOString().split('T')[0]}.xlsx`, 'Kuitansi')}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <span>📈</span> Export Excel
              </button>
              <button
                onClick={() => exportToPDF(receipts, `kuitansi-${new Date().toISOString().split('T')[0]}.pdf`, 'Laporan Kuitansi')}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <span>📋</span> Export PDF
              </button>
            </div>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 text-sm"
          >
            <Plus size={18} />
            Buat Kuitansi
          </button>
        </div>
      </div>

      {filteredReceipts.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider font-bold">
                  <th className="px-6 py-4">Nomor & Tanggal</th>
                  <th className="px-6 py-4">Nama Pelanggan</th>
                  <th className="px-6 py-4">Keterangan</th>
                  <th className="px-6 py-4">Nominal</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReceipts.map((receipt) => (
                  <tr key={receipt.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{receipt.receiptNumber}</p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Calendar size={10} />
                          {receipt.date}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-slate-400" />
                        <span className="text-sm font-medium text-slate-700">{receipt.customerName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-500 line-clamp-1">{receipt.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-emerald-600">
                        {formatCurrency(receipt.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handlePreview(receipt)}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors" 
                          title="Preview & Cetak"
                        >
                          <Printer size={16} />
                        </button>
                        <button 
                          onClick={() => handleOpenModal(receipt)}
                          className="p-1.5 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors" 
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(receipt.id)}
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
        </div>
      ) : (
        <EmptyState 
          icon={Receipt}
          title="Belum Ada Kuitansi"
          description="Buat kuitansi profesional untuk setiap pembayaran yang Anda terima dari pelanggan."
          action={
            <button 
              onClick={() => handleOpenModal()}
              className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all"
            >
              Buat Kuitansi Pertama
            </button>
          }
        />
      )}

      {/* Form Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingReceipt ? "Edit Kuitansi" : "Buat Kuitansi Baru"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nomor Kuitansi</label>
              <input 
                required
                type="text" 
                value={form.receiptNumber}
                onChange={e => setForm({...form, receiptNumber: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Tanggal</label>
              <input 
                required
                type="date" 
                value={form.date}
                onChange={e => setForm({...form, date: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Sudah Terima Dari</label>
              <input 
                required
                type="text" 
                value={form.receivedFrom}
                onChange={e => setForm({...form, receivedFrom: e.target.value})}
                placeholder="Nama pihak yang membayar"
                className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nama Pelanggan (Untuk Arsip)</label>
              <input 
                required
                type="text" 
                value={form.customerName}
                onChange={e => setForm({...form, customerName: e.target.value})}
                placeholder="Nama pelanggan di sistem"
                className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
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
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Metode Pembayaran</label>
              <select 
                value={form.paymentMethod}
                onChange={e => setForm({...form, paymentMethod: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
              >
                <option value="Transfer Bank">Transfer Bank</option>
                <option value="Tunai">Tunai</option>
                <option value="E-Wallet">E-Wallet</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Untuk Pembayaran</label>
              <textarea 
                required
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                placeholder="Deskripsi pembayaran..."
                className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[100px]"
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
              {editingReceipt ? "Simpan Perubahan" : "Simpan Kuitansi"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Preview Modal */}
      <Modal 
        isOpen={isPreviewOpen} 
        onClose={() => setIsPreviewOpen(false)} 
        title="Pratinjau Kuitansi"
        maxWidth="max-w-4xl"
      >
        {selectedReceipt && (
          <div className="space-y-8">
            <div id="receipt-print-area" className="bg-white p-8 border-4 border-slate-100 rounded-sm relative overflow-hidden print:border-none print:p-0">
              {/* Receipt Design */}
              <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600" />
              
              <div className="flex justify-between items-start mb-12">
                <div>
                  <h2 className="text-4xl font-serif font-bold text-indigo-900 tracking-widest uppercase">Kuitansi</h2>
                  <p className="text-slate-400 font-mono text-sm">Official Payment Receipt</p>
                </div>
                <div className="text-right">
                  <div className="bg-slate-50 p-4 border border-slate-100 rounded-lg inline-block">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">No. Kuitansi</p>
                    <p className="text-lg font-mono font-bold text-slate-800">{selectedReceipt.receiptNumber}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex border-b border-dotted border-slate-300 pb-2">
                  <span className="w-48 text-sm text-slate-500 italic">Sudah terima dari :</span>
                  <span className="flex-1 text-lg font-bold text-slate-800 border-b border-slate-200">{selectedReceipt.receivedFrom}</span>
                </div>
                
                <div className="flex border-b border-dotted border-slate-300 pb-2">
                  <span className="w-48 text-sm text-slate-500 italic">Jumlah Uang :</span>
                  <div className="flex-1 bg-indigo-50 px-4 py-2 rounded-lg">
                    <span className="text-xl font-bold text-indigo-700">{formatCurrency(selectedReceipt.amount)}</span>
                  </div>
                </div>

                <div className="flex border-b border-dotted border-slate-300 pb-2">
                  <span className="w-48 text-sm text-slate-500 italic">Untuk Pembayaran :</span>
                  <span className="flex-1 text-sm text-slate-700 leading-relaxed min-h-[60px]">{selectedReceipt.description}</span>
                </div>
              </div>

              <div className="mt-16 flex justify-between items-end">
                <div className="text-center px-8">
                  <p className="text-xs text-slate-400 mb-1">Metode Pembayaran</p>
                  <p className="text-sm font-bold text-slate-700 uppercase tracking-wider">{selectedReceipt.paymentMethod}</p>
                </div>
                <div className="text-center w-64 border-t border-slate-200 pt-4">
                  <p className="text-sm text-slate-500 mb-12">Jakarta, {selectedReceipt.date}</p>
                  <div className="h-20" /> {/* Space for signature */}
                  <p className="font-bold text-slate-900 border-b border-slate-900 inline-block px-4 underline underline-offset-8">Bagian Keuangan</p>
                </div>
              </div>

              <div className="mt-12 pt-6 border-t border-slate-100 flex justify-between items-center opacity-50">
                <p className="text-[10px] text-slate-400">Dicetak melalui {APP_NAME} Dashboard</p>
                <div className="flex gap-2">
                  <div className="w-4 h-4 rounded-full bg-slate-200" />
                  <div className="w-4 h-4 rounded-full bg-slate-300" />
                  <div className="w-4 h-4 rounded-full bg-slate-400" />
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end no-print">
              <button 
                onClick={() => setIsPreviewOpen(false)}
                className="px-6 py-2.5 text-slate-600 font-bold text-sm bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              >
                Tutup
              </button>
              <button 
                onClick={handlePrint}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 text-sm"
              >
                <Printer size={18} />
                Cetak Kuitansi
              </button>
              <button 
                className="flex items-center gap-2 px-6 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all text-sm"
              >
                <Download size={18} />
                PDF
              </button>
            </div>
          </div>
        )}
      </Modal>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-print-area, #receipt-print-area * {
            visibility: visible;
          }
          #receipt-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />
    </div>
  );
}

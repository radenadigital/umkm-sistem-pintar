import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  Star, 
  UserPlus, 
  Filter, 
  Edit2, 
  Trash2,
  Gift,
  Coins,
  Trophy,
  Award,
  Sparkles,
  Check,
  Send,
  ArrowRight,
  ShieldCheck,
  MessageSquare,
  AlertCircle,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import EmptyState from '../../components/ui/EmptyState';
import RefreshButton from '../../components/ui/RefreshButton';
import Modal from '../../components/ui/Modal';
import { cn } from '../../lib/utils';
import { exportToJSON, exportToCSV, exportToExcel, exportToPDF } from '../../lib/export';
import { useDb } from '../../contexts/DatabaseContext';
import { useAuth } from '../../contexts/AuthContext';
import { Customer } from '../../services/database';

const initialCustomers: Customer[] = [];

interface Reward {
  id: string;
  name: string;
  cost: number;
  description: string;
  category: string;
}

const REWARDS_CATALOG: Reward[] = [
  { id: 'r1', name: 'Voucher Potongan Rp 15.000', cost: 150, description: 'Potongan potongan instan Rp 15.000 tanpa batas minimum belanja', category: 'Voucher Belanja' },
  { id: 'r2', name: 'Voucher Diskon 10% (Maks Rp 50.000)', cost: 300, description: 'Diskon 10% untuk transaksi grosir atau eceran', category: 'Diskon Persen' },
  { id: 'r3', name: 'Subsidi Ongkir Seluruh Indonesia', cost: 100, description: 'Free ongkir hingga Rp 20.000 untuk pengiriman luar kota', category: 'Free Ongkir' },
  { id: 'r4', name: 'Exclusive Hampers UMKM Pack', cost: 1000, description: 'Hadiah eksklusif merchandise premium (Mug, Kaos, & Totebag)', category: 'Hadiah Fisik' }
];

export default function Customers() {
  const { db, updateCustomers } = useDb();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('list');
  const [customers, setCustomers] = useState<Customer[]>(db.customers);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState<string>('All');

  // Sync customers to database
  useEffect(() => {
    updateCustomers(customers);
  }, [customers, updateCustomers]);

  // Load data from database on mount
  useEffect(() => {
    setCustomers(db.customers);
  }, [db.customers]);
  
  // Modals for CRUD Customers
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });

  // Loyalty Program States
  const [pointRate, setPointRate] = useState(10000); // Rp 10.000 = 1 Poin
  const [selectedCustForPoints, setSelectedCustForPoints] = useState<string>('');
  const [pointsInputValue, setPointsInputValue] = useState<string>('');
  const [pointsRateInput, setPointsRateInput] = useState<string>('10000');
  const [isRateEditing, setIsRateEditing] = useState(false);
  const [redemptionSuccessMsg, setRedemptionSuccessMsg] = useState<string | null>(null);
  
  // Custom Segmentation States
  const [activeSegmentId, setActiveSegmentId] = useState<string>('all');
  const [broadcastTargetSegment, setBroadcastTargetSegment] = useState<string>('all');
  const [broadcastMessage, setBroadcastMessage] = useState<string>('');
  const [broadcastType, setBroadcastType] = useState<'WhatsApp' | 'Email'>('WhatsApp');
  const [isBroadcastSending, setIsBroadcastSending] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setCustomerForm({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        notes: customer.notes
      });
    } else {
      setEditingCustomer(null);
      setCustomerForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const calculateTier = (points: number): 'Gold' | 'Silver' | 'Bronze' => {
    if (points >= 1000) return 'Gold';
    if (points >= 300) return 'Silver';
    return 'Bronze';
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      setCustomers(prev => prev.map(c => {
        if (c.id === editingCustomer.id) {
          const updatedPoints = c.points;
          return {
            ...c,
            ...customerForm,
            category: c.category, // tetap simpan kategori yang sudah ada
            tier: calculateTier(updatedPoints)
          };
        }
        return c;
      }));
    } else {
      const newCustomer: Customer = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user?.id || '',
        ...customerForm,
        category: 'Retail', // default kategori untuk pelanggan baru
        totalOrders: 0,
        lastOrder: '-',
        tier: 'Bronze',
        points: 0
      };
      setCustomers(prev => [newCustomer, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteCustomer = (id: string) => {
    if (confirm('Hapus data pelanggan ini?')) {
      setCustomers(prev => prev.filter(c => c.id !== id));
    }
  };

  // Add Points Logic (from purchase conversion)
  const handleAddPointsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustForPoints) {
      alert('Silakan pilih pelanggan terlebih dahulu.');
      return;
    }
    const pointsToAdd = parseInt(pointsInputValue);
    if (isNaN(pointsToAdd) || pointsToAdd <= 0) {
      alert('Silakan masukkan jumlah poin yang valid.');
      return;
    }

    setCustomers(prev => prev.map(c => {
      if (c.id === selectedCustForPoints) {
        const nextPoints = c.points + pointsToAdd;
        return {
          ...c,
          points: nextPoints,
          tier: calculateTier(nextPoints)
        };
      }
      return c;
    }));

    // Trigger Success Notification Or Alert
    const name = customers.find(c => c.id === selectedCustForPoints)?.name || '';
    alert(`Berhasil menambahkan ${pointsToAdd} Poin untuk ${name}!`);
    setPointsInputValue('');
  };

  // Redeem Reward Logic
  const handleRedeemReward = (customerId: string, reward: Reward) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    if (customer.points < reward.cost) {
      alert(`Poin ${customer.name} tidak mencukupi untuk menukar ${reward.name}. Butuh ${reward.cost} poin.`);
      return;
    }

    setCustomers(prev => prev.map(c => {
      if (c.id === customerId) {
        const nextPoints = c.points - reward.cost;
        return {
          ...c,
          points: nextPoints,
          tier: calculateTier(nextPoints)
        };
      }
      return c;
    }));

    setRedemptionSuccessMsg(
      `Selamat! ${customer.name} berhasil menukarkan ${reward.cost} poin dengan "${reward.name}". Kode voucher unik telah dikirim!`
    );
    setTimeout(() => setRedemptionSuccessMsg(null), 8000);
  };

  // Segmentations categories calculations
  const segmentsList = [
    {
      id: 'all',
      name: 'Semua Pelanggan',
      criteria: 'Semua pelanggan dalam database',
      count: customers.length,
      icon: Users,
      colorClass: 'bg-indigo-50 border-indigo-200 text-indigo-700'
    },
    {
      id: 'gold_tier',
      name: 'Pelanggan Setia (Gold)',
      criteria: 'Memiliki akumulasi poin > 1000',
      count: customers.filter(c => c.points >= 1000).length,
      icon: Award,
      colorClass: 'bg-amber-50 border-amber-200 text-amber-700'
    },
    {
      id: 'active_shopper',
      name: 'Pembeli Aktif (Order 5x+)',
      criteria: 'Melakukan transaksi minimum 5 kali',
      count: customers.filter(c => c.totalOrders >= 5).length,
      icon: Coins,
      colorClass: 'bg-rose-50 border-rose-200 text-rose-700'
    }
  ];

  // Filtering based on active customer list
  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.phone.includes(searchTerm);
    const matchesTier = filterTier === 'All' || c.tier === filterTier;
    return matchesSearch && matchesTier;
  });

  // Calculate filtered members of specifically active segment tab
  const getSegmentCustomers = (segmentId: string) => {
    switch (segmentId) {
      case 'gold_tier':
        return customers.filter(c => c.points >= 1000);
      case 'active_shopper':
        return customers.filter(c => c.totalOrders >= 5);
      default:
        return customers;
    }
  };

  const activeSegmentCustomers = getSegmentCustomers(activeSegmentId);

  // Broadcast Message Trigger
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    setIsBroadcastSending(true);
    setBroadcastSuccess(false);

    setTimeout(() => {
      setIsBroadcastSending(false);
      setBroadcastSuccess(true);
      setBroadcastMessage('');
      setTimeout(() => setBroadcastSuccess(false), 5000);
    }, 1500);
  };

  const loyalCount = customers.filter(c => c.tier === 'Gold').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="text-indigo-600" />
            CRM & Loyalitas
          </h1>
          <p className="text-slate-500">Bangun loyalitas pembeli dan optimalkan segmentasi program promosi Anda.</p>
        </div>
        <div className="flex items-center gap-3">
          <RefreshButton onRefresh={handleRefresh} />
          <div className="relative group">
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all text-sm">
              <Download size={18} />
              Export
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <button
                onClick={() => exportToJSON(customers, `pelanggan-${new Date().toISOString().split('T')[0]}.json`)}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <span>📄</span> Export JSON
              </button>
              <button
                onClick={() => exportToCSV(customers, `pelanggan-${new Date().toISOString().split('T')[0]}.csv`)}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <span>📊</span> Export CSV
              </button>
              <button
                onClick={() => exportToExcel(customers, `pelanggan-${new Date().toISOString().split('T')[0]}.xlsx`, 'Pelanggan')}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <span>📈</span> Export Excel
              </button>
              <button
                onClick={() => exportToPDF(customers, `pelanggan-${new Date().toISOString().split('T')[0]}.pdf`, 'Laporan Pelanggan')}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <span>📋</span> Export PDF
              </button>
            </div>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 text-sm"
          >
            <UserPlus size={18} />
            Tambah Pelanggan
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        {[
          { id: 'list', label: 'Database Pelanggan' },
          { id: 'loyalty', label: 'Loyalty Program' },
          { id: 'segments', label: 'Segmentasi Cerdas' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 text-sm font-bold transition-all relative ${
              activeTab === tab.id ? 'text-indigo-900 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENT TAB 1: CUSTOMERS LIST */}
      {activeTab === 'list' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Users size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Pelanggan</p>
                <p className="text-2xl font-bold text-slate-900">{customers.length}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <Star size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tingkat Gold (Loyal)</p>
                <p className="text-2xl font-bold text-slate-900">{loyalCount}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Coins size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Terkumpul Poin</p>
                <p className="text-2xl font-bold text-slate-900">
                  {customers.reduce((acc, curr) => acc + curr.points, 0).toLocaleString()} Poin
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative max-w-sm flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Cari nama, email, atau telepon..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-slate-400" />
                <select 
                  value={filterTier}
                  onChange={(e) => setFilterTier(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-600 outline-none hover:bg-slate-50 transition-colors"
                >
                  <option value="All">Semua Tier</option>
                  <option value="Gold">Gold</option>
                  <option value="Silver">Silver</option>
                  <option value="Bronze">Bronze</option>
                </select>
              </div>
            </div>

            {filteredCustomers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider font-bold">
                      <th className="px-6 py-4">Nama Pelanggan</th>
                      <th className="px-6 py-4">Kontak</th>
                      <th className="px-6 py-4">Akumulasi Poin</th>
                      <th className="px-6 py-4">Tier</th>
                      <th className="px-6 py-4">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{customer.name}</div>
                          <div className="text-xs text-slate-400">ID: CUST-{customer.id}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <Mail size={12} className="text-slate-400" /> {customer.email || '-'}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <Phone size={12} className="text-slate-400" /> {customer.phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                            <Coins size={14} className="text-amber-500" />
                            {customer.points.toLocaleString()} Poin
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                            customer.tier === 'Gold' ? 'bg-amber-100 text-amber-700' :
                            customer.tier === 'Silver' ? 'bg-slate-100 text-slate-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {customer.tier}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleOpenModal(customer)}
                              className="p-1.5 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteCustomer(customer.id)}
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
                icon={Users}
                title="Sistem tidak menemukan pencarian Anda"
                description="Coba gunakan kata kunci lain atau tambah pelanggan baru ke dashboard."
              />
            )}
          </div>
        </div>
      )}

      {/* CONTENT TAB 2: LOYALTY PROGRAM */}
      {activeTab === 'loyalty' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Rewards Success Container */}
          <AnimatePresence>
            {redemptionSuccessMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex gap-3 text-emerald-850 items-start shadow-sm"
              >
                <ShieldCheck className="text-emerald-500 mt-1 shrink-0" size={20} />
                <div>
                  <h4 className="font-bold text-emerald-900 text-sm">Penukaran Poin Sukses!</h4>
                  <p className="text-xs text-emerald-700 mt-0.5">{redemptionSuccessMsg}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Conversion Rule Configuration */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                <Trophy size={18} className="text-indigo-600" />
                <span>Aturan Pembagian Poin</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tentukan rasio belanja untuk dikonversikan menjadi poin loyalitas pelanggan secara otomatis.
              </p>

              <div className="p-4 bg-slate-50 rounded-xl space-y-3 border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">Poin Rasio</span>
                  {!isRateEditing ? (
                    <button 
                      onClick={() => {
                        setPointsRateInput(pointRate.toString());
                        setIsRateEditing(true);
                      }}
                      className="text-xs text-indigo-600 font-bold hover:underline"
                    >
                      Ubah Aturan
                    </button>
                  ) : null}
                </div>
                
                {isRateEditing ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-600">Rp</span>
                      <input 
                        type="number" 
                        value={pointsRateInput}
                        onChange={(e) => setPointsRateInput(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none"
                        placeholder="10000"
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button 
                        onClick={() => setIsRateEditing(false)}
                        className="text-[10px] px-2.5 py-1 text-slate-500 bg-white border border-slate-200 rounded"
                      >
                        Batal
                      </button>
                      <button 
                        onClick={() => {
                          const parsed = parseInt(pointsRateInput);
                          if (!isNaN(parsed) && parsed > 0) {
                            setPointRate(parsed);
                            setIsRateEditing(false);
                          }
                        }}
                        className="text-[10px] px-2.5 py-1 text-white bg-indigo-600 rounded font-bold"
                      >
                        Simpan
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-lg font-black text-slate-900">
                    Rp {pointRate.toLocaleString()} = <span className="text-indigo-600">1 Poin</span>
                  </p>
                )}
              </div>

              {/* Threshold Rule Details */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Level Keanggotaan</span>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Gold Tier</span>
                    <span className="font-bold text-slate-700">&gt;= 1.000 Poin</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">Silver Tier</span>
                    <span className="font-bold text-slate-700">300 - 999 Poin</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">Bronze Tier</span>
                    <span className="font-bold text-slate-700">&lt; 300 Poin</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Points Award Manager */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 lg:col-span-2">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                <Coins size={18} className="text-indigo-600" />
                <span>Simulasi atau Input Poin Manual</span>
              </div>
              <p className="text-xs text-slate-500">
                Gunakan formulir ini untuk memberikan poin loyalitas secara manual bila ada transaksi luar aplikasi.
              </p>

              <form onSubmit={handleAddPointsSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 block">Pilih Pelanggan</label>
                  <select
                    value={selectedCustForPoints}
                    onChange={(e) => setSelectedCustForPoints(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold"
                  >
                    <option value="">-- Pilih Anggota CRM --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} (Poin saat ini: {c.points} - {c.tier})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 col-span-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 block">Tambah Jumlah Poin</label>
                  <div className="flex gap-2">
                    <input 
                      type="number"
                      required
                      placeholder="Contoh: 50"
                      value={pointsInputValue}
                      onChange={(e) => setPointsInputValue(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-semibold"
                    />
                    <button 
                      type="submit"
                      className="px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                    >
                      Kredit Poin
                    </button>
                  </div>
                </div>
              </form>

              <div className="p-3 bg-amber-50 rounded-xl text-[11px] text-amber-800 flex gap-2 items-start border border-amber-100">
                <AlertCircle size={14} className="mt-0.5 text-amber-600 shrink-0" />
                <span>
                  Tip: Tier (Bronze/Silver/Gold) pelanggan diupdate secara real-time sesaat setelah points diinputkan secara manual maupun melalui konversi belanja program kasir otomatis.
                </span>
              </div>
            </div>
          </div>

          {/* Reward voucher list for testing redemption */}
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Gift className="text-indigo-600 animate-bounce" size={20} />
                Katalog Katalog Penukaran Hadiah UMKM
              </h3>
              <p className="text-slate-500 text-xs">Pilih pelanggan di bawah katalog hadiah untuk langsung mensimulasikan penukaran voucher dengan poin.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {REWARDS_CATALOG.map((reward) => (
                <div key={reward.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between hover:border-indigo-200 transition-all">
                  <div className="space-y-3">
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase rounded">
                      {reward.category}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm leading-snug">{reward.name}</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">{reward.description}</p>
                    <div className="flex gap-1 items-baseline pt-1">
                      <span className="text-xl font-extrabold text-amber-500">{reward.cost}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Poin</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-3 border-t border-slate-50 col-span-1">
                    <div className="space-y-2">
                      <span className="text-[8px] font-black text-slate-405 uppercase tracking-wide block">Tukarkan Untuk:</span>
                      <div className="flex gap-2">
                        <select 
                          id={`redeem-select-${reward.id}`}
                          className="flex-1 bg-slate-50 border-none rounded-lg text-[11px] px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 outline-none font-semibold"
                        >
                          <option value="">Pilih Member...</option>
                          {customers.map(c => (
                            <option key={c.id} value={c.id} disabled={c.points < reward.cost}>
                              {c.name} ({c.points} Pts)
                            </option>
                          ))}
                        </select>
                        <button 
                          onClick={() => {
                            const selectElement = document.getElementById(`redeem-select-${reward.id}`) as HTMLSelectElement;
                            if (selectElement && selectElement.value) {
                              handleRedeemReward(selectElement.value, reward);
                              selectElement.value = '';
                            } else {
                              alert('Silakan pilih salah satu pelanggan di dropdown terlebih dahulu!');
                            }
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-2.5 py-1.5 rounded-lg transition-colors shrink-0"
                        >
                          Tukar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CONTENT TAB 3: SMART SEGMENTATION */}
      {activeTab === 'segments' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          <div className="space-y-3">
            <div>
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Sparkles className="text-indigo-600" size={20} />
                Analisis Segmentasi Market Otomatis
              </h3>
              <p className="text-slate-500 text-xs">Segmentasikan basis data pelanggan untuk mengirim penawaran atau promo yang paling sesuai.</p>
            </div>

            {/* Segment Grid List (Interactively Filterable!) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {segmentsList.map((seg) => {
                const IconComp = seg.icon;
                const isActive = activeSegmentId === seg.id;
                return (
                  <button
                    key={seg.id}
                    onClick={() => {
                      setActiveSegmentId(seg.id);
                      setBroadcastTargetSegment(seg.id);
                    }}
                    className={cn(
                      "p-5 rounded-2xl border text-left flex flex-col justify-between gap-4 transition-all hover:scale-102 focus:outline-none relative group",
                      isActive 
                        ? "bg-slate-900 text-white border-transparent shadow-lg shadow-slate-900/10" 
                        : "bg-white text-slate-700 border-slate-200 hover:border-indigo-100"
                    )}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className={cn(
                        "p-2 rounded-xl text-indigo-700",
                        isActive ? "bg-slate-800 text-amber-400" : "bg-indigo-50 text-indigo-600"
                      )}>
                        <IconComp size={20} />
                      </div>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping absolute top-4 right-4" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className={cn("text-[10px] font-bold leading-normal uppercase", isActive ? "text-slate-400" : "text-slate-400")}>
                        {seg.criteria}
                      </p>
                      <h4 className="font-extrabold text-sm leading-snug tracking-tight">{seg.name}</h4>
                    </div>

                    <div className="pt-2 border-t w-full flex items-center justify-between border-slate-100/10">
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Populasi</span>
                      <span className="text-lg font-black">{seg.count} Customer</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Col: Target Segment Members list */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
              <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    Anggota CRM: <span className="text-indigo-600">{segmentsList.find(s => s.id === activeSegmentId)?.name}</span>
                  </h4>
                  <p className="text-[10px] font-medium text-slate-500 mt-0.5">
                    ({activeSegmentCustomers.length} dari total {customers.length} pelanggan masuk kriteria)
                  </p>
                </div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                  Filter Cerdas Aktif
                </span>
              </div>

              {activeSegmentCustomers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider font-bold">
                      <th className="px-5 py-3">Nama Anggota</th>
                      <th className="px-5 py-3">Kontak Whatsapp</th>
                      <th className="px-5 py-3">Akumulasi Poin</th>
                      <th className="px-5 py-3">Pesanan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {activeSegmentCustomers.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-slate-900">{c.name}</td>
                        <td className="px-5 py-3.5 text-slate-500 font-mono text-xs">{c.phone}</td>
                        <td className="px-5 py-3.5 font-bold text-slate-800">{c.points.toLocaleString()} Pts</td>
                        <td className="px-5 py-3.5 text-slate-500 font-medium">{c.totalOrders}x order</td>
                      </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Tidak ada anggota yang memenuhi syarat segmentasi ini saat ini.
                </div>
              )}
            </div>

            {/* Right Col: Instant Smart Marketing Campaign Broadcast */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <MessageSquare className="text-indigo-600" size={18} />
                  Blaster Kampanye Instan
                </h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  Kirim promosi khusus (WhatsApp/Email) ke seluruh penerima di segmen terpilih secara simultan.
                </p>
              </div>

              {broadcastSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl text-xs flex gap-2 items-start">
                  <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Broadcast Berhasil Direncanakan!</span>
                    <p className="text-[11px] text-emerald-600 mt-1">
                      Pesan blast ke segmen "{segmentsList.find(s => s.id === broadcastTargetSegment)?.name}" telah dikirim melalui backend server.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSendBroadcast} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Saluran Pengiriman</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['WhatsApp', 'Email'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setBroadcastType(type as any)}
                        className={cn(
                          "py-2 text-xs font-bold rounded-xl border transition-all",
                          broadcastType === type 
                            ? "bg-indigo-600 text-white border-transparent"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Target Segmen Utama</label>
                  <select
                    value={broadcastTargetSegment}
                    onChange={(e) => setBroadcastTargetSegment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none"
                  >
                    {segmentsList.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.count} orang)</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Draft Isi Pesan Promosi</label>
                  <textarea
                    rows={4}
                    required
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="Halo Kak! Khusus pelanggan setia kami hari ini dapat diskon spesial 15% dengan menunjukkan kupon LOYAL15. Nikmati belanja hemat!"
                    className="w-full p-3 bg-slate-50 border-none rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isBroadcastSending || !broadcastMessage.trim()}
                  className={cn(
                    "w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md",
                    isBroadcastSending || !broadcastMessage.trim()
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100"
                  )}
                >
                  {isBroadcastSending ? (
                    <>Memproses Blasting...</>
                  ) : (
                    <>
                      Kirim Blast Pintar
                      <Send size={14} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FOR CREATING AND EDITING CRM CUSTOMERS */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingCustomer ? "Edit Pelanggan" : "Tambah Pelanggan Baru"}
      >
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nama Pelanggan</label>
              <input 
                required
                type="text" 
                value={customerForm.name}
                onChange={e => setCustomerForm({...customerForm, name: e.target.value})}
                placeholder="Nama lengkap"
                className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nomor Telepon</label>
              <input 
                required
                type="tel" 
                value={customerForm.phone}
                onChange={e => setCustomerForm({...customerForm, phone: e.target.value})}
                placeholder="0812xxxx"
                className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Email</label>
              <input 
                type="email" 
                value={customerForm.email}
                onChange={e => setCustomerForm({...customerForm, email: e.target.value})}
                placeholder="email@provider.com"
                className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Alamat</label>
              <textarea 
                rows={2}
                value={customerForm.address}
                onChange={e => setCustomerForm({...customerForm, address: e.target.value})}
                placeholder="Alamat lengkap..."
                className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
              />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Catatan Tambahan</label>
              <textarea 
                rows={2}
                value={customerForm.notes}
                onChange={e => setCustomerForm({...customerForm, notes: e.target.value})}
                placeholder="Catatan khusus pelanggan..."
                className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
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
              {editingCustomer ? "Simpan Perubahan" : "Simpan Pelanggan"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

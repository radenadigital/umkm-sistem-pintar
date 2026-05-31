import React, { useState, useMemo } from 'react';
import { TrendingUp, Users, Package, Wallet, Sparkles, Plus, Send, Zap, Palette, Camera, Video, Layout, ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { formatCurrency, cn } from '../../lib/utils';
import RefreshButton from '../../components/ui/RefreshButton';
import { useDb } from '../../contexts/DatabaseContext';
import { useAuth } from '../../contexts/AuthContext';

import { ChartContainer } from '../../components/ui/ChartContainer';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
  setOpenFinanceModal: (open: boolean) => void;
}

export default function Dashboard({ setActiveTab, setOpenFinanceModal }: DashboardProps) {
  const { db } = useDb();
  const { user } = useAuth();

  // Calculate real-time statistics from database
  const { totalIncome, totalExpense, totalCustomers, totalProducts, totalSold } = useMemo(() => {
    const income = db.transactions
      .filter(t => t.type === 'Income' && t.status === 'Completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = db.transactions
      .filter(t => t.type === 'Expense' && t.status === 'Completed')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome: income,
      totalExpense: expense,
      totalCustomers: db.customers.length,
      totalProducts: db.products.length,
      totalSold: db.products.reduce((sum, p) => sum + (p.stock > 0 ? 0 : 0), 0) // Start with 0, we'll improve this later
    };
  }, [db.transactions, db.customers, db.products]);

  // Generate chart data
  const chartData = useMemo(() => {
    // Group transactions by date for the chart
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const groupedData = last7Days.map(date => {
      const dayIncome = db.transactions
        .filter(t => t.date === date && t.type === 'Income' && t.status === 'Completed')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        name: new Date(date).toLocaleDateString('id-ID', { weekday: 'short' }),
        amount: dayIncome
      };
    });

    return groupedData;
  }, [db.transactions]);

  // Update stats with real database data
  const stats = [
    { label: 'Total Pendapatan', value: formatCurrency(totalIncome), change: '0%', trending: 'up', icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pelanggan', value: totalCustomers.toString(), change: '0%', trending: 'up', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Produk', value: totalProducts.toString(), change: '0%', trending: 'up', icon: Package, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Laba Bersih', value: formatCurrency(totalIncome - totalExpense), change: '0%', trending: 'up', icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  const handleRefresh = async () => {
    // Simulating API refetch
    await new Promise(resolve => setTimeout(resolve, 1500));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Halo, {user?.name || 'User'}! 👋</h1>
          <p className="text-slate-500 text-sm">Berikut adalah ringkasan performa bisnis Anda hari ini.</p>
        </div>
        <div className="flex items-center gap-3">
          <RefreshButton onRefresh={handleRefresh} />
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2">
            <Send size={14} /> Kirim Invoice
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/20">
            <Plus size={14} /> Order Baru
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-all group"
          >
            <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
            <div className="flex items-center justify-between mt-1">
              <h3 className="text-xl font-bold text-slate-900">{stat.value}</h3>
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color} opacity-80 group-hover:opacity-100 transition-opacity`}>
                <stat.icon size={18} />
              </div>
            </div>
            <p className={`text-[10px] mt-3 flex items-center font-bold ${stat.trending === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
              {stat.change}
              <span className="text-slate-400 font-normal ml-1">vs bln lalu</span>
            </p>
          </motion.div>
        ))}
      </div>

      {/* Shortcut Menu Section */}
      <div>
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4">Shortcut Menu</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[
            { label: 'Buat Logo', icon: Palette, tab: 'branding', color: 'from-purple-500 to-pink-500', iconColor: 'text-purple-500', bg: 'bg-purple-50' },
            { label: 'Foto & Kemasan', icon: Camera, tab: 'photo-packaging', color: 'from-indigo-500 to-blue-500', iconColor: 'text-indigo-500', bg: 'bg-indigo-50' },
            { label: 'Video Script', icon: Video, tab: 'video-script', color: 'from-emerald-500 to-teal-500', iconColor: 'text-emerald-500', bg: 'bg-emerald-50' },
            { label: 'Promo Generator', icon: Layout, tab: 'promo-generator', color: 'from-amber-500 to-orange-500', iconColor: 'text-amber-500', bg: 'bg-amber-50' },
            { label: 'Ide Mockup', icon: ImageIcon, tab: 'mockup-ideas', color: 'from-rose-500 to-red-500', iconColor: 'text-rose-500', bg: 'bg-rose-50' },
          ].map((shortcut, i) => (
            <motion.button
              key={shortcut.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              onClick={() => setActiveTab(shortcut.tab)}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all group text-left"
            >
              <div className={`w-12 h-12 ${shortcut.bg} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <shortcut.icon size={24} className={shortcut.iconColor} />
              </div>
              <h3 className="text-sm font-bold text-slate-800">{shortcut.label}</h3>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h4 className="font-bold text-slate-800 uppercase text-xs tracking-widest">Revenue Streams</h4>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div> Revenue
              </span>
            </div>
          </div>
          <div className="p-6">
            <ChartContainer height={300}>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1b43ea" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#1b43ea" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b', fontWeight: 'bold'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#1b43ea" strokeWidth={2} fillOpacity={1} fill="url(#colorAmt)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-2">
                  <TrendingUp className="text-slate-200" size={48} />
                  <div>
                    <p className="text-sm font-bold text-slate-800">Belum ada data visual</p>
                    <p className="text-[10px] text-slate-400">Data penjualan akan muncul saat transaksi mulai dicatat.</p>
                  </div>
                </div>
              )}
            </ChartContainer>
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="bg-slate-900 rounded-2xl p-6 text-white overflow-hidden relative group">
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="text-yellow-400" size={18} />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Quick AI Insight</span>
              </div>
              <h4 className="font-bold text-lg mb-3">Siap untuk Analisis AI?</h4>
              <p className="text-slate-400 text-xs leading-relaxed mb-6">
                Setelah Anda mulai mencatatkan transaksi, AI kami akan memberikan rekomendasi cerdas untuk meningkatkan omzet Bisnis Anda.
              </p>
              <button 
                onClick={() => {
                  setOpenFinanceModal(true);
                  setActiveTab('finance');
                }}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold transition-all"
              >
                Mulai Catat Penjualan
              </button>
            </div>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-50 bg-slate-50/50">
              <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-widest flex items-center gap-2">
                <Users size={14} className="text-indigo-500" />
                Customer Segments
              </h4>
            </div>
            <div className="p-4 space-y-3">
              {[
                { label: 'Royal Class', color: 'bg-indigo-500', pct: 0 },
                { label: 'Newbies', color: 'bg-emerald-500', pct: 0 },
                { label: 'One-timers', color: 'bg-slate-300', pct: 0 },
              ].map((seg, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-600">
                    <span>{seg.label}</span>
                    <span>{seg.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", seg.color)} style={{ width: `${seg.pct}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


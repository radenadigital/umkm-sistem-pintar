import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Layers,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { formatCurrency, cn } from '../../lib/utils';
import RefreshButton from '../../components/ui/RefreshButton';
import { ChartContainer } from '../../components/ui/ChartContainer';

const PERIODS = ['Hari Ini', 'Minggu Ini', 'Bulan Ini', 'Tahun Ini'];

const CHART_DATA: Record<string, { time: string; sales: number; customers: number }[]> = {
  'Hari Ini': [],
  'Minggu Ini': [],
  'Bulan Ini': [],
  'Tahun Ini': [],
};

const CATEGORY_PERFORMANCE: { name: string; value: number; color: string }[] = [];

const FINANCE_FLOW: { month: string; income: number; expense: number }[] = [];

export default function Analytics() {
  const [period, setPeriod] = useState('Bulan Ini');
  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
  };

  const currentData = CHART_DATA[period as keyof typeof CHART_DATA] || [];

  const stats = useMemo(() => {
    const totalSales = currentData.reduce((acc, curr) => acc + (curr.sales || 0), 0);
    const totalCustomers = currentData.reduce((acc, curr) => acc + (curr.customers || 0), 0);
    return {
      sales: totalSales,
      customers: totalCustomers,
      avgTicket: totalCustomers > 0 ? totalSales / totalCustomers : 0,
      growth: '0%'
    };
  }, [currentData]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="text-indigo-600" />
            Wawasan Bisnis
          </h1>
          <p className="text-slate-500 text-sm">Analisis performa bisnis Anda secara real-time.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 rounded-xl p-1 flex shadow-sm">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "px-3 py-1.5 text-xs font-bold rounded-lg transition-all",
                  period === p ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "text-slate-500 hover:text-slate-800"
                )}
              >
                {p}
              </button>
            ))}
          </div>
          <RefreshButton onRefresh={handleRefresh} />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Penjualan', value: formatCurrency(stats.sales), icon: DollarSign, trend: '+8.2%', color: 'indigo' },
          { label: 'Total Pelanggan', value: stats.customers.toLocaleString(), icon: Users, trend: '+15%', color: 'emerald' },
          { label: 'Rata-rata Transaksi', value: formatCurrency(stats.avgTicket), icon: ShoppingBag, trend: '-2.4%', color: 'amber' },
          { label: 'Pertumbuhan Laba', value: stats.growth, icon: TrendingUp, trend: '+5.1%', color: 'rose' },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-8 -mt-8 group-hover:scale-125 transition-transform duration-500 ${
              stat.color === 'indigo' ? 'bg-indigo-500/5' : 
              stat.color === 'emerald' ? 'bg-emerald-500/5' : 
              stat.color === 'amber' ? 'bg-amber-500/5' : 'bg-rose-500/5'
            }`} />
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-xl ${
                stat.color === 'indigo' ? 'bg-indigo-50 bg-indigo-600' : 
                stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 
                stat.color === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
              }`}>
                <stat.icon size={20} />
              </div>
              <span className={cn(
                "text-[10px] font-bold px-2 py-1 rounded-full",
                stat.trend.startsWith('+') ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
              )}>
                {stat.trend}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-xl font-bold text-slate-900 mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Primary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <TrendingUp size={18} className="text-indigo-600" />
                Tren Penjualan & Pendapatan
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">Berdasarkan {period}</p>
            </div>
          </div>
          <ChartContainer height={300}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1b43ea" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#1b43ea" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#94a3b8'}} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [formatCurrency(value), 'Penjualan']}
                />
                <Area type="monotone" dataKey="sales" stroke="#1b43ea" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Category Share */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="mb-8">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Layers size={18} className="text-indigo-600" />
              Komposisi Produk
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">Performa Kategori</p>
          </div>
          <ChartContainer height={200}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={CATEGORY_PERFORMANCE}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {CATEGORY_PERFORMANCE.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="mt-6 space-y-3">
            {CATEGORY_PERFORMANCE.map((item) => (
              <div key={item.name} className="flex items-center justify-between group cursor-default">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{item.name}</span>
                </div>
                <span className="text-xs font-mono font-bold text-slate-400">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cashflow Comparison */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Arus Kas: Masuk vs Keluar</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">Analisis 5 Bulan Terakhir</p>
            </div>
          </div>
          <ChartContainer height={250}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FINANCE_FLOW}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#94a3b8'}} />
                <YAxis hide />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => formatCurrency(value)}
                />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} name="Pemasukan" />
                <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={24} name="Pengeluaran" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="mt-4 flex items-center justify-center gap-6 border-t border-slate-50 pt-4">
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 bg-emerald-500 rounded-sm" />
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pemasukan</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-3 h-3 bg-rose-500 rounded-sm" />
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pengeluaran</span>
             </div>
          </div>
        </div>

        {/* Customer Growth Trend */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Akuisisi Pelanggan Baru</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">Pertumbuhan Basis Data</p>
            </div>
          </div>
          <ChartContainer height={250}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={currentData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 600, fill: '#94a3b8'}} />
                <YAxis hide />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="stepAfter" dataKey="customers" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="mt-4 p-4 bg-indigo-50 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Total Pelanggan Aktif</p>
              <p className="text-xl font-bold text-indigo-700">{stats.customers.toLocaleString()}</p>
            </div>
            <button className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-white px-3 py-2 rounded-xl shadow-sm hover:translate-x-1 transition-transform">
              Kelola Pelanggan
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

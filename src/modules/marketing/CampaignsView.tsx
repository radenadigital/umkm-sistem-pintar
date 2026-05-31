import React, { useState } from 'react';
import { 
  Send, 
  Calendar, 
  BarChart2, 
  MoreVertical, 
  Clock, 
  CheckCircle2, 
  Play,
  ArrowRight,
  Users,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import EmptyState from '../../components/ui/EmptyState';
import RefreshButton from '../../components/ui/RefreshButton';
import CreateCampaignModal from './CreateCampaignModal';

interface Campaign {
  id: string;
  title: string;
  type: 'WhatsApp' | 'Email' | 'Instagram';
  status: 'Active' | 'Scheduled' | 'Completed' | 'Draft';
  sentCount: number;
  openRate: string;
  date: string;
}

interface CampaignsViewProps {
  campaigns?: Campaign[];
  onCampaignCreated?: (newCampaign: Campaign) => void;
}

export default function CampaignsView({ campaigns = [], onCampaignCreated }: CampaignsViewProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kampanye Aktif</h1>
          <p className="text-slate-500 text-sm">Kelola dan monitor jalannya kampanye pemasaran Anda.</p>
        </div>
        <div className="flex items-center gap-3">
          <RefreshButton onRefresh={handleRefresh} />
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            Buat Kampanye Baru <ArrowRight size={16} />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm tracking-tight">Kampanye Terkini</h3>
              <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Lihat Semua</button>
            </div>
            
            {campaigns.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {campaigns.map((item) => (
                  <div key={item.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center",
                        item.type === 'WhatsApp' ? "bg-emerald-50 text-emerald-600" :
                        item.type === 'Email' ? "bg-indigo-50 text-indigo-600" :
                        "bg-rose-50 text-rose-600"
                      )}>
                        {item.type === 'WhatsApp' ? <Send size={20} /> : 
                         item.type === 'Email' ? <Play size={20} /> : <BarChart2 size={20} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900">{item.title}</p>
                          <span className={cn(
                            "text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full",
                            item.status === 'Active' ? "bg-emerald-100 text-emerald-700" :
                            item.status === 'Scheduled' ? "bg-amber-100 text-amber-700" :
                            "bg-slate-100 text-slate-500"
                          )}>
                            {item.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-3">
                           <span className="flex items-center gap-1"><Calendar size={10} /> {item.date}</span>
                           <span className="flex items-center gap-1"><Users size={10} /> {item.sentCount.toLocaleString()} Terkirim</span>
                           {item.status === 'Completed' && <span className="flex items-center gap-1 font-bold text-emerald-600">Open Rate: {item.openRate}</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                       <button className="p-2 hover:bg-slate-100 text-slate-400 rounded-lg">
                          <BarChart2 size={16} />
                       </button>
                       <button className="p-2 hover:bg-slate-100 text-slate-400 rounded-lg">
                          <MoreVertical size={16} />
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState 
                icon={Send}
                title="Belum ada kampanye aktif"
                description="Mulai promosikan produk Anda ke pelanggan lewat kanal pemasaran favorit."
                action={
                  <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest" onClick={() => setIsCreateModalOpen(true)}>
                    Buat Kampanye Pertama
                  </button>
                }
              />
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <h4 className="text-lg font-bold mb-2">Estimasi Reach</h4>
              <p className="text-slate-400 text-xs leading-relaxed mb-6">
                Berdasarkan data segmen pelanggan Anda saat ini.
              </p>
              
              <div className="space-y-4 mb-6">
                 <div>
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                       <span>Potential Audience</span>
                       <span className="text-white">12,450 Users</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                       <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} className="h-full bg-indigo-500 rounded-full" />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white/5 rounded-2xl">
                       <p className="text-[10px] text-slate-500 font-bold uppercase">Loyal</p>
                       <p className="text-lg font-bold">2,4k</p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-2xl">
                       <p className="text-[10px] text-slate-500 font-bold uppercase">Baru</p>
                       <p className="text-lg font-bold">850</p>
                    </div>
                 </div>
              </div>

              <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2">
                Aktifkan Segmentasi Cerdas <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest mb-4">Channel Performance</h3>
            <div className="space-y-4">
               {[
                 { label: 'WhatsApp', value: 75, color: 'emerald' },
                 { label: 'Email', value: 45, color: 'indigo' },
                 { label: 'Instagram', value: 60, color: 'rose' }
               ].map(ch => (
                 <div key={ch.label}>
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                       <span className="text-slate-600">{ch.label}</span>
                       <span className="text-slate-900">{ch.value}%</span>
                    </div>
                    <div className="h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                       <div className={cn(
                          "h-full rounded-full",
                          ch.color === 'emerald' ? "bg-emerald-500" :
                          ch.color === 'indigo' ? "bg-indigo-500" : "bg-rose-500"
                       )} style={{ width: `${ch.value}%` }} />
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
      
      <CreateCampaignModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onCreated={onCampaignCreated}
      />
    </div>
  );
}

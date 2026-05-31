import React, { useState } from 'react';
import { 
  Target, 
  Users, 
  TrendingUp, 
  ShoppingBag, 
  Clock, 
  Plus,
  MoreVertical,
  ArrowRight,
  Filter,
  Check,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import RefreshButton from '../../components/ui/RefreshButton';
import Modal from '../../components/ui/Modal';

interface Segment {
  id: string;
  name: string;
  count: number;
  description: string;
  color: string;
  criteria: string;
}

const INITIAL_SEGMENTS: Segment[] = [];

export default function SegmentsView() {
  const [segments, setSegments] = useState<Segment[]>(INITIAL_SEGMENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSegment, setNewSegment] = useState({ name: '', criteria: 'Order > 1' });

  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
  };

  const handleCreate = () => {
    const segment: Segment = {
      id: `SEG-${Math.floor(Math.random() * 1000)}`,
      name: newSegment.name,
      count: Math.floor(Math.random() * 500) + 10,
      description: `Targeting pelanggan dengan kriteria ${newSegment.criteria}.`,
      color: 'indigo',
      criteria: newSegment.criteria
    };
    setSegments([segment, ...segments]);
    setIsModalOpen(false);
    setNewSegment({ name: '', criteria: 'Order > 1' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Segmentasi Market</h1>
          <p className="text-slate-500 text-sm">Targetkan kampanye Anda ke audiens yang tepat.</p>
        </div>
        <div className="flex items-center gap-3">
          <RefreshButton onRefresh={handleRefresh} />
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all"
          >
            <Plus size={16} />
            Buat Segmen Custom
          </button>
        </div>
      </div>

      <div className="space-y-6">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {segments.map((segment) => (
          <motion.div 
            key={segment.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow group"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className={cn(
                  "p-2 rounded-xl",
                  segment.color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
                  segment.color === 'indigo' ? "bg-indigo-50 text-indigo-600" :
                  segment.color === 'rose' ? "bg-rose-50 text-rose-600" :
                  "bg-amber-50 text-amber-600"
                )}>
                  <Users size={20} />
                </div>
                <button className="p-1.5 hover:bg-slate-50 text-slate-400 rounded-lg group-hover:text-slate-600 transition-colors">
                  <MoreVertical size={18} />
                </button>
              </div>
              
              <div>
                <h4 className="font-bold text-slate-900 text-lg">{segment.name}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{segment.description}</p>
              </div>

              <div className="flex items-center gap-4">
                 <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Populasi</p>
                    <p className="text-xl font-bold text-slate-800">{segment.count.toLocaleString()}</p>
                 </div>
                 <div className="h-8 w-px bg-slate-100" />
                 <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kriteria</p>
                    <p className="text-[11px] font-bold text-slate-600">{segment.criteria}</p>
                 </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-50 flex items-center justify-between">
              <button className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:translate-x-1 transition-transform">
                Kirim Kampanye Ke Segmen <ArrowRight size={14} />
              </button>
              <div className="flex -space-x-2">
                 {[1,2,3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center overflow-hidden">
                       <img src={`https://i.pravatar.cc/150?u=${segment.id}${i}`} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                 ))}
                 <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold text-slate-400">
                    +{segment.count - 3}
                 </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Buat Segmen Custom">
         <div className="space-y-6 pt-2">
            <div>
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nama Segmen</label>
               <input 
                 value={newSegment.name}
                 onChange={(e) => setNewSegment({ ...newSegment, name: e.target.value })}
                 className="w-full mt-1.5 px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" 
                 placeholder="Misal: Pecinta Kopi Gayo" 
               />
            </div>
            
            <div className="space-y-3">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Definisi Filter</label>
               <div className="space-y-2">
                  {[
                    { id: 'Order > 1', label: 'Pernah Order > 1x' },
                    { id: 'Total Spend > 100k', label: 'Belanja > 100rb' },
                    { id: 'Last Active < 7d', label: 'Aktif seminggu terakhir' }
                  ].map(rule => (
                    <button
                      key={rule.id}
                      onClick={() => setNewSegment({ ...newSegment, criteria: rule.id })}
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-xl border transition-all",
                        newSegment.criteria === rule.id ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-white border-slate-100 text-slate-600"
                      )}
                    >
                      <span className="text-xs font-medium">{rule.label}</span>
                      {newSegment.criteria === rule.id && <Check size={14} />}
                    </button>
                  ))}
               </div>
            </div>

            <button 
              onClick={handleCreate}
              disabled={!newSegment.name}
              className={cn(
                "w-full py-3 rounded-xl font-bold text-sm shadow-xl transition-all",
                newSegment.name ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100" : "bg-slate-100 text-slate-400 cursor-not-allowed"
              )}
            >
              Simpan Segmen
            </button>
         </div>
      </Modal>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Modal from '../../components/ui/Modal';
import { AutomationRule } from './AutomationRules';

interface RuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: Partial<AutomationRule>) => void;
  editRule: AutomationRule | null;
}

const TRIGGERS = [
  { id: 'New Transaction', label: 'Transaksi Baru', icon: ShoppingBag, category: 'Sales' },
  { id: 'New Customer', label: 'Pelanggan Baru', icon: Users, category: 'Growth' },
  { id: 'Low Stock', label: 'Stok Hampir Habis', icon: Package, category: 'Inventory' },
  { id: 'Campaign End', label: 'Kampanye Berakhir', icon: TrendingUp, category: 'Marketing' }
];

const ACTIONS = [
  { id: 'Create Task', label: 'Buat Task Baru', icon: MessageSquare },
  { id: 'Send Notification', label: 'Kirim Notifikasi WA', icon: Zap },
  { id: 'Update Status', label: 'Update Status Order', icon: Sparkles }
];

export default function RuleModal({ isOpen, onClose, onSave, editRule }: RuleModalProps) {
  const [formData, setFormData] = useState<Partial<AutomationRule>>({
    name: '',
    description: '',
    trigger: 'New Transaction',
    action: 'Create Task',
    isActive: true
  });

  useEffect(() => {
    if (editRule) {
      setFormData(editRule);
    } else {
      setFormData({
        name: '',
        description: '',
        trigger: 'New Transaction',
        action: 'Create Task',
        isActive: true
      });
    }
  }, [editRule, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const selectedTrigger = TRIGGERS.find(t => t.id === formData.trigger);
  const selectedAction = ACTIONS.find(a => a.id === formData.action);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={editRule ? "Edit Aturan Otomasi" : "Buat Otomasi Baru"}
    >
      <form onSubmit={handleSubmit} className="space-y-6 pt-2">
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1.5 block">Nama Alur (Workflow)</label>
          <input 
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Misal: Follow-up Pembeli Baru"
            className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
          />
        </div>

        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Trigger (Jika)</label>
              <div className="flex gap-2 flex-wrap">
                {TRIGGERS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, trigger: t.id })}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border",
                      formData.trigger === t.id 
                        ? "bg-white border-indigo-200 text-indigo-700 shadow-sm" 
                        : "bg-transparent border-transparent text-slate-500 hover:bg-white/50"
                    )}
                  >
                    <t.icon size={12} /> {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-center -my-2 relative z-10">
            <div className="bg-white p-1 rounded-full border border-slate-100 shadow-sm">
              <ArrowRight size={16} className="text-slate-300 rotate-90" />
            </div>
          </div>

          <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest pl-1 mb-1 block">Action (Maka)</label>
              <div className="flex gap-2 flex-wrap">
                {ACTIONS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, action: a.id })}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border",
                      formData.action === a.id 
                        ? "bg-white border-indigo-200 text-indigo-700 shadow-sm" 
                        : "bg-transparent border-transparent text-slate-400 hover:bg-white/50"
                    )}
                  >
                    <a.icon size={12} /> {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
           <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1.5 block">Deskripsi Rule</label>
           <textarea 
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Kapan alur ini berjalan dan apa tujuannya?"
            className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-20 resize-none"
           />
        </div>

        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-3">
          <div className="text-emerald-600 shrink-0"><Sparkles size={16} /></div>
          <p className="text-[10px] text-emerald-800 leading-relaxed font-medium">
            <strong>Ringkasan:</strong> Sistem akan otomatis <strong>{selectedAction?.label}</strong> setiap kali terjadi <strong>{selectedTrigger?.label}</strong> untuk membantu Anda tetap fokus!
          </p>
        </div>

        <button 
          type="submit"
          className="w-full py-3.5 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]"
        >
          {editRule ? "Simpan Perubahan" : "Aktifkan Otomasi"}
        </button>
      </form>
    </Modal>
  );
}

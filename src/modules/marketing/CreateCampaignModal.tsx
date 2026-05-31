import React, { useState } from 'react';
import { 
  Send, 
  Mail, 
  Instagram, 
  Target, 
  Calendar, 
  ChevronRight, 
  X,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { cn } from '../../lib/utils';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (campaign: any) => void;
}

const CHANNELS = [
  { id: 'WhatsApp', icon: Send, color: 'text-emerald-600', bg: 'bg-emerald-50', description: 'Kirim pesan personal langsung ke WA pelanggan.' },
  { id: 'Email', icon: Mail, color: 'text-indigo-600', bg: 'bg-indigo-50', description: 'Broadcast newsletter atau promo via email.' },
  { id: 'Instagram', icon: Instagram, color: 'text-rose-600', bg: 'bg-rose-50', description: 'Posting konten promo ke feed atau story.' },
];

export default function CreateCampaignModal({ isOpen, onClose, onCreated }: CreateCampaignModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    type: 'WhatsApp',
    segment: 'Semua Pelanggan',
    content: ''
  });

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else {
      // Finalize
      onCreated({
        id: `CMP-${Math.floor(Math.random() * 1000)}`,
        title: formData.title,
        type: formData.type,
        status: 'Scheduled',
        sentCount: 0,
        openRate: '0%',
        date: new Date().toISOString().split('T')[0]
      });
      onClose();
      resetForm();
    }
  };

  const resetForm = () => {
    setStep(1);
    setFormData({ title: '', type: 'WhatsApp', segment: 'Semua Pelanggan', content: '' });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Buat Kampanye Baru">
      <div className="space-y-6 pt-2">
        {/* Progress Bar */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={cn(
                "h-1.5 flex-1 rounded-full transition-all duration-500",
                step >= s ? "bg-indigo-600" : "bg-slate-100"
              )} 
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nama Kampanye</label>
              <input 
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Misal: Promo Weekend Ceria"
                className="w-full mt-1.5 px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Pilih Kanal Pemasaran</label>
              <div className="grid grid-cols-1 gap-3 mt-2">
                {CHANNELS.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => setFormData({ ...formData, type: ch.id as any })}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left",
                      formData.type === ch.id 
                        ? "bg-white border-indigo-600 shadow-md translate-x-1" 
                        : "bg-slate-50 border-transparent hover:bg-slate-100"
                    )}
                  >
                    <div className={cn("p-2.5 rounded-xl", ch.bg, ch.color)}>
                      <ch.icon size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{ch.id}</p>
                      <p className="text-[10px] text-slate-500">{ch.description}</p>
                    </div>
                    {formData.type === ch.id && (
                      <div className="ml-auto w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                        <CheckCircle2 size={12} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Target Segmen</label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {['Semua Pelanggan', 'Pelanggan Loyal', 'Baru Bergabung', 'Churn Risk'].map((seg) => (
                  <button
                    key={seg}
                    onClick={() => setFormData({ ...formData, segment: seg })}
                    className={cn(
                      "p-4 rounded-xl border transition-all text-center",
                      formData.segment === seg 
                        ? "bg-indigo-50 border-indigo-600 text-indigo-600 font-bold" 
                        : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                    )}
                  >
                    <span className="text-xs">{seg}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
               <div className="text-amber-600 mt-0.5"><Target size={16} /></div>
               <p className="text-[10px] text-amber-800 leading-relaxed">
                  <strong>Estimasi Reach:</strong> Memilih segmen ini akan menjangkau sekitar <strong>1,240 pelanggan</strong>.
               </p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Isi Pesan / Konten</label>
                <button className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-700">
                   <Sparkles size={12} /> Gunakan AI
                </button>
              </div>
              <textarea 
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Tulis pesan kampanye Anda..."
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-40 resize-none"
              />
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between border border-slate-100">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg text-slate-400 border border-slate-100">
                     <Calendar size={16} />
                  </div>
                  <div>
                     <p className="text-[10px] font-bold text-slate-900">Jadwalkan Pengiriman</p>
                     <p className="text-[10px] text-slate-500">Kirim sekarang</p>
                  </div>
               </div>
               <ChevronRight size={16} className="text-slate-300" />
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          {step > 1 && (
            <button 
              onClick={() => setStep(step - 1)}
              className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all"
            >
              Kembali
            </button>
          )}
          <button 
            onClick={handleNext}
            disabled={step === 1 && !formData.title}
            className={cn(
              "flex-[2] py-3 rounded-xl font-bold text-sm transition-all shadow-xl",
              (step === 1 && !formData.title) 
                ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100"
            )}
          >
            {step === 3 ? 'Luncurkan Kampanye' : 'Lanjutkan'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function CheckCircle2({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

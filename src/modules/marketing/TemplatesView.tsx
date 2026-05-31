import React, { useState } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Copy, 
  Trash2, 
  Edit2, 
  Search,
  Eye,
  FileText,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import EmptyState from '../../components/ui/EmptyState';
import RefreshButton from '../../components/ui/RefreshButton';
import Modal from '../../components/ui/Modal';

interface Template {
  id: string;
  name: string;
  content: string;
  category: 'Promotion' | 'Support' | 'Newsletter' | 'Transactional';
}

const INITIAL_TEMPLATES: Template[] = [
  { 
    id: 'TPL-001', 
    name: 'Sapaan Pelanggan Baru', 
    category: 'Promotion',
    content: 'Halo {{name}}, selamat bergabung di {{business_name}}! Nikmati diskon 10% untuk transaksi pertama kamu dengan kode: NEWMEMBER. Buruan cek katalog kami!' 
  },
  { 
    id: 'TPL-002', 
    name: 'Konfirmasi Pesanan', 
    category: 'Transactional',
    content: 'Terima kasih {{name}}, pesanan {{order_id}} sedang diproses. Kami akan segera mengirimkannya ke {{address}}.' 
  },
  { 
    id: 'TPL-003', 
    name: 'Flash Sale Weekend', 
    category: 'Promotion',
    content: 'CUMA HARI INI! Flash sale weekend hadir kembali. Dapatkan harga spesial untuk produk favoritmu. Stok terbatas!' 
  },
];

export default function TemplatesView() {
  const [templates, setTemplates] = useState<Template[]>(INITIAL_TEMPLATES);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
  
  const [newTemplate, setNewTemplate] = useState({ name: '', content: '' });

  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
  };

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePreview = (template: Template) => {
    setCurrentTemplate(template);
    setIsPreviewOpen(true);
  };

  const handleSave = () => {
    if (!newTemplate.name || !newTemplate.content) return;
    
    const template: Template = {
      id: `TPL-00${templates.length + 1}`,
      name: newTemplate.name,
      content: newTemplate.content,
      category: 'Promotion'
    };
    
    setTemplates([template, ...templates]);
    setIsModalOpen(false);
    setNewTemplate({ name: '', content: '' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Template Pesan</h1>
          <p className="text-slate-500 text-sm">Simpan dan kelola naskah pesan yang sering Anda gunakan.</p>
        </div>
        <RefreshButton onRefresh={handleRefresh} />
      </div>

      <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari template..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 text-sm"
        >
          <Plus size={18} />
          Buat Template
        </button>
      </div>

      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <motion.div 
              key={template.id} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 hover:border-indigo-200 transition-colors group relative"
            >
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
                  template.category === 'Promotion' ? "bg-rose-100 text-rose-700" :
                  template.category === 'Newsletter' ? "bg-indigo-100 text-indigo-700" :
                  template.category === 'Support' ? "bg-emerald-100 text-emerald-700" :
                  "bg-slate-100 text-slate-600"
                )}>
                  {template.category}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => handlePreview(template)} className="p-1.5 hover:bg-slate-100 text-slate-400 rounded-lg"><Eye size={14} /></button>
                  <button className="p-1.5 hover:bg-slate-100 text-slate-400 rounded-lg"><Edit2 size={14} /></button>
                  <button className="p-1.5 hover:bg-rose-50 text-rose-400 rounded-lg"><Trash2 size={14} /></button>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-1">{template.name}</h4>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed h-8">
                  {template.content}
                </p>
              </div>
              <div className="pt-4 flex items-center justify-between border-t border-slate-50">
                 <p className="text-[10px] font-mono text-slate-400">{template.id}</p>
                 <button className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:text-indigo-700">
                    <Copy size={12} /> Salin Teks
                 </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState 
          icon={MessageSquare}
          title="Template Pesan Belum Ada"
          description="Simpan naskah promosi yang sering Anda gunakan untuk menghemat waktu."
          action={
            <button onClick={() => setIsModalOpen(true)} className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest">
              Buat Template Baru
            </button>
          }
        />
      )}

      {/* Preview Modal */}
      <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="Pratinjau Pesan">
        {currentTemplate && (
          <div className="space-y-6 pt-2">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {currentTemplate.content.replace('{{name}}', 'Budi').replace('{{business_name}}', 'Toko Berkah').replace('{{order_id}}', '#TRX-99').replace('{{address}}', 'Jl. Melati No. 12')}
              </p>
            </div>
            <div className="flex flex-col gap-2">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Variabel Terdeteksi</p>
               <div className="flex flex-wrap gap-2">
                  {['name', 'business_name', 'order_id', 'address'].map(v => (
                    <span key={v} className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-bold">
                       {`{{${v}}}`}
                    </span>
                  ))}
               </div>
            </div>
            <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-indigo-100">
               Gunakan Template
            </button>
          </div>
        )}
      </Modal>

      {/* Basic Create Modal (Placeholder UI) */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Template Baru">
         <div className="space-y-4 pt-2">
            <div>
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nama Template</label>
               <input 
                 value={newTemplate.name}
                 onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                 className="w-full mt-1.5 px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500" 
                 placeholder="Misal: Sambutan Member" 
               />
            </div>
            <div>
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Isi Pesan</label>
               <textarea 
                 value={newTemplate.content}
                 onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                 className="w-full mt-1.5 px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm outline-none h-32 resize-none focus:ring-2 focus:ring-indigo-500" 
                 placeholder="Tulis pesan Anda disini..." 
               />
            </div>
            <button 
              onClick={handleSave}
              disabled={!newTemplate.name || !newTemplate.content}
              className={cn(
                "w-full py-3 rounded-xl font-bold text-sm transition-all shadow-xl",
                (newTemplate.name && newTemplate.content) ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100" : "bg-slate-100 text-slate-400 cursor-not-allowed"
              )}
            >
              Simpan Template
            </button>
         </div>
      </Modal>
      </div>
    </div>
  );
}

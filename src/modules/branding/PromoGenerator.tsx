import React, { useState, useRef } from 'react';
import { Layout, Send, Loader2, Sparkles, Type, Upload, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { geminiService } from '../../services/gemini';
import Markdown from 'react-markdown';

export default function PromoGenerator() {
  const [promoType, setPromoType] = useState<'banner' | 'caption' | 'poster' | 'story'>('banner');
  const [tone, setTone] = useState<'fun' | 'elegant' | 'urgent' | 'friendly'>('friendly');
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const promoTypes = [
    { id: 'banner', label: 'Banner' },
    { id: 'caption', label: 'Caption Sosmed' },
    { id: 'poster', label: 'Poster' },
    { id: 'story', label: 'Instagram Story' },
  ];

  const tones = [
    { id: 'fun', label: 'Fun & Santai' },
    { id: 'elegant', label: 'Elegant & Mewah' },
    { id: 'urgent', label: 'Urgent & Limited' },
    { id: 'friendly', label: 'Ramah & Dekat' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    try {
      let photoNote = '';
      if (uploadedImage) {
        photoNote = '\n\nCATATAN PENTING: Pengguna telah mengupload foto produk. Pastikan konsep promosi mencakup saran untuk menampilkan foto produk tersebut secara menarik (contoh: gunakan sebagai gambar utama, tambahkan overlay teks, atau tempatkan di area strategis).';
      }

      const prompt = `Buat konsep ${promoType} dengan tone ${tone} untuk: ${input}. Sertakan teks, konsep desain, dan saran warna.
      ${photoNote}
      Jawab dalam bahasa Indonesia dengan format yang jelas.`;
      
      const response = await geminiService.generateMarketingContent(
        'Promo Generator',
        prompt
      );
      setResult(response);
    } catch (error) {
      console.error(error);
      setResult('Maaf, terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Layout className="text-emerald-500" />
          Promo Generator
        </h1>
        <p className="text-slate-500">Hasilkan ide konsep visual dan teks untuk promosi bisnis Anda.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="text-sm font-bold text-slate-700">Jenis Promo</div>
          <div className="grid grid-cols-2 gap-2">
            {promoTypes.map((p) => (
              <button
                key={p.id}
                onClick={() => setPromoType(p.id as any)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  promoType === p.id
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="text-sm font-bold text-slate-700">Tone Suara</div>
          <div className="grid grid-cols-2 gap-2">
            {tones.map((t) => (
              <button
                key={t.id}
                onClick={() => setTone(t.id as any)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  tone === t.id
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        {/* Upload Foto Produk */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <Upload size={16} className="text-emerald-500" />
            Upload Foto Produk (Opsional)
          </div>
          
          {!uploadedImage ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">
                <Upload size={24} className="text-slate-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-600">Klik untuk upload foto produk</p>
                <p className="text-xs text-slate-400">JPG, PNG (Max 5MB)</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          ) : (
            <div className="relative rounded-2xl border border-slate-200 overflow-hidden">
              <img
                src={uploadedImage}
                alt="Foto Produk"
                className="w-full h-64 object-cover"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all"
              >
                <X size={18} className="text-slate-600" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/70 to-transparent p-4">
                <div className="flex items-center gap-2 text-white text-sm font-medium">
                  <ImageIcon size={16} />
                  <span>Foto produk berhasil diupload</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Deskripsi Promosi */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <Sparkles size={16} className="text-emerald-500" />
            Deskripsikan promosi Anda
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Contoh: Promo diskon 50% untuk produk fashion, berlaku 3 hari saja, target anak muda"
            className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none text-slate-700"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading || !input.trim()}
          className="w-full py-4 bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20"
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={18} />}
          {isLoading ? 'Sedang Menghasilkan...' : 'Hasilkan Promo'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="p-4 bg-emerald-50 border-b border-emerald-100 font-bold text-emerald-900 text-sm">
              Hasil Promo
            </div>
            <div className="p-8 prose prose-emerald max-w-none">
              <Markdown>{result}</Markdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

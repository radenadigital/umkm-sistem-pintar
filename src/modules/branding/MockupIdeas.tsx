import React, { useState, useRef } from 'react';
import { Image, Send, Loader2, Sparkles, Upload, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { geminiService } from '../../services/gemini';
import Markdown from 'react-markdown';

export default function MockupIdeas() {
  const [mockupType, setMockupType] = useState<'product' | 'branding' | 'social' | 'print'>('product');
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mockupTypes = [
    { id: 'product', label: 'Product Mockup', icon: '📦' },
    { id: 'branding', label: 'Branding Kit', icon: '🎨' },
    { id: 'social', label: 'Social Media', icon: '📱' },
    { id: 'print', label: 'Print Materials', icon: '🖨️' },
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
        photoNote = '\n\nCATATAN PENTING: Pengguna telah mengupload foto produk. Pastikan ide mockup mencakup saran untuk menampilkan foto produk tersebut secara menarik (contoh: gunakan sebagai elemen utama, tempatkan pada posisi strategis, atau kombinasikan dengan desain mockup).';
      }

      const prompt = `Buat ide mockup untuk ${mockupType} untuk: ${input}. Sertakan konsep kreatif, gaya visual, dan tips implementasi.
      ${photoNote}
      Jawab dalam bahasa Indonesia dengan format yang jelas.`;
      
      const response = await geminiService.generateMarketingContent(
        'Mockup Ideas',
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
          <Image className="text-amber-500" />
          Ide Mockup
        </h1>
        <p className="text-slate-500">Dapatkan inspirasi mockup kreatif untuk visualisasi produk dan bisnis Anda.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {mockupTypes.map((m) => (
          <button
            key={m.id}
            onClick={() => setMockupType(m.id as any)}
            className={`p-6 rounded-2xl border transition-all ${
              mockupType === m.id
                ? 'bg-amber-50 border-amber-200 shadow-md'
                : 'bg-white border-slate-200 hover:border-amber-200'
            }`}
          >
            <div className="text-3xl mb-2">{m.icon}</div>
            <div className={`font-bold text-sm ${mockupType === m.id ? 'text-amber-900' : 'text-slate-700'}`}>
              {m.label}
            </div>
          </button>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        {/* Upload Foto Produk */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <Upload size={16} className="text-amber-500" />
            Upload Foto Produk (Opsional)
          </div>
          
          {!uploadedImage ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-amber-400 hover:bg-amber-50/30 transition-all"
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
                  <Image size={16} />
                  <span>Foto produk berhasil diupload</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Deskripsi Mockup */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <Sparkles size={16} className="text-amber-500" />
            Deskripsikan kebutuhan mockup Anda
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Contoh: Mockup produk skincare dengan desain minimalis, target pasar wanita dewasa"
            className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none text-slate-700"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading || !input.trim()}
          className="w-full py-4 bg-amber-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-amber-600 disabled:opacity-50 transition-all shadow-lg shadow-amber-500/20"
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={18} />}
          {isLoading ? 'Sedang Mencari Ide...' : 'Dapatkan Ide Mockup'}
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
            <div className="p-4 bg-amber-50 border-b border-amber-100 font-bold text-amber-900 text-sm">
              Ide Mockup Kreatif
            </div>
            <div className="p-8 prose prose-amber max-w-none">
              <Markdown>{result}</Markdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

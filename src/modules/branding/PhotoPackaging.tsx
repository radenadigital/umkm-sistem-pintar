import React, { useState, useRef } from 'react';
import { Camera, Send, Loader2, Sparkles, Palette, Upload, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { geminiService } from '../../services/gemini';
import Markdown from 'react-markdown';
import ProductImageGeneratorTab from '../creative/components/ProductImageGeneratorTab';

export default function PhotoPackaging() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'photo' | 'packaging'>('photo');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      const prompt = activeTab === 'photo' 
        ? `Generate ideas for product photos for: ${input}. Provide creative angles, lighting, props, and style suggestions.`
        : `Generate packaging design ideas for: ${input}. Provide creative concepts, color schemes, materials, and style suggestions.`;
      const response = await geminiService.generateMarketingContent(
        activeTab === 'photo' ? 'Product Photos' : 'Packaging Design',
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
          <Camera className="text-indigo-500" />
          Foto & Kemasan
        </h1>
        <p className="text-slate-500">Buat konsep foto produk dan desain kemasan yang menarik untuk bisnis Anda.</p>
      </div>

      <div className="flex gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm w-fit">
        <button
          onClick={() => setActiveTab('photo')}
          className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'photo'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Foto Produk
        </button>
        <button
          onClick={() => setActiveTab('packaging')}
          className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'packaging'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          Desain Kemasan
        </button>
      </div>

      {activeTab === 'photo' && <ProductImageGeneratorTab />}

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <Sparkles size={16} className="text-indigo-500" />
          Deskripsikan produk Anda
        </div>
        
        {/* Upload Photo Section */}
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Upload Foto Produk (Opsional)</label>
          {!uploadedImage ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                <Upload size={24} className="text-slate-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-600">Klik untuk upload foto</p>
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
                alt="Preview"
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

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={activeTab === 'photo' 
            ? 'Contoh: Produk kopi bubuk kemasan 250gr, target pasar anak muda, vibe cozy dan aesthetic' 
            : 'Contoh: Kemasan snack kue kering untuk lebaran, desain elegan dan mewah'
          }
          className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none text-slate-700"
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading || !input.trim()}
          className="w-full py-4 bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-600 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/20"
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={18} />}
          {isLoading ? 'Sedang Memproses...' : 'Hasilkan Ide'}
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
            <div className="p-4 bg-indigo-50 border-b border-indigo-100 font-bold text-indigo-900 text-sm">
              Hasil Ide Kreatif
            </div>
            <div className="p-8 prose prose-indigo max-w-none">
              <Markdown>{result}</Markdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

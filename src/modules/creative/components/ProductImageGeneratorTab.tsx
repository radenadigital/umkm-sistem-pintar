import React, { useState, useRef } from 'react';
import { 
  Plus, Search, Wand2, Loader2, Image as ImageIcon, 
  Download, RefreshCw, Palette, Target, Layout, 
  Trash2, Maximize2, CheckCircle2, AlertCircle,
  Eye, Save, Share2, Sparkles, Box
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { cn } from '../../../lib/utils';
import Modal from '../../../components/ui/Modal';

// Types for the generator
interface GenerationParams {
  name: string;
  description: string;
  type: 'photo' | 'packaging';
  style: string;
  color: string;
  target: string;
}

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  params: GenerationParams;
  timestamp: number;
}

const VISUAL_STYLES = [
  'Minimalist', 'Modern', 'Premium', 'Luxury', 'Natural', 
  'Rustic', 'Vibrant', 'Professional', 'Clean', 'Artistic'
];

const VISUAL_TYPES = [
  { id: 'photo', label: 'Foto Produk', icon: ImageIcon, description: 'Visual produk realistis untuk katalog.' },
  { id: 'packaging', label: 'Desain Kemasan', icon: Box, description: 'Konsep desain box atau wadah produk.' }
];

export default function ProductImageGeneratorTab() {
  const [params, setParams] = useState<GenerationParams>({
    name: '',
    description: '',
    type: 'photo',
    style: 'Modern',
    color: '',
    target: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Simple editing state
  const [editSettings, setEditSettings] = useState({
    brightness: 100,
    contrast: 100,
  });

  const handleGenerate = async () => {
    if (!params.name || !params.description) return;
    
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      // Constructing a detailed prompt for better results
      const prompt = `
        Create a high-quality, professional ${params.type === 'photo' ? 'product photograph' : 'packaging design concept'} for:
        Product Name: ${params.name}
        Product Description: ${params.description}
        Visual Style: ${params.style}
        Dominant Colors: ${params.color || 'Cohesive and natural'}
        Target Market: ${params.target || 'General consumers'}
        
        Requirements:
        - Must be visually appealing and suitable for marketing/ecommerce.
        - High resolution, detailed textures, and realistic lighting.
        - ${params.type === 'photo' ? 'Isolated on a professional studio background' : 'Clear presentation of the packaging mockup'}.
        - Do not include any text that isn't essential to the product's identity.
      `.trim();

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          }
        }
      });

      const newImages: GeneratedImage[] = [];
      
      // Process result parts to find images
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64Data = part.inlineData.data;
          const imageUrl = `data:image/png;base64,${base64Data}`;
          
          newImages.push({
            id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            url: imageUrl,
            prompt: prompt,
            params: { ...params },
            timestamp: Date.now()
          });
        }
      }

      setResults(prev => [...newImages, ...prev]);
    } catch (error) {
      console.error('Generation Error:', error);
      // Fallback for demo purposes if API fails or isn't configured
      // In a real app we'd show a proper error UI
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (img: GeneratedImage) => {
    const link = document.createElement('a');
    link.href = img.url;
    link.download = `${params.name.replace(/\s+/g, '_')}_${img.id}.png`;
    link.click();
  };

  const handleRemove = (id: string) => {
    setResults(prev => prev.filter(img => img.id !== id));
  };

  const handlePreview = (img: GeneratedImage) => {
    setSelectedImage(img);
    setIsPreviewOpen(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Input Panel */}
      <div className="lg:col-span-4 space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 bg-slate-900 text-white">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="text-amber-400" size={20} />
              AI Visual Generator
            </h3>
            <p className="text-xs text-slate-400 mt-1">Ciptakan visual produk dalam hitungan detik.</p>
            <button 
              onClick={() => {
                const saved = localStorage.getItem('umkm_business_profile');
                if (saved) {
                  try {
                    const profile = JSON.parse(saved);
                    setParams({
                      ...params,
                      name: profile?.general?.name || '',
                      description: profile?.general?.description || '',
                      target: profile?.targetMarket?.segments || ''
                    });
                  } catch (e) {
                    console.error("Failed to parse profile for autofill", e);
                  }
                }
              }}
              className="mt-4 w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border border-white/10"
            >
              Auto-fill dari Profil Bisnis
            </button>
          </div>
          
          <div className="p-6 space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nama Produk</label>
              <input 
                type="text" 
                placeholder="Contoh: Kopi Bubuk Robusta Gayo"
                value={params.name}
                onChange={e => setParams({...params, name: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Deskripsi Produk</label>
              <textarea 
                placeholder="Jelaskan detail produk, bahan, atau keunikan..."
                value={params.description}
                onChange={e => setParams({...params, description: e.target.value})}
                className="w-full h-24 px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-rose-500 outline-none transition-all resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Jenis Visual</label>
              <div className="grid grid-cols-2 gap-3">
                {VISUAL_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setParams({...params, type: type.id as any})}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all",
                      params.type === type.id 
                        ? "bg-rose-50 border-rose-500 text-rose-700" 
                        : "bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100"
                    )}
                  >
                    <type.icon size={20} />
                    <span className="text-[10px] font-bold uppercase">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Gaya Visual</label>
              <div className="flex flex-wrap gap-2">
                {VISUAL_STYLES.map(style => (
                  <button
                    key={style}
                    onClick={() => setParams({...params, style})}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                      params.style === style 
                        ? "bg-rose-500 text-white shadow-md shadow-rose-200" 
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Warna Dominan</label>
                <div className="relative">
                  <Palette size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Contoh: Gold, Red"
                    value={params.color}
                    onChange={e => setParams({...params, color: e.target.value})}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-xs focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Target Market</label>
                <div className="relative">
                  <Target size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Contoh: Gen Z"
                    value={params.target}
                    onChange={e => setParams({...params, target: e.target.value})}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-xs focus:ring-2 focus:ring-rose-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading || !params.name || !params.description}
              className="w-full py-4 bg-rose-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-rose-600 disabled:opacity-50 transition-all shadow-lg shadow-rose-200 mt-4 group"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Wand2 className="group-hover:rotate-12 transition-transform" size={18} />
              )}
              {isLoading ? 'Sedang Memproses...' : 'Generate Visual AI'}
            </button>
          </div>
        </div>
      </div>

      {/* Output Panel */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex-1 min-h-[500px]">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ImageIcon className="text-rose-500" size={18} />
              Galeri Hasil Generasi
            </h3>
            {results.length > 0 && (
              <button 
                onClick={handleGenerate}
                disabled={isLoading}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors"
                title="Generate ulang dengan input yang sama"
              >
                <RefreshCw className={cn(isLoading && "animate-spin")} size={14} />
                Generate Lagi
              </button>
            )}
          </div>

          {results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence>
                {results.map((img) => (
                  <motion.div
                    key={img.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group relative bg-slate-50 rounded-2xl overflow-hidden aspect-square border border-slate-100"
                  >
                    <img 
                      src={img.url} 
                      alt="AI Result" 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handlePreview(img)}
                          className="p-3 bg-white text-slate-900 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-xl"
                        >
                          <Maximize2 size={20} />
                        </button>
                        <button 
                          onClick={() => handleDownload(img)}
                          className="p-3 bg-white text-slate-900 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-xl"
                        >
                          <Download size={20} />
                        </button>
                      </div>
                      <button 
                        onClick={() => handleRemove(img.id)}
                        className="p-2 bg-white/20 text-white rounded-lg hover:bg-rose-500 transition-all backdrop-blur-md"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-black/50 backdrop-blur-md rounded-lg text-white text-[9px] font-bold uppercase tracking-wider">
                      {img.params.type === 'photo' ? 'Photo' : 'Packaging'} • {img.params.style}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-6">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                <ImageIcon size={48} />
              </div>
              <div className="max-w-xs space-y-2">
                <h4 className="font-bold text-slate-900 text-lg">Mulai Eksplorasi Visual</h4>
                <p className="text-sm text-slate-500">
                  Lengkapi form di sebelah kiri untuk menghasilkan foto produk atau konsep kemasan berbasis AI.
                </p>
              </div>
              {isLoading && (
                <div className="flex flex-col items-center gap-3 mt-4">
                  <div className="flex gap-1">
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-rose-500 rounded-full" />
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-rose-500 rounded-full" />
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-rose-500 rounded-full" />
                  </div>
                  <p className="text-xs font-bold text-rose-500 animate-pulse">Menghitung pixel terbaik...</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tips / Integration Section */}
        <div className="bg-rose-50 border border-rose-100 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="p-4 bg-white rounded-2xl shadow-sm text-rose-500">
            <Layout size={32} />
          </div>
          <div className="flex-1 space-y-1">
            <h4 className="font-bold text-rose-900">Gunakan di Fitur Lain</h4>
            <p className="text-sm text-rose-700/80">Hasil visual ini dapat Anda gunakan langsung sebagai foto produk di Toko Anda atau sebagai gambar utama di Landing Page Generator.</p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors">Pelajari Lebih Lanjut</button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <Modal 
        isOpen={isPreviewOpen} 
        onClose={() => {
          setIsPreviewOpen(false);
          setEditSettings({ brightness: 100, contrast: 100 });
        }} 
        title="Detail Visual AI"
        maxWidth="max-w-4xl"
      >
        {selectedImage && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-100 aspect-square bg-slate-100">
                  <img 
                    src={selectedImage.url} 
                    alt="Full preview" 
                    className="w-full h-full object-cover transition-all"
                    style={{ 
                      filter: `brightness(${editSettings.brightness}%) contrast(${editSettings.contrast}%)` 
                    }}
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Simple Editing Controls */}
                <div className="bg-slate-50 p-4 rounded-2xl space-y-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Wand2 size={12} className="text-rose-500" />
                    Edit Sederhana (Pre-Export)
                  </p>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold text-slate-600 uppercase">
                        <span>Kecerahan</span>
                        <span>{editSettings.brightness}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="50" 
                        max="150" 
                        value={editSettings.brightness}
                        onChange={(e) => setEditSettings({ ...editSettings, brightness: Number(e.target.value) })}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold text-slate-600 uppercase">
                        <span>Kontras</span>
                        <span>{editSettings.contrast}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="50" 
                        max="150" 
                        value={editSettings.contrast}
                        onChange={(e) => setEditSettings({ ...editSettings, contrast: Number(e.target.value) })}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-6 py-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full w-fit text-[10px] font-bold uppercase tracking-widest">
                    <CheckCircle2 size={12} />
                    Siap Digunakan
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedImage.params.name}</h2>
                  <p className="text-slate-500 text-sm italic">"{selectedImage.params.description}"</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Tipe', value: selectedImage.params.type === 'photo' ? 'Foto Produk' : 'Desain Kemasan', icon: ImageIcon },
                    { label: 'Gaya', value: selectedImage.params.style, icon: Sparkles },
                    { label: 'Warna', value: selectedImage.params.color || 'Otomatis', icon: Palette },
                    { label: 'Market', value: selectedImage.params.target || 'Umum', icon: Target }
                  ].map((stat, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-2xl">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                        <stat.icon size={10} className="text-slate-400" />
                        {stat.label}
                      </p>
                      <p className="text-sm font-bold text-slate-800">{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-3">
                  <AlertCircle size={18} className="text-indigo-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-indigo-900 mb-0.5">Saran Edit:</p>
                    <p className="text-xs text-indigo-700/80 leading-relaxed">Gunakan fitur Crop di Galeri HP/Laptop Anda untuk menyesuaikan framing sebelum diunggah ke marketplace.</p>
                  </div>
                </div>

                <div className="mt-auto flex gap-3">
                  <button 
                    onClick={() => handleDownload(selectedImage)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                  >
                    <Download size={18} />
                    Download Gambar
                  </button>
                  <button 
                    className="p-3 border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all"
                    title="Simpan ke Katalog"
                  >
                    <Save size={18} />
                  </button>
                  <button 
                    className="p-3 border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all"
                    title="Bagikan"
                  >
                    <Share2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

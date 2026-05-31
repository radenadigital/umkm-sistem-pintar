import React, { useState } from 'react';
import { Camera, Send, Loader2, Sparkles, Video, Image as ImageIcon, Layout, Wand2, Box, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { geminiService } from '../../services/gemini';
import Markdown from 'react-markdown';
import ProductImageGeneratorTab from './components/ProductImageGeneratorTab';

const creativeTools = [
  { id: 'visual-ai', label: 'Foto & Kemasan AI', icon: Sparkles, description: 'Generate foto produk dan desain kemasan otomatis.' },
  { id: 'video-script', label: 'Video Script', icon: Video, description: 'Buat skrip video pendek untuk TikTok atau Instagram Reels.' },
  { id: 'promo-banner', label: 'Promo Generator', icon: Layout, description: 'Ide konsep visual dan teks untuk banner promosi.' },
  { id: 'mockup-idea', label: 'Ide Mockup', icon: ImageIcon, description: 'Saran visualisasi produk dan mockup kreatif.' },
];

export default function Creative() {
  const [selectedTool, setSelectedTool] = useState(creativeTools[0].id);
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    try {
      const toolLabel = creativeTools.find(t => t.id === selectedTool)?.label || selectedTool;
      const prompt = `Generate a ${toolLabel} for the following business/product: ${input}. Provide creative and actionable ideas.`;
      const response = await geminiService.generateMarketingContent(toolLabel, prompt);
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
          <Camera className="text-rose-500" />
          Creative Studio
        </h1>
        <p className="text-slate-500">Ubah ide bisnis Anda menjadi aset visual dan konten kreatif yang menarik.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
          {creativeTools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setSelectedTool(tool.id)}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                selectedTool === tool.id 
                  ? 'bg-rose-50 border-rose-200 shadow-sm ring-1 ring-rose-500/20' 
                  : 'bg-white border-slate-200 hover:border-rose-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3 mb-1">
                <div className={`p-2 rounded-lg ${selectedTool === tool.id ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <tool.icon size={18} />
                </div>
                <span className={`font-bold ${selectedTool === tool.id ? 'text-rose-900' : 'text-slate-700'}`}>{tool.label}</span>
              </div>
              <p className="text-xs text-slate-500 ml-11">{tool.description}</p>
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 flex flex-col gap-6">
          {selectedTool === 'visual-ai' ? (
            <ProductImageGeneratorTab />
          ) : (
            <>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <Wand2 size={16} className="text-rose-500" />
                  Apa yang ingin Anda buat?
                </div>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Contoh: Saya ingin buat video TikTok untuk jualan Roti Bakar Keju dengan vibe yang asik dan ceria..."
                  className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all resize-none text-slate-700"
                />
                <button
                  onClick={handleGenerate}
                  disabled={isLoading || !input.trim()}
                  className="w-full py-4 bg-rose-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-rose-600 disabled:opacity-50 transition-all shadow-lg shadow-rose-500/20"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={18} />}
                  {isLoading ? 'Sedang Memproses...' : 'Hasilkan Ide Kreatif'}
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
                    <div className="p-4 bg-rose-50 border-b border-rose-100 font-bold text-rose-900 text-sm">
                      Rencana Kreatif AI
                    </div>
                    <div className="p-8 prose prose-rose max-w-none">
                      <Markdown>{result}</Markdown>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

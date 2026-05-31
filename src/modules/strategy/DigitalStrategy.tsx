import React, { useState } from 'react';
import { Lightbulb, Send, Loader2, Sparkles, FileText, Target, PieChart, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { geminiService } from '../../services/gemini';
import Markdown from 'react-markdown';

const strategyTypes = [
  { id: 'swot', label: 'Analisis SWOT', icon: PieChart, description: 'Analisis kekuatan, kelemahan, peluang, dan ancaman bisnis Anda.' },
  { id: 'idea', label: 'Ide Pertumbuhan', icon: TrendingUp, description: 'Dapatkan 5 ide inovatif untuk mengembangkan bisnis Anda.' },
  { id: 'pricing', label: 'Strategi Harga', icon: Target, description: 'Saran penetapan harga berdasarkan nilai dan pasar.' },
  { id: 'market', label: 'Tren Pasar', icon: Lightbulb, description: 'Wawasan tren industri dan analisis kompetitor.' },
];

export default function DigitalStrategy() {
  const [selectedType, setSelectedType] = useState<'swot' | 'idea' | 'pricing' | 'market'>('swot');
  const [businessInfo, setBusinessInfo] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!businessInfo.trim()) return;
    setIsLoading(true);
    try {
      const response = await geminiService.generateBusinessStrategy(selectedType, businessInfo);
      setResult(response);
    } catch (error) {
      console.error(error);
      setResult('Maaf, terjadi kesalahan saat menyusun strategi. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Lightbulb className="text-amber-500" />
          Strategi Digital & Konsultasi AI
        </h1>
        <p className="text-slate-500">Gunakan AI sebagai konsultan bisnis pribadi Anda untuk menyusun strategi pertumbuhan.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
          {strategyTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id as any)}
              className={`w-full text-left p-4 rounded-2xl border transition-all ${
                selectedType === type.id 
                  ? 'bg-amber-50 border-amber-200 shadow-sm ring-1 ring-amber-500/20' 
                  : 'bg-white border-slate-200 hover:border-amber-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3 mb-1">
                <div className={`p-2 rounded-lg ${selectedType === type.id ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <type.icon size={18} />
                </div>
                <span className={`font-bold ${selectedType === type.id ? 'text-amber-900' : 'text-slate-700'}`}>{type.label}</span>
              </div>
              <p className="text-xs text-slate-500 ml-11">{type.description}</p>
            </button>
          ))}
        </div>

        <div className="lg:col-span-3 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <Sparkles size={16} className="text-amber-500" />
              Ceritakan tentang bisnis Anda
            </div>
            <textarea
              value={businessInfo}
              onChange={(e) => setBusinessInfo(e.target.value)}
              placeholder="Contoh: Saya menjalankan kedai kopi kecil di Bandung. Fokus utama saya adalah kopi lokal dengan harga terjangkau. Saya ingin bersaing dengan franchise besar..."
              className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none text-slate-700 leading-relaxed"
            />
            <button
              onClick={handleGenerate}
              disabled={isLoading || !businessInfo.trim()}
              className="w-full py-4 bg-amber-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-500/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Menganalisis Bisnis...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Susun Strategi
                </>
              )}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                <div className="p-4 bg-amber-50 border-b border-amber-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-amber-600" />
                    <span className="text-sm font-bold text-amber-900">Hasil Laporan Strategi Digital</span>
                  </div>
                </div>
                <div className="p-8 markdown-body">
                  <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-700 prose-ul:text-slate-700">
                    <Markdown>{result}</Markdown>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

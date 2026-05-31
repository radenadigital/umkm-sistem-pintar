import React, { useState } from 'react';
import { Sparkles, MessageSquare, FileText, Send, Loader2, Copy, Check, Hash, Mail, Video, Percent, Image, Shield, Lightbulb, Coins, TrendingUp, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { geminiService } from '../../services/gemini';
import { cn } from '../../lib/utils';

const toolTypes = [
  { id: 'caption', label: 'Caption Sosmed', icon: MessageSquare, description: 'Buat caption Instagram, TikTok, atau FB yang menarik.' },
  { id: 'copywriting', label: 'Copywriting', icon: FileText, description: 'Teks persuasif untuk jualan atau landing page.' },
  { id: 'email', label: 'Email Marketing', icon: Mail, description: 'Template email untuk promo atau newsletter.' },
  { id: 'article', label: 'Artikel Meta SEO', icon: Hash, description: 'Artikel pendek yang ramah mesin pencari.' },
  { id: 'video', label: 'Video Script', icon: Video, description: 'Buat skrip video pendek untuk TikTok atau Instagram Reels.' },
  { id: 'promo', label: 'Promo Generator', icon: Percent, description: 'Ide konsep visual dan teks untuk banner promosi.' },
  { id: 'mockup', label: 'Ide Mockup', icon: Image, description: 'Saran visualisasi produk dan mockup kreatif.' },
  { id: 'swot', label: 'Analisis SWOT', icon: Shield, description: 'Analisis kekuatan, kelemahan, peluang, dan ancaman bisnis Anda.' },
  { id: 'growth', label: 'Ide Pertumbuhan', icon: Lightbulb, description: 'Dapatkan 5 ide inovatif untuk mengembangkan bisnis Anda.' },
  { id: 'pricing', label: 'Strategi Harga', icon: Coins, description: 'Saran penetapan harga berdasarkan nilai dan pasar.' },
  { id: 'market', label: 'Tren Pasar', icon: TrendingUp, description: 'Wawasan tren industri dan analisis kompetitor.' },
];

const TONES = ['Persuasif', 'Santai', 'Formal', 'Lucu', 'Sangat Bersemangat'];
const PLATFORMS = {
  caption: ['Instagram', 'TikTok', 'Facebook', 'Twitter'],
  copywriting: ['Landing Page', 'Facebook Ads', 'Google Ads', 'Deskripsi Produk'],
  email: ['Promo', 'Newsletter', 'Welcome Email', 'Follow-up Customer'],
  article: ['Artikel Blog', 'Meta Description', 'Google My Business'],
  video: ['TikTok Reels', 'Instagram Reels', 'YouTube Shorts', 'Iklan Video'],
  promo: ['Banner Toko', 'Instagram Feed', 'Flyer Digital', 'WhatsApp Banner'],
  mockup: ['Mockup Kemasan', 'Mockup Kaos/T-shirt', 'Mockup Botol/Gelas', 'Foto Produk Studio'],
  swot: ['SWOT Dasar', 'SWOT Mendalam'],
  growth: ['Inovasi Produk', 'Strategi Pemasaran', 'Kemitraan/Kolaborasi', 'Ekspansi Pasar'],
  pricing: ['Cost-Based Pricing', 'Value-Based Pricing', 'Competitor Pricing'],
  market: ['Tren Konsumen', 'Analisis Kompetitor', 'Rekomendasi Niche']
};

const getInputLabel = (toolId: string) => {
  switch (toolId) {
    case 'swot':
      return 'Detail Bisnis & Niche Industri Anda';
    case 'growth':
      return 'Model Bisnis & Target Pasar Anda';
    case 'pricing':
      return 'HPP (Harga Pokok), Biaya Produksi & Nilai Produk';
    case 'market':
      return 'Sektor Industri & Kompetitor Utama';
    default:
      return 'Detail Promosi Produk / Jasa';
  }
};

const getInputPlaceholder = (toolId: string) => {
  switch (toolId) {
    case 'swot':
      return 'Contoh: Kedai kopi susu lokal di daerah perumahan padat BSD, menyasar anak muda & pekerja WFH, persaingan ketat dengan brand waralaba besar...';
    case 'growth':
      return 'Contoh: Katering harian sehat rendah kalori di Jakarta Selatan untuk pekerja kantoran sibuk...';
    case 'pricing':
      return 'Contoh: Jual keripik tempe premium dengan bahan organik, biaya produksi Rp 8.000/kemasan, target ingin margin untung bagus tapi berkompetisi sehat...';
    case 'market':
      return 'Contoh: Fashion busana muslim syari online, menyasar ibu muda produktif, kompetitor utama sering banting harga...';
    default:
      return 'Contoh: Promo Kopi Susu Gula Aren diskon 20% untuk mahasiswa di akhir pekan, cabang baru di BSD...';
  }
};

export default function AITools() {
  const [selectedTool, setSelectedTool] = useState(toolTypes[0].id);
  const [input, setInput] = useState('');
  const [tone, setTone] = useState('Persuasif');
  const [platform, setPlatform] = useState('Instagram');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSelectTool = (id: string) => {
    setSelectedTool(id);
    setErrorMessage('');
    const availablePlatforms = PLATFORMS[id as keyof typeof PLATFORMS] || [];
    if (availablePlatforms.length > 0) {
      setPlatform(availablePlatforms[0]);
    }
  };

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    setErrorMessage('');
    setOutput('');
    try {
      const toolLabel = toolTypes.find(t => t.id === selectedTool)?.label || selectedTool;
      const result = await geminiService.generateMarketingContent(toolLabel, input, { tone, platform });
      setOutput(result || '');
    } catch (error) {
      console.error(error);
      const errorMsg = error instanceof Error ? error.message : 'Maaf, terjadi kesalahan saat menghubungi AI. Silakan coba lagi.';
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentPlatforms = PLATFORMS[selectedTool as keyof typeof PLATFORMS] || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="text-indigo-600" />
          AI Marketing Content
        </h1>
        <p className="text-slate-500">Buat draf konten pemasaran profesional bertenaga AI dalam hitungan detik.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Tool Categories */}
        <div className="lg:col-span-1 space-y-4">
          {toolTypes.map((tool) => (
            <button
              key={tool.id}
              onClick={() => handleSelectTool(tool.id)}
              className={cn(
                "w-full text-left p-4 rounded-2xl border transition-all duration-200 outline-none cursor-pointer",
                selectedTool === tool.id 
                  ? 'bg-indigo-50 border-indigo-200 shadow-sm ring-2 ring-indigo-500/10' 
                  : 'bg-white border-slate-200 hover:border-indigo-200 hover:bg-slate-50/50'
              )}
            >
              <div className="flex items-center gap-3 mb-1">
                <div className={cn(
                  "p-2 rounded-lg transition-colors",
                  selectedTool === tool.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                )}>
                  <tool.icon size={18} />
                </div>
                <span className={cn(
                  "font-bold text-sm tracking-tight",
                  selectedTool === tool.id ? 'text-indigo-950' : 'text-slate-700'
                )}>{tool.label}</span>
              </div>
              <p className="text-[11px] text-slate-400 ml-11 leading-relaxed">{tool.description}</p>
            </button>
          ))}
        </div>

        {/* Right columns: Editor & Outputs */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            
            {/* Input area */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                {getInputLabel(selectedTool)}
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={getInputPlaceholder(selectedTool)}
                className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 transition-all text-sm leading-relaxed text-slate-800 font-medium"
              />
            </div>

            {/* Config controls: Tone and Platform */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Tone selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nada Bicara (Tone)</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-xs font-bold text-slate-700 outline-none"
                >
                  {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              {/* Platform selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Media / Platform</label>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {currentPlatforms.map(p => (
                    <button
                      key={p}
                      onClick={() => setPlatform(p)}
                      className={cn(
                        "px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all border cursor-pointer",
                        platform === p 
                          ? "bg-slate-900 border-slate-900 text-white font-black" 
                          : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Generate Action Button */}
            <button
              onClick={handleGenerate}
              disabled={isLoading || !input.trim()}
              className={cn(
                "w-full py-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg cursor-pointer",
                input.trim() ? "bg-indigo-600 text-white shadow-indigo-500/10" : "bg-slate-100 text-slate-400 shadow-none border border-slate-200/50"
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  SEDANG MENGHASILKAN KONTEN...
                </>
              ) : (
                <>
                  <Send size={15} />
                  BUAT KONTEN SEKARANG
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          <AnimatePresence mode="wait">
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="bg-red-50 border border-red-200 rounded-3xl p-6 shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-red-100 rounded-lg text-red-600">
                    <AlertCircle size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-red-800 text-sm mb-2">Terjadi Kesalahan</h3>
                    <p className="text-red-700 text-sm">{errorMessage}</p>
                    <div className="mt-4">
                      <p className="text-xs text-red-600 mb-2">Untuk mengaktifkan fitur AI, Anda perlu:</p>
                      <ol className="text-xs text-red-600 list-decimal list-inside space-y-1">
                        <li>Buka file <code className="bg-red-100 px-1 py-0.5 rounded">.env.local</code> di direktori root</li>
                        <li>Dapatkan API Key dari <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-red-800 underline hover:text-red-900">Google AI Studio</a></li>
                        <li>Tambahkan baris: <code className="bg-red-100 px-1 py-0.5 rounded">GEMINI_API_KEY="YOUR_API_KEY_HERE"</code></li>
                        <li>Refresh halaman setelah menyimpan</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Outputs */}
          <AnimatePresence mode="wait">
            {output && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
              >
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between px-6">
                  <span className="text-xs font-bold text-slate-600 tracking-wider uppercase">Hasil Konten</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={copyToClipboard}
                      className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                    >
                      {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      {copied ? 'Tersalin' : 'Salin Teks'}
                    </button>
                  </div>
                </div>
                {/* Visual rendering of Markdown output */}
                <div className="p-8 prose prose-slate prose-sm max-w-none prose-headings:text-slate-900 prose-headings:font-bold prose-p:text-slate-700 prose-p:leading-relaxed prose-li:text-slate-600 prose-strong:text-slate-900">
                  <ReactMarkdown>{output}</ReactMarkdown>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

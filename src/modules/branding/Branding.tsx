import React, { useState, useRef } from 'react';
import { Palette, Send, Loader2, Sparkles, Type, Layout, Check, Copy, AlertCircle, Save, Image, Eye, Trash2, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { geminiService } from '../../services/gemini';
import { useDb } from '../../contexts/DatabaseContext';
import { toPng } from 'html-to-image';

interface LogoSuggestion {
  id: string;
  name: string;
  style: string;
  colors: string[];
  concept: string;
  tagline: string;
  iconCategory?: string;
}

export default function Branding() {
  const { db, setDb } = useDb();
  const [businessName, setBusinessName] = useState(db.profile?.name || '');
  const [businessType, setBusinessType] = useState(db.profile?.type || '');
  const [style, setStyle] = useState('modern');
  const [logoType, setLogoType] = useState('text-icon');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [logoSuggestions, setLogoSuggestions] = useState<LogoSuggestion[]>([]);
  const logoRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const downloadLogo = async (suggestion: LogoSuggestion) => {
    const element = logoRefs.current[suggestion.id];
    if (!element) return;

    try {
      const dataUrl = await toPng(element, {
        quality: 1.0,
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        width: 400,
        height: 400,
        style: {
          transform: 'scale(1)',
          margin: '0',
        }
      });

      const link = document.createElement('a');
      link.download = `${businessName.replace(/\s+/g, '_')}_logo_${suggestion.id}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to download logo:', error);
      alert('Gagal mengunduh logo. Silakan coba lagi.');
    }
  };

  // Fungsi untuk menentukan icon logo yang cocok dengan konsep dan kategori
  const getLogoIcon = (suggestion: LogoSuggestion, index: number) => {
    const conceptLower = suggestion.concept.toLowerCase();
    const category = suggestion.iconCategory?.toLowerCase() || '';
    const businessTypeLower = businessType.toLowerCase();
    
    // Mapping kategori ke icon
    const categoryIcons: { [key: string]: string[] } = {
      makanan: ['🍔', '🍕', '🍽️', '☕', '🍰', '🍜', '🥗', '🍪'],
      fashion: ['👗', '👔', '👜', '👠', '🧥', '🎽', '👟', '🧢'],
      teknologi: ['💻', '📱', '🚀', '⚡', '💡', '🔧', '📊', '🎯'],
      jasa: ['✂️', '💆', '💇', '🎯', '⭐', '🏆', '✅', '👑'],
      pendidikan: ['📚', '🎓', '✏️', '📖', '🧮', '🔬', '🌍', '🎨'],
      kesehatan: ['❤️', '💊', '🏥', '🩺', '🌿', '💪', '🧘', '✨'],
      kreatif: ['🎨', '✨', '🎭', '🎵', '🎬', '📷', '🎤', '🎪'],
      olahraga: ['⚽', '🏀', '🏃', '🚴', '🏋️', '🎾', '🏊', '⚡'],
      umum: ['⭐', '💎', '✨', '🌟', '🔥', '💫', '❤️', '🎁']
    };

    // Coba cek kata kunci di konsep untuk lebih akurat
    if (conceptLower.includes('kue') || conceptLower.includes('makan') || conceptLower.includes('makanan') || businessTypeLower.includes('kue') || businessTypeLower.includes('makanan')) {
      const icons = ['🍰', '🍪', '🧁', '🍩', '🎂', '🍽️'];
      return icons[index % icons.length];
    }
    if (conceptLower.includes('kopi') || conceptLower.includes('cafe') || businessTypeLower.includes('kopi')) {
      const icons = ['☕', '🍵', '🥤', '🍶', '🫖'];
      return icons[index % icons.length];
    }
    if (conceptLower.includes('baju') || conceptLower.includes('fashion') || conceptLower.includes('pakaian') || businessTypeLower.includes('fashion')) {
      const icons = ['👗', '👔', '👜', '🧥', '👠', '🧢'];
      return icons[index % icons.length];
    }
    if (conceptLower.includes('teknologi') || conceptLower.includes('digital') || conceptLower.includes('app') || businessTypeLower.includes('teknologi')) {
      const icons = ['💻', '📱', '🚀', '⚡', '💡', '🎯'];
      return icons[index % icons.length];
    }
    if (conceptLower.includes('kesehatan') || conceptLower.includes('medis') || businessTypeLower.includes('kesehatan')) {
      const icons = ['❤️', '💊', '🏥', '🩺', '🌿', '💪'];
      return icons[index % icons.length];
    }
    if (conceptLower.includes('pendidikan') || conceptLower.includes('sekolah') || businessTypeLower.includes('pendidikan')) {
      const icons = ['📚', '🎓', '✏️', '📖', '🧮', '🔬'];
      return icons[index % icons.length];
    }
    if (conceptLower.includes('olahraga') || conceptLower.includes('fitness') || businessTypeLower.includes('olahraga')) {
      const icons = ['⚽', '🏀', '🏃', '🚴', '🏋️', '⚡'];
      return icons[index % icons.length];
    }
    if (conceptLower.includes('seni') || conceptLower.includes('desain') || conceptLower.includes('kreatif') || businessTypeLower.includes('desain')) {
      const icons = ['🎨', '✨', '🎭', '🎵', '🎬', '📷'];
      return icons[index % icons.length];
    }

    // Fallback ke kategori
    if (category && categoryIcons[category]) {
      return categoryIcons[category][index % categoryIcons[category].length];
    }

    // Fallback default
    const defaultIcons = ['⭐', '✨', '💎', '🎨', '🚀', '❤️', '🔥', '💡'];
    return defaultIcons[(businessName.length + index) % defaultIcons.length];
  };

  // Fungsi untuk mendapatkan bentuk geometris berdasarkan gaya
  const getLogoShape = (style: string, index: number) => {
    const shapes = [
      'rounded-full', // lingkaran
      'rounded-2xl', // kotak sudut tumpul
      'rounded-lg', // kotak
      '', // tanpa shape (modern)
      'rounded-full', // lingkaran
    ];
    return shapes[index % shapes.length];
  };

  const logoTypes = [
    { id: 'text-icon', label: 'Gambar + Teks', icon: '🎨' },
    { id: 'text-only', label: 'Teks Saja', icon: '📝' },
    { id: 'icon-only', label: 'Gambar Saja', icon: '🎭' },
  ];

  const styles = [
    { id: 'modern', label: 'Modern & Minimalis' },
    { id: 'playful', label: 'Fun & Playful' },
    { id: 'elegant', label: 'Elegan & Mewah' },
    { id: 'bold', label: 'Bold & Kuat' },
    { id: 'vintage', label: 'Vintage & Retro' },
    { id: '3d-clay', label: '3D Clay' },
  ];

  const handleGenerate = async () => {
    if (!businessName.trim() || !businessType.trim()) return;
    setIsLoading(true);
    setErrorMessage('');
    try {
      const logoTypeLabel = logoType === 'text-icon' ? 'gambar dan teks' : logoType === 'text-only' ? 'teks saja' : 'gambar saja';
      
      const result = await geminiService.generateMarketingContent(
        'custom',
        businessName,
        {
          tone: 'professional',
          platform: `Buat 3 konsep logo untuk bisnis "${businessName}" yang bergerak di bidang ${businessType} dengan gaya ${style} dan jenis logo ${logoTypeLabel}. 
        Berikan jawaban dalam format JSON array dengan struktur: 
        [{"name":"nama konsep","style":"deskripsi gaya","colors":["#hex1","#hex2","#hex3"],"concept":"penjelasan konsep secara detail","tagline":"tagline singkat","iconCategory":"kategori icon yang cocok: makanan, fashion, teknologi, jasa, pendidikan, kesehatan, kreatif, olahraga, atau umum"}]`
        }
      );

      let suggestions;
      try {
        suggestions = JSON.parse(result);
      } catch {
        const jsonMatch = result.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          suggestions = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Format respons tidak valid');
        }
      }

      const suggestionsWithId = suggestions.map((s: any, i: number) => ({
        id: `logo-${Date.now()}-${i}`,
        ...s
      }));
      
      setLogoSuggestions(suggestionsWithId);
      
    } catch (error) {
      console.error(error);
      const errorMsg = error instanceof Error ? error.message : 'Maaf, terjadi kesalahan saat menghubungi AI.';
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const deleteSuggestion = (id: string) => {
    setLogoSuggestions(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Palette className="text-indigo-600" />
          Buat Logo
        </h1>
        <p className="text-slate-500">Dapatkan konsep logo profesional untuk bisnis Anda dengan bantuan AI.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-center mb-2">
            <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Sparkles size={32} />
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-900 text-center">Desain Logo Impian Anda</h2>
          <p className="text-slate-500 text-sm text-center">
            Isi detail bisnis Anda, pilih gaya desain, dan AI akan memberikan 3 konsep logo menarik!
          </p>
          
          <div className="space-y-4 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nama Usaha</label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Masukkan nama usaha Anda"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Jenis Bisnis</label>
                <input
                  type="text"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  placeholder="Contoh: Toko kue, Jasa laundry"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Jenis Logo</label>
              <div className="grid grid-cols-3 gap-2">
                {logoTypes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setLogoType(t.id)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all flex flex-col items-center gap-2 ${
                      logoType === t.id
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <span className="text-xl">{t.icon}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Pilih Gaya Desain</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {styles.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setStyle(s.id)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      style === s.id
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading || !businessName.trim() || !businessType.trim()}
            className="w-full px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/20 mt-6"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Palette size={18} />}
            {isLoading ? 'Sedang Membuat Konsep Logo...' : 'Buat Konsep Logo'}
          </button>
        </div>

        {/* Error Message */}
        <AnimatePresence mode="wait">
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="bg-red-50 border border-red-200 rounded-3xl p-6 shadow-sm mt-6"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 bg-red-100 rounded-lg text-red-600">
                  <AlertCircle size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-red-800 text-sm mb-2">Terjadi Kesalahan</h3>
                  <p className="text-red-700 text-sm">{errorMessage}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {logoSuggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-12 border-t border-slate-100"
            >
              {logoSuggestions.map((suggestion) => (
                <motion.div
                  key={suggestion.id}
                  layout
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group"
                >
                  <div className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <h3 className="font-bold text-slate-900 text-lg">{suggestion.name}</h3>
                      <button
                        onClick={() => deleteSuggestion(suggestion.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <div 
                      ref={(el) => (logoRefs.current[suggestion.id] = el)}
                      className={`h-40 rounded-xl flex flex-col items-center justify-center border border-slate-200 overflow-hidden p-3 ${style === '3d-clay' ? 'shadow-[0_10px_30px_rgba(0,0,0,0.2),inset_0_2px_10px_rgba(255,255,255,0.3)]' : 'shadow-inner'}`}
                      style={{ 
                        background: suggestion.colors.length > 1 
                          ? `linear-gradient(145deg, ${suggestion.colors[0]}, ${suggestion.colors[1]})` 
                          : (suggestion.colors[0] || '#f1f5f9')
                      }}
                    >
                      {logoType === 'text-icon' && (
                        <>
                          {/* Variasi desain logo 1: Badge dengan icon */}
                          {logoSuggestions.indexOf(suggestion) === 0 && (
                            <div className="text-center px-4 space-y-2">
                              <div className={`w-16 h-16 mx-auto ${getLogoShape(style, 0)} bg-white/30 backdrop-blur-sm flex items-center justify-center text-3xl border-2 border-white/40 ${style === '3d-clay' ? 'shadow-[0_8px_20px_rgba(0,0,0,0.2),inset_0_3px_10px_rgba(255,255,255,0.4)]' : 'shadow-lg'}`}>
                                {getLogoIcon(suggestion, 0)}
                              </div>
                              <div className={`font-black text-base tracking-widest ${style === '3d-clay' ? 'text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]' : 'text-white drop-shadow-md'}`}>
                                {businessName.split(' ').map(w => w.charAt(0).toUpperCase()).join('')}
                              </div>
                              <div className="text-white/75 text-[10px] font-medium tracking-wider drop-shadow max-w-full truncate">
                                {suggestion.tagline}
                              </div>
                            </div>
                          )}

                          {/* Variasi desain logo 2: Kotak dengan icon besar */}
                          {logoSuggestions.indexOf(suggestion) === 1 && (
                            <div className="flex flex-col items-center gap-2 px-4">
                              <div className="flex items-center gap-2">
                                <div className={`text-4xl ${style === '3d-clay' ? 'drop-shadow-[0_4px_8px_rgba(0,0,0,0.25)]' : 'drop-shadow-md'}`}>
                                  {getLogoIcon(suggestion, 1)}
                                </div>
                                <div className="h-8 w-px bg-white/40" />
                                <div className={`font-extrabold text-lg tracking-tighter ${style === '3d-clay' ? 'text-white drop-shadow-[0_3px_6px_rgba(0,0,0,0.25)]' : 'text-white drop-shadow-md'}`}>
                                  {businessName.split(' ')[0]}
                                </div>
                              </div>
                              <div className="text-white/75 text-[10px] font-medium tracking-wide drop-shadow max-w-full truncate">
                                {suggestion.tagline}
                              </div>
                            </div>
                          )}

                          {/* Variasi desain logo 3: Lingkaran dengan teks di luar */}
                          {logoSuggestions.indexOf(suggestion) === 2 && (
                            <div className="relative text-center">
                              <div className={`w-18 h-18 mx-auto rounded-full bg-white/35 backdrop-blur-sm border-3 border-white/60 flex items-center justify-center text-5xl ${style === '3d-clay' ? 'shadow-[0_10px_25px_rgba(0,0,0,0.25),inset_0_4px_12px_rgba(255,255,255,0.45)]' : 'shadow-xl'}`}>
                                {getLogoIcon(suggestion, 2)}
                              </div>
                              <div className={`mt-1 font-bold text-xs tracking-wider ${style === '3d-clay' ? 'text-white drop-shadow-[0_3px_6px_rgba(0,0,0,0.2)]' : 'text-white/90 drop-shadow'}`}>
                                {businessName.split(' ').slice(0, 2).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                              </div>
                              <div className="mt-1 text-white/70 text-[9px] font-medium tracking-wider drop-shadow max-w-full truncate">
                                {suggestion.tagline}
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {logoType === 'text-only' && (
                        <>
                          {/* Variasi desain text-only 1 */}
                          {logoSuggestions.indexOf(suggestion) === 0 && (
                            <div className="text-center px-4 space-y-1">
                              <div className={`font-black text-xl tracking-[0.3em] uppercase ${style === '3d-clay' ? 'text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]' : 'text-white drop-shadow-md'}`}>
                                {businessName.charAt(0)}
                              </div>
                              <div className="h-0.5 w-10 mx-auto bg-white/50" />
                              <div className="text-white/80 text-[10px] font-semibold tracking-wide drop-shadow">
                                {businessName}
                              </div>
                              <div className="text-white/65 text-[8px] font-medium tracking-wide drop-shadow max-w-full truncate">
                                {suggestion.tagline}
                              </div>
                            </div>
                          )}

                          {/* Variasi desain text-only 2 */}
                          {logoSuggestions.indexOf(suggestion) === 1 && (
                            <div className="text-center px-4 space-y-1">
                              <div className={`font-extrabold text-lg tracking-tighter ${style === '3d-clay' ? 'text-white drop-shadow-[0_3px_6px_rgba(0,0,0,0.25)]' : 'text-white drop-shadow-md'}`}>
                                {businessName.split(' ')[0]}
                              </div>
                              <div className="text-white/70 text-[9px] tracking-[0.2em] uppercase">
                                {businessName.split(' ').slice(1).join(' ')}
                              </div>
                              <div className="text-white/65 text-[8px] font-medium tracking-wide drop-shadow max-w-full truncate">
                                {suggestion.tagline}
                              </div>
                            </div>
                          )}

                          {/* Variasi desain text-only 3 */}
                          {logoSuggestions.indexOf(suggestion) === 2 && (
                            <div className={`bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20 text-center ${style === '3d-clay' ? 'shadow-[0_6px_15px_rgba(0,0,0,0.2)]' : ''}`}>
                              <div className={`font-black text-base tracking-widest uppercase ${style === '3d-clay' ? 'text-white drop-shadow-[0_3px_6px_rgba(0,0,0,0.25)]' : 'text-white drop-shadow-md'}`}>
                                {businessName.split(' ').map(w => w.charAt(0)).join('')}
                              </div>
                              <div className="text-white/65 text-[8px] font-medium tracking-wide drop-shadow max-w-full truncate mt-1">
                                {suggestion.tagline}
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {logoType === 'icon-only' && (
                        <>
                          {/* Variasi desain icon-only 1: Lingkaran penuh */}
                          {logoSuggestions.indexOf(suggestion) === 0 && (
                            <div className="text-center space-y-2">
                              <div className={`w-20 h-20 rounded-full bg-white/25 backdrop-blur-sm border-3 border-white/40 flex items-center justify-center ${style === '3d-clay' ? 'shadow-[0_12px_30px_rgba(0,0,0,0.25),inset_0_4px_12px_rgba(255,255,255,0.45)]' : 'shadow-xl'}`}>
                                <div className={`text-5xl ${style === '3d-clay' ? 'drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]' : 'drop-shadow-md'}`}>
                                  {getLogoIcon(suggestion, 0)}
                                </div>
                              </div>
                              <div className="text-white/75 text-[10px] font-medium tracking-wider drop-shadow max-w-full truncate">
                                {suggestion.tagline}
                              </div>
                            </div>
                          )}

                          {/* Variasi desain icon-only 2: Kotak */}
                          {logoSuggestions.indexOf(suggestion) === 1 && (
                            <div className="text-center space-y-2">
                              <div className={`w-18 h-18 rounded-2xl bg-white/30 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center ${style === '3d-clay' ? 'shadow-[0_10px_25px_rgba(0,0,0,0.2),inset_0_3px_10px_rgba(255,255,255,0.4)]' : 'shadow-xl'}`}>
                                <div className={`text-4xl ${style === '3d-clay' ? 'drop-shadow-[0_3px_6px_rgba(0,0,0,0.25)]' : 'drop-shadow-md'}`}>
                                  {getLogoIcon(suggestion, 1)}
                                </div>
                              </div>
                              <div className="text-white/75 text-[10px] font-medium tracking-wide drop-shadow max-w-full truncate">
                                {suggestion.tagline}
                              </div>
                            </div>
                          )}

                          {/* Variasi desain icon-only 3: Hexagon-like */}
                          {logoSuggestions.indexOf(suggestion) === 2 && (
                            <div className="text-center space-y-2">
                              <div className={`w-20 h-20 bg-white/25 backdrop-blur-sm border-3 border-white/40 flex items-center justify-center ${style === '3d-clay' ? 'shadow-[0_12px_30px_rgba(0,0,0,0.25),inset_0_4px_12px_rgba(255,255,255,0.45)]' : 'shadow-xl'}`}
                                   style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
                              >
                                <div className={`text-5xl ${style === '3d-clay' ? 'drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]' : 'drop-shadow-md'}`}>
                                  {getLogoIcon(suggestion, 2)}
                                </div>
                              </div>
                              <div className="text-white/75 text-[10px] font-medium tracking-wider drop-shadow max-w-full truncate">
                                {suggestion.tagline}
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Fallback untuk desain lainnya */}
                      {logoSuggestions.indexOf(suggestion) > 2 && (
                        <div className="text-center space-y-2 px-4">
                          <div className={`text-3xl ${style === '3d-clay' ? 'drop-shadow-[0_3px_6px_rgba(0,0,0,0.25)]' : 'drop-shadow-md'}`}>
                            {getLogoIcon(suggestion, logoSuggestions.indexOf(suggestion))}
                          </div>
                          <div className={`font-black text-lg tracking-tight ${style === '3d-clay' ? 'text-white drop-shadow-[0_3px_6px_rgba(0,0,0,0.25)]' : 'text-white/95 drop-shadow-md'}`}>
                            {businessName.charAt(0).toUpperCase()}
                          </div>
                          <div className="text-white/70 text-[9px] font-medium tracking-wide drop-shadow max-w-full truncate">
                            {suggestion.tagline}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gaya Desain</div>
                      <p className="text-sm text-slate-700">{suggestion.style}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Warna Rekomendasi</div>
                      <div className="flex gap-2 flex-wrap">
                        {suggestion.colors.map((color, i) => (
                          <div
                            key={i}
                            className="w-10 h-10 rounded-lg shadow-sm border border-slate-200 flex items-center justify-center"
                            style={{ backgroundColor: color }}
                            title={color}
                          >
                            <Eye size={12} className="text-white opacity-80" />
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Konsep</div>
                      <p className="text-sm text-slate-700 leading-relaxed">{suggestion.concept}</p>
                    </div>
                    
                    <div className="space-y-2 pt-4 border-t border-slate-100">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tagline</div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-700 font-medium italic">"{suggestion.tagline}"</span>
                        <button
                          onClick={() => copyText(suggestion.tagline, `tagline-${suggestion.id}`)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        >
                          {copied === `tagline-${suggestion.id}` ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <button
                        onClick={() => downloadLogo(suggestion)}
                        className="w-full py-3 px-4 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-sm"
                      >
                        <Download size={16} />
                        Unduh Logo
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

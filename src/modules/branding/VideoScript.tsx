import React, { useState, useRef } from 'react';
import { Video, Send, Loader2, Sparkles, Smartphone, Zap, Film, Palette, Upload, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { geminiService } from '../../services/gemini';
import Markdown from 'react-markdown';

export default function VideoScript() {
  const [platform, setPlatform] = useState<'tiktok' | 'reels' | 'youtube' | 'shorts'>('tiktok');
  const [duration, setDuration] = useState<'15' | '30' | '60'>('30');
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const platforms = [
    { id: 'tiktok', label: 'TikTok' },
    { id: 'reels', label: 'Instagram Reels' },
    { id: 'shorts', label: 'YouTube Shorts' },
  ];

  const durations = [
    { id: '15', label: '15 Detik' },
    { id: '30', label: '30 Detik' },
    { id: '60', label: '60 Detik' },
  ];

  const recommendedApps = [
    {
      name: 'CapCut',
      icon: <Smartphone className="text-cyan-500" />,
      description: 'Editor video mudah dengan template viral, stok video, dan musik bebas royalti. Cocok untuk pemula!',
      pros: ['Gratis', 'Banyak template', 'Auto captions']
    },
    {
      name: 'Canva',
      icon: <Palette className="text-blue-500" />,
      description: 'Desain visual + editor video dengan template profesional untuk berbagai platform.',
      pros: ['Drag & drop', 'Template lengkap', 'Kolaborasi tim']
    },
    {
      name: 'Runway ML',
      icon: <Zap className="text-pink-500" />,
      description: 'AI video generator untuk membuat video dari teks atau gambar secara otomatis.',
      pros: ['Text-to-video', 'AI magic tools', 'Kualitas tinggi']
    },
    {
      name: 'Pictory',
      icon: <Film className="text-orange-500" />,
      description: 'Konversi teks/skrip menjadi video secara otomatis dengan voiceover AI.',
      pros: ['Script-to-video', 'Auto voiceover', 'Stock footage']
    }
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
        photoNote = '\n\nCATATAN PENTING: Pengguna telah mengupload foto produk. Pastikan skrip video mencakup saran untuk menampilkan foto produk tersebut secara menarik di dalam video (contoh: tampilkan foto di awal, gunakan sebagai background, atau tampilkan di bagian tertentu).';
      }

      const prompt = `Buat skrip video untuk ${platform}, durasi ${duration} detik, tentang: ${input}. 
      
      STRUKTUR YANG DIBUTUHKAN:
      1. Hook (baris pertama yang menarik perhatian)
      2. Konten Utama (point-point yang jelas)
      3. Call to Action (yang jelas dan meyakinkan)
      4. Rekomendasi visual (contoh: close-up produk, transition, overlay teks)
      5. Saran musik/tone suara yang cocok
      ${photoNote}
      
      Jawab dalam bahasa Indonesia dengan format yang jelas.`;
      const response = await geminiService.generateMarketingContent(
        'Video Script',
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
          <Video className="text-purple-500" />
          Video Script
        </h1>
        <p className="text-slate-500">Buat skrip video menarik untuk TikTok, Instagram Reels, atau YouTube Shorts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="text-sm font-bold text-slate-700">Platform</div>
          <div className="grid grid-cols-3 gap-2">
            {platforms.map((p) => (
              <button
                key={p.id}
                onClick={() => setPlatform(p.id as any)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  platform === p.id
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="text-sm font-bold text-slate-700">Durasi</div>
          <div className="grid grid-cols-3 gap-2">
            {durations.map((d) => (
              <button
                key={d.id}
                onClick={() => setDuration(d.id as any)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  duration === d.id
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        {/* Upload Foto Produk */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <Upload size={16} className="text-purple-500" />
            Upload Foto Produk (Opsional)
          </div>
          
          {!uploadedImage ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-purple-400 hover:bg-purple-50/30 transition-all"
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

        {/* Deskripsi Video */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
            <Sparkles size={16} className="text-purple-500" />
            Deskripsikan video yang ingin Anda buat
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Contoh: Video promosi produk skincare, tone ceria dan meyakinkan, target wanita 18-30 tahun"
            className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all resize-none text-slate-700"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading || !input.trim()}
          className="w-full py-4 bg-purple-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-purple-600 disabled:opacity-50 transition-all shadow-lg shadow-purple-500/20"
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={18} />}
          {isLoading ? 'Sedang Membuat Skrip...' : 'Buat Skrip Video'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Skrip Video */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-purple-50 border-b border-purple-100 font-bold text-purple-900 text-sm flex items-center gap-2">
                <Sparkles size={16} />
                Skrip Video
              </div>
              <div className="p-8 prose prose-purple max-w-none">
                <Markdown>{result}</Markdown>
              </div>
            </div>

            {/* Rekomendasi Aplikasi untuk Membuat Video */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Video size={20} className="text-purple-600" />
                Aplikasi untuk Membuat Video dari Skrip Ini
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendedApps.map((app, index) => (
                  <motion.div
                    key={app.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center">
                        {app.icon}
                      </div>
                      <h3 className="font-bold text-slate-900">{app.name}</h3>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{app.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {app.pros.map((pro, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full"
                        >
                          ✓ {pro}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Saran Prompt untuk AI Video Generator */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 bg-blue-50 border-b border-blue-100 font-bold text-blue-900 text-sm flex items-center gap-2">
                <Zap size={16} />
                Contoh Prompt untuk AI Video Generator
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <h4 className="text-sm font-bold text-slate-700 mb-2">Prompt untuk Runway ML / Pika Labs:</h4>
                  <p className="text-sm text-slate-600 font-mono bg-white p-3 rounded-lg border border-slate-200">
                    {`Buat video pendek ${duration} detik untuk ${platform}, tentang: ${input}. Gunakan hook yang menarik di awal, visual yang dinamis, dan call to action yang jelas. Tone: ceria dan meyakinkan.`}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <h4 className="text-sm font-bold text-slate-700 mb-2">Prompt untuk CapCut Template:</h4>
                  <p className="text-sm text-slate-600 font-mono bg-white p-3 rounded-lg border border-slate-200">
                    {`Template video ${platform} ${duration} detik dengan transisi smooth, teks overlay yang jelas, dan musik upbeat. Cocok untuk promosi produk: ${input}.`}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

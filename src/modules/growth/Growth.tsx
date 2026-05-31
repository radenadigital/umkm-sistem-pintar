import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Trophy, 
  ArrowRight, 
  PlayCircle, 
  Target, 
  Award, 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  X, 
  Youtube,
  Play,
  Clock,
  Video
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import EmptyState from '../../components/ui/EmptyState';
import RefreshButton from '../../components/ui/RefreshButton';
import { useDb } from '../../contexts/DatabaseContext';
import { useAuth } from '../../contexts/AuthContext';
import { Course } from '../../services/database';

function getYouTubeID(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default function Growth() {
  const { db, updateCourses, updateCategories } = useDb();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>(db.courses);
  const [categories, setCategories] = useState<string[]>(db.categories);
  
  // Sync to database
  useEffect(() => {
    updateCourses(courses);
  }, [courses, updateCourses]);

  useEffect(() => {
    updateCategories(categories);
  }, [categories, updateCategories]);

  // Load data from database on mount
  useEffect(() => {
    setCourses(db.courses);
  }, [db.courses]);

  useEffect(() => {
    setCategories(db.categories);
  }, [db.categories]);

  // Update form data category when categories changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      category: categories[0] || ''
    }));
  }, [categories]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Course | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtubeUrl: '',
    category: categories[0] || ''
  });

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          course.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = !selectedCategory || course.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [courses, searchQuery, selectedCategory]);

  const handleAddCourse = () => {
    setEditingCourse(null);
    setFormData({ 
      title: '', 
      description: '', 
      youtubeUrl: '', 
      category: categories[0] || '' 
    });
    setIsModalOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      youtubeUrl: course.youtubeUrl,
      category: course.category
    });
    setIsModalOpen(true);
  };

  const handleDeleteCourse = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus kursus ini?')) {
      setCourses(prev => prev.filter(c => c.id !== id));
      if (selectedVideo?.id === id) setSelectedVideo(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category) {
      alert('Silakan tambahkan kategori terlebih dahulu!');
      return;
    }
    
    const videoId = getYouTubeID(formData.youtubeUrl);
    
    if (!videoId) {
      alert('URL YouTube tidak valid. Pastikan URL benar.');
      return;
    }

    if (editingCourse) {
      setCourses(prev => prev.map(c => c.id === editingCourse.id ? {
        ...c,
        ...formData,
        videoId
      } : c));
    } else {
      const newCourse: Course = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user?.id || '',
        ...formData,
        videoId,
        createdAt: Date.now()
      };
      setCourses(prev => [newCourse, ...prev]);
    }
    
    setIsModalOpen(false);
  };

  const handleAddCategory = () => {
    const trimmedName = newCategoryName.trim();
    if (trimmedName && !categories.includes(trimmedName)) {
      setCategories(prev => [...prev, trimmedName]);
      setNewCategoryName('');
      setIsCategoryModalOpen(false);
    } else if (categories.includes(trimmedName)) {
      alert('Kategori sudah ada!');
    }
  };

  const handleDeleteCategory = (cat: string) => {
    if (confirm(`Hapus kategori "${cat}"? Kursus di kategori ini akan tetap ada.`)) {
      setCategories(prev => prev.filter(c => c !== cat));
      if (selectedCategory === cat) setSelectedCategory(null);
    }
  };

  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="text-indigo-600" />
            Kursus & Edukasi UMKM
          </h1>
          <p className="text-slate-500">Kembangkan bisnis Anda melalui materi video pembelajaran terkurasi.</p>
        </div>
        <div className="flex items-center gap-3">
          <RefreshButton onRefresh={handleRefresh} />
          <button 
            onClick={handleAddCourse}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm"
          >
            <Plus size={16} />
            Tambah Kursus
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-6">
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Cari kursus..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar items-center">
              <button 
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
                  !selectedCategory ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                Semua
              </button>
              {categories.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1",
                    selectedCategory === cat ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {cat}
                </button>
              ))}
              <button 
                onClick={() => setIsCategoryModalOpen(true)}
                className="px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all flex items-center gap-1"
              >
                <Plus size={14} /> Kategori
              </button>
            </div>
          </div>

          {/* Video Player Section */}
          <AnimatePresence mode="wait">
            {selectedVideo && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden mb-8"
              >
                <div className="aspect-video bg-slate-900 border-b border-slate-200 relative group">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1`}
                    title={selectedVideo.title}
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  />
                  <button 
                    onClick={() => setSelectedVideo(null)}
                    className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-bold rounded uppercase">
                          {selectedVideo.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                          <Clock size={10} /> 
                          {new Date(selectedVideo.createdAt).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-slate-900">{selectedVideo.title}</h2>
                      <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
                        {selectedVideo.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Course List */}
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
              {filteredCourses.map((course) => (
                <motion.div 
                  layout
                  key={course.id} 
                  className={cn(
                    "bg-white rounded-2xl border transition-all overflow-hidden group hover:shadow-lg",
                    selectedVideo?.id === course.id ? "border-indigo-500 ring-4 ring-indigo-50" : "border-slate-200"
                  )}
                >
                  <div className="h-44 relative overflow-hidden bg-slate-100">
                    <img 
                      src={`https://img.youtube.com/vi/${course.videoId}/maxresdefault.jpg`} 
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${course.videoId}/hqdefault.jpg`;
                      }}
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={() => setSelectedVideo(course)}
                        className="p-4 bg-white text-indigo-600 rounded-full shadow-xl transform scale-90 group-hover:scale-100 transition-all duration-300"
                      >
                        <Play fill="currentColor" size={24} />
                      </button>
                    </div>
                    <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[10px] font-bold text-indigo-700 uppercase shadow-sm">
                      {course.category}
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <div>
                      <h4 className="font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                        {course.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                        {course.description}
                      </p>
                    </div>
                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                      <button 
                        onClick={() => setSelectedVideo(course)}
                        className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline"
                      >
                        Tonton Sekarang <ArrowRight size={14} />
                      </button>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleEditCourse(course)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteCourse(course.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState 
              icon={Video}
              title="Belum ada kursus"
              description="Mulai tambahkan video pembelajaran YouTube untuk membantu UMKM Anda berkembang."
              action={
                <button 
                  onClick={handleAddCourse}
                  className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest"
                >
                  Tambah Video Pertama
                </button>
              }
            />
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-500" />
              Tips Belajar Efektif
            </h3>
            <ul className="space-y-3">
              {[
                "Atur waktu 15 menit setiap pagi.",
                "Praktikkan langsung ke Bisnis Anda.",
                "Buat catatan poin-poin penting.",
                "Bagikan ilmu ke tim operasional."
              ].map((tip, i) => (
                <li key={i} className="flex gap-2 text-xs text-slate-600 leading-relaxed">
                  <div className="mt-1 w-1 h-1 rounded-full bg-indigo-400 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Course Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">
                  {editingCourse ? 'Edit Kursus' : 'Tambah Kursus Baru'}
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Judul Kursus</label>
                  <input 
                    required
                    type="text" 
                    value={formData.title}
                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Contoh: Digital Marketing 101"
                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Kategori</label>
                    {categories.length === 0 ? (
                      <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                        <span className="font-bold">Perhatian:</span> Tambahkan kategori terlebih dahulu!
                      </div>
                    ) : (
                      <select 
                        value={formData.category}
                        onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all text-sm appearance-none"
                      >
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">URL YouTube</label>
                    <div className="relative">
                      <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        required
                        type="url" 
                        value={formData.youtubeUrl}
                        onChange={e => setFormData(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                        placeholder="https://youtube.com/watch?v=..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Deskripsi Singkat</label>
                  <textarea 
                    required
                    rows={3}
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Jelaskan apa yang akan dipelajari di kursus ini..."
                    className="w-full px-4 py-2.5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all text-sm resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 text-slate-600 font-bold text-sm bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 text-white font-bold text-sm bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-lg shadow-indigo-100"
                  >
                    {editingCourse ? 'Simpan Perubahan' : 'Tambah Kursus'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Category Management Modal */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCategoryModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Manajemen Kategori</h3>
                <button 
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                {/* Add New Category */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Tambah Kategori Baru</label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Nama kategori..."
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                      className="flex-1 px-4 py-2.5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all text-sm"
                    />
                    <button 
                      onClick={handleAddCategory}
                      className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all"
                    >
                      Tambah
                    </button>
                  </div>
                </div>

                {/* Category List */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Daftar Kategori</label>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {categories.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-4">Belum ada kategori</p>
                    ) : (
                      categories.map(cat => (
                        <div key={cat} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                          <span className="text-sm font-medium text-slate-700">{cat}</span>
                          <button 
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


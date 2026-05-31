import React, { useState, useEffect } from 'react';
import { 
  Building2, Palette, ShoppingBag, Target, Star, Save, 
  Mail, Phone, Globe, MapPin, Plus, Trash2, Camera, 
  ChevronRight, CheckCircle2, AlertCircle, Info, Sparkles, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import RefreshButton from '../../components/ui/RefreshButton';
import { useDb } from '../../contexts/DatabaseContext';
import { useAuth } from '../../contexts/AuthContext';

interface ProductService {
  id: string;
  name: string;
  description: string;
  usp: string;
}

export default function BusinessProfile() {
  const { db, updateProfile, userData } = useDb();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<'general' | 'branding' | 'products' | 'market' | 'usp'>('general');
  const [profile, setProfile] = useState(userData?.profile);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Load data from database on mount and when db changes
  useEffect(() => {
    setProfile(userData?.profile);
  }, [userData?.profile]);

  // Save to database whenever profile changes
  useEffect(() => {
    if (user && userData) {
      updateProfile(profile);
    }
  }, [profile, user, userData, updateProfile]);

  const handleSave = () => {
    setIsSaving(true);
    setSaveStatus('idle');
    
    // Simulate API delay
    setTimeout(() => {
      setIsSaving(false);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 500);
  };

  const addProduct = () => {
    const newProduct: ProductService = {
      id: `p-${Date.now()}`,
      name: '',
      description: '',
      usp: ''
    };
    setProfile({ ...profile, products: [...profile.products, newProduct] });
  };

  const removeProduct = (id: string) => {
    setProfile({ ...profile, products: profile.products.filter(p => p.id !== id) });
  };

  const updateProduct = (id: string, field: keyof ProductService, value: string) => {
    const newProducts = profile.products.map(p => p.id === id ? { ...p, [field]: value } : p);
    setProfile({ ...profile, products: newProducts });
  };

  const addCoreValue = () => {
    setProfile({ 
      ...profile, 
      branding: { ...profile.branding, coreValues: [...profile.branding.coreValues, ''] } 
    });
  };

  const updateCoreValue = (index: number, value: string) => {
    const newValues = [...profile.branding.coreValues];
    newValues[index] = value;
    setProfile({ 
      ...profile, 
      branding: { ...profile.branding, coreValues: newValues } 
    });
  };

  const removeCoreValue = (index: number) => {
    const newValues = profile.branding.coreValues.filter((_, i) => i !== index);
    setProfile({ 
      ...profile, 
      branding: { ...profile.branding, coreValues: newValues } 
    });
  };

  const sections = [
    { id: 'general', label: 'Informasi Umum', icon: Building2 },
    { id: 'branding', label: 'Branding & Identitas', icon: Sparkles },
    { id: 'products', label: 'Produk & Layanan', icon: ShoppingBag },
    { id: 'market', label: 'Target Pasar', icon: Target },
    { id: 'usp', label: 'Keunggulan (USP)', icon: Star },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Profil Bisnis</h1>
          <p className="text-slate-500 text-sm">Pusat data bisnis Anda untuk kecerdasan buatan dan strategi pemasaran.</p>
        </div>
        <div className="flex items-center gap-3">
          <RefreshButton onRefresh={async () => {}} />
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              "flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg text-sm",
              saveStatus === 'success' ? "bg-emerald-500 text-white" : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200"
            )}
          >
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : (saveStatus === 'success' ? <CheckCircle2 size={18} /> : <Save size={18} />)}
            {isSaving ? 'Menyimpan...' : (saveStatus === 'success' ? 'Berhasil Disimpan' : 'Simpan Profil')}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-72 space-y-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id as any)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all group",
                activeSection === section.id 
                  ? "bg-white text-indigo-700 shadow-sm border border-slate-200 font-bold" 
                  : "text-slate-500 hover:bg-slate-100"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-xl transition-colors",
                  activeSection === section.id ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-400 group-hover:bg-white"
                )}>
                  <section.icon size={18} />
                </div>
                <span className="text-sm">{section.label}</span>
              </div>
              <ChevronRight size={16} className={cn(
                "transition-transform",
                activeSection === section.id ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"
              )} />
            </button>
          ))}

          <div className="mt-8 p-6 bg-slate-900 rounded-3xl text-white relative overflow-hidden">
            <Sparkles className="absolute -right-4 -top-4 text-white/10 w-24 h-24" />
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">AI Ready</p>
            <p className="text-sm font-medium mb-4 leading-relaxed">
              Data ini akan digunakan oleh asisten AI untuk memberikan hasil copywriting dan strategi yang lebih akurat.
            </p>
            <div className="flex items-center gap-2 text-xs text-indigo-300 font-bold">
              <CheckCircle2 size={14} />
              Konteks Diaktifkan
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-8 space-y-8"
            >
              {/* Section Headers */}
              <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                  {(() => {
                    const Icon = sections.find(s => s.id === activeSection)?.icon;
                    return Icon ? <Icon size={24} /> : null;
                  })()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {sections.find(s => s.id === activeSection)?.label}
                  </h2>
                  <p className="text-slate-500 text-sm">Lengkapi data untuk hasil optimal.</p>
                </div>
              </div>

              {/* General Section */}
              {activeSection === 'general' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nama Bisnis</label>
                    <input 
                      type="text" 
                      value={profile.general.name}
                      onChange={e => setProfile({...profile, general: {...profile.general, name: e.target.value}})}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Deskripsi Bisnis</label>
                    <textarea 
                      value={profile.general.description}
                      onChange={e => setProfile({...profile, general: {...profile.general, description: e.target.value}})}
                      className="w-full h-32 px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Kategori / Industri</label>
                    <input 
                      type="text" 
                      value={profile.general.category}
                      onChange={e => setProfile({...profile, general: {...profile.general, category: e.target.value}})}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Tahun Berdiri</label>
                    <input 
                      type="text" 
                      value={profile.general.foundedYear}
                      onChange={e => setProfile({...profile, general: {...profile.general, foundedYear: e.target.value}})}
                      className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm"
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Alamat Utama</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-4 top-4 text-slate-400" />
                      <textarea 
                        value={profile.general.address}
                        onChange={e => setProfile({...profile, general: {...profile.general, address: e.target.value}})}
                        className="w-full h-20 pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm resize-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Email Kontak</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="email" 
                        value={profile.general.email}
                        onChange={e => setProfile({...profile, general: {...profile.general, email: e.target.value}})}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">No. Telepon / WA</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        value={profile.general.phone}
                        onChange={e => setProfile({...profile, general: {...profile.general, phone: e.target.value}})}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Website</label>
                    <div className="relative">
                      <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        value={profile.general.website}
                        onChange={e => setProfile({...profile, general: {...profile.general, website: e.target.value}})}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Branding Section */}
              {activeSection === 'branding' && (
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-48 space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Logo Bisnis</label>
                       <div className="aspect-square bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 group hover:border-indigo-500 hover:text-indigo-500 transition-all cursor-pointer overflow-hidden">
                          {profile.branding.logo ? (
                            <img src={profile.branding.logo} alt="Logo" className="w-full h-full object-cover" />
                          ) : (
                            <>
                              <Camera size={32} strokeWidth={1.5} />
                              <span className="text-[10px] font-bold mt-2">Upload Logo</span>
                            </>
                          )}
                       </div>
                    </div>
                    <div className="flex-1 space-y-6">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Tagline Bisnis</label>
                        <input 
                          type="text" 
                          placeholder="Motto atau slogan unik..."
                          value={profile.branding.tagline}
                          onChange={e => setProfile({...profile, branding: {...profile.branding, tagline: e.target.value}})}
                          className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm italic focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Warna Utama</label>
                          <div className="flex gap-2">
                            <input 
                              type="color" 
                              value={profile.branding.primaryColor}
                              onChange={e => setProfile({...profile, branding: {...profile.branding, primaryColor: e.target.value}})}
                              className="w-12 h-12 rounded-xl border-none p-1 bg-slate-50 cursor-pointer"
                            />
                            <input 
                              type="text" 
                              value={profile.branding.primaryColor}
                              onChange={e => setProfile({...profile, branding: {...profile.branding, primaryColor: e.target.value}})}
                              className="flex-1 px-4 py-3 bg-slate-50 border-none rounded-xl text-sm uppercase font-mono"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Warna Sekunder</label>
                          <div className="flex gap-2">
                            <input 
                              type="color" 
                              value={profile.branding.secondaryColor}
                              onChange={e => setProfile({...profile, branding: {...profile.branding, secondaryColor: e.target.value}})}
                              className="w-12 h-12 rounded-xl border-none p-1 bg-slate-50 cursor-pointer"
                            />
                            <input 
                              type="text" 
                              value={profile.branding.secondaryColor}
                              onChange={e => setProfile({...profile, branding: {...profile.branding, secondaryColor: e.target.value}})}
                              className="flex-1 px-4 py-3 bg-slate-50 border-none rounded-xl text-sm uppercase font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nilai Bisnis (Core Values)</label>
                      <button 
                        onClick={addCoreValue}
                        className="text-[10px] font-bold text-indigo-600 flex items-center gap-1"
                      >
                        <Plus size={14} />
                        Tambah Nilai
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {profile.branding.coreValues.map((val, index) => (
                        <div key={index} className="flex items-center gap-2 bg-slate-50 pl-4 pr-2 py-2 rounded-xl border border-slate-100 group transition-all focus-within:border-indigo-400 focus-within:bg-white">
                          <input 
                            type="text" 
                            value={val}
                            onChange={e => updateCoreValue(index, e.target.value)}
                            className="bg-transparent border-none text-sm font-medium outline-none w-32"
                            placeholder="Nilai baru..."
                          />
                          <button 
                            onClick={() => removeCoreValue(index)}
                            className="p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Products Section */}
              {activeSection === 'products' && (
                <div className="space-y-6">
                  {profile.products.map((product) => (
                    <div key={product.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4 relative group">
                      <button 
                        onClick={() => removeProduct(product.id)}
                        className="absolute top-4 right-4 p-2 bg-white text-slate-300 hover:text-rose-500 rounded-xl shadow-sm transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5 md:col-span-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nama Produk / Layanan Utama</label>
                          <input 
                            type="text" 
                            value={product.name}
                            onChange={e => updateProduct(product.id, 'name', e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Judul penawaran Anda..."
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Deskripsi Singkat</label>
                          <textarea 
                            value={product.description}
                            onChange={e => updateProduct(product.id, 'description', e.target.value)}
                            className="w-full h-24 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm resize-none"
                            placeholder="Apa yang ditawarkan produk ini?"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">USP Terintegrasi</label>
                          <textarea 
                            value={product.usp}
                            onChange={e => updateProduct(product.id, 'usp', e.target.value)}
                            className="w-full h-24 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm resize-none text-indigo-600 font-medium"
                            placeholder="Kenapa orang harus memilih produk ini dibanding pesaing?"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={addProduct}
                    className="w-full py-4 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-bold text-sm flex items-center justify-center gap-2 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all"
                  >
                    <Plus size={18} />
                    Tambah Produk / Layanan Lainnya
                  </button>
                </div>
              )}

              {/* Market Section */}
              {activeSection === 'market' && (
                <div className="space-y-8">
                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
                    <Info size={18} className="text-amber-500 shrink-0 mt-1" />
                    <div>
                      <p className="text-xs font-bold text-amber-900 mb-0.5">Penting!</p>
                      <p className="text-xs text-amber-800/80 leading-relaxed">
                        Data ini membantu AI menentukan gaya bahasa (tone of voice) yang cocok dengan calon audiens Anda.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Segmentasi Pelanggan</label>
                      <input 
                        type="text" 
                        value={profile.targetMarket.segments}
                        onChange={e => setProfile({...profile, targetMarket: {...profile.targetMarket, segments: e.target.value}})}
                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm"
                        placeholder="Contoh: Pemilik Bisnis UKM, Kolektor Sepatu, Orang Tua Muda..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Karakteristik & Psikografis</label>
                      <textarea 
                        value={profile.targetMarket.characteristics}
                        onChange={e => setProfile({...profile, targetMarket: {...profile.targetMarket, characteristics: e.target.value}})}
                        className="w-full h-32 px-4 py-3 bg-slate-50 border-none rounded-xl text-sm resize-none"
                        placeholder="Seperti apa keseharian mereka? Apa minat mereka?"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Pain Points (Masalah Utama)</label>
                      <textarea 
                        value={profile.targetMarket.painPoints}
                        onChange={e => setProfile({...profile, targetMarket: {...profile.targetMarket, painPoints: e.target.value}})}
                        className="w-full h-32 px-4 py-3 bg-slate-50 border-none rounded-xl text-sm resize-none"
                        placeholder="Masalah apa yang ingin mereka pecahkan dengan produk Anda?"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* USP Section */}
              {activeSection === 'usp' && (
                <div className="space-y-8">
                  <div className="p-6 bg-slate-900 rounded-3xl text-white relative h-48 flex flex-col justify-center">
                    <Star className="absolute top-4 right-4 text-amber-400" size={32} />
                    <h3 className="text-2xl font-bold mb-2">Unique Selling Proposition</h3>
                    <p className="text-slate-400 text-sm max-w-lg">Apa satu hal yang paling membedakan Anda dari ribuan kompetitor di luar sana?</p>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Competitive Edge</label>
                      <textarea 
                        value={profile.usp.competitiveEdge}
                        onChange={e => setProfile({...profile, usp: {...profile.usp, competitiveEdge: e.target.value}})}
                        className="w-full h-32 px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500"
                        placeholder="Misal: Satu-satunya yang memakai teknologi AI..."
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Perbedaan Utama (Differentiation)</label>
                      <textarea 
                        value={profile.usp.differentiation}
                        onChange={e => setProfile({...profile, usp: {...profile.usp, differentiation: e.target.value}})}
                        className="w-full h-32 px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500"
                        placeholder="Jelaskan alasan emosional kenapa konsumen harus memilih Anda."
                      />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

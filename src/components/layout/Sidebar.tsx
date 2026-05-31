import React from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  Sparkles, 
  Palette, 
  Camera, 
  Video,
  Layout,
  Image as ImageIcon,
  Lightbulb, 
  Package,
  Users,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Zap,
  ShieldCheck,
  FileText,
  Receipt,
  Send,
  Target,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}

export default function Sidebar({ activeTab, setActiveTab, collapsed, setCollapsed }: SidebarProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'Main' },
    { id: 'inventory', label: 'Stok & Produk', icon: Package, category: 'Business' },
    { id: 'customers', label: 'Pelanggan', icon: Users, category: 'Business' },
    { id: 'finance', label: 'Keuangan', icon: Wallet, category: 'Finance' },
    { id: 'invoices', label: 'Faktur (Invoice)', icon: FileText, category: 'Finance' },
    { id: 'receipts', label: 'Kuitansi', icon: Receipt, category: 'Finance' },
    { id: 'ai-content', label: 'AI Content (New)', icon: Sparkles, category: 'Marketing' },
    { id: 'campaigns', label: 'Kampanye Aktif', icon: Send, category: 'Marketing' },
    { id: 'templates', label: 'Template Pesan', icon: MessageSquare, category: 'Marketing' },
    { id: 'segments', label: 'Segmentasi Market', icon: Target, category: 'Marketing' },
    { id: 'branding', label: 'Buat Logo', icon: Palette, category: 'Branding' },
    { id: 'photo-packaging', label: 'Foto & Kemasan', icon: Camera, category: 'Branding' },
    { id: 'video-script', label: 'Video Script', icon: Video, category: 'Branding' },
    { id: 'promo-generator', label: 'Promo Generator', icon: Layout, category: 'Branding' },
    { id: 'mockup-ideas', label: 'Ide Mockup', icon: ImageIcon, category: 'Branding' },
    { id: 'strategy', label: 'Strategi Digital', icon: Lightbulb, category: 'Strategy' },
    { id: 'growth', label: 'Kursus & Edukasi', icon: Trophy, category: 'Strategy' },
    { id: 'automation', label: 'Otomasi & Task', icon: Zap, category: 'System' },
    { id: 'business-profile', label: 'Profil Bisnis', icon: Users, category: 'System' },
    { id: 'disclaimer', label: 'Disclaimer', icon: AlertCircle, category: 'System' },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin Panel', icon: ShieldCheck, category: 'System' }] : []),
  ];
  return (
    <motion.aside 
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      className="h-screen bg-[#0F172A] text-slate-300 flex flex-col border-r border-slate-800/80 sticky top-0 z-20"
    >
      <div className="p-6 flex items-center justify-between border-b border-slate-800/60">
        {!collapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-white font-extrabold tracking-tight select-none shrink-0"
          >
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0 shadow-sm shadow-indigo-600/35 border border-indigo-400/20">
              <span className="text-white text-sm font-black">U</span>
            </div>
            <span className="text-base font-extrabold tracking-tight whitespace-nowrap">
              UMKM <span className="bg-gradient-to-r from-indigo-400 to-indigo-300 bg-clip-text text-transparent font-black">Go Digital</span>
            </span>
          </motion.div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 text-slate-400 border border-slate-700/60 transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 space-y-6 scrollbar-hide py-6">
        {['Main', 'Business', 'Finance', 'Marketing', 'Branding', 'Strategy', 'System'].map((cat) => {
          const itemsInCat = navItems.filter(i => i.category === cat);
          if (itemsInCat.length === 0) return null;

          return (
            <div key={cat} className="space-y-1">
              {!collapsed && (
                <h3 className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">
                  {cat}
                </h3>
              )}
              {itemsInCat.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                      isActive 
                        ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/20' 
                        : 'hover:bg-slate-800/60 text-slate-300 hover:text-white border border-transparent'
                    }`}
                  >
                    <Icon size={18} className={`${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}`} />
                    {!collapsed && (
                      <span className="text-sm whitespace-nowrap">{item.label}</span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800/60">
        {!collapsed && (
          <p className="text-[10px] text-slate-500 text-center">
            © 2026 Radena Digital Agency
          </p>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <span className="text-[10px] text-slate-500">©</span>
          </div>
        )}
      </div>

    </motion.aside>
  );
}

import React, { useState } from 'react';
import { 
  MessageSquare, 
  Mail, 
  Send, 
  Calendar,
  Users,
  Target,
  Sparkles,
  ArrowRight,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import EmptyState from '../../components/ui/EmptyState';
import RefreshButton from '../../components/ui/RefreshButton';
import AIContentGenerator from './AIContentGenerator';
import CampaignsView from './CampaignsView';
import TemplatesView from './TemplatesView';
import SegmentsView from './SegmentsView';
import CreateCampaignModal from './CreateCampaignModal';

const INITIAL_CAMPAIGNS = [];

export default function Marketing() {
  const [activeTab, setActiveTab] = useState('aicontent');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS);

  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
  };

  const handleCampaignCreated = (newCampaign: any) => {
    setCampaigns([newCampaign, ...campaigns]);
    setActiveTab('campaigns');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Marketing Center</h1>
          <p className="text-slate-500 text-sm">Kelola kampanye dan buat konten pemasaran cerdas.</p>
        </div>
        <div className="flex items-center gap-3">
          <RefreshButton onRefresh={handleRefresh} />
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            Buat Kampanye Baru <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200 overflow-x-auto pb-px">
        {[
          { id: 'aicontent', label: 'AI Content (New)', icon: Sparkles },
          { id: 'campaigns', label: 'Kampanye Aktif', icon: Send },
          { id: 'templates', label: 'Template Pesan', icon: MessageSquare },
          { id: 'segments', label: 'Segmentasi Market', icon: Target },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 pb-4 text-sm font-bold transition-all relative whitespace-nowrap px-2 ${
              activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.icon && <tab.icon size={16} />}
            {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="marketTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
            )}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'aicontent' && <AIContentGenerator />}
            {activeTab === 'campaigns' && <CampaignsView campaigns={campaigns} />}
            {activeTab === 'templates' && <TemplatesView />}
            {activeTab === 'segments' && <SegmentsView />}
          </motion.div>
        </AnimatePresence>
      </div>

      <CreateCampaignModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onCreated={handleCampaignCreated}
      />
    </div>
  );
}


/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';
import Dashboard from './modules/dashboard/Dashboard';
import AITools from './modules/ai-tools/AITools';
import Inventory from './modules/inventory/Inventory';
import Finance from './modules/finance/Finance';
import DigitalStrategy from './modules/strategy/DigitalStrategy';
import Branding from './modules/branding/Branding';
import PhotoPackaging from './modules/branding/PhotoPackaging';
import VideoScript from './modules/branding/VideoScript';
import PromoGenerator from './modules/branding/PromoGenerator';
import MockupIdeas from './modules/branding/MockupIdeas';
import InvoicesTab from './modules/finance/components/InvoicesTab';
import ReceiptsTab from './modules/finance/components/ReceiptsTab';
import Customers from './modules/customers/Customers';
import AIContentGenerator from './modules/marketing/AIContentGenerator';
import CampaignsView from './modules/marketing/CampaignsView';
import TemplatesView from './modules/marketing/TemplatesView';
import SegmentsView from './modules/marketing/SegmentsView';
import Growth from './modules/growth/Growth';
import Analytics from './modules/analytics/Analytics';
import Marketing from './modules/marketing/Marketing';
import Automation from './modules/automation/Automation';
import Admin from './modules/admin/Admin';
import BusinessProfile from './modules/profile/BusinessProfile';
import Disclaimer from './modules/system/Disclaimer';
import Login from './modules/auth/Login';
import Register from './modules/auth/Register';
import { useAuth } from './contexts/AuthContext';

export default function App() {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [openFinanceModal, setOpenFinanceModal] = useState(false);

  // Redirect from admin page if not admin
  useEffect(() => {
    if (activeTab === 'admin' && user?.role !== 'Admin') {
      setActiveTab('dashboard');
    }
  }, [activeTab, user]);

  const renderContent = () => {
    // Protect admin route
    if (activeTab === 'admin' && user?.role !== 'Admin') {
      setActiveTab('dashboard');
      return <Dashboard setActiveTab={setActiveTab} setOpenFinanceModal={setOpenFinanceModal} />;
    }
    
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} setOpenFinanceModal={setOpenFinanceModal} />;
      case 'ai-tools':
        return <AITools />;
      case 'inventory':
        return <Inventory />;
      case 'finance':
        return <Finance openModal={openFinanceModal} setOpenModal={setOpenFinanceModal} />;
      case 'invoices':
        return <InvoicesTab />;
      case 'receipts':
        return <ReceiptsTab />;
      case 'strategy':
        return <DigitalStrategy />;
      case 'growth':
        return <Growth />;
      case 'branding':
        return <Branding />;
      case 'photo-packaging':
        return <PhotoPackaging />;
      case 'video-script':
        return <VideoScript />;
      case 'promo-generator':
        return <PromoGenerator />;
      case 'mockup-ideas':
        return <MockupIdeas />;
      case 'customers':
        return <Customers />;
      case 'marketing':
        return <Marketing />;
      case 'ai-content':
        return <AIContentGenerator />;
      case 'campaigns':
        return <CampaignsView />;
      case 'templates':
        return <TemplatesView />;
      case 'segments':
        return <SegmentsView />;
      case 'automation':
        return <Automation />;
      case 'admin':
        return <Admin />;
      case 'business-profile':
        return <BusinessProfile />;
      case 'disclaimer':
        return <Disclaimer />;
      default:
        return <Dashboard setActiveTab={setActiveTab} setOpenFinanceModal={setOpenFinanceModal} />;
    }
  };

  if (!isAuthenticated) {
    return authView === 'login' ? (
      <Login 
        onLogin={() => setActiveTab('dashboard')} 
        onSwitchToRegister={() => setAuthView('register')} 
      />
    ) : (
      <Register 
        onRegister={() => setActiveTab('dashboard')} 
        onSwitchToLogin={() => setAuthView('login')} 
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}


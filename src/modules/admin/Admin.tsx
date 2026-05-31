import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Settings, Bell, Database, Lock, Send, Mail, CheckCircle2, Plus, Edit2, Trash2, X } from 'lucide-react';
import RefreshButton from '../../components/ui/RefreshButton';
import { cn } from '../../lib/utils';
import { useDb } from '../../contexts/DatabaseContext';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../services/database';

export default function Admin() {
  const { db, updateUsers } = useDb();
  const { user: currentUser } = useAuth();
  const [waActive, setWaActive] = useState(true);
  const [emailActive, setEmailActive] = useState(true);
  const [waNumber, setWaNumber] = useState('081234567890');
  const [providerEmail, setProviderEmail] = useState('billing@umkmsistempintar.com');
  const [defaultChannel, setDefaultChannel] = useState<'WhatsApp' | 'Email'>('WhatsApp');
  const [showNotification, setShowNotification] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // User Management States
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'User' as 'Admin' | 'User',
  });

  // Load initial configurations
  useEffect(() => {
    const savedWaStatus = localStorage.getItem('whatsapp_channel_active');
    if (savedWaStatus !== null) setWaActive(savedWaStatus === 'true');
    else localStorage.setItem('whatsapp_channel_active', 'true');

    const savedEmailStatus = localStorage.getItem('email_channel_active');
    if (savedEmailStatus !== null) setEmailActive(savedEmailStatus === 'true');
    else localStorage.setItem('email_channel_active', 'true');

    const savedDefaultChannel = localStorage.getItem('default_delivery_channel');
    if (savedDefaultChannel !== null) setDefaultChannel(savedDefaultChannel as any);
    else localStorage.setItem('default_delivery_channel', 'WhatsApp');

    const savedWaNum = localStorage.getItem('whatsapp_channel_number');
    if (savedWaNum) setWaNumber(savedWaNum);

    const savedProvEmail = localStorage.getItem('email_channel_provider');
    if (savedProvEmail) setProviderEmail(savedProvEmail);
  }, []);

  const saveConfigurations = () => {
    setIsLoading(true);
    setTimeout(() => {
      localStorage.setItem('whatsapp_channel_active', waActive.toString());
      localStorage.setItem('email_channel_active', emailActive.toString());
      localStorage.setItem('default_delivery_channel', defaultChannel);
      localStorage.setItem('whatsapp_channel_number', waNumber);
      localStorage.setItem('email_channel_provider', providerEmail);
      setIsLoading(false);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }, 1000);
  };

  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setUserFormData({ name: '', email: '', password: '', role: 'User' });
    setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserFormData({
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
    });
    setShowUserModal(true);
  };

  const handleDeleteUser = (userId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) return;
    if (userId === currentUser?.id) {
      alert('Anda tidak bisa menghapus akun Anda sendiri!');
      return;
    }
    updateUsers(db.users.filter(u => u.id !== userId));
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userFormData.name || !userFormData.email || !userFormData.password) {
      alert('Semua kolom harus diisi!');
      return;
    }

    if (editingUser) {
      // Update existing user
      updateUsers(db.users.map(u => u.id === editingUser.id ? { ...u, ...userFormData } : u));
    } else {
      // Check if email already exists
      const emailExists = db.users.some(u => u.email === userFormData.email);
      if (emailExists) {
        alert('Email sudah terdaftar!');
        return;
      }
      
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        ...userFormData,
        createdAt: Date.now(),
      };
      updateUsers([...db.users, newUser]);
    }
    setShowUserModal(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Super Admin Panel</h1>
          <p className="text-slate-500 text-sm">Manajemen sistem, user, dan konfigurasi platform.</p>
        </div>
        <RefreshButton onRefresh={handleRefresh} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: db.users.length.toString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'System Health', value: '100%', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Active Sessions', value: '1', icon: Lock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Storage Used', value: '0 GB', icon: Database, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map((stat, i) => (
          <div key={i} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
            <div className="flex items-center justify-between mt-1">
              <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
              <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                <stat.icon size={18} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {showNotification && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex gap-3 items-center animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="text-emerald-600" size={20} />
          <p className="text-xs font-bold text-emerald-800">Konfigurasi saluran pengiriman sukses disimpan!</p>
        </div>
      )}

      {/* User Management Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm tracking-tight">Pengaturan User</h3>
            <p className="text-xs text-slate-500">Kelola pengguna aplikasi, tambah, edit, dan hapus.</p>
          </div>
          <button
            onClick={handleAddUser}
            className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
          >
            <Plus size={16} />
            Tambah User
          </button>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal Dibuat</th>
                  <th className="text-right py-3 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {db.users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-slate-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-600">{user.email}</td>
                    <td className="py-4 px-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-bold uppercase",
                        user.role === 'Admin' ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-700"
                      )}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString('id-ID')}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Main Settings Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: General System Settings */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest flex items-center gap-2">
                <Lock size={14} className="text-slate-500" />
                Global Status
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <p className="text-sm font-bold text-slate-800">Maintenance Mode</p>
                  <p className="text-xs text-slate-500">Enable maintenance mode for all users.</p>
                </div>
                <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <p className="text-sm font-bold text-slate-800">New Registrations</p>
                  <p className="text-xs text-slate-500">Allow new users to sign up.</p>
                </div>
                <div className="w-12 h-6 bg-indigo-600 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Delivery Channels activation */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <dt className="font-bold text-slate-900 text-sm tracking-tight">Konfigurasi Saluran Pengiriman</dt>
                <dd className="text-xs text-slate-500">Konfigurasi dan aktifkan modul gateway WhatsApp dan Email cerdas kami.</dd>
              </div>
              <button
                onClick={saveConfigurations}
                disabled={isLoading}
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                {isLoading ? 'Menyimpan...' : 'Simpan Saluran'}
              </button>
            </div>

            <div className="p-8 space-y-6 divide-y divide-slate-100">
              
              {/* WhatsApp CONFIGURATION */}
              <div className="pt-0 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
                      <Send size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Saluran WhatsApp Bisnis Gateway</p>
                      <p className="text-xs text-slate-500">Otomatisasi pengiriman pesan promosi dan invoice lewat nomor WhatsApp.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setWaActive(!waActive)}
                    className={cn(
                      "w-12 h-6 rounded-full relative transition-colors duration-200 outline-none",
                      waActive ? "bg-emerald-500" : "bg-slate-200"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200",
                      waActive ? "right-1" : "left-1"
                    )} />
                  </button>
                </div>

                {waActive && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-12 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nomor Pengirim (Sender Number)</label>
                      <input
                        type="text"
                        value={waNumber}
                        onChange={(e) => setWaNumber(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none text-slate-700"
                        placeholder="Contoh: 08123456789"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Status Enkripsi Gateway</label>
                      <div className="h-10 px-4 py-2 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                        SALURAN WA AKTIF (READY)
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* EMAIL CONFIGURATION */}
              <div className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600">
                      <Mail size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Saluran Surel (Email via SMTP)</p>
                      <p className="text-xs text-slate-500">Mendukung pengiriman newsletter dan faktur PDF profesional langsung ke email.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEmailActive(!emailActive)}
                    className={cn(
                      "w-12 h-6 rounded-full relative transition-colors duration-200 outline-none",
                      emailActive ? "bg-indigo-600" : "bg-slate-200"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200",
                      emailActive ? "right-1" : "left-1"
                    )} />
                  </button>
                </div>

                {emailActive && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-12 animate-in slide-in-from-top-2 duration-300">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Email Pengirim (Sender Email)</label>
                      <input
                        type="email"
                        value={providerEmail}
                        onChange={(e) => setProviderEmail(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none text-slate-700"
                        placeholder="Contoh: billing@toko.com"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Status Server Transmisi</label>
                      <div className="h-10 px-4 py-2 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse" />
                        SMTP SERVER AKTIF (AUTHENTICATED)
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* DEFAULT SETTING */}
              <div className="pt-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Saluran Utama Default (Sistem Terpilih)</label>
                  <div className="flex gap-4">
                    {['WhatsApp', 'Email'].map((ch) => (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => setDefaultChannel(ch as any)}
                        className={cn(
                          "px-6 py-2.5 rounded-2xl border-2 font-bold text-xs transition-all flex items-center gap-2",
                          defaultChannel === ch 
                            ? "bg-slate-900 border-slate-900 text-white" 
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        {ch === 'WhatsApp' ? <Send size={14} /> : <Mail size={14} />}
                        Gunakan {ch} Sebagai Default
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* User Add/Edit Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowUserModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {editingUser ? 'Edit User' : 'Tambah User Baru'}
              </h3>
              <button 
                onClick={() => setShowUserModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleUserSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                  placeholder="Nama pengguna"
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all text-sm"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Email</label>
                <input
                  type="email"
                  required
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  placeholder="email@example.com"
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all text-sm"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Password</label>
                <input
                  type="password"
                  required
                  value={userFormData.password}
                  onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all text-sm"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Role</label>
                <select
                  value={userFormData.role}
                  onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value as 'Admin' | 'User' })}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl outline-none transition-all text-sm"
                >
                  <option value="User">User</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="flex-1 py-3 text-slate-600 font-bold text-sm bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-white font-bold text-sm bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-lg shadow-indigo-100"
                >
                  {editingUser ? 'Simpan Perubahan' : 'Tambah User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

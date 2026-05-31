import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Package, ArrowUpDown, Edit2, Trash2, X, Camera, ChevronRight, ChevronLeft, Users, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import RefreshButton from '../../components/ui/RefreshButton';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import { cn, formatCurrency } from '../../lib/utils';
import { exportToJSON, exportToCSV, exportToExcel, exportToPDF } from '../../lib/export';
import { useDb } from '../../contexts/DatabaseContext';
import { useAuth } from '../../contexts/AuthContext';
import { Product, Supplier } from '../../services/database';

const PRODUCT_CATEGORIES = ['Makanan', 'Minuman', 'Camilan', 'Lainnya'];
const SUPPLIER_CATEGORIES = ['Bahan Baku', 'Kemasan', 'Peralatan', 'Jasa', 'Lainnya'];

export default function Inventory() {
  const { db, updateProducts, updateSuppliers } = useDb();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState<Product[]>(db.products);
  const [suppliers, setSuppliers] = useState<Supplier[]>(db.suppliers);

  // Sync products to database
  useEffect(() => {
    updateProducts(products);
  }, [products, updateProducts]);

  // Sync suppliers to database
  useEffect(() => {
    updateSuppliers(suppliers);
  }, [suppliers, updateSuppliers]);

  // Load data from database on mount
  useEffect(() => {
    setProducts(db.products);
    setSuppliers(db.suppliers);
  }, [db.products, db.suppliers]);
  const [searchTerm, setSearchTerm] = useState('');
  const [supplierSearchTerm, setSupplierSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    stock: '',
    category: 'Makanan',
    image: ''
  });

  const [supplierForm, setSupplierForm] = useState({
    name: '',
    contactName: '',
    phone: '',
    email: '',
    address: '',
    category: 'Bahan Baku',
    notes: ''
  });

  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
  };

  // Product Handlers
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const product: Product = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user?.id || '',
      name: newProduct.name,
      price: Number(newProduct.price),
      stock: Number(newProduct.stock),
      category: newProduct.category,
      status: Number(newProduct.stock) > 20 ? 'In Stock' : Number(newProduct.stock) > 0 ? 'Low Stock' : 'Out of Stock',
      image: newProduct.image
    };
    setProducts(prev => [product, ...prev]);
    setIsAddModalOpen(false);
    setNewProduct({ name: '', price: '', stock: '', category: 'Makanan', image: '' });
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Hapus produk ini?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  // Supplier Handlers
  const handleOpenSupplierModal = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setSupplierForm({
        name: supplier.name,
        contactName: supplier.contactName,
        phone: supplier.phone,
        email: supplier.email,
        address: supplier.address,
        category: supplier.category,
        notes: supplier.notes || ''
      });
    } else {
      setEditingSupplier(null);
      setSupplierForm({
        name: '',
        contactName: '',
        phone: '',
        email: '',
        address: '',
        category: 'Bahan Baku',
        notes: ''
      });
    }
    setIsSupplierModalOpen(true);
  };

  const handleSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSupplier) {
      setSuppliers(prev => prev.map(s => s.id === editingSupplier.id ? { ...s, ...supplierForm } : s));
    } else {
      const supplier: Supplier = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user?.id || '',
        ...supplierForm
      };
      setSuppliers(prev => [supplier, ...prev]);
    }
    setIsSupplierModalOpen(false);
  };

  const handleDeleteSupplier = (id: string) => {
    if (confirm('Hapus data supplier ini?')) {
      setSuppliers(prev => prev.filter(s => s.id !== id));
    }
  };

  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter(p => 
      (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       p.category.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterCategory === 'All' || p.category === filterCategory)
    );

    result.sort((a, b) => {
      const valA = a[sortBy] as any;
      const valB = b[sortBy] as any;
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [products, searchTerm, filterCategory, sortBy, sortOrder]);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => 
      s.name.toLowerCase().includes(supplierSearchTerm.toLowerCase()) ||
      s.contactName.toLowerCase().includes(supplierSearchTerm.toLowerCase()) ||
      s.category.toLowerCase().includes(supplierSearchTerm.toLowerCase())
    );
  }, [suppliers, supplierSearchTerm]);

  const toggleSort = (key: 'name' | 'price' | 'stock') => {
    if (sortBy === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="text-indigo-600" />
            Operasional Bisnis
          </h1>
          <p className="text-slate-500 text-sm">Kelola katalog produk, stok, dan supplier Anda secara terpadu.</p>
        </div>
        <div className="flex items-center gap-3">
          <RefreshButton onRefresh={handleRefresh} />
          <div className="relative group">
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all text-sm">
              <Download size={18} />
              Export
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <button
                onClick={() => {
                  if (activeTab === 'products') {
                    exportToJSON(products, `produk-${new Date().toISOString().split('T')[0]}.json`);
                  } else {
                    exportToJSON(suppliers, `supplier-${new Date().toISOString().split('T')[0]}.json`);
                  }
                }}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <span>📄</span> Export JSON
              </button>
              <button
                onClick={() => {
                  if (activeTab === 'products') {
                    exportToCSV(products, `produk-${new Date().toISOString().split('T')[0]}.csv`);
                  } else {
                    exportToCSV(suppliers, `supplier-${new Date().toISOString().split('T')[0]}.csv`);
                  }
                }}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <span>📊</span> Export CSV
              </button>
              <button
                onClick={() => {
                  if (activeTab === 'products') {
                    exportToExcel(products, `produk-${new Date().toISOString().split('T')[0]}.xlsx`, 'Produk');
                  } else {
                    exportToExcel(suppliers, `supplier-${new Date().toISOString().split('T')[0]}.xlsx`, 'Supplier');
                  }
                }}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <span>📈</span> Export Excel
              </button>
              <button
                onClick={() => {
                  if (activeTab === 'products') {
                    exportToPDF(products, `produk-${new Date().toISOString().split('T')[0]}.pdf`, 'Laporan Produk');
                  } else {
                    exportToPDF(suppliers, `supplier-${new Date().toISOString().split('T')[0]}.pdf`, 'Laporan Supplier');
                  }
                }}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <span>📋</span> Export PDF
              </button>
            </div>
          </div>
          <button 
            onClick={() => activeTab === 'products' ? setIsAddModalOpen(true) : handleOpenSupplierModal()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20 text-sm"
          >
            <Plus size={18} />
            Tambah {activeTab === 'products' ? 'Produk' : 'Supplier'}
          </button>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        {[
          { id: 'products', label: 'Stok & Produk' },
          { id: 'suppliers', label: 'Manajemen Supplier' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 text-sm font-bold transition-all relative ${
              activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div layoutId="invTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
            )}
          </button>
        ))}
      </div>

      {activeTab === 'products' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Cari produk..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex items-center gap-2">
                <Filter className="text-slate-400" size={16} />
                <select 
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-600 outline-none hover:bg-slate-50 transition-colors"
                >
                  <option value="All">Semua Kategori</option>
                  {PRODUCT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="h-6 w-px bg-slate-200 mx-2" />
              <button 
                onClick={() => toggleSort('price')}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition-colors border",
                  sortBy === 'price' ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
              >
                <Plus size={14} className={cn("transition-transform", sortBy === 'price' && sortOrder === 'desc' && "rotate-180")} />
                Harga
              </button>
              <button 
                onClick={() => toggleSort('stock')}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-lg transition-colors border",
                  sortBy === 'stock' ? "bg-indigo-50 border-indigo-200 text-indigo-600" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
              >
                <ArrowUpDown size={14} />
                Stok
              </button>
            </div>
          </div>

          {products.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider font-bold">
                      <th className="px-6 py-4">Produk</th>
                      <th className="px-6 py-4">Kategori</th>
                      <th className="px-6 py-4">Harga</th>
                      <th className="px-6 py-4">Stok</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAndSortedProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 overflow-hidden">
                              {product.image ? (
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <Package size={20} />
                              )}
                            </div>
                            <span className="font-bold text-slate-900">{product.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold uppercase">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-700 font-bold">
                          {formatCurrency(product.price)}
                        </td>
                        <td className="px-6 py-4 text-slate-700 text-sm">
                          {product.stock} unit
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider",
                            product.status === 'In Stock' ? 'bg-emerald-100 text-emerald-700' :
                            product.status === 'Low Stock' ? 'bg-amber-100 text-amber-700' :
                            'bg-rose-100 text-rose-700'
                          )}>
                            {product.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1.5 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors" title="Edit">
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors" 
                              title="Hapus"
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
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-widest">
                <span>Menampilkan {filteredAndSortedProducts.length} produk</span>
                <div className="flex gap-2">
                  <button className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-30" disabled>
                    <ChevronLeft size={16} />
                  </button>
                  <button className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-30" disabled>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <EmptyState 
              icon={Package}
              title="Katalog Produk Kosong"
              description="Tambahkan produk pertama Anda untuk mulai mengelola stok dan melakukan penjualan."
              action={
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                >
                  Tambah Produk Baru
                </button>
              }
            />
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Cari supplier..." 
                value={supplierSearchTerm}
                onChange={(e) => setSupplierSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 bg-slate-50/30">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest">Daftar Supplier</h3>
            </div>
            
            {filteredSuppliers.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {filteredSuppliers.map((sup) => (
                  <div key={sup.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm">
                        {sup.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900">{sup.name}</p>
                          <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-bold uppercase rounded">
                            {sup.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{sup.contactName} • {sup.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-slate-700">{sup.phone}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{sup.email}</p>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenSupplierModal(sup)}
                          className="p-1.5 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteSupplier(sup.id)}
                          className="p-1.5 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState 
                icon={Users}
                title="Belum Ada Supplier"
                description="Kelola hubungan dengan pemasok barang Anda di sini."
                action={
                  <button 
                    onClick={() => handleOpenSupplierModal()}
                    className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest"
                  >
                    Tambah Supplier Pertama
                  </button>
                }
              />
            )}
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title="Tambah Produk Baru"
      >
        <form onSubmit={handleAddProduct} className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="relative group">
                <div className="w-24 h-24 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 group-hover:bg-slate-50 group-hover:border-indigo-300 transition-all cursor-pointer">
                  <Camera size={32} />
                  <span className="text-[10px] font-bold uppercase mt-1">Foto</span>
                </div>
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nama Produk</label>
                <input 
                  required
                  type="text" 
                  value={newProduct.name}
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  placeholder="Contoh: Kopi Susu Aren"
                  className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Harga Jual</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">Rp</span>
                    <input 
                      required
                      type="number" 
                      value={newProduct.price}
                      onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                      placeholder="0"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Stok Awal</label>
                  <input 
                    required
                    type="number" 
                    value={newProduct.stock}
                    onChange={e => setNewProduct({...newProduct, stock: e.target.value})}
                    placeholder="0"
                    className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Kategori</label>
                <select 
                  value={newProduct.category}
                  onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                >
                  {PRODUCT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="flex-1 py-3 text-slate-600 font-bold text-sm bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all"
            >
              Batal
            </button>
            <button 
              type="submit"
              className="flex-1 py-3 text-white font-bold text-sm bg-indigo-600 hover:bg-indigo-700 rounded-2xl transition-all shadow-lg shadow-indigo-200"
            >
              Simpan Produk
            </button>
          </div>
        </form>
      </Modal>

      {/* Supplier Modal */}
      <Modal 
        isOpen={isSupplierModalOpen} 
        onClose={() => setIsSupplierModalOpen(false)} 
        title={editingSupplier ? "Edit Supplier" : "Tambah Supplier Baru"}
      >
        <form onSubmit={handleSupplierSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nama Supplier</label>
              <input 
                required
                type="text" 
                value={supplierForm.name}
                onChange={e => setSupplierForm({...supplierForm, name: e.target.value})}
                placeholder="Contoh: PT Sumber Pangan"
                className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nama Kontak</label>
              <input 
                type="text" 
                value={supplierForm.contactName}
                onChange={e => setSupplierForm({...supplierForm, contactName: e.target.value})}
                placeholder="Nama penanggung jawab"
                className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nomor Telepon</label>
              <input 
                required
                type="tel" 
                value={supplierForm.phone}
                onChange={e => setSupplierForm({...supplierForm, phone: e.target.value})}
                placeholder="0812xxxx"
                className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Email</label>
              <input 
                type="email" 
                value={supplierForm.email}
                onChange={e => setSupplierForm({...supplierForm, email: e.target.value})}
                placeholder="email@provider.com"
                className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Kategori</label>
              <select 
                value={supplierForm.category}
                onChange={e => setSupplierForm({...supplierForm, category: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
              >
                {SUPPLIER_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Alamat</label>
              <textarea 
                required
                rows={2}
                value={supplierForm.address}
                onChange={e => setSupplierForm({...supplierForm, address: e.target.value})}
                placeholder="Alamat lengkap supplier..."
                className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={() => setIsSupplierModalOpen(false)}
              className="flex-1 py-3 text-slate-600 font-bold text-sm bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all"
            >
              Batal
            </button>
            <button 
              type="submit"
              className="flex-1 py-3 text-white font-bold text-sm bg-indigo-600 hover:bg-indigo-700 rounded-2xl transition-all shadow-lg shadow-indigo-200"
            >
              {editingSupplier ? "Simpan Perubahan" : "Simpan Supplier"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}


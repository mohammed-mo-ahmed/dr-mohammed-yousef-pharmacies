'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { supabase } from '@/lib/supabase';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  getCustomers,
  getOrders,
  updateOrderStatus,
  deleteOrder,
  seedDatabase,
} from '@/lib/api';
import { Product, Category, Order, Customer, Offer } from '@/types';
import {
  LayoutDashboard,
  Pill,
  Folders,
  ShoppingBag,
  Users,
  Warehouse,
  Percent,
  Plus,
  Edit2,
  Trash2,
  X,
  LogOut,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  PackageCheck,
} from 'lucide-react';
import Image from 'next/image';

type TabType = 'dashboard' | 'products' | 'categories' | 'orders' | 'customers' | 'inventory' | 'offers';

export default function AdminDashboardPage() {
  const t = useTranslations('dashboard');
  const common = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const isRtl = locale === 'ar';

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [user, setUser] = useState<import('@supabase/supabase-js').User | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<{ success: boolean; msg: string } | null>(null);

  // Data States
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Modals / Form States
  const [activeModal, setActiveModal] = useState<'product' | 'category' | 'offer' | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  
  // Product Form
  const [prodNameAr, setProdNameAr] = useState('');
  const [prodNameEn, setProdNameEn] = useState('');
  const [prodPrice, setProdPrice] = useState(0);
  const [prodStock, setProdStock] = useState(0);
  const [prodCategoryId, setProdCategoryId] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [prodDescAr, setProdDescAr] = useState('');
  const [prodDescEn, setProdDescEn] = useState('');
  const [prodUsageAr, setProdUsageAr] = useState('');
  const [prodUsageEn, setProdUsageEn] = useState('');
  const [prodIsBest, setProdIsBest] = useState(false);
  const [prodIsLatest, setProdIsLatest] = useState(true);

  // Category Form
  const [catNameAr, setCatNameAr] = useState('');
  const [catNameEn, setCatNameEn] = useState('');
  const [catSlug, setCatSlug] = useState('');

  // Offer Form
  const [offTitleAr, setOffTitleAr] = useState('');
  const [offTitleEn, setOffTitleEn] = useState('');
  const [offPercent, setOffPercent] = useState(0);
  const [offImage, setOffImage] = useState('');

  const loadAllData = async () => {
    setLoadingData(true);
    try {
      const [cats, prods, ords, custs, offs] = await Promise.all([
        getCategories(),
        getProducts(),
        getOrders(),
        getCustomers(),
        getOffers(),
      ]);
      setCategories(cats);
      setProducts(prods);
      setOrders(ords);
      setCustomers(custs);
      setOffers(offs);
    } catch (e) {
      console.error('Error loading admin data:', e);
    } finally {
      setLoadingData(false);
    }
  };

  // Auth Guard
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push(`/login?redirect=/admin`);
      } else {
        setUser(session.user);
        loadAllData();
      }
      setLoadingSession(false);
    }
    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    setSeedResult(null);
    try {
      const res = await seedDatabase();
      if (res.success) {
        setSeedResult({ success: true, msg: isRtl ? 'تم تهيئة قاعدة البيانات بنجاح!' : 'Database seeded successfully!' });
        loadAllData();
      } else {
        setSeedResult({ success: false, msg: isRtl ? 'قاعدة البيانات تحتوي على بيانات بالفعل.' : 'Database already contains data.' });
      }
    } catch {
      setSeedResult({ success: false, msg: 'Error seeding database.' });
    } finally {
      setIsSeeding(false);
    }
  };

  // ==========================================
  // PRODUCT ACTIONS
  // ==========================================
  const openAddProduct = () => {
    setEditId(null);
    setProdNameAr('');
    setProdNameEn('');
    setProdPrice(0);
    setProdStock(0);
    setProdCategoryId(categories[0]?.id || '');
    setProdImage('');
    setProdDescAr('');
    setProdDescEn('');
    setProdUsageAr('');
    setProdUsageEn('');
    setProdIsBest(false);
    setProdIsLatest(true);
    setActiveModal('product');
  };

  const openEditProduct = (prod: Product) => {
    setEditId(prod.id);
    setProdNameAr(prod.name_ar);
    setProdNameEn(prod.name_en);
    setProdPrice(prod.price);
    setProdStock(prod.stock);
    setProdCategoryId(prod.category_id);
    setProdImage(prod.image_url);
    setProdDescAr(prod.description_ar);
    setProdDescEn(prod.description_en);
    setProdUsageAr(prod.usage_instructions_ar);
    setProdUsageEn(prod.usage_instructions_en);
    setProdIsBest(prod.is_best_seller);
    setProdIsLatest(prod.is_latest);
    setActiveModal('product');
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name_ar: prodNameAr,
      name_en: prodNameEn,
      price: Number(prodPrice),
      stock: Number(prodStock),
      category_id: prodCategoryId,
      image_url: prodImage,
      description_ar: prodDescAr,
      description_en: prodDescEn,
      usage_instructions_ar: prodUsageAr,
      usage_instructions_en: prodUsageEn,
      is_best_seller: prodIsBest,
      is_latest: prodIsLatest,
    };

    let result;
    if (editId) {
      result = await updateProduct(editId, payload);
    } else {
      result = await createProduct(payload);
    }

    if (result) {
      setActiveModal(null);
      loadAllData();
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm(t('products.deleteConfirm'))) {
      const ok = await deleteProduct(id);
      if (ok) loadAllData();
    }
  };

  // ==========================================
  // CATEGORY ACTIONS
  // ==========================================
  const openAddCategory = () => {
    setEditId(null);
    setCatNameAr('');
    setCatNameEn('');
    setCatSlug('');
    setActiveModal('category');
  };

  const openEditCategory = (cat: Category) => {
    setEditId(cat.id);
    setCatNameAr(cat.name_ar);
    setCatNameEn(cat.name_en);
    setCatSlug(cat.slug);
    setActiveModal('category');
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name_ar: catNameAr,
      name_en: catNameEn,
      slug: catSlug || catNameEn.toLowerCase().replace(/\s+/g, '-'),
    };

    let result;
    if (editId) {
      result = await updateCategory(editId, payload);
    } else {
      result = await createCategory(payload);
    }

    if (result) {
      setActiveModal(null);
      loadAllData();
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm(isRtl ? 'هل أنت متأكد من حذف هذه الفئة؟' : 'Are you sure you want to delete this category?')) {
      const ok = await deleteCategory(id);
      if (ok) loadAllData();
    }
  };

  // ==========================================
  // OFFERS ACTIONS
  // ==========================================
  const openAddOffer = () => {
    setEditId(null);
    setOffTitleAr('');
    setOffTitleEn('');
    setOffPercent(0);
    setOffImage('');
    setActiveModal('offer');
  };

  const openEditOffer = (offer: Offer) => {
    setEditId(offer.id);
    setOffTitleAr(offer.title_ar);
    setOffTitleEn(offer.title_en);
    setOffPercent(offer.discount_percentage);
    setOffImage(offer.image_url);
    setActiveModal('offer');
  };

  const handleSaveOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title_ar: offTitleAr,
      title_en: offTitleEn,
      discount_percentage: Number(offPercent),
      image_url: offImage,
      active: true,
    };

    let result;
    if (editId) {
      result = await updateOffer(editId, payload);
    } else {
      result = await createOffer(payload);
    }
    if (result) {
      setActiveModal(null);
      loadAllData();
    }
  };

  const handleDeleteOffer = async (id: string) => {
    if (confirm(isRtl ? 'هل تريد حذف هذا العرض؟' : 'Delete this offer?')) {
      const ok = await deleteOffer(id);
      if (ok) loadAllData();
    }
  };

  // ==========================================
  // ORDER ACTIONS
  // ==========================================
  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    const updated = await updateOrderStatus(orderId, status);
    if (updated) {
      loadAllData();
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (confirm(isRtl ? 'حذف هذا الطلب نهائياً؟' : 'Permanently delete this order?')) {
      const ok = await deleteOrder(id);
      if (ok) loadAllData();
    }
  };

  // ==========================================
  // INVENTORY ACTIONS
  // ==========================================
  const handleUpdateStockInline = async (id: string, newStock: number) => {
    await updateProduct(id, { stock: newStock });
    // Soft update
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, stock: newStock } : p)));
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null; // Guarded route

  const isLowStock = (stock: number) => stock <= 10;
  const lowStockCount = products.filter((p) => isLowStock(p.stock)).length;
  const totalSales = orders.reduce((sum, o) => (o.status !== 'cancelled' ? sum + Number(o.total) : sum), 0);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-cairo">
      
      {/* SIDEBAR */}
      <aside className={`w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col justify-between p-6 border-b md:border-b-0 ${
        isRtl ? 'md:border-l' : 'md:border-r'
      } border-slate-800`}>
        <div>
          {/* Brand header */}
          <div className="flex items-center gap-2 mb-8">
            <span className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              Y
            </span>
            <span className="font-extrabold text-white text-base leading-none">
              {isRtl ? 'لوحة التحكم للمدير' : 'Admin Panel'}
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-right ${
                activeTab === 'dashboard' ? 'bg-teal-600 text-white shadow-md' : 'hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard size={18} />
              <span>{t('nav.home')}</span>
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-right ${
                activeTab === 'products' ? 'bg-teal-600 text-white shadow-md' : 'hover:bg-slate-800'
              }`}
            >
              <Pill size={18} />
              <span>{t('nav.products')}</span>
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-right ${
                activeTab === 'categories' ? 'bg-teal-600 text-white shadow-md' : 'hover:bg-slate-800'
              }`}
            >
              <Folders size={18} />
              <span>{t('nav.categories')}</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-right ${
                activeTab === 'orders' ? 'bg-teal-600 text-white shadow-md' : 'hover:bg-slate-800'
              }`}
            >
              <ShoppingBag size={18} />
              <span>{t('nav.orders')}</span>
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-right ${
                activeTab === 'customers' ? 'bg-teal-600 text-white shadow-md' : 'hover:bg-slate-800'
              }`}
            >
              <Users size={18} />
              <span>{t('nav.customers')}</span>
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-right ${
                activeTab === 'inventory' ? 'bg-teal-600 text-white shadow-md' : 'hover:bg-slate-800'
              }`}
            >
              <Warehouse size={18} />
              <span>{t('nav.inventory')}</span>
            </button>
            <button
              onClick={() => setActiveTab('offers')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-right ${
                activeTab === 'offers' ? 'bg-teal-600 text-white shadow-md' : 'hover:bg-slate-800'
              }`}
            >
              <Percent size={18} />
              <span>{t('nav.offers')}</span>
            </button>
          </nav>
        </div>

        {/* Footer Logout info */}
        <div className="pt-6 border-t border-slate-800">
          <div className="text-xs text-slate-500 mb-3 truncate" title={user.email}>
            {user.email}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-950/20 border border-rose-950/40 hover:bg-rose-900/40 text-rose-400 rounded-xl text-sm font-bold transition-all cursor-pointer"
          >
            <LogOut size={16} />
            <span>{common('logout')}</span>
          </button>
        </div>
      </aside>

      {/* MAIN VIEW AREA */}
      <main className="flex-grow p-6 md:p-10 max-h-screen overflow-y-auto">
        {/* Sync / Seed bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800">
              {activeTab === 'dashboard' && t('title')}
              {activeTab === 'products' && t('nav.products')}
              {activeTab === 'categories' && t('nav.categories')}
              {activeTab === 'orders' && t('nav.orders')}
              {activeTab === 'customers' && t('nav.customers')}
              {activeTab === 'inventory' && t('nav.inventory')}
              {activeTab === 'offers' && t('nav.offers')}
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={loadAllData}
              disabled={loadingData}
              className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-all flex items-center gap-1.5 text-xs font-bold shadow-sm"
              title="Refresh Data"
            >
              <RefreshCw size={14} className={loadingData ? 'animate-spin' : ''} />
              <span>{isRtl ? 'تحديث البيانات' : 'Refresh'}</span>
            </button>

            <button
              onClick={handleSeedDatabase}
              disabled={isSeeding}
              className="p-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-all text-xs font-bold shadow-sm"
            >
              {isSeeding ? 'Seeding...' : isRtl ? 'تهيئة قاعدة البيانات' : 'Seed Database'}
            </button>
          </div>
        </div>

        {/* Database Seeding Status alert */}
        {seedResult && (
          <div className={`p-4 rounded-2xl mb-6 text-xs md:text-sm font-bold flex items-center gap-2 border ${
            seedResult.success ? 'bg-emerald-50 text-emerald-800 border-emerald-250' : 'bg-amber-55/30 text-amber-800 border-amber-200'
          }`}>
            <span>{seedResult.msg}</span>
            <button onClick={() => setSeedResult(null)} className="ml-auto font-black">✕</button>
          </div>
        )}

        {loadingData && products.length === 0 ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* TABS SELECTORS */}
            
            {/* 1. DASHBOARD VIEW */}
            {activeTab === 'dashboard' && (
              <div className="flex flex-col gap-8 animate-fadeIn">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Card 1: Orders */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 font-semibold">{t('stats.totalOrders')}</span>
                      <h3 className="text-2xl font-black text-slate-800 mt-1 font-sans">{orders.length}</h3>
                    </div>
                    <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
                      <ShoppingBag size={22} />
                    </div>
                  </div>

                  {/* Card 2: Sales */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 font-semibold">{t('stats.totalSales')}</span>
                      <h3 className="text-2xl font-black text-slate-800 mt-1 font-sans">
                        {totalSales.toFixed(2)} <span className="text-xs">{common('currency')}</span>
                      </h3>
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                      <TrendingUp size={22} />
                    </div>
                  </div>

                  {/* Card 3: Customers */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 font-semibold">{t('stats.activeCustomers')}</span>
                      <h3 className="text-2xl font-black text-slate-800 mt-1 font-sans">{customers.length}</h3>
                    </div>
                    <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center">
                      <Users size={22} />
                    </div>
                  </div>

                  {/* Card 4: Low Stock */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 font-semibold">{t('stats.lowStock')}</span>
                      <h3 className={`text-2xl font-black mt-1 font-sans ${lowStockCount > 0 ? 'text-rose-500' : 'text-slate-800'}`}>
                        {lowStockCount}
                      </h3>
                    </div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      lowStockCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'
                    }`}>
                      <AlertTriangle size={22} />
                    </div>
                  </div>
                </div>

                {/* Recent Orders Table */}
                <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-slate-850 text-base mb-4">
                    {isRtl ? 'الطلبات الأخيرة قيد الانتظار' : 'Recent Pending Orders'}
                  </h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right text-slate-650">
                      <thead className="text-xs text-slate-400 uppercase bg-slate-50">
                        <tr>
                          <th className="px-6 py-3">{t('orders.customer')}</th>
                          <th className="px-6 py-3">{t('orders.date')}</th>
                          <th className="px-6 py-3">{common('price')}</th>
                          <th className="px-6 py-3">{t('orders.status')}</th>
                          <th className="px-6 py-3">{common('actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 5).map((o) => (
                          <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                            <td className="px-6 py-4 font-bold text-slate-800">
                              <div>{o.customer_name}</div>
                              <div className="text-xs text-slate-400 font-sans" dir="ltr">{o.customer_phone}</div>
                            </td>
                            <td className="px-6 py-4 font-sans text-xs">
                              {o.created_at ? new Date(o.created_at).toLocaleDateString(locale) : ''}
                            </td>
                            <td className="px-6 py-4 font-bold text-slate-900 font-sans">
                              {o.total.toFixed(2)} {common('currency')}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                o.status === 'pending' ? 'bg-amber-50 text-amber-700' :
                                o.status === 'shipped' ? 'bg-sky-50 text-sky-700' :
                                o.status === 'delivered' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-500'
                              }`}>
                                {t(`orders.status${o.status.charAt(0).toUpperCase() + o.status.slice(1)}`)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => setActiveTab('orders')}
                                className="text-xs font-bold text-teal-600 hover:underline"
                              >
                                {isRtl ? 'تفاصيل وإدارة' : 'Manage'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 2. PRODUCTS VIEW */}
            {activeTab === 'products' && (
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-6 animate-fadeIn">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 text-base">
                    {isRtl ? 'قائمة المنتجات المتاحة' : 'Available Products Catalog'}
                  </h3>
                  <button
                    onClick={openAddProduct}
                    className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-50 transition-all cursor-pointer"
                  >
                    <Plus size={16} />
                    <span>{t('products.add')}</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-right text-slate-650">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-50">
                      <tr>
                        <th className="px-6 py-3">{common('name')}</th>
                        <th className="px-6 py-3">{t('products.fields.category')}</th>
                        <th className="px-6 py-3">{common('price')}</th>
                        <th className="px-6 py-3">{t('products.fields.stock')}</th>
                        <th className="px-6 py-3">{common('actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="px-6 py-4 flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl relative overflow-hidden flex-shrink-0">
                              <Image
                                src={p.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=60'}
                                alt={p.name_en}
                                fill
                                sizes="40px"
                                className="object-contain p-1"
                              />
                            </div>
                            <div>
                              <div className="font-bold text-slate-800">{isRtl ? p.name_ar : p.name_en}</div>
                              <div className="text-slate-400 text-xs truncate max-w-xs">{isRtl ? p.description_ar : p.description_en}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-semibold text-slate-700">
                            {p.category ? (isRtl ? p.category.name_ar : p.category.name_en) : ''}
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-900 font-sans">
                            {p.price.toFixed(2)} {common('currency')}
                          </td>
                          <td className="px-6 py-4 font-bold font-sans">
                            <span className={isLowStock(p.stock) ? 'text-rose-500' : 'text-slate-750'}>
                              {p.stock}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openEditProduct(p)}
                                className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-colors"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
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
            )}

            {/* 3. CATEGORIES VIEW */}
            {activeTab === 'categories' && (
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-6 animate-fadeIn">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 text-base">
                    {isRtl ? 'فئات المنتجات' : 'Product Categories'}
                  </h3>
                  <button
                    onClick={openAddCategory}
                    className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <Plus size={16} />
                    <span>{isRtl ? 'إضافة فئة' : 'Add Category'}</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-right text-slate-650">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-50">
                      <tr>
                        <th className="px-6 py-3">{isRtl ? 'الاسم بالعربية' : 'Name (Arabic)'}</th>
                        <th className="px-6 py-3">{isRtl ? 'الاسم بالإنجليزية' : 'Name (English)'}</th>
                        <th className="px-6 py-3">{isRtl ? 'المعرف الفريد (Slug)' : 'Slug'}</th>
                        <th className="px-6 py-3">{common('actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((c) => (
                        <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-bold text-slate-800">{c.name_ar}</td>
                          <td className="px-6 py-4 font-semibold text-slate-850">{c.name_en}</td>
                          <td className="px-6 py-4 font-sans text-xs">{c.slug}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openEditCategory(c)}
                                className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-colors"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(c.id)}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
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
            )}

            {/* 4. ORDERS VIEW */}
            {activeTab === 'orders' && (
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-6 animate-fadeIn">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-right text-slate-650">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-50">
                      <tr>
                        <th className="px-6 py-3">{t('orders.customer')}</th>
                        <th className="px-6 py-3">{isRtl ? 'طريقة الاستلام' : 'Delivery Method'}</th>
                        <th className="px-6 py-3">{t('orders.items')}</th>
                        <th className="px-6 py-3">{common('price')}</th>
                        <th className="px-6 py-3">{t('orders.status')}</th>
                        <th className="px-6 py-3">{common('actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-850">{o.customer_name}</div>
                            <div className="text-xs text-slate-400 font-sans" dir="ltr">{o.customer_phone}</div>
                            <div className="text-[10px] text-slate-500 mt-1 max-w-xs">{o.customer_address}</div>
                          </td>
                          <td className="px-6 py-4 font-semibold text-xs">
                            {o.delivery_method === 'home_delivery' ? (isRtl ? 'توصيل للمنزل' : 'Home Delivery') : (isRtl ? 'استلام من الصيدلية' : 'Pickup')}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1 text-xs">
                              {o.order_items?.map((item, idx) => (
                                <div key={idx} className="font-semibold text-slate-700">
                                  • {isRtl ? item.product?.name_ar : item.product?.name_en} ({item.quantity} ×)
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-900 font-sans">
                            {o.total.toFixed(2)} {common('currency')}
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={o.status}
                              onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as Order['status'])}
                              className={`p-1.5 text-xs font-bold rounded-xl focus:outline-none border ${
                                o.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                o.status === 'shipped' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                                o.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-250' : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}
                            >
                              <option value="pending">{t('orders.statusPending')}</option>
                              <option value="shipped">{t('orders.statusShipped')}</option>
                              <option value="delivered">{t('orders.statusDelivered')}</option>
                              <option value="cancelled">{t('orders.statusCancelled')}</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleDeleteOrder(o.id)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 5. CUSTOMERS VIEW */}
            {activeTab === 'customers' && (
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-6 animate-fadeIn">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-right text-slate-650">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-50">
                      <tr>
                        <th className="px-6 py-3">{common('name')}</th>
                        <th className="px-6 py-3">{isRtl ? 'الهاتف' : 'Phone'}</th>
                        <th className="px-6 py-3">{isRtl ? 'العنوان' : 'Address'}</th>
                        <th className="px-6 py-3">{isRtl ? 'تاريخ التسجيل' : 'Registered Date'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((c) => (
                        <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-bold text-slate-800">{c.name}</td>
                          <td className="px-6 py-4 font-semibold text-slate-700 font-sans" dir="ltr">{c.phone}</td>
                          <td className="px-6 py-4 text-xs max-w-sm">{c.address || '-'}</td>
                          <td className="px-6 py-4 font-sans text-xs">
                            {c.created_at ? new Date(c.created_at).toLocaleDateString(locale) : ''}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 6. INVENTORY VIEW */}
            {activeTab === 'inventory' && (
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-6 animate-fadeIn">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-right text-slate-650">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-50">
                      <tr>
                        <th className="px-6 py-3">{common('name')}</th>
                        <th className="px-6 py-3">{t('products.fields.stock')}</th>
                        <th className="px-6 py-3">{isRtl ? 'تعديل المخزون' : 'Manage Stock'}</th>
                        <th className="px-6 py-3">{isRtl ? 'الحالة' : 'Status'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-bold text-slate-800">
                            {isRtl ? p.name_ar : p.name_en}
                          </td>
                          <td className="px-6 py-4 font-bold font-sans text-base">
                            <span className={isLowStock(p.stock) ? 'text-rose-500 animate-pulse' : 'text-slate-850'}>
                              {p.stock}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                defaultValue={p.stock}
                                onBlur={(e) => handleUpdateStockInline(p.id, Number(e.target.value))}
                                className="w-20 p-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white text-center font-sans text-sm font-bold"
                              />
                              <span className="text-[10px] text-slate-400">
                                {isRtl ? '(اضغط خارج الحقل للحفظ)' : '(Blur to Save)'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {isLowStock(p.stock) ? (
                              <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-xs font-bold rounded-lg flex items-center gap-1 w-max">
                                <AlertTriangle size={12} />
                                <span>{isRtl ? 'مخزون منخفض' : 'Low Stock'}</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg flex items-center gap-1 w-max">
                                <PackageCheck size={12} />
                                <span>{isRtl ? 'مستقر' : 'Stable'}</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 7. OFFERS VIEW */}
            {activeTab === 'offers' && (
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-6 animate-fadeIn">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 text-base">
                    {isRtl ? 'العروض النشطة' : 'Active Offers Banner List'}
                  </h3>
                  <button
                    onClick={openAddOffer}
                    className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <Plus size={16} />
                    <span>{isRtl ? 'إضافة عرض جديد' : 'Create Offer'}</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-right text-slate-650">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-50">
                      <tr>
                        <th className="px-6 py-3">{common('name')}</th>
                        <th className="px-6 py-3">{isRtl ? 'نسبة الخصم' : 'Discount Percentage'}</th>
                        <th className="px-6 py-3">{common('actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {offers.map((o) => (
                        <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="px-6 py-4 flex items-center gap-3">
                            <div className="w-12 h-8 bg-slate-50 border border-slate-100 rounded-lg relative overflow-hidden flex-shrink-0">
                              <Image
                                src={o.image_url || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=60'}
                                alt={o.title_en}
                                fill
                                sizes="50px"
                                className="object-cover"
                              />
                            </div>
                            <span className="font-bold text-slate-850">{isRtl ? o.title_ar : o.title_en}</span>
                          </td>
                          <td className="px-6 py-4 font-bold text-rose-600 font-sans">
                            {o.discount_percentage}%
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openEditOffer(o)}
                                className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-colors"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteOffer(o.id)}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
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
            )}
          </>
        )}
      </main>

      {/* ==========================================
          MODAL COMPONENT (FOR ADD / EDIT CRUD)
          ========================================== */}
      {activeModal === 'product' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6">
              {editId ? t('products.edit') : t('products.add')}
            </h3>

            <form onSubmit={handleSaveProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500">{t('products.fields.nameAr')}</label>
                <input
                  type="text"
                  required
                  value={prodNameAr}
                  onChange={(e) => setProdNameAr(e.target.value)}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500">{t('products.fields.nameEn')}</label>
                <input
                  type="text"
                  required
                  value={prodNameEn}
                  onChange={(e) => setProdNameEn(e.target.value)}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white text-left"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500">{t('products.fields.price')}</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={prodPrice}
                  onChange={(e) => setProdPrice(Number(e.target.value))}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white font-sans font-bold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500">{t('products.fields.stock')}</label>
                <input
                  type="number"
                  required
                  value={prodStock}
                  onChange={(e) => setProdStock(Number(e.target.value))}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white font-sans font-bold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500">{t('products.fields.category')}</label>
                <select
                  value={prodCategoryId}
                  onChange={(e) => setProdCategoryId(e.target.value)}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white font-semibold text-slate-700"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {isRtl ? c.name_ar : c.name_en}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-500">{t('products.fields.image')}</label>
                <input
                  type="url"
                  value={prodImage}
                  onChange={(e) => setProdImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white text-left"
                />
              </div>

              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-500">{t('products.fields.descAr')}</label>
                <textarea
                  value={prodDescAr}
                  onChange={(e) => setProdDescAr(e.target.value)}
                  rows={2}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white"
                />
              </div>

              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-500">{t('products.fields.descEn')}</label>
                <textarea
                  value={prodDescEn}
                  onChange={(e) => setProdDescEn(e.target.value)}
                  rows={2}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white text-left"
                />
              </div>

              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-500">{t('products.fields.usageAr')}</label>
                <input
                  type="text"
                  value={prodUsageAr}
                  onChange={(e) => setProdUsageAr(e.target.value)}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white"
                />
              </div>

              <div className="flex flex-col gap-1 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-500">{t('products.fields.usageEn')}</label>
                <input
                  type="text"
                  value={prodUsageEn}
                  onChange={(e) => setProdUsageEn(e.target.value)}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white text-left"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="prodIsBest"
                  checked={prodIsBest}
                  onChange={(e) => setProdIsBest(e.target.checked)}
                  className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded"
                />
                <label htmlFor="prodIsBest" className="text-xs font-bold text-slate-700">
                  {isRtl ? 'منتج متميز (أكثر مبيعاً)' : 'Best Seller Product'}
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="prodIsLatest"
                  checked={prodIsLatest}
                  onChange={(e) => setProdIsLatest(e.target.checked)}
                  className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded"
                />
                <label htmlFor="prodIsLatest" className="text-xs font-bold text-slate-700">
                  {isRtl ? 'منتج جديد (أحدث المضاف)' : 'New Addition'}
                </label>
              </div>

              <div className="sm:col-span-2 mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                >
                  {common('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all"
                >
                  {common('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'category' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl relative font-cairo">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-4">
              {editId ? (isRtl ? 'تعديل الفئة' : 'Edit Category') : (isRtl ? 'إضافة فئة جديدة' : 'Add Category')}
            </h3>

            <form onSubmit={handleSaveCategory} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500">{isRtl ? 'الاسم بالعربية' : 'Name (Arabic)'}</label>
                <input
                  type="text"
                  required
                  value={catNameAr}
                  onChange={(e) => setCatNameAr(e.target.value)}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500">{isRtl ? 'الاسم بالإنجليزية' : 'Name (English)'}</label>
                <input
                  type="text"
                  required
                  value={catNameEn}
                  onChange={(e) => setCatNameEn(e.target.value)}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none text-left"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500">{isRtl ? 'المعرف الفريد' : 'Slug'}</label>
                <input
                  type="text"
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  placeholder="E.g. baby-care"
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none text-left"
                />
              </div>

              <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                >
                  {common('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all"
                >
                  {common('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === 'offer' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-cairo">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-4">
              {editId
                ? (isRtl ? 'تعديل العرض' : 'Edit Offer')
                : (isRtl ? 'إضافة عرض خصم جديد' : 'Create Offer Banner')}
            </h3>

            <form onSubmit={handleSaveOffer} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500">{isRtl ? 'عنوان العرض بالعربية' : 'Title (Arabic)'}</label>
                <input
                  type="text"
                  required
                  value={offTitleAr}
                  onChange={(e) => setOffTitleAr(e.target.value)}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500">{isRtl ? 'عنوان العرض بالإنجليزية' : 'Title (English)'}</label>
                <input
                  type="text"
                  required
                  value={offTitleEn}
                  onChange={(e) => setOffTitleEn(e.target.value)}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none text-left"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500">{isRtl ? 'نسبة الخصم (%)' : 'Discount Percentage (%)'}</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  value={offPercent}
                  onChange={(e) => setOffPercent(Number(e.target.value))}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none font-sans font-bold"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-500">{isRtl ? 'رابط الصورة البانر' : 'Banner Image URL'}</label>
                <input
                  type="url"
                  value={offImage}
                  onChange={(e) => setOffImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none text-left"
                />
              </div>

              <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                >
                  {common('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all"
                >
                  {common('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

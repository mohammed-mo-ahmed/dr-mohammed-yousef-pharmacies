'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCustomers,
  getOrders,
  updateOrderStatus,
  deleteOrder,
  seedDatabase,
} from '@/lib/api';
import { Product, Category, Order, Customer, OrderStatus } from '@/types';
import { RefreshCw, ShieldAlert } from 'lucide-react';

import Sidebar from '@/components/admin/Sidebar';
import DashboardTab from '@/components/admin/DashboardTab';
import ProductsTab from '@/components/admin/ProductsTab';
import CategoriesTab from '@/components/admin/CategoriesTab';
import OrdersTab from '@/components/admin/OrdersTab';
import CustomersTab from '@/components/admin/CustomersTab';
import InventoryTab from '@/components/admin/InventoryTab';
import OffersTab from '@/components/admin/OffersTab';
import ProductFormModal from '@/components/admin/ProductFormModal';
import AddOfferModal from '@/components/admin/AddOfferModal';
import OfferModal from '@/components/admin/OfferModal';

type TabType = 'dashboard' | 'products' | 'categories' | 'orders' | 'customers' | 'inventory' | 'offers';

export default function AdminDashboardPage() {
  const t = useTranslations('dashboard');
  const common = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const isRtl = locale === 'ar';
  const { user: authUser, isAdmin, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<{ success: boolean; msg: string } | null>(null);

  // Data States
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Modals / Form States
  const [activeModal, setActiveModal] = useState<'product' | 'category' | null>(null);
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

  // Offer Modal (from ProductsTab % icon)
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerProduct, setOfferProduct] = useState<Product | null>(null);

  // Add/Edit Offer Modal (from OffersTab)
  const [addOfferModalOpen, setAddOfferModalOpen] = useState(false);
  const [addOfferEditProduct, setAddOfferEditProduct] = useState<Product | null>(null);

  const loadAllData = async () => {
    setLoadingData(true);
    try {
      const [cats, { products: prods }, ords, custs] = await Promise.all([
        getCategories(),
        getProducts({ limit: 10000 }),
        getOrders(),
        getCustomers(),
      ]);
      setCategories(cats);
      setProducts(prods);
      setOrders(ords);
      setCustomers(custs);
    } catch (e) {
      console.error('Error loading admin data:', e);
    } finally {
      setLoadingData(false);
    }
  };

  // Auth + Admin Guard
  useEffect(() => {
    if (authLoading) return;
    if (!authUser) {
      router.push('/');
      return;
    }
    if (!isAdmin) return;
    loadAllData();
  }, [authUser, isAdmin, authLoading, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
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
  // PRODUCT OFFER (from ProductsTab % icon)
  // ==========================================
  const openOfferModal = (prod: Product) => {
    setOfferProduct(prod);
    setOfferModalOpen(true);
  };

  const handleSaveProductOffer = async (productId: string, offerPrice: number) => {
    await updateProduct(productId, { offer_price: offerPrice });
    loadAllData();
  };

  const handleRemoveProductOffer = async (productId: string) => {
    await updateProduct(productId, { offer_price: null });
    loadAllData();
  };

  // ==========================================
  // OFFERS TAB ACTIONS
  // ==========================================
  const openAddOffer = () => {
    setAddOfferEditProduct(null);
    setAddOfferModalOpen(true);
  };

  const openEditOffer = (product: Product) => {
    setAddOfferEditProduct(product);
    setAddOfferModalOpen(true);
  };

  const handleSaveOfferFromTab = async (productId: string, offerPrice: number) => {
    await updateProduct(productId, { offer_price: offerPrice });
    loadAllData();
  };

  const handleRemoveOfferFromTab = async (productId: string) => {
    await updateProduct(productId, { offer_price: null });
    loadAllData();
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
  // ORDER ACTIONS
  // ==========================================
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const result = await updateOrderStatus(orderId, status, isRtl);
    if (result.order) {
      loadAllData();
      // Open WhatsApp notification in new tab if URL generated
      if (result.whatsappUrl) {
        window.open(result.whatsappUrl, '_blank', 'noopener');
      }
    }
  };

  const handleConfirmPayment = async (orderId: string) => {
    await handleUpdateOrderStatus(orderId, 'paid');
  };

  const handleApproveOrder = async (orderId: string) => {
    await handleUpdateOrderStatus(orderId, 'approved');
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
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, stock: newStock } : p)));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!authUser) return null;

  // Non-admin access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center font-cairo">
        <div className="bg-white border border-slate-100 rounded-3xl p-8 md:p-12 shadow-md flex flex-col items-center text-center max-w-md">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-6">
            <ShieldAlert size={36} />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 mb-3">
            {isRtl ? 'غير مصرح بالدخول' : 'Access Denied'}
          </h1>
          <p className="text-slate-500 text-sm mb-6">
            {isRtl
              ? 'ليس لديك صلاحية للوصول إلى لوحة التحكم.'
              : 'You do not have permission to access the admin dashboard.'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold"
          >
            {isRtl ? 'العودة للرئيسية' : 'Back to Home'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-cairo">

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isRtl={isRtl}
        t={t}
        common={common}
        handleLogout={handleLogout}
        userEmail={authUser.email || ''}
      />

      <main className="flex-grow p-6 md:p-10 overflow-y-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl md:text-2xl font-extrabold text-slate-800">
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
            {activeTab === 'dashboard' && (
              <DashboardTab
                orders={orders}
                customers={customers}
                products={products}
                isRtl={isRtl}
                t={t}
                common={common}
                locale={locale}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'products' && (
              <ProductsTab
                products={products}
                isRtl={isRtl}
                t={t}
                common={common}
                openAddProduct={openAddProduct}
                openEditProduct={openEditProduct}
                openOfferModal={openOfferModal}
                handleDeleteProduct={handleDeleteProduct}
              />
            )}

            {activeTab === 'categories' && (
              <CategoriesTab
                categories={categories}
                isRtl={isRtl}
                common={common}
                openAddCategory={openAddCategory}
                openEditCategory={openEditCategory}
                handleDeleteCategory={handleDeleteCategory}
              />
            )}

            {activeTab === 'orders' && (
              <OrdersTab
                orders={orders}
                isRtl={isRtl}
                t={t}
                common={common}
                handleUpdateOrderStatus={handleUpdateOrderStatus}
                handleDeleteOrder={handleDeleteOrder}
                handleConfirmPayment={handleConfirmPayment}
                handleApproveOrder={handleApproveOrder}
              />
            )}

            {activeTab === 'customers' && (
              <CustomersTab
                customers={customers}
                isRtl={isRtl}
                locale={locale}
                common={common}
              />
            )}

            {activeTab === 'inventory' && (
              <InventoryTab
                products={products}
                isRtl={isRtl}
                t={t}
                common={common}
                handleUpdateStockInline={handleUpdateStockInline}
              />
            )}

            {activeTab === 'offers' && (
              <OffersTab
                products={products}
                isRtl={isRtl}
                t={t}
                common={common}
                openAddOffer={openAddOffer}
                openEditOffer={openEditOffer}
                handleRemoveOffer={handleRemoveOfferFromTab}
              />
            )}
          </>
        )}
      </main>

      <ProductFormModal
        isOpen={activeModal === 'product'}
        onClose={() => setActiveModal(null)}
        editId={editId}
        categories={categories}
        isRtl={isRtl}
        t={t}
        common={common}
        prodNameAr={prodNameAr}
        setProdNameAr={setProdNameAr}
        prodNameEn={prodNameEn}
        setProdNameEn={setProdNameEn}
        prodPrice={prodPrice}
        setProdPrice={setProdPrice}
        prodStock={prodStock}
        setProdStock={setProdStock}
        prodCategoryId={prodCategoryId}
        setProdCategoryId={setProdCategoryId}
        prodImage={prodImage}
        setProdImage={setProdImage}
        prodDescAr={prodDescAr}
        setProdDescAr={setProdDescAr}
        prodDescEn={prodDescEn}
        setProdDescEn={setProdDescEn}
        prodUsageAr={prodUsageAr}
        setProdUsageAr={setProdUsageAr}
        prodUsageEn={prodUsageEn}
        setProdUsageEn={setProdUsageEn}
        prodIsBest={prodIsBest}
        setProdIsBest={setProdIsBest}
        prodIsLatest={prodIsLatest}
        setProdIsLatest={setProdIsLatest}
        onSubmit={handleSaveProduct}
      />

      {activeModal === 'category' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl relative font-cairo">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
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

      <AddOfferModal
        isOpen={addOfferModalOpen}
        onClose={() => { setAddOfferModalOpen(false); setAddOfferEditProduct(null); }}
        products={products}
        editProduct={addOfferEditProduct}
        isRtl={isRtl}
        onSave={handleSaveOfferFromTab}
        onRemove={handleRemoveOfferFromTab}
      />

      <OfferModal
        isOpen={offerModalOpen}
        onClose={() => setOfferModalOpen(false)}
        product={offerProduct}
        isRtl={isRtl}
        onSave={handleSaveProductOffer}
        onRemove={handleRemoveProductOffer}
      />

    </div>
  );
}

'use client';

import { useEffect, useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { getCategories, getProducts } from '@/lib/api';
import { Product, Category } from '@/types';
import { useCart } from '@/context/CartContext';
import { Search, ShoppingBag, HelpCircle } from 'lucide-react';
import Image from 'next/image';

interface ProductsClientProps {
  locale: string;
}

export default function ProductsClient({ locale }: ProductsClientProps) {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const isRtl = locale === 'ar';
  const [, startTransition] = useTransition();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Active filters from URL search params
  const activeCategory = searchParams.get('category') || 'all';
  const activeSearch = searchParams.get('search') || '';
  const activeSort = searchParams.get('sort') || 'newest';

  // Search input state (local responsiveness, URL is source of truth for fetching)
  const [searchInput, setSearchInput] = useState(() => searchParams.get('search') || '');

  // Fetch categories on mount
  useEffect(() => {
    async function loadCategories() {
      const cats = await getCategories();
      setCategories(cats);
    }
    loadCategories();
  }, []);

  // Fetch products when parameters change
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      const data = await getProducts({
        categoryId: activeCategory,
        search: activeSearch,
        sort: activeSort,
      });
      setProducts(data);
      setLoading(false);
    }
    loadProducts();
  }, [activeCategory, activeSearch, activeSort]);

  const updateFilters = (newParams: { category?: string; search?: string; sort?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newParams.category !== undefined) {
      if (newParams.category === 'all') {
        params.delete('category');
      } else {
        params.set('category', newParams.category);
      }
    }

    if (newParams.search !== undefined) {
      if (newParams.search === '') {
        params.delete('search');
      } else {
        params.set('search', newParams.search);
      }
    }

    if (newParams.sort !== undefined) {
      if (newParams.sort === 'newest') {
        params.delete('sort');
      } else {
        params.set('sort', newParams.sort);
      }
    }

    startTransition(() => {
      router.push(`/products?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput });
  };

  const clearSearch = () => {
    setSearchInput('');
    updateFilters({ search: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Page Title */}
      <div className={`mb-8 ${isRtl ? 'text-right' : 'text-left'}`}>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-cairo">
          {t('products.title')}
        </h1>
        <p className="text-slate-500 text-sm mt-2 font-cairo">
          {isRtl ? 'تصفح تشكيلتنا الكاملة من الأدوية والعناية الطبية ومستحضرات التجميل' : 'Explore our complete catalog of medicines, wellness, and beauty products'}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* FILTERS SIDEBAR (Desktop) */}
        <aside className="w-full lg:w-1/4 flex-shrink-0 flex flex-col gap-6">
          {/* Search Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm mb-3 font-cairo">
              {isRtl ? 'البحث عن منتج' : 'Search Products'}
            </h3>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t('common.search')}
                className={`w-full py-2.5 pl-10 pr-4 text-slate-700 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 transition-colors font-cairo ${
                  isRtl ? 'text-right pl-4 pr-10' : 'text-left'
                }`}
              />
              <button
                type="submit"
                className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-600 ${
                  isRtl ? 'right-3' : 'left-3'
                }`}
              >
                <Search size={18} />
              </button>
              {searchInput && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 text-xs font-bold ${
                    isRtl ? 'left-3' : 'right-3'
                  }`}
                >
                  ✕
                </button>
              )}
            </form>
          </div>

          {/* Categories Filter */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm mb-4 font-cairo">
              {t('products.filter')}
            </h3>
            
            {/* Desktop list */}
            <div className="hidden lg:flex flex-col gap-2">
              <button
                onClick={() => updateFilters({ category: 'all' })}
                className={`w-full text-right px-4 py-2.5 rounded-xl text-sm font-semibold transition-all font-cairo ${
                  activeCategory === 'all'
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-100'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {t('products.all')}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => updateFilters({ category: cat.id })}
                  className={`w-full text-right px-4 py-2.5 rounded-xl text-sm font-semibold transition-all font-cairo ${
                    activeCategory === cat.id
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {isRtl ? cat.name_ar : cat.name_en}
                </button>
              ))}
            </div>

            {/* Mobile dropdown */}
            <div className="block lg:hidden">
              <select
                value={activeCategory}
                onChange={(e) => updateFilters({ category: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 font-cairo"
              >
                <option value="all">{t('products.all')}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {isRtl ? cat.name_ar : cat.name_en}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sorting */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 text-sm mb-3 font-cairo">
              {t('products.sort')}
            </h3>
            <select
              value={activeSort}
              onChange={(e) => updateFilters({ sort: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 font-cairo"
            >
              <option value="newest">{isRtl ? 'الأحدث أولاً' : 'Newest'}</option>
              <option value="price-asc">{t('products.sortByPriceAsc')}</option>
              <option value="price-desc">{t('products.sortByPriceDesc')}</option>
              <option value="name-asc">{t('products.sortByName')}</option>
            </select>
          </div>
        </aside>

        {/* PRODUCTS GRID */}
        <main className="w-full lg:w-3/4">
          {loading ? (
            <div className="min-h-[400px] flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-white border border-slate-100 rounded-3xl shadow-sm">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
                <HelpCircle size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 font-cairo mb-2">
                {t('common.noProducts')}
              </h3>
              <p className="text-slate-500 text-sm font-cairo mb-4">
                {isRtl ? 'حاول تغيير معايير البحث أو اختيار فئة أخرى.' : 'Try changing your search keywords or category filters.'}
              </p>
              <button
                onClick={() => {
                  setSearchInput('');
                  router.push('/products');
                }}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold font-cairo shadow-sm transition-all"
              >
                {isRtl ? 'إعادة ضبط التصفية' : 'Reset Filters'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((prod) => (
                <ProductGridCard
                  key={prod.id}
                  product={prod}
                  isRtl={isRtl}
                  t={t}
                  onAddToCart={addToCart}
                  router={router}
                />
              ))}
            </div>
          )}
        </main>

      </div>
    </div>
  );
}

// Internal Grid Card component
interface GridCardProps {
  product: Product;
  isRtl: boolean;
  t: (key: string) => string;
  onAddToCart: (p: Product) => void;
  router: { push: (url: string) => void };
}

function ProductGridCard({ product, isRtl, t, onAddToCart, router }: GridCardProps) {
  const [imgErr, setImgErr] = useState(false);

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between">
      {/* Image container */}
      <div
        className="w-full aspect-square relative bg-slate-50 cursor-pointer overflow-hidden"
        onClick={() => router.push(`/products/${product.id}`)}
      >
        <Image
          src={imgErr || !product.image_url ? 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60' : product.image_url}
          alt={isRtl ? product.name_ar : product.name_en}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          onError={() => setImgErr(true)}
        />

        {/* Badges */}
        <div className={`absolute top-3 ${isRtl ? 'right-3' : 'left-3'} flex flex-col gap-1.5`}>
          {product.is_best_seller && (
            <span className="px-2.5 py-0.5 bg-rose-500 text-white rounded-full text-[10px] font-extrabold uppercase font-cairo">
              {isRtl ? 'مميز' : 'Best'}
            </span>
          )}
          {product.is_latest && (
            <span className="px-2.5 py-0.5 bg-teal-600 text-white rounded-full text-[10px] font-extrabold uppercase font-cairo">
              {isRtl ? 'جديد' : 'New'}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          {/* Category */}
          <span className="text-[11px] text-teal-600 font-semibold uppercase tracking-wider block mb-1 font-cairo">
            {product.category ? (isRtl ? product.category.name_ar : product.category.name_en) : ''}
          </span>
          {/* Title */}
          <h3
            onClick={() => router.push(`/products/${product.id}`)}
            className="font-bold text-slate-800 text-sm md:text-base mb-2 font-cairo line-clamp-2 hover:text-teal-600 cursor-pointer transition-colors leading-snug"
          >
            {isRtl ? product.name_ar : product.name_en}
          </h3>
        </div>

        {/* Pricing & Cart Action */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-cairo">{t('common.price')}</span>
            <span className="text-base md:text-lg font-extrabold text-teal-600 font-sans">
              {product.price.toFixed(2)} <span className="text-xs md:text-sm font-bold font-cairo">{t('common.currency')}</span>
            </span>
          </div>

          <button
            onClick={() => onAddToCart(product)}
            className="p-2.5 bg-teal-50 hover:bg-teal-600 text-teal-600 hover:text-white rounded-xl transition-all shadow-sm"
            title={t('common.addToCart')}
          >
            <ShoppingBag size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

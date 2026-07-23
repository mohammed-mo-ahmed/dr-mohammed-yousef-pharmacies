'use client';

import { useEffect, useState, useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { getProducts } from '@/lib/api';
import { Product } from '@/types';
import ProductCard from '@/components/ProductCard';
import { Percent, Search, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function OffersPage() {
  const locale = useLocale();
  const router = useRouter();
  const isRtl = locale === 'ar';
  const { addToCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(p =>
      p.name_ar.toLowerCase().includes(q) ||
      p.name_en.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.toLowerCase().includes(q))
    );
  }, [products, searchQuery]);

  useEffect(() => {
    async function loadOfferProducts() {
      setLoading(true);
      const { products: prods } = await getProducts({ isOnSale: true, limit: 50 });
      setProducts(prods);
      setLoading(false);
    }
    loadOfferProducts();
  }, []);

  const t = (key: string) => {
    const translations: Record<string, string> = {
      exclusiveOffers: isRtl ? 'العروض الحصرية' : 'Exclusive Offers',
      saveMore: isRtl ? 'وفر أكثر مع أقوى خصوماتنا' : 'Save More with Our Top Discounts',
      noOffers: isRtl ? 'لا توجد عروض نشطة حالياً' : 'No Active Offers Available',
      stayTuned: isRtl ? 'تابعنا باستمرار للاستفادة من أحدث الخصومات والتخفيضات.' : 'Stay tuned for our upcoming seasonal offers.',
      browseProducts: isRtl ? 'تصفح كل المنتجات' : 'Browse All Products',
      limitedTime: isRtl ? 'عرض لفترة محدودة' : 'Limited Time Offer',
    };
    return translations[key] || key;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-cairo">

      {/* Page Title */}
      <div className={`mb-10 ${isRtl ? 'text-right' : 'text-left'}`}>
        <span className="text-teal-600 text-xs md:text-sm font-bold tracking-wider uppercase mb-2 block">
          {t('exclusiveOffers')}
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
          {t('saveMore')}
        </h1>
        <div className="w-16 h-1 bg-teal-600 mx-auto lg:mx-0 mt-4 rounded-full"></div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8 max-w-md" style={{ [isRtl ? 'marginRight' : 'marginLeft']: 0, marginInline: isRtl ? '0 auto 0 0' : '0 0 0 auto' }}>
        <Search size={18} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRtl ? 'right-4' : 'left-4'}`} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isRtl ? 'ابحث بالاسم أو الباركود...' : 'Search by name or barcode...'}
          className={`w-full py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all ${isRtl ? 'pr-12 pl-5 text-right' : 'pl-12 pr-5 text-left'}`}
        />
      </div>

      {loading ? (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-4">
            {searchQuery ? <Search size={32} /> : <Percent size={32} />}
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">
            {searchQuery
              ? (isRtl ? 'لا توجد نتائج للبحث' : 'No search results')
              : t('noOffers')}
          </h2>
          <p className="text-sm text-slate-500 mb-6 font-cairo">
            {searchQuery
              ? (isRtl ? 'حاول البحث بكلمات أخرى' : 'Try different search terms')
              : t('stayTuned')}
          </p>
          <button
            onClick={() => searchQuery ? setSearchQuery('') : router.push('/products')}
            className="px-6 py-2.5 bg-teal-600 text-white rounded-xl font-bold shadow-sm"
          >
            {searchQuery
              ? (isRtl ? 'مسح البحث' : 'Clear Search')
              : t('browseProducts')}
          </button>
        </div>
      ) : (
        /* Products Grid */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} isRtl={isRtl} t={(k: string) => {
              const map: Record<string, string> = {
                'common.addToCart': isRtl ? 'أضف للعربة' : 'Add to Cart',
                'common.price': isRtl ? 'السعر' : 'Price',
                'common.currency': isRtl ? 'ج.م' : 'EGP',
                'wishlist': isRtl ? 'المفضلة' : 'Wishlist',
              };
              return map[k] || k;
            }} onAddToCart={addToCart} />
          ))}
        </div>
      )}

    </div>
  );
}

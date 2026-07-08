'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import ScrollScene, { ScrollOverlay } from '@/components/ScrollScene';
import { getCategories, getProducts, getOffers } from '@/lib/api';
import { Product, Category, Offer } from '@/types';
import { Search, ChevronLeft, ChevronRight, ShoppingBag, AlertCircle, Shield, Truck, Clock, Award } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';

export default function HomePage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const { addToCart } = useCart();
  const isRtl = locale === 'ar';

  const [categories, setCategories] = useState<Category[]>([]);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [bestSellingProducts, setBestSellingProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dbEmpty, setDbEmpty] = useState(false);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [cats, latest, best, offList] = await Promise.all([
          getCategories(),
          getProducts({ isLatest: true }),
          getProducts({ isBestSeller: true }),
          getOffers(),
        ]);

        setCategories(cats);
        setLatestProducts(latest);
        setBestSellingProducts(best);
        setOffers(offList);

        if (cats.length === 0 && latest.length === 0) {
          setDbEmpty(true);
        }
      } catch (err) {
        console.error('Error loading homepage data:', err);
      }
    }

    loadHomeData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const heroOverlays: ScrollOverlay[] = [
    {
      startPercentage: 0,
      endPercentage: 35,
      titleAr: 'جودة طبية ورعاية نثق بها',
      titleEn: 'Trusted Healthcare Quality',
      descAr: 'جميع أدويتنا ومستحضرات التجميل تخضع لرقابة صارمة ومصادر طبية مرخصة.',
      descEn: 'All our products are sourced from certified suppliers, guaranteeing efficacy and safety.',
      ctaAr: 'تصفح المنتجات',
      ctaEn: 'Browse Products',
      ctaHref: '/products',
    },
    {
      startPercentage: 40,
      endPercentage: 68,
      titleAr: 'توصيل سريع حتى باب المنزل',
      titleEn: 'Fast & Secure Delivery',
      descAr: 'توصيل سريع ومهيأ طبياً لجميع احتياجاتك مع الحفاظ على درجات الحرارة المناسبة.',
      descEn: 'Temperature-controlled packaging delivered straight to your door.',
      ctaAr: 'اتصل بنا',
      ctaEn: 'Contact Us',
      ctaHref: '/contact',
    },
    {
      startPercentage: 72,
      endPercentage: 96,
      titleAr: 'استشارات صيدلانية على مدار الساعة',
      titleEn: '24/7 Professional Consultation',
      descAr: 'صيادلتنا متواجدون دائماً لتقديم التوجيه الطبي والنصح حول الجرعات وطرق الاستخدام.',
      descEn: 'Our experienced pharmacists are available 24/7 for medical guidance.',
      ctaAr: 'اعرف المزيد',
      ctaEn: 'Learn More',
      ctaHref: '/about',
    },
  ];

  return (
    <div className="w-full bg-white">
      {/* HERO */}
      <section className="w-full relative">
        <ScrollScene
          frameCount={183}
          framePathPattern={(i) => `/frames/${String(i).padStart(5, '0')}.jpg`}
          overlays={heroOverlays}
          locale={locale}
          navbarHeight={80}
        />
      </section>

      {/* Content that follows the hero naturally */}
      <div>

      {/* WAVE DIVIDER */}
      <div className="-mt-1">
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className="w-full h-16 md:h-24 lg:h-32 block"
          style={{ transform: 'scaleY(-1)' }}
        >
          <path
            d="M0,60 C360,120 540,0 720,60 C900,120 1080,0 1440,60 L1440,120 L0,120 Z"
            fill="#f8fafc"
          />
          <path
            d="M0,60 C360,120 540,0 720,60 C900,120 1080,0 1440,60 L1440,120 L0,120 Z"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="1"
            opacity="0.5"
          />
        </svg>
      </div>

      {/* TRANSITION SECTION */}
      <section className="bg-slate-50 py-12 md:py-16 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-50 border border-teal-100 rounded-full text-teal-700 text-xs font-bold uppercase tracking-wider mb-5 font-cairo">
            <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse"></span>
            {isRtl ? 'مرحباً بكم في صيدلياتنا' : 'Welcome to Our Pharmacies'}
          </div>
          <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 leading-tight font-cairo mb-4">
            {isRtl
              ? 'رعايتكم الصحية هي أولويتنا الأولى'
              : 'Your Health & Wellness is Our Priority'}
          </h2>
          <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-cairo">
            {isRtl
              ? 'نحن نقدم مجموعة متكاملة من الخدمات الصيدلانية والمنتجات الطبية والتجميلية بأعلى معايير الجودة والعناية.'
              : 'We offer a complete range of pharmaceutical services, medical products, and cosmetics with the highest standards of quality and care.'}
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { icon: Shield, titleAr: 'منتجات أصلية ١٠٠٪', titleEn: '100% Authentic', descAr: 'جميع المنتجات مضمونة ومصادرها موثوقة', descEn: 'All products sourced directly from certified manufacturers' },
            { icon: Truck, titleAr: 'توصيل سريع وآمن', titleEn: 'Fast Delivery', descAr: 'توصيل خلال ٢٤ ساعة داخل المدينة', descEn: 'Delivery within 24 hours inside the city' },
            { icon: Clock, titleAr: 'خدمة ٢٤ ساعة', titleEn: 'Open 24/7', descAr: 'نعمل على مدار الساعة لخدمتكم', descEn: 'We are open 24 hours a day to serve you' },
            { icon: Award, titleAr: 'صيادلة محترفون', titleEn: 'Expert Pharmacists', descAr: 'فريق صيدلاني مؤهل لتقديم الاستشارات', descEn: 'Qualified pharmacy team for expert consultations' },
          ].map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div key={i} className="bg-slate-50 rounded-2xl p-5 md:p-6 text-center border border-slate-100 hover:border-teal-100 hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon size={28} className="text-teal-600" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm md:text-base mb-1 font-cairo">
                  {isRtl ? feat.titleAr : feat.titleEn}
                </h3>
                <p className="text-slate-500 text-xs md:text-sm leading-relaxed font-cairo">
                  {isRtl ? feat.descAr : feat.descEn}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* OFFERS BANNER */}
      {offers.length > 0 && (
        <section className="bg-gradient-to-r from-teal-500 to-emerald-600 py-5 px-4 shadow-inner text-white">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-white text-teal-600 rounded-full text-xs font-extrabold uppercase animate-pulse">
                {t('offersBanner.badge')}
              </span>
              <p className="text-sm md:text-base font-bold font-cairo">
                {isRtl ? offers[0].title_ar : offers[0].title_en}
              </p>
            </div>
            <button
              onClick={() => router.push('/offers')}
              className="px-6 py-2 bg-white text-teal-600 hover:bg-teal-50 rounded-xl text-sm font-extrabold font-cairo transition-all shadow-md"
            >
              {t('offersBanner.cta')}
            </button>
          </div>
        </section>
      )}

      {/* SEARCH BAR */}
      <section className="bg-slate-50 py-14">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-cairo">
              {isRtl ? 'ابحث عن منتجك' : 'Find Your Product'}
            </h2>
            <p className="text-slate-500 text-sm mt-1.5 font-cairo">
              {isRtl ? 'تصفح آلاف المنتجات الطبية والتجميلية' : 'Browse thousands of medical and cosmetic products'}
            </p>
          </div>
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('common.searchPlaceholder')}
              className={`w-full py-4 md:py-5 pl-5 pr-14 text-slate-700 bg-white rounded-2xl text-base md:text-lg border-2 border-slate-200 focus:border-teal-500 focus:outline-none transition-all shadow-sm focus:shadow-lg font-cairo ${
                isRtl ? 'text-right pr-5 pl-14' : 'text-left'
              }`}
            />
            <button
              type="submit"
              className={`absolute top-1/2 -translate-y-1/2 p-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all shadow-md ${
                isRtl ? 'left-2' : 'right-2'
              }`}
            >
              <Search size={20} />
            </button>
          </form>
        </div>
      </section>

      {/* DB EMPTY PROMPT */}
      {dbEmpty && (
        <section className="max-w-4xl mx-auto px-4 pb-8 -mt-6">
          <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-4 shadow-sm">
            <AlertCircle size={28} className="text-amber-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-base font-bold text-amber-800 font-cairo mb-1">
                {isRtl ? 'قاعدة البيانات فارغة حالياً' : 'Database is empty'}
              </h3>
              <p className="text-sm text-amber-700 font-cairo mb-3">
                {isRtl
                  ? 'لم يتم العثور على منتجات أو فئات في قاعدة البيانات. يرجى الدخول إلى لوحة تحكم المدير والنقر على "تهيئة قاعدة البيانات" لملئها بمنتجات تجريبية.'
                  : 'No categories or products were found. Please go to the Admin Dashboard and click "Seed Database" to fill it with realistic starter products.'}
              </p>
              <Link
                href="/login"
                className="inline-block px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold font-cairo transition-all"
              >
                {isRtl ? 'تسجيل الدخول' : 'Login'}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CATEGORIES */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-cairo tracking-tight">
              {t('categories.title')}
            </h2>
            <p className="text-slate-500 text-sm mt-2 font-cairo">
              {isRtl ? 'تصفح المنتجات حسب الفئة' : 'Browse products by category'}
            </p>
            <div className="w-16 h-1 bg-teal-600 mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => router.push(`/products?category=${cat.id}`)}
                className="group cursor-pointer bg-white hover:bg-teal-50 rounded-2xl p-6 text-center border border-slate-100 hover:border-teal-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-teal-100 transition-all duration-300 text-teal-600">
                  <ShoppingBag size={28} />
                </div>
                <h3 className="font-bold text-slate-800 text-sm md:text-base font-cairo line-clamp-2">
                  {isRtl ? cat.name_ar : cat.name_en}
                </h3>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* BEST-SELLING PRODUCTS */}
      {bestSellingProducts.length > 0 && (
        <section className="bg-slate-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-cairo">
                  {isRtl ? 'الأكثر مبيعاً' : 'Best Selling'}
                </h2>
                <p className="text-slate-500 text-xs md:text-sm mt-1 font-cairo">
                  {isRtl ? 'المنتجات الأكثر طلباً ورواجاً بين عملائنا' : 'Top requested products by our customers'}
                </p>
              </div>
              <button
                onClick={() => router.push('/products')}
                className="text-teal-600 hover:text-teal-700 font-bold text-sm flex items-center gap-1 font-cairo"
              >
                <span>{isRtl ? 'عرض الكل' : 'View All'}</span>
                {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {bestSellingProducts.slice(0, 4).map((prod) => (
                <ProductCard key={prod.id} product={prod} isRtl={isRtl} t={t} onAddToCart={addToCart} router={router} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* LATEST PRODUCTS */}
      {latestProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-cairo">
                {isRtl ? 'وصل حديثاً' : 'Latest Additions'}
              </h2>
              <p className="text-slate-500 text-xs md:text-sm mt-1 font-cairo">
                {isRtl ? 'أحدث المنتجات الطبية ومستحضرات العناية المضافة حديثاً' : 'Our newest medical and cosmetics products'}
              </p>
            </div>
            <button
              onClick={() => router.push('/products')}
              className="text-teal-600 hover:text-teal-700 font-bold text-sm flex items-center gap-1 font-cairo"
            >
              <span>{isRtl ? 'عرض الكل' : 'View All'}</span>
              {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {latestProducts.slice(0, 4).map((prod) => (
              <ProductCard key={prod.id} product={prod} isRtl={isRtl} t={t} onAddToCart={addToCart} router={router} />
            ))}
          </div>
        </section>
      )}

      </div>
    </div>
  );
}

// Product Card Component
interface ProductCardProps {
  product: Product;
  isRtl: boolean;
  t: (key: string) => string;
  onAddToCart: (p: Product) => void;
  router: { push: (url: string) => void };
}

function ProductCard({ product, isRtl, t, onAddToCart, router }: ProductCardProps) {
  const [imgErr, setImgErr] = useState(false);

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 hover:shadow-xl hover:border-slate-200 transition-all duration-300 overflow-hidden flex flex-col justify-between">
      
      {/* Product Image */}
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
            <span className="px-2.5 py-0.5 bg-rose-500 text-white rounded-full text-[10px] font-extrabold uppercase shadow-sm">
              {isRtl ? 'مميز' : 'Best'}
            </span>
          )}
          {product.is_latest && (
            <span className="px-2.5 py-0.5 bg-teal-600 text-white rounded-full text-[10px] font-extrabold uppercase shadow-sm">
              {isRtl ? 'جديد' : 'New'}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <span className="text-[11px] text-teal-600 font-semibold uppercase tracking-wider block mb-1 font-cairo">
            {product.category ? (isRtl ? product.category.name_ar : product.category.name_en) : ''}
          </span>
          <h3
            onClick={() => router.push(`/products/${product.id}`)}
            className="font-bold text-slate-800 text-sm md:text-base mb-2 font-cairo line-clamp-2 hover:text-teal-600 cursor-pointer transition-colors leading-snug"
          >
            {isRtl ? product.name_ar : product.name_en}
          </h3>
        </div>

        <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-50">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-cairo">{t('common.price')}</span>
            <span className="text-base md:text-lg font-extrabold text-teal-600 font-sans">
              {(product.price ?? 0).toFixed(2)} <span className="text-xs md:text-sm font-bold font-cairo">{t('common.currency')}</span>
            </span>
          </div>

          <button
            onClick={() => onAddToCart(product)}
            className="p-2.5 bg-teal-50 hover:bg-teal-600 text-teal-600 hover:text-white rounded-xl transition-all shadow-sm group-hover:shadow-md"
            title={t('common.addToCart')}
          >
            <ShoppingBag size={18} />
          </button>
        </div>
      </div>

    </div>
  );
}

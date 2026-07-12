'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import ScrollScene, { ScrollOverlay } from '@/components/ScrollScene';
import OfferCard from '@/components/OfferCard';
import InfiniteCarousel from '@/components/InfiniteCarousel';
import CustomerReviews from '@/components/CustomerReviews';
import { getCategories, getProducts } from '@/lib/api';
import { Product, Category } from '@/types';
import { ChevronLeft, ChevronRight, ShoppingBag, Shield, Truck, Clock, Award } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function HomePage() {
  const t = useTranslations();
  const locale = useLocale();
  const { addToCart } = useCart();
  const isRtl = locale === 'ar';

  const [categories, setCategories] = useState<Category[]>([]);
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);

  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [cats, { products: sales }] = await Promise.all([
          getCategories(),
          getProducts({ isOnSale: true, limit: 12 }),
        ]);

        setCategories(cats);
        setSaleProducts(sales);
      } catch (err) {
        console.error('Error loading homepage data:', err);
      }
    }

    loadHomeData();
  }, []);

  const heroOverlays: ScrollOverlay[] = [
    {
      startPercentage: 0,
      endPercentage: 35,
      subtitleAr: 'اكتشف',
      subtitleEn: 'Discover',
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
      subtitleAr: 'توصيل',
      subtitleEn: 'Delivery',
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
      persistAfterEnd: true,
      subtitleAr: 'دعم',
      subtitleEn: 'Support',
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
      {/* 1. HERO + 2. FEATURES */}
      <ScrollScene
        overlays={heroOverlays}
        locale={locale}
        navbarHeight={80}
      >
      <section className="bg-gradient-to-b from-teal-50 to-slate-100 py-8 md:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
        </div>
      </section>
      </ScrollScene>

      {/* 3. OFFERS — Horizontal infinite scroll */}
      {saleProducts.length > 0 && (
        <section className="bg-slate-50 py-16 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-cairo">
                {isRtl ? 'عروض خاصة' : 'Special Offers'}
              </h2>
              <p className="text-slate-500 text-sm mt-2 font-cairo">
                {isRtl ? 'خصومات حقيقية على منتجات مختارة' : 'Real discounts on selected products'}
              </p>
              <div className="w-16 h-1 bg-teal-600 mx-auto mt-4 rounded-full" />
            </div>
          </div>

          <InfiniteCarousel isRtl={isRtl} speed={18}>
            {saleProducts.map((prod) => {
              const discount = prod.offer_price && prod.offer_price < prod.price
                ? Math.round(((prod.price - prod.offer_price) / prod.price) * 100)
                : 0;
              return (
                <OfferCard key={prod.id} product={prod} discount={discount} isRtl={isRtl} t={t} onAddToCart={addToCart} />
              );
            })}
          </InfiniteCarousel>

          <div className="text-center mt-10">
            <Link
              href="/offers"
              className="inline-flex items-center gap-2 px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg font-cairo"
            >
              <span>{isRtl ? 'عرض الكل' : 'View More'}</span>
              {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </Link>
          </div>
        </section>
      )}

      {/* 4. CATEGORIES */}
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

          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-5">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.id}`}
                className="block group bg-white hover:bg-teal-50 rounded-2xl p-4 md:p-6 text-center border border-slate-100 hover:border-teal-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 md:w-16 md:h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:scale-110 group-hover:bg-teal-100 transition-all duration-300 text-teal-600">
                  <ShoppingBag size={24} className="md:hidden" />
                  <ShoppingBag size={28} className="hidden md:block" />
                </div>
                <h3 className="font-bold text-slate-800 text-xs md:text-base font-cairo line-clamp-2">
                  {isRtl ? cat.name_ar : cat.name_en}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 5. CUSTOMER REVIEWS */}
      <CustomerReviews />

    </div>
  );
}

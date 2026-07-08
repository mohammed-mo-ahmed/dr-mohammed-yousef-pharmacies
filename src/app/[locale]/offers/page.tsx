'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { getOffers } from '@/lib/api';
import { Offer } from '@/types';
import { Calendar, Percent, ArrowLeft, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function OffersPage() {
  const t = useTranslations('offersBanner');
  const locale = useLocale();
  const router = useRouter();
  const isRtl = locale === 'ar';

  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOffers() {
      setLoading(true);
      const data = await getOffers();
      setOffers(data);
      setLoading(false);
    }
    loadOffers();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-cairo">
      
      {/* Page Title */}
      <div className={`mb-10 ${isRtl ? 'text-right' : 'text-left'}`}>
        <span className="text-teal-600 text-xs md:text-sm font-bold tracking-wider uppercase mb-2 block">
          {isRtl ? 'العروض الحصرية' : 'Exclusive Offers'}
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
          {isRtl ? 'وفر أكثر مع أقوى خصوماتنا' : 'Save More with Our Top Discounts'}
        </h1>
        <div className="w-16 h-1 bg-teal-600 mx-auto lg:mx-0 mt-4 rounded-full"></div>
      </div>

      {loading ? (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
        </div>
      ) : offers.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-4">
            <Percent size={32} />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">
            {isRtl ? 'لا توجد عروض نشطة حالياً' : 'No Active Offers Available'}
          </h2>
          <p className="text-sm text-slate-500 mb-6 font-cairo">
            {isRtl ? 'تابعنا باستمرار للاستفادة من أحدث الخصومات والتخفيضات.' : 'Stay tuned for our upcoming seasonal offers.'}
          </p>
          <button
            onClick={() => router.push('/products')}
            className="px-6 py-2.5 bg-teal-600 text-white rounded-xl font-bold shadow-sm"
          >
            {isRtl ? 'تصفح كل المنتجات' : 'Browse All Products'}
          </button>
        </div>
      ) : (
        /* Offers Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-350 flex flex-col justify-between"
            >
              {/* Offer Banner Image */}
              <div className="w-full h-56 relative bg-slate-100">
                <Image
                  src={offer.image_url || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=60'}
                  alt={isRtl ? offer.title_ar : offer.title_en}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
                
                {/* Discount Badge */}
                <div className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} bg-rose-500 text-white font-extrabold text-sm md:text-base px-4 py-2 rounded-2xl shadow-md flex items-center gap-1.5`}>
                  <Percent size={18} />
                  <span>{offer.discount_percentage}% {isRtl ? 'خصم' : 'OFF'}</span>
                </div>
              </div>

              {/* Content Panel */}
              <div className={`p-6 flex flex-col justify-between flex-grow ${isRtl ? 'text-right' : 'text-left'}`}>
                <div>
                  <div className="flex items-center gap-2 mb-3 text-slate-400 text-xs">
                    <Calendar size={14} className="text-teal-600" />
                    <span>{isRtl ? 'عرض لفترة محدودة' : 'Limited Time Offer'}</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-800 mb-4 leading-snug">
                    {isRtl ? offer.title_ar : offer.title_en}
                  </h3>
                </div>

                <button
                  onClick={() => router.push('/products')}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold transition-all shadow-sm shadow-teal-50"
                >
                  <span>{t('cta')}</span>
                  {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}

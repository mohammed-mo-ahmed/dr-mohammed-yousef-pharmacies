'use client';

import { useLocale } from 'next-intl';
import InfiniteCarousel from './InfiniteCarousel';
import { Star } from 'lucide-react';

interface Review {
  nameAr: string;
  nameEn: string;
  textAr: string;
  textEn: string;
  rating: number;
}

const reviews: Review[] = [
  {
    nameAr: 'سارة أحمد',
    nameEn: 'Sarah Ahmed',
    textAr: 'خدمة ممتازة وتوصيل سريع جداً! المنتجات أصلية والأسعار مناسبة. أنصح بالتعامل معهم بشدة.',
    textEn: 'Excellent service and very fast delivery! Products are authentic and prices are fair. Highly recommended.',
    rating: 5,
  },
  {
    nameAr: 'محمد علي',
    nameEn: 'Mohamed Ali',
    textAr: 'صيدلية موثوقة وفريق عمل محترف. ساعدوني في اختيار الدواء المناسب واستشارة ممتازة.',
    textEn: 'A trustworthy pharmacy with a professional team. They helped me choose the right medicine with excellent consultation.',
    rating: 5,
  },
  {
    nameAr: 'فاطمة حسن',
    nameEn: 'Fatima Hassan',
    textAr: 'تجربة رائعة من الطلب إلى التوصيل. التغليف ممتاز والمنتجات وصلت بحالة ممتازة.',
    textEn: 'Amazing experience from ordering to delivery. Packaging is great and products arrived in perfect condition.',
    rating: 5,
  },
  {
    nameAr: 'خالد إبراهيم',
    nameEn: 'Khaled Ibrahim',
    textAr: 'أفضل صيدلية أونلاين تعاملت معها. سرعة في التنفيذ وجودة عالية في الخدمة.',
    textEn: 'The best online pharmacy I have dealt with. Fast execution and high quality service.',
    rating: 4,
  },
  {
    nameAr: 'نورا سعيد',
    nameEn: 'Noura Said',
    textAr: 'منتجات تجميلية أصلية بأسعار معقولة. التوصيل كان سريع والتغليف كان احترافي.',
    textEn: 'Authentic cosmetic products at reasonable prices. Delivery was fast and packaging was professional.',
    rating: 5,
  },
  {
    nameAr: 'عمر عبد الله',
    nameEn: 'Omar Abdullah',
    textAr: 'فريق صيدلاني محترف ومتعاون جداً. أجابوا على جميع أسئلتي بأمانة ودقة.',
    textEn: 'Professional and very cooperative pharmacy team. They answered all my questions honestly and accurately.',
    rating: 5,
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={14}
          className={i < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review, isRtl }: { review: Review; isRtl: boolean }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full">
      <StarRating rating={review.rating} />
      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mt-3 flex-1 font-cairo">
        &ldquo;{isRtl ? review.textAr : review.textEn}&rdquo;
      </p>
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 font-bold text-xs font-cairo">
          {(isRtl ? review.nameAr : review.nameEn).charAt(0)}
        </div>
        <span className="text-slate-800 text-xs sm:text-sm font-semibold font-cairo">
          {isRtl ? review.nameAr : review.nameEn}
        </span>
      </div>
    </div>
  );
}

export default function CustomerReviews() {
  const locale = useLocale();
  const isRtl = locale === 'ar';

  return (
    <section className="bg-slate-50 py-16 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-cairo">
            {isRtl ? 'آراء العملاء' : 'Reviews'}
          </h2>
          <p className="text-slate-500 text-sm mt-2 font-cairo">
            {isRtl ? 'ماذا يقول عملاؤنا عنا' : 'What our customers say about us'}
          </p>
          <div className="w-16 h-1 bg-teal-600 mx-auto mt-4 rounded-full" />
        </div>
      </div>

      <InfiniteCarousel isRtl={isRtl} speed={14}>
        {reviews.map((review, i) => (
          <ReviewCard key={i} review={review} isRtl={isRtl} />
        ))}
      </InfiniteCarousel>
    </section>
  );
}

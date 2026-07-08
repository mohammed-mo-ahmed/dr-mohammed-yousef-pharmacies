'use client';

import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { HeartPulse, Award, ShieldAlert } from 'lucide-react';

export default function AboutPage() {
  const t = useTranslations('about');
  const locale = useLocale();
  const isRtl = locale === 'ar';

  const values = [
    {
      icon: <HeartPulse className="text-teal-600" size={28} />,
      titleAr: 'صحة المريض أولاً',
      titleEn: 'Patient Health First',
      descAr: 'نضع مصلحة المريض وصحته في قمة أولوياتنا ونحرص على تقديم الدواء الآمن والنصيحة الطبية الأمينة.',
      descEn: 'We place the wellness and safety of our patients above all else, ensuring authentic medicines and advice.',
    },
    {
      icon: <Award className="text-teal-600" size={28} />,
      titleAr: 'الجودة والتميز',
      titleEn: 'Quality & Excellence',
      descAr: 'نلتزم بأعلى معايير جودة الخدمات والمنتجات، من حيث التخزين والمناولة وسرعة الاستجابة لطلبات العملاء.',
      descEn: 'We commit to the highest international standards of storage, packaging, and express pharmacy services.',
    },
    {
      icon: <ShieldAlert className="text-teal-600" size={28} />,
      titleAr: 'الأمان والموثوقية',
      titleEn: 'Trust & Reliability',
      descAr: 'جميع أدويتنا ومستحضراتنا مسجلة وموثوقة بنسبة 100%، ويتم شحنها بأساليب تحافظ على سلامتها الطبية الكاملة.',
      descEn: 'All products are 100% certified and monitored, preserving their full pharmaceutical integrity during delivery.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-cairo">
      
      {/* 1. Header Hero section */}
      <div className="text-center mb-16">
        <span className="text-teal-600 text-xs md:text-sm font-bold tracking-wider uppercase mb-2 block">
          {isRtl ? 'من نحن' : 'About Us'}
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
          {isRtl ? 'صيدليات د. محمد يوسف' : 'Dr. Mohammed Yousef Pharmacies'}
        </h1>
        <div className="w-16 h-1 bg-teal-600 mx-auto mt-4 rounded-full"></div>
      </div>

      {/* 2. Intro Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
        <div className="relative aspect-video lg:aspect-square bg-slate-100 rounded-3xl overflow-hidden border border-slate-100 shadow-md">
          <Image
            src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=60"
            alt="Pharmacy clinic"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        <div className={`flex flex-col gap-6 ${isRtl ? 'text-right' : 'text-left'}`}>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
            {isRtl ? 'رعاية صحية متكاملة وموثوقة' : 'Complete and Trusted Medical Services'}
          </h2>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            {t('text')}
          </p>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed">
            {isRtl
              ? 'نهدف في صيدليات د. محمد يوسف إلى توفير تجربة تسوق إلكترونية متطورة للمرضى والعملاء، بحيث يسهل الحصول على الأدوية الطبية والمستحضرات التجميلية مع ضمان أعلى مستويات الأمان والجودة الدوائية.'
              : 'At Dr. Mohammed Yousef Pharmacies, we aim to deliver an advanced, digitized pharmaceutical shopping experience, ensuring patients can secure prescription medications and skin cosmetics with unmatched quality checks.'}
          </p>
        </div>
      </div>

      {/* 3. Core Values Grid */}
      <section className="bg-slate-50 rounded-3xl p-8 md:p-12 mb-16 shadow-inner">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
            {isRtl ? 'قيمنا الأساسية' : 'Our Core Values'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((v, i) => (
            <div
              key={i}
              className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm text-center flex flex-col items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center">
                {v.icon}
              </div>
              <h3 className="font-bold text-slate-800 text-base">
                {isRtl ? v.titleAr : v.titleEn}
              </h3>
              <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
                {isRtl ? v.descAr : v.descEn}
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

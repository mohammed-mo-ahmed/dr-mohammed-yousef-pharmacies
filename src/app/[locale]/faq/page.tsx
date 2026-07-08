'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface FaqItem {
  qAr: string;
  qEn: string;
  aAr: string;
  aEn: string;
}

export default function FaqPage() {
  const t = useTranslations('common');
  const locale = useLocale();
  const isRtl = locale === 'ar';

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqs: FaqItem[] = [
    {
      qAr: 'كيف يمكنني إرسال وصفة طبية (روشتة) لتوصيلها؟',
      qEn: 'How can I send a prescription for delivery?',
      aAr: 'يمكنك التواصل معنا مباشرة عبر واتساب بالضغط على أيقونة واتساب في صفحة "اتصل بنا" وإرسال صورة واضحة للوصفة الطبية، وسيقوم الصيدلي بإعداد الأدوية وتوصيلها لك.',
      aEn: 'You can contact us directly via WhatsApp by clicking the WhatsApp icon on the "Contact Us" page and sending a clear photo of your prescription. The pharmacist will prepare and deliver it.',
    },
    {
      qAr: 'ما هي مواعيد عمل الصيدلية والتوصيل؟',
      qEn: 'What are the pharmacy and delivery working hours?',
      aAr: 'نحن نعمل على مدار الساعة (24 ساعة يومياً، 7 أيام في الأسبوع) لتوفير الخدمات الطبية وتوصيل الأدوية للمنازل في أي وقت.',
      aEn: 'We operate 24 hours daily, 7 days a week, providing medical services and home delivery at any time.',
    },
    {
      qAr: 'هل تقبل الصيدلية بطاقات التأمين الصحي؟',
      qEn: 'Do you accept health insurance cards?',
      aAr: 'نعم، نحن نقبل مجموعة واسعة من بطاقات التأمين الصحي الكبرى في مصر. يرجى إرسال صورة بطاقة التأمين والروشتة عبر واتساب للتحقق من نسبة الخصم والتغطية.',
      aEn: 'Yes, we accept a wide range of major health insurance cards in Egypt. Please send a copy of your insurance card and prescription via WhatsApp to verify coverage and co-pay.',
    },
    {
      qAr: 'ما هي المدة المستغرقة لتوصيل الطلبات؟',
      qEn: 'How long does it take for delivery?',
      aAr: 'يستغرق التوصيل عادةً بين 30 دقيقة إلى ساعتين كحد أقصى حسب منطقة السكن ومسافتها من فرع الصيدلية.',
      aEn: 'Delivery typically takes between 30 minutes to 2 hours maximum, depending on your location and distance from the branch.',
    },
    {
      qAr: 'كيف يمكنني التأكد من سلامة وتخزين الأدوية الحساسة أثناء الشحن؟',
      qEn: 'How do you ensure safe storage for sensitive medicine during delivery?',
      aAr: 'يتم نقل الأدوية الحساسة للحرارة (مثل الأنسولين أو قطرات العين المعينة) في حقائب مبردة ومخصصة طبياً للحفاظ على سلامة المادة الفعالة بنسبة 100%.',
      aEn: 'Heat-sensitive medications (like insulin or specific eye drops) are transported in specialized insulated cooling bags to maintain full efficacy.',
    },
  ];

  const toggleFaq = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-cairo">
      
      {/* Page Title */}
      <div className="text-center mb-12">
        <span className="text-teal-600 text-xs md:text-sm font-bold tracking-wider uppercase mb-2 block">
          {t('faq')}
        </span>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
          {isRtl ? 'الأسئلة الشائعة والإجابات' : 'Frequently Asked Questions'}
        </h1>
        <div className="w-16 h-1 bg-teal-600 mx-auto mt-4 rounded-full"></div>
      </div>

      {/* Accordion List */}
      <div className="flex flex-col gap-4">
        {faqs.map((faq, index) => {
          const isOpen = activeIndex === index;
          return (
            <div
              key={index}
              className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm transition-all hover:shadow-md"
            >
              {/* Question Trigger */}
              <button
                onClick={() => toggleFaq(index)}
                className={`w-full p-5 md:p-6 flex items-center justify-between gap-4 font-bold text-slate-800 text-sm md:text-base cursor-pointer focus:outline-none transition-colors ${
                  isOpen ? 'text-teal-600 bg-teal-50/10' : 'hover:bg-slate-50/50'
                } ${isRtl ? 'text-right' : 'text-left'}`}
              >
                <div className="flex items-center gap-3">
                  <HelpCircle size={18} className="text-teal-600 flex-shrink-0" />
                  <span>{isRtl ? faq.qAr : faq.qEn}</span>
                </div>
                {isOpen ? (
                  <ChevronUp size={18} className="text-teal-600" />
                ) : (
                  <ChevronDown size={18} className="text-slate-400" />
                )}
              </button>

              {/* Answer Box */}
              {isOpen && (
                <div className={`p-5 md:p-6 border-t border-slate-50 bg-slate-50/30 text-xs md:text-sm text-slate-600 leading-relaxed font-cairo ${
                  isRtl ? 'text-right' : 'text-left'
                }`}>
                  {isRtl ? faq.aAr : faq.aEn}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}

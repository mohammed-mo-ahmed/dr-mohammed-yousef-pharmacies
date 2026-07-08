'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Phone, Mail, Clock, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const t = useTranslations('common');
  const locale = useLocale();
  const isRtl = locale === 'ar';

  const quickLinks = [
    { href: '/', label: t('home') },
    { href: '/products', label: t('products') },
    { href: '/offers', label: t('offers') },
    { href: '/about', label: t('about') },
    { href: '/contact', label: t('contact') },
    { href: '/faq', label: t('faq') },
  ];

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Logo & Brief */}
          <div className={`flex flex-col ${isRtl ? 'items-start text-right' : 'items-start text-left'}`}>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                Y
              </span>
              <span className="font-extrabold text-white text-lg font-cairo">
                {t('title')}
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed font-cairo mb-4">
              {locale === 'ar'
                ? 'مجموعتنا الطبية تلتزم بتقديم رعاية صحية ذات مواصفات عالمية، مع توصيل سريع للأدوية ومستحضرات التجميل.'
                : 'Our pharmacy group is committed to providing world-class health services, ensuring fast delivery for medicines and cosmetics.'}
            </p>
          </div>

          {/* Quick Links */}
          <div className={`flex flex-col ${isRtl ? 'items-start' : 'items-start'}`}>
            <h3 className="text-white font-bold text-base mb-4 font-cairo">
              {locale === 'ar' ? 'روابط سريعة' : 'Quick Links'}
            </h3>
            <ul className="space-y-2 text-sm">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-teal-400 transition-colors py-1 block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="flex flex-col items-start">
            <h3 className="text-white font-bold text-base mb-4 font-cairo">
              {locale === 'ar' ? 'معلومات الاتصال' : 'Contact Information'}
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-teal-500" />
                <span dir="ltr">+20 123 456 7890</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-teal-500" />
                <span>info@dr-yousef-pharmacy.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock size={16} className="text-teal-500" />
                <span className="font-cairo">{isRtl ? 'يومياً على مدار 24 ساعة' : '24 Hours Daily'}</span>
              </li>
            </ul>
          </div>

          {/* About us CTA / Trust */}
          <div className="flex flex-col items-start">
            <h3 className="text-white font-bold text-base mb-4 font-cairo">
              {locale === 'ar' ? 'الضمان والجودة' : 'Trust & Quality'}
            </h3>
            <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700 w-full flex items-start gap-3">
              <ShieldCheck className="text-teal-500 flex-shrink-0 mt-1" size={24} />
              <div>
                <h4 className="text-sm font-semibold text-white mb-1 font-cairo">
                  {locale === 'ar' ? 'أدوية مرخصة وموثوقة' : '100% Certified Medicines'}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed font-cairo">
                  {locale === 'ar'
                    ? 'جميع الأدوية مصرحة من وزارة الصحة المصرية ومخزنة تحت درجات حرارة مثالية.'
                    : 'All medications are approved by the Ministry of Health and stored under optimal conditions.'}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-cairo">
            &copy; {new Date().getFullYear()} {t('title')}. {locale === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
          </p>
        </div>
      </div>
    </footer>
  );
}

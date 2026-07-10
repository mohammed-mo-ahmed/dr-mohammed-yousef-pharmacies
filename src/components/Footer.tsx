'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { Phone, Mail, Clock } from 'lucide-react';

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-12">
          
          {/* Logo & Brief */}
          <div className={`flex flex-col ${isRtl ? 'items-start text-right' : 'items-start text-left'}`}>
            <div className="mb-4">
              <Image
                src={isRtl ? '/images/logos/ar.png' : '/images/logos/en.png'}
                alt="Dr. Mohammed Yousef Pharmacies"
                width={180}
                height={48}
                className="h-10 md:h-12 w-auto brightness-0 invert"
              />
            </div>
            <p className="text-sm text-slate-400 leading-relaxed font-cairo mb-4">
              {locale === 'ar'
                ? 'مجموعتنا الطبية تلتزم بتقديم رعاية صحية ذات مواصفات عالمية، مع توصيل سريع للأدوية ومستحضرات التجميل.'
                : 'Our pharmacy group is committed to providing world-class health services, ensuring fast delivery for medicines and cosmetics.'}
            </p>
          </div>

          {/* Quick Links */}
          <div className={`flex flex-col ${'items-start'}`}>
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

        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-cairo">
            &copy; {new Date().getFullYear()} {t('title')}. {locale === 'ar' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
          </p>
          <a
            href="https://qabnix.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold bg-gradient-to-r from-blue-600/10 to-purple-600/10 text-blue-400 border border-blue-500/20 hover:border-blue-400/40 hover:shadow-[0_0_12px_rgba(59,130,246,0.3)] transition-all duration-300"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
            <span>{locale === 'ar' ? 'صنع بواسطة كابنكس' : 'Powered by Qabnix'}</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

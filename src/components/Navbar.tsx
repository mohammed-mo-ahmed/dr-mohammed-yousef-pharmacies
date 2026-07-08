'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Menu, X, Globe, UserPlus } from 'lucide-react';
import Image from 'next/image';

export default function Navbar() {
  const t = useTranslations('common');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isRtl = locale === 'ar';

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/products', label: t('products') },
    { href: '/offers', label: t('offers') },
    { href: '/about', label: t('about') },
    { href: '/contact', label: t('contact') },
    { href: '/faq', label: t('faq') },
  ];

  const switchLocale = () => {
    const nextLocale = locale === 'ar' ? 'en' : 'ar';
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-white border-b border-slate-100 z-50 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* LOGO */}
        <div className="flex-shrink-0 flex items-center">
          <Link href="/" className="block leading-none">
            <Image
              src={isRtl ? '/images/logos/ar.png' : '/images/logos/en.png'}
              alt="Dr. Mohammed Yousef Pharmacies"
              width={180}
              height={48}
              className="h-10 md:h-12 w-auto"
              priority
            />
          </Link>
        </div>

        {/* DESKTOP NAV LINKS */}
        <div className="hidden lg:flex items-center space-x-6 space-x-reverse">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-teal-600 px-2 py-1 rounded-md ${
                  isActive
                    ? 'text-teal-600 font-bold border-b-2 border-teal-600'
                    : 'text-slate-600'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* CONTROLS (Cart, Language Switcher, Admin/Login) */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Register Now */}
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold border border-teal-600 transition-colors shadow-sm"
          >
            <UserPlus size={16} />
            <span>{t('registerNow')}</span>
          </Link>

          {/* Cart Icon */}
          <Link
            href="/cart"
            className="relative p-2 text-slate-700 hover:text-teal-600 transition-colors bg-slate-50 hover:bg-teal-50 rounded-xl border border-slate-100"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Language Toggle */}
          <button
            onClick={switchLocale}
            className="flex items-center gap-1.5 px-3 py-1.5 text-slate-700 hover:text-teal-600 hover:bg-teal-50 border border-slate-200 hover:border-teal-200 rounded-xl text-sm font-semibold transition-all duration-300"
          >
            <Globe size={16} className="text-teal-600" />
            <span>{locale === 'ar' ? 'English' : 'العربية'}</span>
          </button>
        </div>

        {/* MOBILE TRIGGER */}
        <div className="flex lg:hidden items-center gap-3">
          <Link
            href="/cart"
            className="relative p-2 text-slate-700 hover:text-teal-600 bg-slate-50 rounded-xl"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                {cartCount}
              </span>
            )}
          </Link>

          <button
            onClick={switchLocale}
            className="p-2 text-slate-700 hover:text-teal-600 bg-slate-50 rounded-xl"
          >
            <Globe size={20} />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:text-teal-600 bg-slate-50 rounded-xl"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

      </div>

      {/* MOBILE NAV MENU */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed top-20 left-0 right-0 bottom-0 bg-white/95 backdrop-blur-md z-40 border-t border-slate-100 flex flex-col p-6 animate-fadeIn">
          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-lg font-bold py-2 border-b border-slate-50 ${
                    isActive ? 'text-teal-600' : 'text-slate-700'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <div className="pt-6 flex flex-col gap-3">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold border border-teal-600 text-center transition-colors shadow-sm"
              >
                <UserPlus size={18} />
                <span>{t('registerNow')}</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

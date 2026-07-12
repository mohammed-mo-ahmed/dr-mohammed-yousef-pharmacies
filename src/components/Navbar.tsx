'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { supabase } from '@/lib/supabase';
import { ShoppingCart, Menu, X, Globe, LogIn, Heart, User, ChevronDown, LogOut, ShoppingBag, Package, ClipboardList } from 'lucide-react';
import Image from 'next/image';

export default function Navbar() {
  const t = useTranslations('common');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAccountOpen(false);
    setMobileMenuOpen(false);
    router.push('/');
  };

  // Close account dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    }
    if (accountOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [accountOpen]);

  const accountDropdown = (
    <div className="absolute top-full end-0 mt-2 w-56 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 animate-fadeIn">
      <div className="px-4 py-3 border-b border-slate-100">
        <p className="text-xs text-slate-400">{isRtl ? 'مرحباً بك' : 'Welcome back'}</p>
        <p className="text-sm font-bold text-slate-800 truncate">{user?.email}</p>
      </div>
      <Link
        href="/account"
        onClick={() => setAccountOpen(false)}
        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-teal-600 transition-colors"
      >
        <User size={16} />
        <span>{t('myAccount')}</span>
      </Link>
      <Link
        href="/orders"
        onClick={() => setAccountOpen(false)}
        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-teal-600 transition-colors"
      >
        <ClipboardList size={16} />
        <span>{t('myOrders')}</span>
      </Link>
      <Link
        href="/wishlist"
        onClick={() => setAccountOpen(false)}
        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-teal-600 transition-colors"
      >
        <Heart size={16} />
        <span>{t('wishlist')}</span>
      </Link>
      <Link
        href="/cart"
        onClick={() => setAccountOpen(false)}
        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-teal-600 transition-colors"
      >
        <ShoppingBag size={16} />
        <span>{t('cart')}</span>
      </Link>
      <hr className="my-1 border-slate-100" />
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors w-full"
      >
        <LogOut size={16} />
        <span>{t('logout')}</span>
      </button>
    </div>
  );

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

        {/* CONTROLS (Wishlist, Cart, Language, Login/Account) */}
        <div className="hidden lg:flex items-center gap-3">
          {/* Wishlist Icon */}
          <Link
            href="/wishlist"
            aria-label={t('wishlist')}
            className="relative p-2 text-slate-700 hover:text-teal-600 transition-colors bg-slate-50 hover:bg-teal-50 rounded-xl border border-slate-100"
          >
            <Heart size={20} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -end-1.5 bg-rose-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Icon — always visible */}
          <Link
            href="/cart"
            aria-label={t('cart')}
            className="relative p-2 text-slate-700 hover:text-teal-600 transition-colors bg-slate-50 hover:bg-teal-50 rounded-xl border border-slate-100"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -end-1.5 bg-rose-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
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

          {/* Login / Account */}
          {isAuthenticated ? (
            <div className="relative" ref={accountRef}>
              <button
                onClick={() => setAccountOpen(!accountOpen)}
                className="flex items-center gap-2 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
              >
                <User size={16} />
                <span className="max-w-[100px] truncate">{user?.email?.split('@')[0]}</span>
                <ChevronDown size={14} className={`transition-transform ${accountOpen ? 'rotate-180' : ''}`} />
              </button>
              {accountOpen && accountDropdown}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold border border-teal-600 transition-colors shadow-sm"
            >
              <LogIn size={16} />
              <span>{t('login')}</span>
            </Link>
          )}
        </div>

        {/* MOBILE TRIGGER */}
        <div className="flex lg:hidden items-center gap-2">
          {/* Wishlist (mobile) */}
          <Link
            href="/wishlist"
            aria-label={t('wishlist')}
            className="relative p-2 text-slate-700 hover:text-teal-600 bg-slate-50 rounded-xl"
          >
            <Heart size={20} />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -end-1.5 bg-rose-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart (mobile) — always visible */}
          <Link
            href="/cart"
            aria-label={t('cart')}
            className="relative p-2 text-slate-700 hover:text-teal-600 bg-slate-50 rounded-xl"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -end-1.5 bg-rose-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                {cartCount}
              </span>
            )}
          </Link>

          <button
            onClick={switchLocale}
            aria-label={locale === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
            className="p-2 text-slate-700 hover:text-teal-600 bg-slate-50 rounded-xl"
          >
            <Globe size={20} />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? (locale === 'ar' ? 'إغلاق القائمة' : 'Close menu') : (locale === 'ar' ? 'فتح القائمة' : 'Open menu')}
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
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl">
                    <User size={18} className="text-teal-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-400">{t('myAccount')}</p>
                      <p className="text-sm font-bold text-slate-800 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/account"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-slate-50 hover:bg-teal-50 text-slate-700 rounded-xl font-semibold border border-slate-200 text-center transition-colors"
                  >
                    <User size={18} />
                    <span>{t('myAccount')}</span>
                  </Link>
                  <Link
                    href="/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-slate-50 hover:bg-teal-50 text-slate-700 rounded-xl font-semibold border border-slate-200 text-center transition-colors"
                  >
                    <ClipboardList size={18} />
                    <span>{t('myOrders')}</span>
                  </Link>
                  <Link
                    href="/wishlist"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-slate-50 hover:bg-teal-50 text-slate-700 rounded-xl font-semibold border border-slate-200 text-center transition-colors"
                  >
                    <Heart size={18} />
                    <span>{t('wishlist')}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-semibold border border-rose-200 text-center transition-colors"
                  >
                    <LogOut size={18} />
                    <span>{t('logout')}</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold border border-teal-600 text-center transition-colors shadow-sm"
                >
                  <LogIn size={18} />
                  <span>{t('login')}</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useWishlist } from '@/context/WishlistContext';
import ProductCard from '@/components/ProductCard';
import { useCart } from '@/context/CartContext';
import { Heart } from 'lucide-react';

export default function WishlistPage() {
  const t = useTranslations();
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const { wishlist, loading } = useWishlist();
  const { addToCart } = useCart();

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-cairo flex items-center gap-3">
          <Heart size={28} className="text-rose-500 fill-rose-500" />
          {t('wishlist.title')}
        </h1>
      </div>

      {wishlist.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-slate-100 text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Heart size={32} />
          </div>
          <h2 className="text-lg font-bold text-slate-600 mb-2 font-cairo">
            {t('wishlist.empty')}
          </h2>
          <Link
            href="/products"
            className="inline-block mt-4 px-6 py-2.5 bg-teal-600 text-white rounded-xl font-bold shadow-md hover:bg-teal-700 transition-all"
          >
            {isRtl ? 'تصفح المنتجات' : 'Browse Products'}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isRtl={isRtl}
              t={t}
              onAddToCart={addToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
}

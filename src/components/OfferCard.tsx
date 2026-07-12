'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShoppingBag, Heart } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Product } from '@/types';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';

interface OfferCardProps {
  product: Product;
  discount?: number;
  isRtl: boolean;
  onAddToCart: (product: Product) => void;
  t: (key: string) => string;
}

export default function OfferCard({ product, discount = 15, isRtl, onAddToCart, t }: OfferCardProps) {
  const [imgErr, setImgErr] = useState(false);
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { isAuthenticated } = useAuth();
  const wishlisted = isWishlisted(product.id);

  const originalPrice = product.old_price && product.old_price > product.price
    ? product.old_price
    : product.price / (1 - discount / 100);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    toggleWishlist(product);
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 hover:shadow-xl hover:border-amber-200 hover:scale-[1.02] transition-all duration-500 overflow-hidden flex flex-col justify-between relative h-full">
      {/* Discount badge */}
      <div className="absolute top-3 start-3 z-10 px-2.5 py-0.5 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-full text-[10px] font-extrabold uppercase shadow-md">
        {discount}% {isRtl ? 'خصم' : 'OFF'}
      </div>

      {/* Wishlist heart button */}
      <button
        onClick={handleWishlistToggle}
        className="absolute top-3 end-3 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white hover:scale-110 transition-all duration-200"
        aria-label={t('wishlist')}
      >
        <Heart
          size={14}
          className={wishlisted ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}
        />
      </button>

      {/* Product Image */}
      <Link href={`/products/${product.id}`} className="block w-full aspect-square relative bg-slate-50 overflow-hidden">
        <Image
          src={imgErr || !product.image_url ? 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60' : product.image_url}
          alt={isRtl ? product.name_ar : product.name_en}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
          onError={() => setImgErr(true)}
        />
      </Link>

      {/* Card Body */}
      <div className="p-3.5 flex-grow flex flex-col justify-between gap-2">
        {/* Name */}
        <Link
          href={`/products/${product.id}`}
          className="font-bold text-slate-800 font-cairo line-clamp-1 hover:text-teal-600 transition-colors leading-snug text-xs md:text-sm"
        >
          {isRtl ? product.name_ar : product.name_en}
        </Link>

        {/* Short description */}
        <p className="text-slate-400 text-[10px] md:text-[11px] leading-relaxed line-clamp-2 font-cairo">
          {isRtl ? product.description_ar : product.description_en}
        </p>

        {/* Prices */}
        <div className="flex items-end gap-2 mt-auto">
          <span className="font-extrabold text-teal-600 font-sans text-sm">
            {product.price.toFixed(2)}
          </span>
          <span className="text-slate-400 line-through font-sans text-[11px]">
            {originalPrice.toFixed(2)}
          </span>
          <span className="text-[9px] font-bold text-slate-500">{t('common.currency')}</span>
        </div>

        {/* Add to cart */}
        <button
          onClick={() => onAddToCart(product)}
          className="w-full mt-1 flex items-center justify-center gap-1.5 bg-teal-50 hover:bg-teal-600 text-teal-600 hover:text-white py-2 rounded-lg transition-all shadow-sm text-[11px] font-bold font-cairo"
        >
          <ShoppingBag size={13} />
          <span>{t('common.addToCart')}</span>
        </button>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShoppingBag } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  isRtl: boolean;
  t: (key: string) => string;
  onAddToCart: (p: Product) => void;
  variant?: 'default' | 'compact';
}

export default function ProductCard({ product, isRtl, t, onAddToCart, variant = 'default' }: ProductCardProps) {
  const [imgErr, setImgErr] = useState(false);
  const isDefault = variant === 'default';

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 hover:shadow-xl hover:border-slate-200 hover:scale-[1.02] transition-all duration-500 overflow-hidden flex flex-col justify-between h-full">
      <Link href={`/products/${product.id}`} className="block w-full aspect-square relative bg-slate-50 overflow-hidden">
        <Image
          src={imgErr || !product.image_url ? 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60' : product.image_url}
          alt={isRtl ? product.name_ar : product.name_en}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className={`object-contain ${isDefault ? 'p-4' : 'p-3'} group-hover:scale-105 transition-transform duration-300`}
          onError={() => setImgErr(true)}
        />

        <div className={`absolute top-3 ${isRtl ? 'right-3' : 'left-3'} flex flex-col gap-1.5`}>
          {product.is_best_seller && (
            <span className="px-2.5 py-0.5 bg-rose-500 text-white rounded-full text-[10px] font-extrabold uppercase">
              {isRtl ? 'مميز' : 'Best'}
            </span>
          )}
          {product.is_latest && (
            <span className="px-2.5 py-0.5 bg-teal-600 text-white rounded-full text-[10px] font-extrabold uppercase">
              {isRtl ? 'جديد' : 'New'}
            </span>
          )}
        </div>
      </Link>

      <div className={`flex-grow flex flex-col justify-between ${isDefault ? 'p-4' : 'p-3.5'}`}>
        <div>
          {product.category && (
            <span className="text-[11px] text-teal-600 font-semibold uppercase tracking-wider block mb-1">
              {isRtl ? product.category.name_ar : product.category.name_en}
            </span>
          )}
          <Link
            href={`/products/${product.id}`}
            className={`font-bold text-slate-800 font-cairo line-clamp-2 hover:text-teal-600 transition-colors leading-snug block ${
              isDefault ? 'text-sm md:text-base' : 'text-xs md:text-sm'
            }`}
          >
            {isRtl ? product.name_ar : product.name_en}
          </Link>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400">{t('common.price')}</span>
            <span className={`font-extrabold text-teal-600 font-sans ${isDefault ? 'text-base md:text-lg' : 'text-sm'}`}>
              {product.price.toFixed(2)} <span className={`font-bold ${isDefault ? 'text-xs md:text-sm' : 'text-[10px]'}`}>{t('common.currency')}</span>
            </span>
          </div>

          <button
            onClick={() => onAddToCart(product)}
            className={`bg-teal-50 hover:bg-teal-600 text-teal-600 hover:text-white transition-all shadow-sm ${
              isDefault ? 'p-2.5 rounded-xl' : 'p-2 rounded-lg'
            }`}
            title={t('common.addToCart')}
          >
            <ShoppingBag size={isDefault ? 18 : 14} />
          </button>
        </div>
      </div>
    </div>
  );
}

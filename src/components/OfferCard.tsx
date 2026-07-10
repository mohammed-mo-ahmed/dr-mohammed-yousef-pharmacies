'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShoppingBag } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Product } from '@/types';

interface OfferCardProps {
  product: Product;
  isRtl: boolean;
  onAddToCart: (product: Product) => void;
  t: (key: string) => string;
}

export default function OfferCard({ product, isRtl, onAddToCart, t }: OfferCardProps) {
  const [imgErr, setImgErr] = useState(false);

  return (
    <div className="group bg-white rounded-2xl border border-slate-100 hover:shadow-xl hover:border-amber-200 hover:scale-[1.02] transition-all duration-500 overflow-hidden flex flex-col justify-between relative h-full">
      <div className="absolute top-3 start-3 z-10 px-2.5 py-0.5 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-full text-[10px] font-extrabold uppercase shadow-md">
        {isRtl ? 'عرض' : 'Offer'}
      </div>

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

      <div className="p-3.5 flex-grow flex flex-col justify-between">
        <Link
          href={`/products/${product.id}`}
          className="font-bold text-slate-800 font-cairo line-clamp-2 hover:text-teal-600 transition-colors leading-snug text-xs md:text-sm"
        >
          {isRtl ? product.name_ar : product.name_en}
        </Link>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400">{t('common.price')}</span>
            <span className="font-extrabold text-teal-600 font-sans text-sm">
              {product.price.toFixed(2)} <span className="font-bold text-[10px]">{t('common.currency')}</span>
            </span>
          </div>

          <button
            onClick={() => onAddToCart(product)}
            className="bg-teal-50 hover:bg-teal-600 text-teal-600 hover:text-white p-2 rounded-lg transition-all shadow-sm"
            title={t('common.addToCart')}
          >
            <ShoppingBag size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

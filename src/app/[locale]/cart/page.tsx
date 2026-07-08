'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, Link } from '@/i18n/routing';
import { useCart } from '@/context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, ArrowRight, CreditCard } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

export default function CartPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const isRtl = locale === 'ar';

  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const handleImgError = (id: string) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Title */}
      <div className={`mb-8 ${isRtl ? 'text-right' : 'text-left'}`}>
        <h1 className="text-3xl font-extrabold text-slate-900 font-cairo">
          {t('cart.title')}
        </h1>
      </div>

      {cart.length === 0 ? (
        /* Empty State */
        <div className="min-h-[400px] bg-white border border-slate-100 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-sm font-cairo">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
            <ShoppingBag size={32} />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">
            {t('cart.empty')}
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            {isRtl ? 'أضف بعض المنتجات الرائعة لتسوقك اليوم.' : 'Add some products to get started with your order.'}
          </p>
          <Link
            href="/products"
            className="px-6 py-2.5 bg-teal-600 text-white hover:bg-teal-700 rounded-xl font-bold transition-all shadow-md flex items-center gap-2"
          >
            <span>{isRtl ? 'تصفح المنتجات' : 'Browse Products'}</span>
            {isRtl ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
          </Link>
        </div>
      ) : (
        /* Cart List Grid */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Cart Items list (Left 2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {cart.map((item) => {
              const { product, quantity } = item;
              const hasImgErr = imgErrors[product.id];
              return (
                <div
                  key={product.id}
                  className="bg-white border border-slate-100 rounded-2xl p-4 md:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 transition-all hover:shadow-md"
                >
                  {/* Image & Title details */}
                  <div className="flex flex-row items-center gap-4 w-full sm:w-auto">
                    <div className="relative w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100">
                      <Image
                        src={hasImgErr || !product.image_url ? 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60' : product.image_url}
                        alt={isRtl ? product.name_ar : product.name_en}
                        fill
                        sizes="80px"
                        className="object-contain p-2"
                        onError={() => handleImgError(product.id)}
                      />
                    </div>
                    
                    <div className={isRtl ? 'text-right font-cairo' : 'text-left font-outfit'}>
                      <span className="text-[10px] text-teal-600 font-bold uppercase tracking-wider block">
                        {product.category ? (isRtl ? product.category.name_ar : product.category.name_en) : ''}
                      </span>
                      <Link
                        href={`/products/${product.id}`}
                        className="font-bold text-slate-800 hover:text-teal-600 transition-colors text-sm md:text-base leading-snug line-clamp-2"
                      >
                        {isRtl ? product.name_ar : product.name_en}
                      </Link>
                      <span className="text-xs text-slate-400 mt-1 block">
                        {isRtl ? 'سعر الوحدة:' : 'Unit price:'} {product.price.toFixed(2)} {t('common.currency')}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Actions & Price & Delete */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0">
                    
                    {/* Quantity Selector */}
                    <div className="flex items-center justify-between border border-slate-200 rounded-xl p-1 bg-slate-50 w-28">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-white rounded-lg transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-extrabold text-slate-800 text-sm font-sans w-6 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-white rounded-lg transition-colors"
                        disabled={quantity >= product.stock}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Total item price */}
                    <div className="text-right min-w-[70px]">
                      <span className="text-xs text-slate-400 block font-cairo">
                        {isRtl ? 'الإجمالي' : 'Subtotal'}
                      </span>
                      <span className="font-extrabold text-slate-850 text-sm md:text-base text-teal-600 font-sans">
                        {(product.price * quantity).toFixed(2)}
                      </span>
                    </div>

                    {/* Delete item button */}
                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title={t('cart.remove')}
                    >
                      <Trash2 size={18} />
                    </button>

                  </div>

                </div>
              );
            })}
          </div>

          {/* Cart Summary (Right 1 col) */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-6 font-cairo">
            <h3 className="font-bold text-slate-900 text-lg border-b border-slate-100 pb-4">
              {isRtl ? 'ملخص الطلب' : 'Order Summary'}
            </h3>
            
            <div className="flex flex-col gap-3 text-sm text-slate-600 border-b border-slate-100 pb-4">
              <div className="flex justify-between">
                <span>{isRtl ? 'عدد العناصر' : 'Total Items'}</span>
                <span className="font-extrabold text-slate-900 font-sans">
                  {cart.reduce((tot, i) => tot + i.quantity, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{isRtl ? 'سعر المنتجات' : 'Products Total'}</span>
                <span className="font-extrabold text-slate-900 font-sans">
                  {cartTotal.toFixed(2)} {t('common.currency')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>{isRtl ? 'الشحن' : 'Delivery'}</span>
                <span className="font-bold text-emerald-600">
                  {isRtl ? 'مجاني' : 'Free'}
                </span>
              </div>
            </div>

            {/* Total price */}
            <div className="flex justify-between items-baseline">
              <span className="font-bold text-slate-800 text-base">{t('cart.total')}</span>
              <div className="text-right">
                <span className="text-2xl font-black text-teal-600 font-sans">
                  {cartTotal.toFixed(2)}
                </span>
                <span className="text-xs font-bold text-slate-500 font-cairo ml-1">
                  {t('common.currency')}
                </span>
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={() => router.push('/checkout')}
              className="w-full flex items-center justify-center gap-2 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-extrabold shadow-md shadow-teal-100 hover:shadow-lg transition-all"
            >
              <CreditCard size={18} />
              <span>{t('cart.checkout')}</span>
            </button>

            <Link
              href="/products"
              className="text-center text-sm font-semibold text-teal-600 hover:text-teal-700 py-1"
            >
              {isRtl ? 'استكمال التسوق' : 'Continue Shopping'}
            </Link>
          </div>

        </div>
      )}

    </div>
  );
}

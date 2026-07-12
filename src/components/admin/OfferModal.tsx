'use client';

import { useState, useEffect } from 'react';
import { X, Percent } from 'lucide-react';
import Image from 'next/image';
import { Product } from '@/types';

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  isRtl: boolean;
  onSave: (productId: string, newPrice: number, oldPrice: number) => Promise<void>;
  onRemove: (productId: string) => Promise<void>;
}

export default function OfferModal({ isOpen, onClose, product, isRtl, onSave, onRemove }: OfferModalProps) {
  const [discountPercent, setDiscountPercent] = useState(0);
  const [newPrice, setNewPrice] = useState(0);
  const [originalPrice, setOriginalPrice] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) {
      const orig = product.old_price && product.old_price > product.price ? product.old_price : product.price;
      setOriginalPrice(orig);
      setNewPrice(product.price);
      if (product.old_price && product.old_price > product.price) {
        const disc = Math.round(((product.old_price - product.price) / product.old_price) * 100);
        setDiscountPercent(disc);
      } else {
        setDiscountPercent(0);
      }
    }
  }, [product]);

  const handleDiscountChange = (val: number) => {
    setDiscountPercent(val);
    const price = originalPrice * (1 - val / 100);
    setNewPrice(Math.round(price * 100) / 100);
  };

  const handleNewPriceChange = (val: number) => {
    setNewPrice(val);
    if (originalPrice > 0) {
      const disc = Math.round(((originalPrice - val) / originalPrice) * 100);
      setDiscountPercent(Math.max(0, Math.min(99, disc)));
    }
  };

  const handleSave = async () => {
    if (!product || newPrice <= 0 || newPrice >= originalPrice) return;
    setSaving(true);
    await onSave(product.id, newPrice, originalPrice);
    setSaving(false);
    onClose();
  };

  const handleRemove = async () => {
    if (!product) return;
    setSaving(true);
    await onRemove(product.id);
    setSaving(false);
    onClose();
  };

  if (!isOpen || !product) return null;

  const hasOffer = product.old_price && product.old_price > product.price;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
            <Percent size={20} className="text-amber-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {hasOffer ? (isRtl ? 'تعديل العرض' : 'Edit Offer') : (isRtl ? 'إضافة عرض' : 'Add Offer')}
          </h3>
        </div>

        {/* Product preview */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-6">
          <div className="w-12 h-12 bg-white border border-slate-100 rounded-lg relative overflow-hidden flex-shrink-0">
            <Image
              src={product.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=60'}
              alt={product.name_en}
              fill
              sizes="48px"
              className="object-contain p-1"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-bold text-slate-800 text-xs truncate">{isRtl ? product.name_ar : product.name_en}</div>
            <div className="text-slate-400 text-[10px]">{isRtl ? 'السعر الأصلي' : 'Original'}: {originalPrice.toFixed(2)}</div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {/* Discount % */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500">
              {isRtl ? 'نسبة الخصم (%)' : 'Discount (%)'}
            </label>
            <input
              type="number"
              min="1"
              max="99"
              value={discountPercent || ''}
              onChange={(e) => handleDiscountChange(Number(e.target.value))}
              placeholder="10, 20, 30..."
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-amber-400 font-sans font-bold text-center text-lg"
            />
          </div>

          {/* New Price */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500">
              {isRtl ? 'السعر الجديد' : 'New Price'}
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={newPrice || ''}
              onChange={(e) => handleNewPriceChange(Number(e.target.value))}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-amber-400 font-sans font-bold text-center text-lg"
            />
          </div>

          {/* Preview */}
          {discountPercent > 0 && newPrice < originalPrice && (
            <div className="flex items-center justify-center gap-3 p-3 bg-amber-50 rounded-xl">
              <span className="text-slate-400 line-through font-sans text-sm">{originalPrice.toFixed(2)}</span>
              <span className="text-amber-600 font-extrabold text-lg font-sans">{newPrice.toFixed(2)}</span>
              <span className="px-2 py-0.5 bg-amber-500 text-white rounded-full text-[10px] font-bold">
                -{discountPercent}%
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-2">
            {hasOffer && (
              <button
                onClick={handleRemove}
                disabled={saving}
                className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                {isRtl ? 'إزالة العرض' : 'Remove Offer'}
              </button>
            )}
            <div className="flex-1" />
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || discountPercent <= 0 || newPrice <= 0 || newPrice >= originalPrice}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {saving ? '...' : (isRtl ? 'حفظ العرض' : 'Save Offer')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

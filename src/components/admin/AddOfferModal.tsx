'use client';

import { useState, useEffect } from 'react';
import { X, Search, Percent } from 'lucide-react';
import Image from 'next/image';
import { Product } from '@/types';

interface AddOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  editProduct: Product | null;
  isRtl: boolean;
  onSave: (productId: string, offerPrice: number) => Promise<void>;
  onRemove: (productId: string) => Promise<void>;
}

export default function AddOfferModal({ isOpen, onClose, products, editProduct, isRtl, onSave, onRemove }: AddOfferModalProps) {
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [offerPrice, setOfferPrice] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editProduct) {
        setSelectedProduct(editProduct);
        if (editProduct.offer_price && editProduct.offer_price < editProduct.price) {
          setOfferPrice(editProduct.offer_price);
          setDiscountPercent(Math.round(((editProduct.price - editProduct.offer_price) / editProduct.price) * 100));
        } else {
          setOfferPrice(0);
          setDiscountPercent(0);
        }
        setSearch('');
      } else {
        setSelectedProduct(null);
        setOfferPrice(0);
        setDiscountPercent(0);
        setSearch('');
      }
    }
  }, [isOpen, editProduct]);

  const basePrice = selectedProduct?.price || 0;

  const filtered = search
    ? products.filter(p =>
        (p.name_en.toLowerCase().includes(search.toLowerCase()) ||
        p.name_ar.includes(search) ||
        p.barcode?.includes(search)) &&
        !p.offer_price
      ).slice(0, 20)
    : [];

  const handleDiscountChange = (val: number) => {
    setDiscountPercent(val);
    const price = basePrice * (1 - val / 100);
    setOfferPrice(Math.round(price * 100) / 100);
  };

  const handleOfferPriceChange = (val: number) => {
    setOfferPrice(val);
    if (basePrice > 0) {
      const disc = Math.round(((basePrice - val) / basePrice) * 100);
      setDiscountPercent(Math.max(0, Math.min(99, disc)));
    }
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setSearch('');
    setOfferPrice(0);
    setDiscountPercent(0);
  };

  const handleSave = async () => {
    if (!selectedProduct || offerPrice <= 0 || offerPrice >= basePrice) return;
    setSaving(true);
    await onSave(selectedProduct.id, offerPrice);
    setSaving(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90dvh] overflow-y-auto">
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
            {editProduct
              ? (isRtl ? 'تعديل العرض' : 'Edit Offer')
              : (isRtl ? 'إضافة عرض جديد' : 'Add New Offer')}
          </h3>
        </div>

        {/* Product Selection */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-slate-500 mb-2 block">
            {isRtl ? 'اختر المنتج' : 'Select Product'}
          </label>

          {selectedProduct ? (
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <div className="w-12 h-12 bg-white border border-slate-100 rounded-lg relative overflow-hidden flex-shrink-0">
                <Image
                  src={selectedProduct.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=60'}
                  alt={selectedProduct.name_en}
                  fill
                  sizes="48px"
                  className="object-contain p-1"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-slate-800 text-xs truncate">
                  {isRtl ? selectedProduct.name_ar : selectedProduct.name_en}
                </div>
                <div className="text-slate-400 text-[10px]">
                  {isRtl ? 'السعر الأساسي' : 'Base Price'}: {selectedProduct.price.toFixed(2)}
                </div>
              </div>
              {!editProduct && (
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ) : (
            <div className="relative">
              <Search size={16} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRtl ? 'right-3' : 'left-3'}`} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isRtl ? 'ابحث بالاسم أو الباركود...' : 'Search by name or barcode...'}
                className={`w-full py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 ${isRtl ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'}`}
                autoFocus
              />
              {search && filtered.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto z-10">
                  {filtered.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectProduct(p)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                    >
                      <div className="w-8 h-8 bg-slate-50 border border-slate-100 rounded-lg relative overflow-hidden flex-shrink-0">
                        <Image
                          src={p.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=60'}
                          alt={p.name_en}
                          fill
                          sizes="32px"
                          className="object-contain p-0.5"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-800 text-xs truncate">
                          {isRtl ? p.name_ar : p.name_en}
                        </div>
                        <div className="text-slate-400 text-[10px] font-sans">
                          {p.price.toFixed(2)} {p.barcode && `| ${p.barcode}`}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {search && filtered.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg p-4 text-center">
                  <p className="text-xs text-slate-400">
                    {isRtl ? 'لا توجد نتائج' : 'No results found'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Offer Price Fields */}
        {selectedProduct && (
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

            {/* Offer Price */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500">
                {isRtl ? 'سعر العرض' : 'Offer Price'}
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={offerPrice || ''}
                onChange={(e) => handleOfferPriceChange(Number(e.target.value))}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:border-amber-400 font-sans font-bold text-center text-lg"
              />
            </div>

            {/* Preview */}
            {discountPercent > 0 && offerPrice > 0 && offerPrice < basePrice && (
              <div className="flex items-center justify-center gap-3 p-3 bg-amber-50 rounded-xl">
                <span className="text-slate-400 line-through font-sans text-sm">{basePrice.toFixed(2)}</span>
                <span className="text-amber-600 font-extrabold text-lg font-sans">{offerPrice.toFixed(2)}</span>
                <span className="px-2 py-0.5 bg-amber-500 text-white rounded-full text-[10px] font-bold">
                  -{discountPercent}%
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1" />
              <button
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                {isRtl ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleSave}
                disabled={saving || discountPercent <= 0 || offerPrice <= 0 || offerPrice >= basePrice}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {saving ? '...' : (isRtl ? 'حفظ العرض' : 'Save Offer')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

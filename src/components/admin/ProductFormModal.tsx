'use client';

import { X } from 'lucide-react';
import { Category } from '@/types';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editId: string | null;
  categories: Category[];
  isRtl: boolean;
  t: (key: string) => string;
  common: (key: string) => string;

  prodNameAr: string;
  setProdNameAr: (v: string) => void;
  prodNameEn: string;
  setProdNameEn: (v: string) => void;
  prodPrice: number;
  setProdPrice: (v: number) => void;
  prodStock: number;
  setProdStock: (v: number) => void;
  prodCategoryId: string;
  setProdCategoryId: (v: string) => void;
  prodImage: string;
  setProdImage: (v: string) => void;
  prodDescAr: string;
  setProdDescAr: (v: string) => void;
  prodDescEn: string;
  setProdDescEn: (v: string) => void;
  prodUsageAr: string;
  setProdUsageAr: (v: string) => void;
  prodUsageEn: string;
  setProdUsageEn: (v: string) => void;
  prodIsBest: boolean;
  setProdIsBest: (v: boolean) => void;
  prodIsLatest: boolean;
  setProdIsLatest: (v: boolean) => void;

  // Drug-specific fields
  prodActiveIngredients?: string;
  setProdActiveIngredients?: (v: string) => void;
  prodCompany?: string;
  setProdCompany?: (v: string) => void;
  prodBarcode?: string;
  setProdBarcode?: (v: string) => void;
  prodForm?: string;
  setProdForm?: (v: string) => void;
  prodSize?: string;
  setProdSize?: (v: string) => void;

  onSubmit: (e: React.FormEvent) => void;
}

export default function ProductFormModal({
  isOpen,
  onClose,
  editId,
  categories,
  isRtl,
  t,
  common,
  prodNameAr, setProdNameAr,
  prodNameEn, setProdNameEn,
  prodPrice, setProdPrice,
  prodStock, setProdStock,
  prodCategoryId, setProdCategoryId,
  prodImage, setProdImage,
  prodDescAr, setProdDescAr,
  prodDescEn, setProdDescEn,
  prodUsageAr, setProdUsageAr,
  prodUsageEn, setProdUsageEn,
  prodIsBest, setProdIsBest,
  prodIsLatest, setProdIsLatest,
  prodActiveIngredients, setProdActiveIngredients,
  prodCompany, setProdCompany,
  prodBarcode, setProdBarcode,
  prodForm, setProdForm,
  prodSize, setProdSize,
  onSubmit,
}: ProductFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90dvh] overflow-y-auto p-6 md:p-8 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
        >
          <X size={20} />
        </button>

        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-6">
          {editId ? t('products.edit') : t('products.add')}
        </h3>

        <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">{t('products.fields.nameAr')}</label>
            <input
              type="text"
              required
              value={prodNameAr}
              onChange={(e) => setProdNameAr(e.target.value)}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">{t('products.fields.nameEn')}</label>
            <input
              type="text"
              required
              value={prodNameEn}
              onChange={(e) => setProdNameEn(e.target.value)}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white text-left"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">{t('products.fields.price')}</label>
            <input
              type="number"
              step="0.01"
              required
              value={prodPrice}
              onChange={(e) => setProdPrice(Number(e.target.value))}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white font-sans font-bold"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">{t('products.fields.stock')}</label>
            <input
              type="number"
              required
              value={prodStock}
              onChange={(e) => setProdStock(Number(e.target.value))}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white font-sans font-bold"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">{t('products.fields.category')}</label>
            <select
              value={prodCategoryId}
              onChange={(e) => setProdCategoryId(e.target.value)}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white font-semibold text-slate-700"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {isRtl ? c.name_ar : c.name_en}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-500">{t('products.fields.image')}</label>
            <input
              type="url"
              value={prodImage}
              onChange={(e) => setProdImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white text-left"
            />
          </div>

          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-xs font-semibold text-slate-500">{t('products.fields.descAr')}</label>
            <textarea
              value={prodDescAr}
              onChange={(e) => setProdDescAr(e.target.value)}
              rows={2}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white"
            />
          </div>

          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-xs font-semibold text-slate-500">{t('products.fields.descEn')}</label>
            <textarea
              value={prodDescEn}
              onChange={(e) => setProdDescEn(e.target.value)}
              rows={2}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white text-left"
            />
          </div>

          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-xs font-semibold text-slate-500">{t('products.fields.usageAr')}</label>
            <input
              type="text"
              value={prodUsageAr}
              onChange={(e) => setProdUsageAr(e.target.value)}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white"
            />
          </div>

          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-xs font-semibold text-slate-500">{t('products.fields.usageEn')}</label>
            <input
              type="text"
              value={prodUsageEn}
              onChange={(e) => setProdUsageEn(e.target.value)}
              className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white text-left"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="prodIsBest"
              checked={prodIsBest}
              onChange={(e) => setProdIsBest(e.target.checked)}
              className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded"
            />
            <label htmlFor="prodIsBest" className="text-xs font-bold text-slate-700">
              {isRtl ? 'منتج متميز (أكثر مبيعاً)' : 'Best Seller Product'}
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="prodIsLatest"
              checked={prodIsLatest}
              onChange={(e) => setProdIsLatest(e.target.checked)}
              className="w-4 h-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded"
            />
            <label htmlFor="prodIsLatest" className="text-xs font-bold text-slate-700">
              {isRtl ? 'منتج جديد (أحدث المضاف)' : 'New Addition'}
            </label>
          </div>

          {/* Drug Information Section */}
          {(setProdCompany || setProdBarcode || setProdForm) && (
            <div className="sm:col-span-2 mt-4 border-t border-slate-100 pt-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">
                {isRtl ? 'معلومات الدواء' : 'Drug Information'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {setProdCompany && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-500">{isRtl ? 'الشركة' : 'Company'}</label>
                    <input type="text" value={prodCompany || ''} onChange={(e) => setProdCompany(e.target.value)} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white" />
                  </div>
                )}
                {setProdBarcode && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-500">{isRtl ? 'الباركود' : 'Barcode'}</label>
                    <input type="text" value={prodBarcode || ''} onChange={(e) => setProdBarcode(e.target.value)} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white text-left" />
                  </div>
                )}
                {setProdForm && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-500">{isRtl ? 'الشكل' : 'Form'}</label>
                    <input type="text" value={prodForm || ''} onChange={(e) => setProdForm(e.target.value)} placeholder="tablet, syrup, cream..." className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white text-left" />
                  </div>
                )}
                {setProdSize && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-500">{isRtl ? 'الحجم' : 'Size'}</label>
                    <input type="text" value={prodSize || ''} onChange={(e) => setProdSize(e.target.value)} placeholder="100 ml, 30 tablets..." className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white text-left" />
                  </div>
                )}
                {setProdActiveIngredients && (
                  <div className="flex flex-col gap-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-slate-500">{isRtl ? 'المكونات الفعالة' : 'Active Ingredients'}</label>
                    <input type="text" value={prodActiveIngredients || ''} onChange={(e) => setProdActiveIngredients(e.target.value)} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:bg-white text-left" />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="sm:col-span-2 mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
            >
              {common('cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all"
            >
              {common('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

import { X } from 'lucide-react';

interface OfferFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editId: string | null;
  isRtl: boolean;
  common: (key: string) => string;

  offTitleAr: string;
  setOffTitleAr: (v: string) => void;
  offTitleEn: string;
  setOffTitleEn: (v: string) => void;
  offPercent: number;
  setOffPercent: (v: number) => void;
  offImage: string;
  setOffImage: (v: string) => void;

  onSubmit: (e: React.FormEvent) => void;
}

export default function OfferFormModal({
  isOpen,
  onClose,
  editId,
  isRtl,
  common,
  offTitleAr, setOffTitleAr,
  offTitleEn, setOffTitleEn,
  offPercent, setOffPercent,
  offImage, setOffImage,
  onSubmit,
}: OfferFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-cairo">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl"
        >
          <X size={20} />
        </button>

        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-4 mb-4">
          {editId
            ? (isRtl ? 'تعديل العرض' : 'Edit Offer')
            : (isRtl ? 'إضافة عرض خصم جديد' : 'Create Offer Banner')}
        </h3>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500">{isRtl ? 'عنوان العرض بالعربية' : 'Title (Arabic)'}</label>
            <input
              type="text"
              required
              value={offTitleAr}
              onChange={(e) => setOffTitleAr(e.target.value)}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500">{isRtl ? 'عنوان العرض بالإنجليزية' : 'Title (English)'}</label>
            <input
              type="text"
              required
              value={offTitleEn}
              onChange={(e) => setOffTitleEn(e.target.value)}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none text-left"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500">{isRtl ? 'نسبة الخصم (%)' : 'Discount Percentage (%)'}</label>
            <input
              type="number"
              required
              min="0"
              max="100"
              value={offPercent}
              onChange={(e) => setOffPercent(Number(e.target.value))}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none font-sans font-bold"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500">{isRtl ? 'رابط الصورة البانر' : 'Banner Image URL'}</label>
            <input
              type="url"
              value={offImage}
              onChange={(e) => setOffImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none text-left"
            />
          </div>

          <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
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

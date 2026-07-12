'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Percent } from 'lucide-react';
import Image from 'next/image';
import { Product } from '@/types';

interface OffersTabProps {
  products: Product[];
  isRtl: boolean;
  t: (key: string) => string;
  common: (key: string) => string;
  openAddOffer: () => void;
  openEditOffer: (product: Product) => void;
  handleRemoveOffer: (productId: string) => void;
}

const PAGE_SIZE = 25;

export default function OffersTab({ products, isRtl, t, common, openAddOffer, openEditOffer, handleRemoveOffer }: OffersTabProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const offerProducts = products.filter(p => p.offer_price != null && p.offer_price < p.price);

  const filtered = search
    ? offerProducts.filter(p =>
        p.name_en.toLowerCase().includes(search.toLowerCase()) ||
        p.name_ar.includes(search) ||
        p.barcode?.includes(search)
      )
    : offerProducts;

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className="font-bold text-slate-800 text-base">
          {isRtl ? `العروض النشطة (${offerProducts.length})` : `Active Offers (${offerProducts.length})`}
        </h3>
        <button
          onClick={openAddOffer}
          className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-50 transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>{isRtl ? 'إضافة عرض' : 'Add Offer'}</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRtl ? 'right-3' : 'left-3'}`} />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={isRtl ? 'بحث بالاسم أو الباركود...' : 'Search by name or barcode...'}
          className={`w-full py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 ${isRtl ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'}`}
        />
      </div>

      {offerProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-4">
            <Percent size={32} />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">
            {isRtl ? 'لا توجد عروض نشطة' : 'No Active Offers'}
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            {isRtl ? 'اضغط "إضافة عرض" لتبدأ بإضافة عرض على منتج' : 'Click "Add Offer" to start adding offers to products'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right text-slate-650">
            <thead className="text-xs text-slate-400 uppercase bg-slate-50">
              <tr>
                <th className="px-4 py-3">{common('name')}</th>
                <th className="px-4 py-3">{isRtl ? 'السعر الأصلي' : 'Base Price'}</th>
                <th className="px-4 py-3">{isRtl ? 'سعر العرض' : 'Offer Price'}</th>
                <th className="px-4 py-3">{isRtl ? 'الخصم' : 'Discount'}</th>
                <th className="px-4 py-3">{common('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((p) => {
                const discount = Math.round(((p.price - (p.offer_price || 0)) / p.price) * 100);
                return (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-lg relative overflow-hidden flex-shrink-0">
                          <Image
                            src={p.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=60'}
                            alt={p.name_en}
                            fill
                            sizes="40px"
                            className="object-contain p-0.5"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-800 text-xs truncate max-w-[200px]">{isRtl ? p.name_ar : p.name_en}</div>
                          {p.barcode && <div className="text-slate-400 text-[10px] font-mono">{p.barcode}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-sans text-xs text-slate-500">
                      {p.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 font-bold text-teal-600 font-sans text-xs">
                      {p.offer_price?.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 font-bold font-sans text-xs">
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold">
                        %{discount}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditOffer(p)}
                          className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleRemoveOffer(p.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-xs text-slate-500">
            {isRtl ? `${filtered.length} نتيجة` : `${filtered.length} results`}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {isRtl ? 'السابق' : 'Prev'}
            </button>
            <span className="text-xs font-bold text-slate-600 px-2">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {isRtl ? 'التالي' : 'Next'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

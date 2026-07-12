'use client';

import { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Percent } from 'lucide-react';
import Image from 'next/image';
import { Product } from '@/types';

interface ProductsTabProps {
  products: Product[];
  isRtl: boolean;
  t: (key: string) => string;
  common: (key: string) => string;
  openAddProduct: () => void;
  openEditProduct: (prod: Product) => void;
  openOfferModal: (prod: Product) => void;
  handleDeleteProduct: (id: string) => void;
}

const isLowStock = (stock: number) => stock <= 10;
const PAGE_SIZE = 25;

export default function ProductsTab({ products, isRtl, t, common, openAddProduct, openEditProduct, openOfferModal, handleDeleteProduct }: ProductsTabProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = search
    ? products.filter(p =>
        p.name_en.toLowerCase().includes(search.toLowerCase()) ||
        p.name_ar.includes(search) ||
        p.barcode?.includes(search) ||
        p.company?.toLowerCase().includes(search.toLowerCase())
      )
    : products;

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
          {isRtl ? `المنتجات (${filtered.length})` : `Products (${filtered.length})`}
        </h3>
        <button
          onClick={openAddProduct}
          className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-50 transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>{t('products.add')}</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRtl ? 'right-3' : 'left-3'}`} />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={isRtl ? 'بحث بالاسم أو الباركود أو الشركة...' : 'Search by name, barcode, or company...'}
          className={`w-full py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 ${isRtl ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'}`}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right text-slate-650">
          <thead className="text-xs text-slate-400 uppercase bg-slate-50">
            <tr>
              <th className="px-4 py-3">{common('name')}</th>
              <th className="px-4 py-3 hidden md:table-cell">{isRtl ? 'الشكل' : 'Form'}</th>
              <th className="px-4 py-3 hidden lg:table-cell">{isRtl ? 'الشركة' : 'Company'}</th>
              <th className="px-4 py-3">{common('price')}</th>
              <th className="px-4 py-3">{t('products.fields.stock')}</th>
              <th className="px-4 py-3">{common('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((p) => (
              <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-50 border border-slate-100 rounded-lg relative overflow-hidden flex-shrink-0">
                      <Image
                        src={p.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=60'}
                        alt={p.name_en}
                        fill
                        sizes="32px"
                        className="object-contain p-0.5"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-800 text-xs truncate max-w-[200px]">{isRtl ? p.name_ar : p.name_en}</div>
                      {p.barcode && <div className="text-slate-400 text-[10px] font-mono">{p.barcode}</div>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-xs text-slate-600">{p.form || '-'}</td>
                <td className="px-4 py-3 hidden lg:table-cell text-xs text-slate-600 truncate max-w-[150px]">{p.company || '-'}</td>
                <td className="px-4 py-3 font-bold text-slate-900 font-sans text-xs">
                  <div className="flex flex-col">
                    <span>{p.price.toFixed(2)}</span>
                    {p.old_price && p.old_price > p.price && (
                      <span className="text-[10px] text-amber-500 line-through">{p.old_price.toFixed(2)}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-bold font-sans text-xs">
                  <span className={isLowStock(p.stock) ? 'text-rose-500' : 'text-slate-750'}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openOfferModal(p)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        p.old_price && p.old_price > p.price
                          ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                          : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50'
                      }`}
                      title={isRtl ? 'إضافة عرض' : 'Add Offer'}
                    >
                      <Percent size={14} />
                    </button>
                    <button
                      onClick={() => openEditProduct(p)}
                      className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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

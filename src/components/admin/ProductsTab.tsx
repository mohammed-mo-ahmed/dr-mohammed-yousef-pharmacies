'use client';

import { Plus, Edit2, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { Product } from '@/types';

interface ProductsTabProps {
  products: Product[];
  isRtl: boolean;
  t: (key: string) => string;
  common: (key: string) => string;
  openAddProduct: () => void;
  openEditProduct: (prod: Product) => void;
  handleDeleteProduct: (id: string) => void;
}

const isLowStock = (stock: number) => stock <= 10;

export default function ProductsTab({ products, isRtl, t, common, openAddProduct, openEditProduct, handleDeleteProduct }: ProductsTabProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-800 text-base">
          {isRtl ? 'قائمة المنتجات المتاحة' : 'Available Products Catalog'}
        </h3>
        <button
          onClick={openAddProduct}
          className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-50 transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>{t('products.add')}</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right text-slate-650">
          <thead className="text-xs text-slate-400 uppercase bg-slate-50">
            <tr>
              <th className="px-6 py-3">{common('name')}</th>
              <th className="px-6 py-3">{t('products.fields.category')}</th>
              <th className="px-6 py-3">{common('price')}</th>
              <th className="px-6 py-3">{t('products.fields.stock')}</th>
              <th className="px-6 py-3">{common('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl relative overflow-hidden flex-shrink-0">
                    <Image
                      src={p.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=60'}
                      alt={p.name_en}
                      fill
                      sizes="40px"
                      className="object-contain p-1"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">{isRtl ? p.name_ar : p.name_en}</div>
                    <div className="text-slate-400 text-xs truncate max-w-xs">{isRtl ? p.description_ar : p.description_en}</div>
                  </div>
                </td>
                <td className="px-6 py-4 font-semibold text-slate-700">
                  {p.category ? (isRtl ? p.category.name_ar : p.category.name_en) : ''}
                </td>
                <td className="px-6 py-4 font-bold text-slate-900 font-sans">
                  {p.price.toFixed(2)} {common('currency')}
                </td>
                <td className="px-6 py-4 font-bold font-sans">
                  <span className={isLowStock(p.stock) ? 'text-rose-500' : 'text-slate-750'}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditProduct(p)}
                      className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

'use client';

import { AlertTriangle, PackageCheck } from 'lucide-react';
import { Product } from '@/types';

interface InventoryTabProps {
  products: Product[];
  isRtl: boolean;
  t: (key: string) => string;
  common: (key: string) => string;
  handleUpdateStockInline: (id: string, newStock: number) => void;
}

const isLowStock = (stock: number) => stock <= 10;

export default function InventoryTab({ products, isRtl, t, common, handleUpdateStockInline }: InventoryTabProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-6 animate-fadeIn">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right text-slate-650">
          <thead className="text-xs text-slate-400 uppercase bg-slate-50">
            <tr>
              <th className="px-6 py-3">{common('name')}</th>
              <th className="px-6 py-3">{t('products.fields.stock')}</th>
              <th className="px-6 py-3">{isRtl ? 'تعديل المخزون' : 'Manage Stock'}</th>
              <th className="px-6 py-3">{isRtl ? 'الحالة' : 'Status'}</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="px-6 py-4 font-bold text-slate-800">
                  {isRtl ? p.name_ar : p.name_en}
                </td>
                <td className="px-6 py-4 font-bold font-sans text-base">
                  <span className={isLowStock(p.stock) ? 'text-rose-500 animate-pulse' : 'text-slate-850'}>
                    {p.stock}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      defaultValue={p.stock}
                      onBlur={(e) => handleUpdateStockInline(p.id, Number(e.target.value))}
                      className="w-20 p-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white text-center font-sans text-sm font-bold"
                    />
                    <span className="text-[10px] text-slate-400">
                      {isRtl ? '(اضغط خارج الحقل للحفظ)' : '(Blur to Save)'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {isLowStock(p.stock) ? (
                    <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-xs font-bold rounded-lg flex items-center gap-1 w-max">
                      <AlertTriangle size={12} />
                      <span>{isRtl ? 'مخزون منخفض' : 'Low Stock'}</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg flex items-center gap-1 w-max">
                      <PackageCheck size={12} />
                      <span>{isRtl ? 'مستقر' : 'Stable'}</span>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

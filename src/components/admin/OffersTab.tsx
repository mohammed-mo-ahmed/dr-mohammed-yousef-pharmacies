'use client';

import { Plus, Edit2, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { Offer } from '@/types';

interface OffersTabProps {
  offers: Offer[];
  isRtl: boolean;
  common: (key: string) => string;
  openAddOffer: () => void;
  openEditOffer: (offer: Offer) => void;
  handleDeleteOffer: (id: string) => void;
}

export default function OffersTab({ offers, isRtl, common, openAddOffer, openEditOffer, handleDeleteOffer }: OffersTabProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-800 text-base">
          {isRtl ? 'العروض النشطة' : 'Active Offers Banner List'}
        </h3>
        <button
          onClick={openAddOffer}
          className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>{isRtl ? 'إضافة عرض جديد' : 'Create Offer'}</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right text-slate-650">
          <thead className="text-xs text-slate-400 uppercase bg-slate-50">
            <tr>
              <th className="px-6 py-3">{common('name')}</th>
              <th className="px-6 py-3">{isRtl ? 'نسبة الخصم' : 'Discount Percentage'}</th>
              <th className="px-6 py-3">{common('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((o) => (
              <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="w-12 h-8 bg-slate-50 border border-slate-100 rounded-lg relative overflow-hidden flex-shrink-0">
                    <Image
                      src={o.image_url || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=60'}
                      alt={o.title_en}
                      fill
                      sizes="50px"
                      className="object-cover"
                    />
                  </div>
                  <span className="font-bold text-slate-850">{isRtl ? o.title_ar : o.title_en}</span>
                </td>
                <td className="px-6 py-4 font-bold text-rose-600 font-sans">
                  {o.discount_percentage}%
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditOffer(o)}
                      className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteOffer(o.id)}
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

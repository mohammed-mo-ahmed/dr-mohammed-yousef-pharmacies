'use client';

import { Trash2 } from 'lucide-react';
import { Order } from '@/types';

interface OrdersTabProps {
  orders: Order[];
  isRtl: boolean;
  t: (key: string) => string;
  common: (key: string) => string;
  handleUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  handleDeleteOrder: (id: string) => void;
}

export default function OrdersTab({ orders, isRtl, t, common, handleUpdateOrderStatus, handleDeleteOrder }: OrdersTabProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-6 animate-fadeIn">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right text-slate-650">
          <thead className="text-xs text-slate-400 uppercase bg-slate-50">
            <tr>
              <th className="px-6 py-3">{t('orders.customer')}</th>
              <th className="px-6 py-3">{isRtl ? 'طريقة الاستلام' : 'Delivery Method'}</th>
              <th className="px-6 py-3">{t('orders.items')}</th>
              <th className="px-6 py-3">{common('price')}</th>
              <th className="px-6 py-3">{t('orders.status')}</th>
              <th className="px-6 py-3">{common('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-850">{o.customer_name}</div>
                  <div className="text-xs text-slate-400 font-sans" dir="ltr">{o.customer_phone}</div>
                  <div className="text-[10px] text-slate-500 mt-1 max-w-xs">{o.customer_address}</div>
                </td>
                <td className="px-6 py-4 font-semibold text-xs">
                  {o.delivery_method === 'home_delivery' ? (isRtl ? 'توصيل للمنزل' : 'Home Delivery') : (isRtl ? 'استلام من الصيدلية' : 'Pickup')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1 text-xs">
                    {o.order_items?.map((item, idx) => (
                      <div key={idx} className="font-semibold text-slate-700">
                        • {isRtl ? item.product?.name_ar : item.product?.name_en} ({item.quantity} ×)
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 font-bold text-slate-900 font-sans">
                  {o.total.toFixed(2)} {common('currency')}
                </td>
                <td className="px-6 py-4">
                  <select
                    value={o.status}
                    onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as Order['status'])}
                    className={`p-1.5 text-xs font-bold rounded-xl focus:outline-none border ${
                      o.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      o.status === 'shipped' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                      o.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-250' : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    <option value="pending">{t('orders.statusPending')}</option>
                    <option value="shipped">{t('orders.statusShipped')}</option>
                    <option value="delivered">{t('orders.statusDelivered')}</option>
                    <option value="cancelled">{t('orders.statusCancelled')}</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleDeleteOrder(o.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

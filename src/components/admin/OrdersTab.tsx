'use client';

import { Trash2, CheckCircle, DollarSign } from 'lucide-react';
import { Order, OrderStatus } from '@/types';

interface OrdersTabProps {
  orders: Order[];
  isRtl: boolean;
  t: (key: string) => string;
  common: (key: string) => string;
  handleUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  handleDeleteOrder: (id: string) => void;
  handleConfirmPayment?: (orderId: string) => void;
  handleApproveOrder?: (orderId: string) => void;
}

const statusStyles: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700 border-gray-200',
  under_review: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-teal-50 text-teal-700 border-teal-200',
  awaiting_payment: 'bg-blue-50 text-blue-700 border-blue-200',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  processing: 'bg-purple-50 text-purple-700 border-purple-200',
  ready_for_pickup: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  out_for_delivery: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  delivered: 'bg-green-100 text-green-700 border-green-300',
  shipped: 'bg-sky-100 text-sky-700 border-sky-200',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
};

const paymentMethodLabels: Record<string, { ar: string; en: string }> = {
  online: { ar: 'أونلاين', en: 'Online' },
  cod: { ar: 'عند الاستلام', en: 'Cash on Delivery' },
  pickup: { ar: 'عند الاستلام', en: 'Pay at Pickup' },
};

export default function OrdersTab({
  orders,
  isRtl,
  t,
  common,
  handleUpdateOrderStatus,
  handleDeleteOrder,
  handleConfirmPayment,
  handleApproveOrder,
}: OrdersTabProps) {
  const statusOptions: { value: OrderStatus; labelKey: string }[] = [
    { value: 'pending', labelKey: 'statusPending' },
    { value: 'under_review', labelKey: 'statusUnderReview' },
    { value: 'approved', labelKey: 'statusApproved' },
    { value: 'awaiting_payment', labelKey: 'statusAwaitingPayment' },
    { value: 'paid', labelKey: 'statusPaid' },
    { value: 'processing', labelKey: 'statusProcessing' },
    { value: 'ready_for_pickup', labelKey: 'statusReadyForPickup' },
    { value: 'out_for_delivery', labelKey: 'statusOutForDelivery' },
    { value: 'delivered', labelKey: 'statusDelivered' },
    { value: 'cancelled', labelKey: 'statusCancelled' },
  ];

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-6 animate-fadeIn">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right text-slate-650">
          <thead className="text-xs text-slate-400 uppercase bg-slate-50">
            <tr>
              <th className="px-6 py-3">{t('orders.customer')}</th>
              <th className="px-6 py-3">{isRtl ? 'طريقة الاستلام' : 'Delivery Method'}</th>
              <th className="px-6 py-3">{t('orders.paymentMethod')}</th>
              <th className="px-6 py-3">{t('orders.items')}</th>
              <th className="px-6 py-3">{common('price')}</th>
              <th className="px-6 py-3">{t('orders.status')}</th>
              <th className="px-6 py-3">{common('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const payMethod = o.payment_method || 'cod';
              const payLabel = paymentMethodLabels[payMethod];
              return (
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
                  <span className="text-xs font-bold">
                    {isRtl ? payLabel.ar : payLabel.en}
                  </span>
                  {o.payment_status === 'paid' && (
                    <span className="ml-1.5 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[9px] font-bold">
                      {isRtl ? 'مدفوع' : 'Paid'}
                    </span>
                  )}
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
                  <div className="flex flex-col gap-1.5">
                    <select
                      value={o.status}
                      onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value as OrderStatus)}
                      className={`p-1.5 text-xs font-bold rounded-xl focus:outline-none border ${statusStyles[o.status] || 'border-slate-200'}`}
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {t(`orders.${opt.labelKey}`)}
                        </option>
                      ))}
                    </select>
                    
                    {/* Quick action buttons */}
                    <div className="flex gap-1">
                      {o.status === 'under_review' && handleApproveOrder && (
                        <button
                          onClick={() => handleApproveOrder(o.id)}
                          className="flex items-center gap-1 px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-[10px] font-bold transition-colors"
                          title={t('orders.approveOrder')}
                        >
                          <CheckCircle size={10} />
                          <span>{isRtl ? 'قبول' : 'Approve'}</span>
                        </button>
                      )}
                      {o.status === 'awaiting_payment' && handleConfirmPayment && (
                        <button
                          onClick={() => handleConfirmPayment(o.id)}
                          className="flex items-center gap-1 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold transition-colors"
                          title={t('orders.confirmPayment')}
                        >
                          <DollarSign size={10} />
                          <span>{isRtl ? 'تأكيد الدفع' : 'Confirm Payment'}</span>
                        </button>
                      )}
                    </div>
                  </div>
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

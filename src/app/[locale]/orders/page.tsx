'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/context/AuthContext';
import { getOrdersByUser } from '@/lib/api';
import { Order } from '@/types';
import { Package, ChevronDown, ChevronUp, Truck, Store, CheckCircle, Circle } from 'lucide-react';

const statusColors: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-700',
  under_review: 'bg-amber-100 text-amber-700',
  approved: 'bg-teal-100 text-teal-700',
  awaiting_payment: 'bg-blue-100 text-blue-700',
  paid: 'bg-emerald-100 text-emerald-700',
  processing: 'bg-purple-100 text-purple-700',
  ready_for_pickup: 'bg-cyan-100 text-cyan-700',
  out_for_delivery: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  shipped: 'bg-sky-100 text-sky-700',
  cancelled: 'bg-rose-100 text-rose-700',
};

const statusTimeline: string[] = [
  'pending',
  'under_review',
  'approved',
  'awaiting_payment',
  'paid',
  'processing',
  'ready_for_pickup',
  'out_for_delivery',
  'delivered',
];

const paymentMethodLabels: Record<string, { ar: string; en: string }> = {
  online: { ar: 'أونلاين', en: 'Online' },
  cod: { ar: 'الدفع عند الاستلام', en: 'Cash on Delivery' },
  pickup: { ar: 'الدفع عند الاستلام', en: 'Pay at Pickup' },
};

export default function OrdersPage() {
  const locale = useLocale();
  const router = useRouter();
  const isRtl = locale === 'ar';
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const t = (key: string) => {
    const translations: Record<string, string> = {
      title: isRtl ? 'طلباتي' : 'My Orders',
      empty: isRtl ? 'لا توجد طلبات سابقة.' : 'No orders yet.',
      orderNumber: isRtl ? 'رقم الطلب' : 'Order #',
      date: isRtl ? 'التاريخ' : 'Date',
      status: isRtl ? 'الحالة' : 'Status',
      total: isRtl ? 'الإجمالي' : 'Total',
      items: isRtl ? 'المنتجات' : 'Items',
      pending: isRtl ? 'تم الإرسال' : 'Sent',
      under_review: isRtl ? 'قيد المراجعة' : 'Under Review',
      approved: isRtl ? 'تم القبول' : 'Approved',
      awaiting_payment: isRtl ? 'بانتظار الدفع' : 'Awaiting Payment',
      paid: isRtl ? 'تم الدفع' : 'Paid',
      processing: isRtl ? 'جاري التجهيز' : 'Processing',
      ready_for_pickup: isRtl ? 'جاهز للاستلام' : 'Ready for Pickup',
      out_for_delivery: isRtl ? 'خرج للتوصيل' : 'Out for Delivery',
      delivered: isRtl ? 'تم التسليم' : 'Delivered',
      cancelled: isRtl ? 'ملغي' : 'Cancelled',
      homeDelivery: isRtl ? 'توصيل للمنزل' : 'Home Delivery',
      pharmacyPickup: isRtl ? 'استلام من الصيدلية' : 'Pharmacy Pickup',
      paymentMethod: isRtl ? 'طريقة الدفع' : 'Payment Method',
      online: isRtl ? 'أونلاين' : 'Online',
      cod: isRtl ? 'الدفع عند الاستلام' : 'Cash on Delivery',
      pickup: isRtl ? 'الدفع عند الاستلام' : 'Pay at Pickup',
    };
    return translations[key] || key;
  };

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/orders');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      getOrdersByUser(user.id).then((data) => {
        setOrders(data);
        setLoading(false);
      });
    }
  }, [user]);

  const formatDate = (date?: string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTimelineStatus = (currentStatus: string) => {
    if (currentStatus === 'cancelled') return null;
    const idx = statusTimeline.indexOf(currentStatus);
    if (idx === -1) return null;
    return { currentIndex: idx, totalSteps: statusTimeline.length };
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 font-cairo">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 flex items-center gap-3">
          <Package size={28} className="text-teal-600" />
          {t('title')}
        </h1>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-slate-100 text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Package size={32} />
          </div>
          <h2 className="text-lg font-bold text-slate-600 mb-2">{t('empty')}</h2>
          <button
            onClick={() => router.push('/products')}
            className="mt-4 px-6 py-2.5 bg-teal-600 text-white rounded-xl font-bold shadow-md hover:bg-teal-700 transition-all"
          >
            {isRtl ? 'تصفح المنتجات' : 'Browse Products'}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const timeline = !order.status.includes('cancell') ? getTimelineStatus(order.status) : null;
            return (
            <div key={order.id} className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
              {/* Order Header */}
              <div
                onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                className="flex items-center justify-between p-4 md:p-5 cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                  <div>
                    <p className="text-xs text-slate-400">{t('orderNumber')}</p>
                    <p className="text-sm font-bold text-slate-800 font-mono">{order.id.slice(0, 8)}...</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">{t('date')}</p>
                    <p className="text-sm font-semibold text-slate-700">{formatDate(order.created_at)}</p>
                  </div>
                  <div>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                      {t(order.status)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-left">
                    <p className="text-xs text-slate-400">{t('total')}</p>
                    <p className="text-base font-black text-teal-600 font-sans">{order.total.toFixed(2)}</p>
                  </div>
                  {expandedId === order.id ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                </div>
              </div>

              {/* Order Details (expandable) */}
              {expandedId === order.id && (
                <div className="border-t border-slate-100 p-4 md:p-5 bg-slate-50/50">
                  {/* Delivery method */}
                  <div className="flex items-center gap-2 mb-3 text-xs text-slate-500">
                    {order.delivery_method === 'home_delivery' ? <Truck size={14} /> : <Store size={14} />}
                    <span>{order.delivery_method === 'home_delivery' ? t('homeDelivery') : t('pharmacyPickup')}</span>
                  </div>

                  {/* Payment method */}
                  <div className="text-xs text-slate-500 mb-4">
                    <span className="font-semibold">{t('paymentMethod')}: </span>
                    {isRtl
                      ? (paymentMethodLabels[order.payment_method || 'cod']?.ar || t('cod'))
                      : (paymentMethodLabels[order.payment_method || 'cod']?.en || t('cod'))}
                  </div>

                  {/* Timeline */}
                  {timeline && (
                    <div className="mb-6">
                      <div className="flex items-center gap-0">
                        {statusTimeline.map((s, i) => {
                          const isActive = i <= timeline.currentIndex;
                          const isLast = i === statusTimeline.length - 1;
                          return (
                            <div key={s} className="flex items-center flex-1">
                              <div className={`flex flex-col items-center ${isLast ? '' : 'flex-1'}`}>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                  isActive ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-400'
                                }`}>
                                  {isActive ? <CheckCircle size={14} /> : <Circle size={14} />}
                                </div>
                                <span className={`text-[8px] mt-1 text-center leading-tight ${
                                  isActive ? 'text-teal-600 font-bold' : 'text-slate-400'
                                }`}>
                                  {t(s)}
                                </span>
                              </div>
                              {!isLast && (
                                <div className={`h-0.5 flex-1 mt-[-16px] ${
                                  i < timeline.currentIndex ? 'bg-teal-600' : 'bg-slate-200'
                                }`} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Items */}
                  <div className="flex flex-col gap-3">
                    {order.order_items?.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-[10px] font-bold">
                            {item.quantity}
                          </span>
                          <span className="text-slate-700 font-semibold">
                            {isRtl ? item.product?.name_ar : item.product?.name_en}
                          </span>
                        </div>
                        <span className="font-bold text-slate-600 font-sans">
                          {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

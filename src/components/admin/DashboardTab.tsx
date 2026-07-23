'use client';

import { ShoppingBag, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import { Order, Customer, Product } from '@/types';

type TabType = 'dashboard' | 'products' | 'categories' | 'orders' | 'customers' | 'inventory' | 'offers';

interface DashboardTabProps {
  orders: Order[];
  customers: Customer[];
  products: Product[];
  isRtl: boolean;
  t: (key: string) => string;
  common: (key: string) => string;
  locale: string;
  setActiveTab: (tab: TabType) => void;
}

const isLowStock = (stock: number) => stock <= 10;

export default function DashboardTab({ orders, customers, products, isRtl, t, common, locale, setActiveTab }: DashboardTabProps) {
  const lowStockCount = products.filter((p) => isLowStock(p.stock)).length;
  const totalSales = orders.reduce((sum, o) => (o.status !== 'cancelled' ? sum + Number(o.total) : sum), 0);

  return (
    <div className="flex flex-col gap-8 animate-fadeIn">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold">{t('stats.totalOrders')}</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1 font-sans">{orders.length}</h3>
          </div>
          <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
            <ShoppingBag size={22} />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold">{t('stats.totalSales')}</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1 font-sans">
              {totalSales.toFixed(2)} <span className="text-xs">{common('currency')}</span>
            </h3>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <TrendingUp size={22} />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold">{t('stats.activeCustomers')}</span>
            <h3 className="text-2xl font-black text-slate-800 mt-1 font-sans">{customers.length}</h3>
          </div>
          <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center">
            <Users size={22} />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-semibold">{t('stats.lowStock')}</span>
            <h3 className={`text-2xl font-black mt-1 font-sans ${lowStockCount > 0 ? 'text-rose-500' : 'text-slate-800'}`}>
              {lowStockCount}
            </h3>
          </div>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            lowStockCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'
          }`}>
            <AlertTriangle size={22} />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-slate-850 text-base mb-4">
          {isRtl ? 'الطلبات الأخيرة قيد الانتظار' : 'Recent Pending Orders'}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right text-slate-650">
            <thead className="text-xs text-slate-400 uppercase bg-slate-50">
              <tr>
                <th className="px-6 py-3">{t('orders.customer')}</th>
                <th className="px-6 py-3">{t('orders.date')}</th>
                <th className="px-6 py-3">{common('price')}</th>
                <th className="px-6 py-3">{t('orders.status')}</th>
                <th className="px-6 py-3">{common('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((o) => (
                <tr key={o.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-bold text-slate-800">
                    <div>{o.customer_name}</div>
                    <div className="text-xs text-slate-400 font-sans" dir="ltr">{o.customer_phone}</div>
                  </td>
                  <td className="px-6 py-4 font-sans text-xs">
                    {o.created_at ? new Date(o.created_at).toLocaleDateString(locale) : ''}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900 font-sans">
                    {o.total.toFixed(2)} {common('currency')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      o.status === 'pending' ? 'bg-gray-100 text-gray-700' :
                      o.status === 'under_review' ? 'bg-amber-50 text-amber-700' :
                      o.status === 'approved' ? 'bg-teal-50 text-teal-700' :
                      o.status === 'awaiting_payment' ? 'bg-blue-50 text-blue-700' :
                      o.status === 'paid' ? 'bg-emerald-50 text-emerald-700' :
                      o.status === 'processing' ? 'bg-purple-50 text-purple-700' :
                      o.status === 'ready_for_pickup' ? 'bg-cyan-50 text-cyan-700' :
                      o.status === 'out_for_delivery' ? 'bg-indigo-50 text-indigo-700' :
                      o.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      o.status === 'shipped' ? 'bg-sky-100 text-sky-700' :
                      o.status === 'cancelled' ? 'bg-rose-50 text-rose-700' : 'bg-slate-50 text-slate-500'
                    }`}>
                      {t(`orders.status${o.status.split('_').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join('')}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-bold text-teal-600 hover:underline"
                    >
                      {isRtl ? 'تفاصيل وإدارة' : 'Manage'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

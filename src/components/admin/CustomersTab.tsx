'use client';

import { Customer } from '@/types';

interface CustomersTabProps {
  customers: Customer[];
  isRtl: boolean;
  locale: string;
  common: (key: string) => string;
}

export default function CustomersTab({ customers, isRtl, locale, common }: CustomersTabProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-6 animate-fadeIn">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right text-slate-650">
          <thead className="text-xs text-slate-400 uppercase bg-slate-50">
            <tr>
              <th className="px-6 py-3">{common('name')}</th>
              <th className="px-6 py-3">{isRtl ? 'الهاتف' : 'Phone'}</th>
              <th className="px-6 py-3">{isRtl ? 'العنوان' : 'Address'}</th>
              <th className="px-6 py-3">{isRtl ? 'تاريخ التسجيل' : 'Registered Date'}</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="px-6 py-4 font-bold text-slate-800">{c.name}</td>
                <td className="px-6 py-4 font-semibold text-slate-700 font-sans" dir="ltr">{c.phone}</td>
                <td className="px-6 py-4 text-xs max-w-sm">{c.address || '-'}</td>
                <td className="px-6 py-4 font-sans text-xs">
                  {c.created_at ? new Date(c.created_at).toLocaleDateString(locale) : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

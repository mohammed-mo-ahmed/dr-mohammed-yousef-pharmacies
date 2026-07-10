'use client';

import {
  LayoutDashboard,
  Pill,
  Folders,
  ShoppingBag,
  Users,
  Warehouse,
  Percent,
  LogOut,
} from 'lucide-react';

type TabType = 'dashboard' | 'products' | 'categories' | 'orders' | 'customers' | 'inventory' | 'offers';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isRtl: boolean;
  t: (key: string) => string;
  common: (key: string) => string;
  handleLogout: () => void;
  userEmail: string;
}

export default function Sidebar({ activeTab, setActiveTab, isRtl, t, common, handleLogout, userEmail }: SidebarProps) {
  const tabs: { key: TabType; icon: React.ReactNode; label: string }[] = [
    { key: 'dashboard', icon: <LayoutDashboard size={18} />, label: t('nav.home') },
    { key: 'products', icon: <Pill size={18} />, label: t('nav.products') },
    { key: 'categories', icon: <Folders size={18} />, label: t('nav.categories') },
    { key: 'orders', icon: <ShoppingBag size={18} />, label: t('nav.orders') },
    { key: 'customers', icon: <Users size={18} />, label: t('nav.customers') },
    { key: 'inventory', icon: <Warehouse size={18} />, label: t('nav.inventory') },
    { key: 'offers', icon: <Percent size={18} />, label: t('nav.offers') },
  ];

  return (
    <aside
      className={`w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col justify-between p-6 border-b md:border-b-0 ${
        isRtl ? 'md:border-l' : 'md:border-r'
      } border-slate-800`}
    >
      <div>
        <div className="flex items-center gap-2 mb-8">
          <span className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
            Y
          </span>
          <span className="font-extrabold text-white text-base leading-none">
            {isRtl ? 'لوحة التحكم للمدير' : 'Admin Panel'}
          </span>
        </div>

        <nav className="flex flex-col gap-1.5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-end ${
                activeTab === tab.key ? 'bg-teal-600 text-white shadow-md' : 'hover:bg-slate-800'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="pt-6 border-t border-slate-800">
        <div className="text-xs text-slate-500 mb-3 truncate" title={userEmail}>
          {userEmail}
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-rose-950/20 border border-rose-950/40 hover:bg-rose-900/40 text-rose-400 rounded-xl text-sm font-bold transition-all cursor-pointer"
        >
          <LogOut size={16} />
          <span>{common('logout')}</span>
        </button>
      </div>
    </aside>
  );
}

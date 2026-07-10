'use client';

import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Category } from '@/types';

interface CategoriesTabProps {
  categories: Category[];
  isRtl: boolean;
  common: (key: string) => string;
  openAddCategory: () => void;
  openEditCategory: (cat: Category) => void;
  handleDeleteCategory: (id: string) => void;
}

export default function CategoriesTab({ categories, isRtl, common, openAddCategory, openEditCategory, handleDeleteCategory }: CategoriesTabProps) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-800 text-base">
          {isRtl ? 'فئات المنتجات' : 'Product Categories'}
        </h3>
        <button
          onClick={openAddCategory}
          className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          <Plus size={16} />
          <span>{isRtl ? 'إضافة فئة' : 'Add Category'}</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right text-slate-650">
          <thead className="text-xs text-slate-400 uppercase bg-slate-50">
            <tr>
              <th className="px-6 py-3">{isRtl ? 'الاسم بالعربية' : 'Name (Arabic)'}</th>
              <th className="px-6 py-3">{isRtl ? 'الاسم بالإنجليزية' : 'Name (English)'}</th>
              <th className="px-6 py-3">{isRtl ? 'المعرف الفريد (Slug)' : 'Slug'}</th>
              <th className="px-6 py-3">{common('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                <td className="px-6 py-4 font-bold text-slate-800">{c.name_ar}</td>
                <td className="px-6 py-4 font-semibold text-slate-850">{c.name_en}</td>
                <td className="px-6 py-4 font-sans text-xs">{c.slug}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditCategory(c)}
                      className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(c.id)}
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

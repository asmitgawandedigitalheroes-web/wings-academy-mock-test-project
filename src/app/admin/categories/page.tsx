import React from 'react'
import { getCategories } from '@/app/actions/admin'
import CategoryList from '@/components/admin/categories/CategoryList'
import { Layout } from 'lucide-react'

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#0f172a] tracking-tight">Category Management</h1>
          <p className="text-slate-500 font-medium mt-2">Organize your mock test modules into logical categories.</p>
        </div>
        <div className="bg-primary/5 px-6 py-4 rounded-3xl border border-primary/10 flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm">
            <Layout className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">Total Categories</p>
            <p className="text-2xl font-black text-[#0f172a]">{categories.length}</p>
          </div>
        </div>
      </div>

      <CategoryList initialCategories={categories} />
    </div>
  )
}

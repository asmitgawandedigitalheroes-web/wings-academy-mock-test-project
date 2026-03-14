'use client'

import React, { useState } from 'react'
import { Plus, Edit2, Trash2, Layout, Search, LayoutGrid } from 'lucide-react'
import CategoryModal from './CategoryModal'
import ConfirmationModal from '@/components/common/ConfirmationModal'
import { addCategory, updateCategory, deleteCategory } from '@/app/actions/admin_categories'

interface Category {
  id: string
  name: string
  description?: string
  icon_url?: string
  status?: string
  created_at?: string
}

interface CategoryListProps {
  initialCategories: Category[]
}

export default function CategoryList({ initialCategories }: CategoryListProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [search, setSearch] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = async (data: { name: string, description: string, icon_url: string, status: string }) => {
    setIsLoading(true)
    setMessage(null)
    const result = await addCategory(data.name, data.description, data.icon_url, data.status)
    if (result.success && result.data) {
      setCategories([...categories, result.data as Category].sort((a, b) => a.name.localeCompare(b.name)))
      setIsAddModalOpen(false)
      setMessage({ type: 'success', text: 'Category created successfully!' })
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to create category' })
    }
    setIsLoading(false)
  }

  const handleUpdate = async (data: { name: string, description: string, icon_url: string, status: string }) => {
    if (!editingCategory) return
    setIsLoading(true)
    setMessage(null)
    const result = await updateCategory(editingCategory.id, data.name, data.description, data.icon_url, data.status)
    if (result.success && result.data) {
      setCategories(categories.map(c => c.id === editingCategory.id ? result.data as Category : c).sort((a, b) => a.name.localeCompare(b.name)))
      setEditingCategory(null)
      setMessage({ type: 'success', text: 'Category updated successfully!' })
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update category' })
    }
    setIsLoading(false)
  }

  const handleDelete = async () => {
    if (!deletingCategory) return
    setIsLoading(true)
    setMessage(null)
    const result = await deleteCategory(deletingCategory.id)
    if (result.success) {
      setCategories(categories.filter(c => c.id !== deletingCategory.id))
      setDeletingCategory(null)
      setMessage({ type: 'success', text: 'Category deleted successfully!' })
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to delete category' })
    }
    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-primary/5">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border-none rounded-2xl font-bold text-sm text-[#0f172a] placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
          />
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#152e75] transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group whitespace-nowrap"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          Add Category
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl font-bold text-sm animate-in fade-in slide-in-from-top-2 duration-300 ${message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
          }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <div
            key={category.id}
            className={`group bg-white p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden flex flex-col ${
              category.status === 'Inactive' ? 'opacity-75 grayscale-[0.5] border-slate-100 shadow-none' : 'border-slate-100 shadow-xl shadow-primary/5 hover:scale-[1.01]'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  category.status === 'Inactive' ? 'bg-slate-100 text-slate-400' : 'bg-primary/5 text-primary'
                }`}>
                  <CategoryIcon name={category.icon_url || 'LayoutGrid'} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#0f172a] line-clamp-1 uppercase leading-tight">{category.name}</h3>
                  <div className={`text-[0.6rem] font-black uppercase tracking-widest ${
                    category.status === 'Inactive' ? 'text-red-400' : 'text-green-500'
                  }`}>
                    {category.status || 'Active'}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <p className="text-slate-500 text-sm font-medium line-clamp-2 min-h-[2.5rem] mb-6">
                {category.description || 'No description provided.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditingCategory(category)}
                className="flex-1 bg-slate-50 text-slate-400 p-3 rounded-xl hover:bg-primary/5 hover:text-primary transition-all flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => setDeletingCategory(category)}
                className="bg-red-50 text-red-400 p-3 rounded-xl hover:bg-red-100 hover:text-red-500 transition-all"
                title="Delete Category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {filteredCategories.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-primary/5">
            <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Layout className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-[#0f172a]">
              No Categories Found
            </h3>
            <p className="text-slate-500 font-medium">
              Start by adding your first module category.
            </p>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <CategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onConfirm={handleCreate}
        title="Create New Category"
        isLoading={isLoading}
      />

      {/* Edit Modal */}
      <CategoryModal
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        onConfirm={handleUpdate}
        initialData={editingCategory ? {
          name: editingCategory.name,
          description: editingCategory.description || '',
          icon_url: editingCategory.icon_url || 'LayoutGrid',
          status: editingCategory.status || 'Active'
        } : undefined}
        title="Edit Category"
        isLoading={isLoading}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={!!deletingCategory}
        title="Delete Category"
        message={`Are you sure you want to delete "${deletingCategory?.name}"? This action cannot be undone.`}
        type="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeletingCategory(null)}
        isLoading={isLoading}
      />
    </div>
  )
}

function CategoryIcon({ name }: { name: string }) {
  const icons: Record<string, any> = {
    'LayoutGrid': require('lucide-react').LayoutGrid,
    'Layers': require('lucide-react').Layers,
    'Box': require('lucide-react').Box,
    'Package': require('lucide-react').Package,
    'Settings': require('lucide-react').Settings,
    'Book': require('lucide-react').Book,
    'Zap': require('lucide-react').Zap,
    'Award': require('lucide-react').Award,
  }

  const Icon = icons[name] || icons['LayoutGrid']
  return <Icon className="w-6 h-6" />
}

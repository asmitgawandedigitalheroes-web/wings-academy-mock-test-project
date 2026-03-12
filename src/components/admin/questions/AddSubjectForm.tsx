'use client'

import React, { useState } from 'react'
import { X, Layers } from 'lucide-react'
import { addSubject } from '@/app/actions/admin'
import ConfirmationModal from '@/components/common/ConfirmationModal'

interface SubjectFormProps {
  categories: { id: string, name: string }[]
  onSuccess: () => void
  onCancel: () => void
}

export default function AddSubjectForm({ categories, onSuccess, onCancel }: SubjectFormProps) {
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [loading, setLoading] = useState(false)
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: 'danger' | 'info' | 'prompt'
    confirmLabel: string
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    confirmLabel: 'Confirm',
    onConfirm: () => {}
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const result = await addSubject({ name, categoryId })
    
    setLoading(false)
    if (result.success) {
        onSuccess()
    } else {
      setModalConfig({
        isOpen: true,
        title: 'Error Creating Subject',
        message: result.error || 'Please check your inputs and try again.',
        type: 'danger',
        confirmLabel: 'Close',
        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
      })
    }
  }

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl space-y-6 max-w-md w-full">
      <ConfirmationModal 
        {...modalConfig}
        onCancel={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
      />

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-[#0f172a] flex items-center gap-3">
            <Layers className="w-6 h-6 text-primary" />
            Add New Subject
        </h2>
        <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <X className="w-6 h-6 text-slate-400" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Exam Category</label>
          <select 
            required
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-[#0f172a]"
          >
            <option value="">Select Category...</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mb-2.5 ml-1">Subject Name</label>
          <input 
            required
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-[#0f172a]"
            placeholder="e.g. Module 3: Electrical Fundamentals"
          />
        </div>

        <div className="flex gap-4 pt-2">
          <button 
            type="button"
            onClick={onCancel}
            className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all font-bold"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={loading}
            className="flex-2 py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Subject'}
          </button>
        </div>
      </form>
    </div>
  )
}

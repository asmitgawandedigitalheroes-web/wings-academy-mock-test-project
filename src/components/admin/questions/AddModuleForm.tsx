'use client'

import React, { useState } from 'react'
import { X, Layers } from 'lucide-react'
import { addModule } from '@/app/actions/admin'
import ConfirmationModal from '@/components/common/ConfirmationModal'

interface ModuleFormProps {
  categories: { id: string, name: string }[]
  onSuccess: () => void
  onCancel: () => void
}

export default function AddModuleForm({ categories, onSuccess, onCancel }: ModuleFormProps) {
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [moduleCode, setModuleCode] = useState('')
  const [description, setDescription] = useState('')
  const [freeLimit, setFreeLimit] = useState(2)
  const [paidLimit, setPaidLimit] = useState(3)
  const [status, setStatus] = useState('Active')
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
    onConfirm: () => { }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const result = await addModule({ 
      name, 
      categoryId,
      module_code: moduleCode,
      description,
      free_test_limit: freeLimit,
      paid_test_limit: paidLimit,
      status
    })

    setLoading(false)
    if (result.success) {
      onSuccess()
    } else {
      setModalConfig({
        isOpen: true,
        title: 'Error Creating Module',
        message: result.error || 'Please check your inputs and try again.',
        type: 'danger',
        confirmLabel: 'Close',
        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
      })
    }
  }

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl space-y-6 max-w-lg w-full overflow-y-auto max-h-[90vh]">
      <ConfirmationModal
        {...modalConfig}
        onCancel={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
      />

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-[#0f172a] flex items-center gap-3">
          <Layers className="w-6 h-6 text-primary" />
          Add New Module
        </h2>
        <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <X className="w-6 h-6 text-slate-400" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1">Module Category</label>
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

          <div className="space-y-2">
            <label className="block text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1">Module Code</label>
            <input
              type="text"
              value={moduleCode}
              onChange={(e) => setModuleCode(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-[#0f172a]"
              placeholder="e.g. ELEC-101"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1">Module Name</label>
          <input
            required
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-[#0f172a]"
            placeholder="e.g. Electrical Fundamentals"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1">Module Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-[#0f172a] resize-none"
            placeholder="Enter module description..."
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1">Free Test Limit</label>
            <input
              type="number"
              min="0"
              value={freeLimit}
              onChange={(e) => setFreeLimit(parseInt(e.target.value) || 0)}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-[#0f172a]"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1">Paid Test Limit</label>
            <input
              type="number"
              min="0"
              value={paidLimit}
              onChange={(e) => setPaidLimit(parseInt(e.target.value) || 0)}
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-[#0f172a]"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
          <div className="flex bg-slate-50 rounded-2xl p-1.5 border border-slate-200">
            <button
              type="button"
              onClick={() => setStatus('Active')}
              className={`flex-1 py-3.5 rounded-xl text-[0.65rem] font-black uppercase tracking-widest transition-all ${
                status === 'Active' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setStatus('Inactive')}
              className={`flex-1 py-3.5 rounded-xl text-[0.65rem] font-black uppercase tracking-widest transition-all ${
                status === 'Inactive' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Inactive
            </button>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-2 py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Module'}
          </button>
        </div>
      </form>
    </div>
  )
}

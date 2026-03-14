'use client'

import React, { useState, useEffect } from 'react'
import { X, Plus, Edit2, Layout } from 'lucide-react'

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (data: { name: string, description: string, icon_url: string, status: string }) => Promise<void>
  initialData?: {
    name: string
    description: string
    icon_url: string
    status: string
  }
  title: string
  isLoading?: boolean
}

export default function CategoryModal({
  isOpen,
  onClose,
  onConfirm,
  initialData,
  title,
  isLoading = false
}: CategoryModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('LayoutGrid')
  const [status, setStatus] = useState('Active')

  useEffect(() => {
    if (isOpen && initialData) {
      setName(initialData.name)
      setDescription(initialData.description || '')
      setIcon(initialData.icon_url || 'LayoutGrid')
      setStatus(initialData.status || 'Active')
    } else if (isOpen) {
      setName('')
      setDescription('')
      setIcon('LayoutGrid')
      setStatus('Active')
    }
  }, [isOpen, initialData])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    await onConfirm({
      name: name.trim(),
      description: description.trim(),
      icon_url: icon,
      status
    })
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div 
        className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 pb-0 flex justify-between items-start">
          <div className="p-4 rounded-2xl bg-primary/5">
            <Layout className="w-6 h-6 text-primary" />
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-8">
          <h3 className="text-2xl font-black text-[#0f172a] mb-6">{title}</h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1">
                Category Name
              </label>
              <input 
                type="text"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-black text-[#0f172a] focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                placeholder="e.g. Aircraft Maintenance"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1">
                Category Description
              </label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-[#0f172a] focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all resize-none"
                placeholder="Briefly describe what this category includes..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Category Icon
                </label>
                <select 
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-black text-[#0f172a] focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="LayoutGrid">Layout Grid</option>
                  <option value="Layers">Layers</option>
                  <option value="Box">Box</option>
                  <option value="Package">Package</option>
                  <option value="Settings">Settings</option>
                  <option value="Book">Book</option>
                  <option value="Zap">Zap</option>
                  <option value="Award">Award</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Status
                </label>
                <div className="flex bg-slate-50 rounded-2xl p-1.5 border border-slate-100">
                  <button
                    type="button"
                    onClick={() => setStatus('Active')}
                    className={`flex-1 py-2.5 rounded-xl text-[0.65rem] font-black uppercase tracking-widest transition-all ${
                      status === 'Active' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('Inactive')}
                    className={`flex-1 py-2.5 rounded-xl text-[0.65rem] font-black uppercase tracking-widest transition-all ${
                      status === 'Inactive' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    Inactive
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <button 
                type="button"
                onClick={onClose}
                className="py-4 bg-slate-50 text-slate-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isLoading || !name.trim()}
                className="py-4 bg-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#152e75] transition-all shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  initialData ? 'Update' : 'Create'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

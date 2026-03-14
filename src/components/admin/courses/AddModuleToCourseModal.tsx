'use client'

import React, { useState, useEffect } from 'react'
import { X, Search, Plus, Layers } from 'lucide-react'
import { getModulesWithCategories, addModuleToCourse } from '@/app/actions/admin'

interface AddModuleToCourseModalProps {
  courseId: string
  attachedModuleIds: string[]
  onCancel: () => void
  onSuccess: () => void
}

export default function AddModuleToCourseModal({ courseId, attachedModuleIds, onCancel, onSuccess }: AddModuleToCourseModalProps) {
  const [modules, setModules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [addingId, setAddingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function loadModules() {
      setLoading(true)
      const allModules = await getModulesWithCategories()
      // Filter out modules that are already attached to this course
      const available = allModules.filter((sub: any) => !attachedModuleIds.includes(sub.id))
      setModules(available)
      setLoading(false)
    }
    loadModules()
  }, [attachedModuleIds])

  const handleAdd = async (moduleId: string) => {
    setAddingId(moduleId)
    await addModuleToCourse(courseId, moduleId)
    setAddingId(null)
    onSuccess() // We can close the modal, or maybe let them keep adding. Let's close it on success for simplicity, or just refresh the list.
    // Actually, maybe we only want to close it if they hit "Done". Let's update the list locally for continuous adding.
  }

  const filteredModules = modules.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (s.categories?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-2xl shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] flex flex-col">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h2 className="text-2xl font-black text-[#0f172a] tracking-tight">Add Module to Course</h2>
          <p className="text-slate-500 text-sm font-medium mt-1">Select from existing modules.</p>
        </div>
        <button 
          onClick={onCancel}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors shrink-0"
        >
          <X className="w-6 h-6 text-slate-400" />
        </button>
      </div>

      <div className="relative mb-6 shrink-0">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input 
          type="text"
          placeholder="Search modules..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold"
        />
      </div>

      <div className="flex-1 overflow-y-auto min-h-[300px] pr-2 space-y-3 custom-scrollbar">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="font-bold text-slate-400 text-sm">Loading available modules...</p>
          </div>
        ) : filteredModules.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
              <Layers className="w-8 h-8 text-slate-300" />
            </div>
            <p className="font-bold text-slate-500">No modules available to add.</p>
          </div>
        ) : (
          filteredModules.map(module => (
            <div key={module.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl hover:border-primary/30 transition-colors bg-white group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary/5 transition-colors">
                  <Layers className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <h3 className="font-black text-[#0f172a]">{module.name}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">{module.categories?.name || 'Uncategorized'}</p>
                </div>
              </div>
              <button
                onClick={() => handleAdd(module.id)}
                disabled={addingId === module.id}
                className="flex items-center gap-2 bg-slate-50 text-primary px-4 py-2 rounded-xl font-bold hover:bg-primary hover:text-white transition-all disabled:opacity-50"
              >
                {addingId === module.id ? (
                  <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Add
              </button>
            </div>
          ))
        )}
      </div>

      <div className="pt-6 shrink-0 border-t border-slate-100 mt-6">
        <button 
          onClick={onCancel}
          className="w-full py-4 bg-slate-100 text-[#0f172a] rounded-2xl font-black hover:bg-slate-200 transition-all shadow-sm"
        >
          Done
        </button>
      </div>
    </div>
  )
}

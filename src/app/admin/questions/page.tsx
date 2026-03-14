'use client'

import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Layers, 
  ChevronRight,
  BookOpen,
  HelpCircle,
  MoreVertical,
  FileText,
  Settings,
  Eye,
  EyeOff,
  Trash2
} from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { getStats, getCategories, getModulesWithCategories, deleteModule, toggleModuleStatus } from '@/app/actions/admin'
import AddModuleForm from '@/components/admin/questions/AddModuleForm'
import AddQuestionForm from '@/components/admin/questions/AddQuestionForm'
import ConfirmationModal from '@/components/common/ConfirmationModal'

export default function ModuleManager() {
  const [showModuleForm, setShowModuleForm] = useState(false)
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [modules, setModules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [moduleToDelete, setModuleToDelete] = useState<any | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  const fetchData = async () => {
    setLoading(true)
    const [c, mods] = await Promise.all([
      getCategories(),
      getModulesWithCategories()
    ])
    setCategories(c)
    setModules(mods)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggleStatus = async (module: any) => {
    const res = await toggleModuleStatus(module.id, module.status || 'enabled')
    if (res.success) {
      fetchData()
    } else {
      alert(res.error || 'Failed to update module status')
    }
  }

  const handleDelete = async () => {
    if (!moduleToDelete) return
    setDeleteLoading(true)
    const result = await deleteModule(moduleToDelete.id)
    if (result.success) {
      setModuleToDelete(null)
      fetchData()
    } else {
      alert(result.error || 'Failed to delete module')
    }
    setDeleteLoading(false)
  }

  // No more grouping needed

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      {/* Modals */}
      {(showModuleForm || showQuestionForm) && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            {showModuleForm && (
                <AddModuleForm 
                  categories={categories} 
                  onCancel={() => setShowModuleForm(false)} 
                  onSuccess={() => {
                      setShowModuleForm(false)
                      fetchData()
                  }} 
                />
            )}
            {showQuestionForm && (
                <AddQuestionForm 
                  modules={modules} 
                  onCancel={() => setShowQuestionForm(false)} 
                  onSuccess={() => {
                      setShowQuestionForm(false)
                      fetchData()
                  }} 
                />
            )}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0f172a] tracking-tight">Modules</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your examination modules and categories.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowModuleForm(true)}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-primary/20 hover:bg-[#152e75] transition-all shrink-0"
          >
            <Plus className="w-5 h-5" />
            Add Module
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center gap-4">
           <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
           <p className="text-slate-400 font-bold text-sm">Loading modules...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {modules.map((module: any) => (
            <div key={module.id} className="group relative">
              <Link 
                  href={`/admin/modules/${module.id}`}
                  className={`block bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg shadow-primary/5 hover:border-primary/20 transition-all relative overflow-hidden h-full ${module.status === 'disabled' ? 'opacity-60 grayscale-[0.5]' : ''}`}
              >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-10 -mt-10 group-hover:bg-primary/10 transition-colors"></div>
                  
                  <div className="flex justify-between items-start relative z-10 mb-4">
                      <div className="flex items-center gap-3">
                          <div className="p-3 bg-slate-50 rounded-2xl group-hover:scale-110 transition-transform">
                              <Layers className="w-6 h-6 text-primary" />
                          </div>
                          {module.status === 'disabled' && (
                              <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full text-[0.65rem] font-black uppercase tracking-widest border border-red-100 shadow-sm animate-in fade-in zoom-in slide-in-from-left-2">
                                  <EyeOff className="w-3 h-3" />
                                  Hidden
                              </span>
                          )}
                      </div>
                      <div className="w-8 h-8" /> {/* Spacer for menu */}
                  </div>

                  <div>
                     <h3 className="text-lg font-black text-[#0f172a] mb-2">{module.name}</h3>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mt-4 pt-4 border-t border-slate-50 group-hover:border-slate-100 transition-colors">
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Tests</span>
                  </div>
              </Link>

              {/* Action Menu - Outside Link to avoid overflow clipping */}
              <div className="absolute top-6 right-6 z-20" ref={activeMenu === module.id ? menuRef : null}>
                  <button 
                      onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setActiveMenu(activeMenu === module.id ? null : module.id)
                      }}
                      className={`p-2 rounded-full transition-all duration-200 border ${
                        activeMenu === module.id 
                        ? 'bg-primary text-white border-primary shadow-lg scale-110' 
                        : 'bg-white/80 hover:bg-white text-slate-500 border-slate-100 shadow-sm hover:scale-110'
                      } menu-button`}
                      title="More Options"
                  >
                      <MoreVertical className="w-5 h-5" />
                  </button>

                  <AnimatePresence>
                    {activeMenu === module.id && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -10 }}
                            className="absolute right-0 mt-3 w-52 bg-white border border-slate-100 rounded-3xl shadow-2xl z-[50] py-3 overflow-hidden ring-1 ring-black/5"
                        >
                            <Link 
                                href={`/admin/modules/${module.id}/settings`}
                                className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                <Settings className="w-4 h-4" />
                                Settings
                            </Link>
                            <button 
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    handleToggleStatus(module)
                                    setActiveMenu(null)
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors text-left"
                            >
                                {module.status === 'disabled' ? (
                                    <>
                                        <Eye className="w-4 h-4" />
                                        Show Module
                                    </>
                                ) : (
                                    <>
                                        <EyeOff className="w-4 h-4" />
                                        Hide Module
                                    </>
                                )}
                            </button>
                            <button 
                                onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    setModuleToDelete(module)
                                    setActiveMenu(null)
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors text-left"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </button>
                        </motion.div>
                    )}
                  </AnimatePresence>
              </div>
            </div>
          ))}

          {modules.length === 0 && !loading && (
             <div className="col-span-full bg-white p-20 rounded-[3rem] border border-slate-100 shadow-2xl shadow-primary/5 text-center space-y-6">
                <div className="w-24 h-24 bg-primary/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
                    <Layers className="w-12 h-12 text-primary" />
                </div>
                <h2 className="text-3xl font-black text-[#0f172a]">Ready to start?</h2>
                <p className="text-slate-500 max-w-sm mx-auto font-medium">Create your first module to begin building your question bank for students.</p>
                <button 
                    onClick={() => setShowModuleForm(true)}
                    className="bg-primary text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.05] transition-all"
                >
                    Create First Module
                </button>
             </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal 
          isOpen={!!moduleToDelete}
          title={`Delete "${moduleToDelete?.name}"?`}
          message="This will permanently delete this module and all associated tests and questions. This action cannot be undone."
          type="danger"
          confirmLabel="Delete Module"
          isLoading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => setModuleToDelete(null)}
      />
    </div>
  )
}



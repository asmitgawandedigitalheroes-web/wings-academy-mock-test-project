'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ChevronLeft, 
  Plus, 
  BookOpen, 
  ChevronRight,
  Library,
  Trash2,
  HelpCircle,
  FileText
} from 'lucide-react'
import Link from 'next/link'
import { getCourseDetails, getCourseModules, removeModuleFromCourse } from '@/app/actions/admin'
import AddModuleToCourseModal from '@/components/admin/courses/AddModuleToCourseModal'
import ConfirmationModal from '@/components/common/ConfirmationModal'

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [course, setCourse] = useState<any>(null)
  const [modules, setModules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModule, setShowAddModule] = useState(false)
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

  const fetchData = async () => {
    setLoading(true)
    const [courseDetails, moduleList] = await Promise.all([
      getCourseDetails(id),
      getCourseModules(id)
    ])
    setCourse(courseDetails)
    setModules(moduleList)
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const handleRemoveModule = (moduleId: string) => {
    setModalConfig({
      isOpen: true,
      title: 'Remove Module?',
      message: 'Are you sure you want to remove this module from the course? This will not delete the module itself, only its association with this course.',
      type: 'danger',
      confirmLabel: 'Remove',
      onConfirm: async () => {
        setLoading(true)
        const result = await removeModuleFromCourse(id, moduleId)
        if (result.success) {
          setModalConfig(prev => ({ ...prev, isOpen: false }))
          fetchData()
        } else {
          setModalConfig({
            isOpen: true,
            title: 'Error',
            message: result.error || 'Failed to remove module.',
            type: 'danger',
            confirmLabel: 'Close',
            onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
          })
          setLoading(false)
        }
      }
    })
  }

  if (loading && !course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="font-black text-slate-400 animate-pulse">Loading course data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <ConfirmationModal 
        {...modalConfig}
        onCancel={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Add Module Modal */}
      {showAddModule && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <AddModuleToCourseModal 
            courseId={id}
            attachedModuleIds={modules.map(m => m.module_id)}
            onCancel={() => setShowAddModule(false)}
            onSuccess={() => {
              setShowAddModule(false)
              fetchData()
            }}
          />
        </div>
      )}

      {/* Breadcrumb & Title */}
      <div className="flex flex-col gap-4">
        <Link 
          href="/admin/courses"
          className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors font-bold text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Courses
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-white shadow-xl shadow-primary/5 rounded-3xl flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-black text-primary uppercase tracking-[0.2em] mb-1">
                <span>Course Config</span>
              </div>
              <h1 className="text-3xl font-black text-[#0f172a] tracking-tight">{course?.title}</h1>
            </div>
          </div>
          <button 
            onClick={() => setShowAddModule(true)}
            className="bg-primary text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:bg-[#152e75] hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shrink-0"
          >
            <Plus className="w-6 h-6" />
            Add Module
          </button>
        </div>
      </div>

      {/* Subject List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-[#0f172a] flex items-center gap-3">
                <Library className="w-6 h-6 text-primary" />
                Included Modules ({modules.length})
            </h2>
        </div>

        {modules.length === 0 ? (
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-primary/5 p-20 text-center space-y-6">
            <div className="w-24 h-24 bg-primary/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-12 h-12 text-primary translate-x-0.5" />
            </div>
            <h3 className="text-2xl font-black text-[#0f172a]">This course is empty</h3>
            <p className="text-slate-500 max-w-sm mx-auto font-medium">Add your first module to this course bundle to make it available for students.</p>
            <button 
              onClick={() => setShowAddModule(true)}
              className="bg-primary text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.05] transition-all"
            >
              Add First Module
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((item) => (
              <div key={item.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-primary/5 hover:border-primary/20 transition-all group relative overflow-hidden">
                <div className="flex justify-between items-start relative z-10 mb-4">
                  <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-primary/5 group-hover:scale-110 transition-all">
                    <Library className="w-6 h-6 text-primary" />
                  </div>
                  <button 
                    onClick={() => handleRemoveModule(item.module_id)}
                    className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="relative z-10">
                  <h4 className="text-xl font-black text-[#0f172a] mb-2">{item.modules?.name}</h4>
                </div>

                <div className="flex items-center gap-4 mt-6 pt-6 border-t border-slate-50 relative z-10">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-black text-slate-600 uppercase tracking-wider">Content Ready</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

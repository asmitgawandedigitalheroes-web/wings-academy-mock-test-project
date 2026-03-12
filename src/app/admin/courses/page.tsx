'use client'

import React, { useState, useEffect } from 'react'
import { 
  FileText, 
  Plus, 
  Search, 
  Layout, 
  Clock, 
  Target,
  MoreVertical,
  Play,
  BookOpen,
  ChevronRight,
  Settings,
  Trash2
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { getCourses, deleteCourse } from '@/app/actions/admin'
import AddCourseModal from '@/components/admin/courses/AddCourseModal'
import ConfirmationModal from '@/components/common/ConfirmationModal'

export default function CoursesManager() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddCourse, setShowAddCourse] = useState(false)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)
  const [courseToDelete, setCourseToDelete] = useState<any | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchCourses = async () => {
    setLoading(true)
    const data = await getCourses()
    setCourses(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const handleDelete = async () => {
    if (!courseToDelete) return
    setDeleteLoading(true)
    const result = await deleteCourse(courseToDelete.id)
    if (result.success) {
      setCourseToDelete(null)
      fetchCourses()
    } else {
      alert(result.error || 'Failed to delete course')
    }
    setDeleteLoading(false)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      {/* Modals */}
      {showAddCourse && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <AddCourseModal 
              onCancel={() => setShowAddCourse(false)} 
              onSuccess={() => {
                  setShowAddCourse(false)
                  fetchCourses()
              }} 
            />
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0f172a] tracking-tight">Manage Courses</h1>
          <p className="text-slate-500 font-medium mt-1">Curate and publish full-length course bundles for students.</p>
        </div>
        <button 
          onClick={() => setShowAddCourse(true)}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-primary/20 hover:bg-[#152e75] transition-all shrink-0"
        >
          <Plus className="w-5 h-5" />
          Create Course
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center gap-4">
           <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
           <p className="text-slate-400 font-bold text-sm">Loading courses...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg shadow-primary/5 hover:border-primary/20 transition-all relative overflow-hidden group flex flex-col h-full">
              {course.image_url ? (
                <>
                  <div className="absolute inset-0 z-0 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                    <Image src={course.image_url} alt={course.title} fill className="object-cover" />
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 -mr-10 -mt-10 z-0 opacity-10 group-hover:opacity-20 transition-opacity rounded-bl-full overflow-hidden">
                    <Image src={course.image_url} alt={course.title} fill className="object-cover" />
                  </div>
                </>
              ) : (
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-10 -mt-10 group-hover:bg-primary/10 transition-colors z-0"></div>
              )}
              
              <div className="flex justify-between items-start z-10 mb-4">
                  <div className="p-3 bg-slate-50 rounded-2xl group-hover:scale-110 transition-transform">
                      <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div className="relative">
                      <button 
                          onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setActiveMenu(activeMenu === course.id ? null : course.id)
                          }}
                          className="p-2 hover:bg-slate-50 rounded-full transition-colors relative z-20"
                      >
                          <MoreVertical className="w-4 h-4 text-slate-400" />
                      </button>

                      {activeMenu === course.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-30 py-2 animate-in fade-in zoom-in duration-200">
                              <Link 
                                  href={`/admin/courses/${course.id}`} // Or a settings page if exists
                                  className="flex items-center gap-3 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                              >
                                  <Settings className="w-4 h-4" />
                                  Manage
                              </Link>
                              <button 
                                  onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      setCourseToDelete(course)
                                      setActiveMenu(null)
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                              >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                              </button>
                          </div>
                      )}
                  </div>
              </div>

              <div className="flex-1">
                 <h3 className="text-lg font-black text-[#0f172a] mb-2">{course.title}</h3>
                 <p className="text-sm font-medium text-slate-500 line-clamp-2">{course.description}</p>
              </div>
              
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-50">
                  <span className="text-xs font-bold text-slate-400">Added {new Date(course.created_at).toLocaleDateString()}</span>
                  <Link href={`/admin/courses/${course.id}`} className="text-primary text-sm font-bold hover:text-accent transition-colors flex items-center gap-1 cursor-pointer">
                    Manage <ChevronRight className="w-4 h-4" />
                  </Link>
              </div>
            </div>
          ))}

          {courses.length === 0 && (
            <div 
              onClick={() => setShowAddCourse(true)}
              className="bg-white p-8 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center opacity-70 hover:opacity-100 transition-all min-h-[300px] cursor-pointer hover:border-primary/30 hover:bg-slate-50 group"
            >
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-white group-hover:shadow-sm transition-all border border-slate-100 group-hover:border-primary/20">
                <Plus className="w-8 h-8 text-primary/50 group-hover:text-primary transition-colors" />
              </div>
              <p className="font-bold text-slate-400 group-hover:text-slate-600 transition-colors">Click to create your first course</p>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal 
          isOpen={!!courseToDelete}
          title={`Delete "${courseToDelete?.title}"?`}
          message="This course and its category links will be permanently deleted. This action cannot be undone."
          type="danger"
          confirmLabel="Delete Course"
          isLoading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => setCourseToDelete(null)}
      />
    </div>
  )
}

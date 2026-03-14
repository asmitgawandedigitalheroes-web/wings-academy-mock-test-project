'use client'

import React, { useState, useEffect } from 'react'
import {
  FileText,
  Search,
  Filter,
  Plus,
  ChevronRight,
  Eye,
  EyeOff,
  Trash2,
  BookOpen,
  DollarSign,
  Clock,
  LayoutGrid
} from 'lucide-react'
import Link from 'next/link'
import { getAllTests, deleteTestSet, toggleTestStatus } from '@/app/actions/admin'
import ConfirmationModal from '@/components/common/ConfirmationModal'

export default function TestsManagementPage() {
  const [tests, setTests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'free' | 'paid'>('all')
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, id: string, moduleId: string }>({
    isOpen: false,
    id: '',
    moduleId: ''
  })

  useEffect(() => {
    fetchTests()
  }, [])

  const fetchTests = async () => {
    setLoading(true)
    const data = await getAllTests()
    setTests(data)
    setLoading(false)
  }

  const handleToggleStatus = async (test: any) => {
    const res = await toggleTestStatus(test.id, test.module_id, test.status || 'draft')
    if (res.success) {
      fetchTests()
    }
  }

  const handleDelete = async () => {
    const { id, moduleId } = deleteModal
    const res = await deleteTestSet(id, moduleId)
    if (res.success) {
      setTests(tests.filter(t => t.id !== id))
    }
    setDeleteModal({ isOpen: false, id: '', moduleId: '' })
  }

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (test.modules?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' ||
      (filter === 'free' && !test.is_paid) ||
      (filter === 'paid' && test.is_paid)
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#0f172a] tracking-tight">Mock Tests</h1>
          <p className="text-slate-500 font-medium mt-1">Manage all examination papers across the platform.</p>
        </div>
        <Link
          href="/admin/modules"
          className="bg-primary text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:bg-[#152e75] hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
        >
          <Plus className="w-5 h-5" />
          Create New Test
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-xl shadow-primary/5 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by test title or module..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold"
          />
        </div>
        <div className="flex items-center gap-2 p-1 bg-slate-50 rounded-xl border border-slate-100">
          {(['all', 'free', 'paid'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${filter === f
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-primary/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Test Details</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Pricing</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="font-bold text-slate-400">Loading mock tests...</p>
                  </td>
                </tr>
              ) : filteredTests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold">
                    No mock tests found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredTests.map((test) => (
                  <tr key={test.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center shrink-0">
                          <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-base font-black text-[#0f172a]">{test.title}</p>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400 font-bold">
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              {test.pass_percentage || 70}% Pass Mark
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(test.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {test.is_paid ? (
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-primary">₹{test.price}</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paid Access</span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[0.65rem] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700">
                          Free
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.65rem] font-black uppercase tracking-wider ${test.status === 'published' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${test.status === 'published' ? 'bg-blue-600' : 'bg-amber-500'}`}></div>
                        {test.status || 'Draft'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 transition-opacity">
                        <button
                          onClick={() => handleToggleStatus(test)}
                          className={`p-3 bg-white border border-slate-100 rounded-xl transition-all hover:shadow-lg ${test.status === 'published' ? 'text-blue-500 hover:text-blue-600' : 'text-slate-400 hover:text-primary'
                            }`}
                          title={test.status === 'published' ? 'Move to Draft' : 'Publish Test'}
                        >
                          {test.status === 'published' ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                        <Link
                          href={`/admin/tests/${test.id}`}
                          className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-primary hover:shadow-lg rounded-xl transition-all"
                        >
                          <LayoutGrid className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, id: test.id, moduleId: test.module_id })}
                          className="p-3 bg-white border border-slate-100 text-slate-400 hover:text-red-500 hover:shadow-lg rounded-xl transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="bg-white p-12 rounded-[2rem] border border-slate-100 text-center">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="font-bold text-slate-400">Loading tests...</p>
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="bg-white p-12 rounded-[2rem] border border-slate-100 text-center">
            <p className="font-bold text-slate-400">No mock tests found.</p>
          </div>
        ) : (
          filteredTests.map((test) => (
            <div key={test.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-primary/5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-black text-[#0f172a] leading-tight">{test.title}</h3>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.6rem] font-black uppercase tracking-wider ${test.status === 'published' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                  {test.status || 'Draft'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mb-0.5">Price</p>
                    <p className="text-sm font-black text-primary">{test.is_paid ? `₹${test.price}` : 'Free'}</p>
                  </div>
                  <div>
                    <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mb-0.5">Pass Mark</p>
                    <p className="text-sm font-black text-slate-600">{test.pass_percentage || 70}%</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(test)}
                    className={`p-2 bg-slate-50 rounded-lg transition-all ${test.status === 'published' ? 'text-blue-500' : 'text-slate-400'
                      }`}
                  >
                    {test.status === 'published' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <Link
                    href={`/admin/tests/${test.id}`}
                    className="p-2 bg-slate-50 text-slate-400 rounded-lg transition-all"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => setDeleteModal({ isOpen: true, id: test.id, moduleId: test.module_id })}
                    className="p-2 bg-red-50 text-red-400 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Delete Test Set?"
        message="Are you sure you want to delete this test set and all its associated questions? This action cannot be undone."
        type="danger"
        confirmLabel="Delete Test"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ isOpen: false, id: '', moduleId: '' })}
      />
    </div>
  )
}

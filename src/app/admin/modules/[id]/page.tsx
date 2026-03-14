'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  Plus, 
  FileText, 
  Clock, 
  ChevronRight,
  MoreVertical,
  Play,
  Settings2,
  HelpCircle,
  BookOpen,
  Settings,
  DollarSign
} from 'lucide-react'
import Link from 'next/link'
import BackButton from '@/components/common/BackButton'
import { getModuleDetails, getTestsByModule, toggleModuleStatus } from '@/app/actions/admin'
import AddTestModal from '@/components/admin/tests/AddTestModal'
import TestCardActions from '@/components/admin/tests/TestCardActions'

export default function ModuleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [module, setModule] = useState<any>(null)
  const [tests, setTests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddTest, setShowAddTest] = useState(false)
  const [sortBy, setSortBy] = useState<'newest' | 'alphabetical'>('newest')

  const fetchData = async () => {
    setLoading(true)
    const [modDetails, testList] = await Promise.all([
      getModuleDetails(id),
      getTestsByModule(id)
    ])
    setModule(modDetails)
    setTests(testList)
    setLoading(false)
  }

  const sortedTests = [...tests].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    } else {
      return a.title.localeCompare(b.title)
    }
  })

  useEffect(() => {
    fetchData()
  }, [id])

  if (loading && !module) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="font-black text-slate-400 animate-pulse">Loading module data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Add Test Modal */}
      {showAddTest && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <AddTestModal 
            moduleId={id}
            existingTests={tests}
            freeLimit={module?.free_tests_limit}
            paidLimit={module?.paid_tests_limit}
            onCancel={() => setShowAddTest(false)}
            onSuccess={() => {
              setShowAddTest(false)
              fetchData()
            }}
          />
        </div>
      )}

      {/* Breadcrumb & Title */}
      <div className="flex flex-col gap-4">
        <BackButton variant="ghost" className="-ml-3" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-white shadow-xl shadow-primary/5 rounded-3xl flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#0f172a] tracking-tight capitalize">{module?.name}</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href={`/admin/modules/${id}/settings`}
              className="p-4 bg-white shadow-xl shadow-primary/5 rounded-2xl text-slate-400 hover:text-primary transition-all hover:scale-105 border border-slate-50"
              title="Module Settings"
            >
              <Settings2 className="w-6 h-6" />
            </Link>
            <button 
              onClick={() => setShowAddTest(true)}
              className="bg-primary text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:bg-[#152e75] hover:scale-[1.02] transition-all flex items-center gap-3 shrink-0"
            >
              <Plus className="w-6 h-6" />
              Add New Test
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mb-1">Total Tests</p>
          <p className="text-2xl font-black text-[#0f172a]">{tests.length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mb-1">Total Questions</p>
          <p className="text-2xl font-black text-[#0f172a]">{tests.reduce((acc, test) => acc + (test.question_count || 0), 0)}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mb-1">Average Time</p>
          <p className="text-2xl font-black text-[#0f172a]">45m</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center group">
          <div>
            <p className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${module?.status === 'disabled' ? 'bg-red-500' : 'bg-green-500'}`}></div>
              <p className="text-lg font-black text-[#0f172a]">{module?.status === 'disabled' ? 'Disabled' : 'Enabled'}</p>
            </div>
          </div>
          <button 
            onClick={async () => {
              const res = await toggleModuleStatus(id, module?.status || 'enabled')
              if (res.success) fetchData()
            }}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
              module?.status === 'disabled' 
              ? 'bg-green-50 text-green-700 hover:bg-green-100' 
              : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            {module?.status === 'disabled' ? 'Enable Module' : 'Disable Module'}
          </button>
        </div>
      </div>

      {/* Tests Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-[#0f172a] flex items-center gap-3">
                <FileText className="w-6 h-6 text-primary" />
                Available Test Sets
            </h2>
            <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">Sort by:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-sm font-black text-slate-600 cursor-pointer outline-none hover:text-primary transition-colors"
                >
                    <option value="newest">Newest First</option>
                    <option value="alphabetical">A - Z</option>
                </select>
            </div>
        </div>

        {tests.length === 0 ? (
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl shadow-primary/5 p-20 text-center space-y-6">
            <div className="w-24 h-24 bg-primary/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-4">
              <FileText className="w-12 h-12 text-primary translate-x-0.5" />
            </div>
            <h3 className="text-2xl font-black text-[#0f172a]">No Tests Yet</h3>
            <p className="text-slate-500 max-w-sm mx-auto font-medium">This module doesn't have any mock tests yet. Create your first one to start adding questions.</p>
            <button 
              onClick={() => setShowAddTest(true)}
              className="bg-primary text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.05] transition-all"
            >
              Create First Test
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {sortedTests.map((test) => (
              <div key={test.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-primary/5 hover:border-primary/20 transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-primary/5 group-hover:scale-110 transition-all relative">
                      <FileText className="w-6 h-6 text-primary" />
                      {test.is_paid && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                          <DollarSign className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      test.status === 'published' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                      : 'bg-amber-100 text-amber-700 border border-amber-200'
                    }`}>
                      {test.status === 'published' ? 'Published' : 'Draft'}
                    </div>
                  </div>
                  <TestCardActions 
                    test={test} 
                    moduleId={id} 
                    onRefresh={fetchData} 
                  />
                </div>
                
                <h4 className="text-xl font-black text-[#0f172a] mb-2 capitalize">{test.title}</h4>
                
                <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-slate-50">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{test.test_type === 'short' ? 'Short Length' : 'Full Length'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{test.time_limit_minutes} Mins</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl">
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{test.question_count || 0} Qs</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-8">
                    <Link 
                        href={`/admin/tests/${test.id}`}
                        className="flex items-center justify-center gap-2 py-4 bg-slate-50 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm"
                    >
                        <Settings className="w-4 h-4" />
                        Manage
                    </Link>
                    <Link 
                        href={`/admin/tests/${test.id}/preview`}
                        className="flex items-center justify-center gap-2 py-4 bg-primary/5 text-primary rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm"
                    >
                        <Play className="w-4 h-4" />
                        Preview
                    </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

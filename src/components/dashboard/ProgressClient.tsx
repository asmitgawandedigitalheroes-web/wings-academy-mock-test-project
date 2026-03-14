'use client'

import React, { useState, useMemo } from 'react'
import { Search, BookOpen, CheckCircle2, Trophy, Clock, ArrowRight, Library } from 'lucide-react'
import { getModuleResultsDetails } from '@/app/actions/dashboard'
import ModuleProgressDetail from './ModuleProgressDetail'

interface ModuleProgress {
  id: string
  name: string
  description: string
  totalTests: number
  completedCount: number
  avgScore: number
  bestScore: number
  latestActivity: string
  completionRate: number
}

interface ProgressClientProps {
  initialData: ModuleProgress[]
}

type FilterStatus = 'all' | 'in-progress' | 'completed'

export default function ProgressClient({ initialData }: ProgressClientProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterStatus>('all')
  const [selectedModule, setSelectedModule] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)

  const handleModuleClick = async (moduleId: string) => {
    setLoading(true)
    try {
      const data = await getModuleResultsDetails(moduleId)
      setSelectedModule(data)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      console.error('Failed to load module details:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredData = useMemo(() => {
    return initialData.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase())

      if (filter === 'completed') {
        return matchesSearch && item.completionRate === 100
      }
      if (filter === 'in-progress') {
        return matchesSearch && item.completionRate > 0 && item.completionRate < 100
      }
      return matchesSearch
    })
  }, [search, filter, initialData])

  const overallAverage = initialData.length > 0
    ? Math.round(initialData.reduce((acc, p) => acc + p.avgScore, 0) / initialData.filter(p => p.totalTests > 0).length || 1)
    : 0

  const totalCompleted = initialData.reduce((acc, p) => acc + p.completedCount, 0)
  const totalAvailable = initialData.reduce((acc, p) => acc + p.totalTests, 0)

  if (selectedModule) {
    return (
      <ModuleProgressDetail
        module={selectedModule.module}
        stats={selectedModule.stats}
        history={selectedModule.history}
        accuracy={selectedModule.accuracy}
        difficultyBreakdown={selectedModule.difficultyBreakdown}
        tests={selectedModule.tests}
        onBack={() => setSelectedModule(null)}
      />
    )
  }

  return (
    <div className={`space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-[#0f172a] tracking-tight">Learning Progress</h1>
          <p className="text-slate-500 font-medium mt-2 text-sm md:text-base">Track your module-wise performance and mastery levels.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-primary/5">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          <input
            type="text"
            placeholder="Search module..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border-none rounded-xl md:rounded-2xl font-bold text-sm text-[#0f172a] placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
          />
        </div>

        <div className="flex bg-slate-50 p-1 rounded-xl md:rounded-2xl border border-slate-100 self-start lg:self-auto overflow-x-auto no-scrollbar w-full md:w-auto">
          {(['all', 'in-progress', 'completed'] as FilterStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`flex-1 md:flex-none px-4 md:px-6 py-2 text-[0.6rem] md:text-[0.65rem] font-black uppercase tracking-widest transition-all rounded-lg md:rounded-xl whitespace-nowrap ${filter === status
                ? 'bg-white text-primary shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              {status.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {filteredData.map((module) => (
          <div key={module.id} className="group bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-primary/5 p-6 md:p-8 hover:border-primary/20 transition-all duration-300 flex flex-col">
            <div className="flex items-start justify-between mb-6 md:mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-accent/10 text-accent rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
                  <Library className="w-6 h-6 md:w-7 md:h-7" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-black text-[#0f172a] leading-tight capitalize">{module.name}</h3>
                  <p className="text-[0.6rem] md:text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mt-1">Module Progress</p>
                </div>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border-[3px] md:border-4 border-slate-50 flex items-center justify-center text-[0.6rem] md:text-[0.65rem] font-black text-primary shrink-0">
                {module.completionRate}%
              </div>
            </div>

            <div className="space-y-6 flex-1">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[0.65rem]">
                  <span className="font-bold text-slate-400">Mastery Level</span>
                  <span className="font-black text-primary">{module.avgScore}%</span>
                </div>
                <div className="h-2 md:h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-1000"
                    style={{ width: `${module.avgScore || 0}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="bg-slate-50 p-3.5 md:p-4 rounded-xl md:rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
                    <span className="text-[0.55rem] md:text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest truncate">Completed</span>
                  </div>
                  <p className="text-base md:text-lg font-black text-[#0f172a]">{module.completedCount}/{module.totalTests}</p>
                </div>
                <div className="bg-slate-50 p-3.5 md:p-4 rounded-xl md:rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="w-3 h-3 text-amber-500 shrink-0" />
                    <span className="text-[0.55rem] md:text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest truncate">Best Score</span>
                  </div>
                  <p className="text-base md:text-lg font-black text-[#0f172a]">{module.bestScore}%</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex items-center gap-2 text-slate-400 overflow-hidden">
                  <Clock className="w-3 h-3 shrink-0" />
                  <span className="text-[0.65rem] md:text-xs font-bold truncate">{module.latestActivity}</span>
                </div>
                <button
                  onClick={() => handleModuleClick(module.id)}
                  className="p-2 md:p-2.5 bg-slate-50 hover:bg-accent hover:text-white rounded-lg md:rounded-xl transition-all group shrink-0"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredData.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-primary/5">
            <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Library className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-[#0f172a]">
              {search ? 'No Matches Found' : 'No Progress Data'}
            </h3>
            <p className="text-slate-500 font-medium">
              {search ? `We couldn't find any modules matching "${search}"` : 'Start taking mock tests to track your learning journey.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

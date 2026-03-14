'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { Lock as LockIcon, ClipboardList, CheckCircle2, Library, Search } from 'lucide-react'
import StartTestButton from '@/components/test/StartTestButton'

interface MyTestsClientProps {
  initialTests: any[]
}

export default function MyTestsClient({ initialTests }: MyTestsClientProps) {
  const [filter, setFilter] = useState<'all' | 'completed'>('all')
  const [search, setSearch] = useState('')

  const filteredTests = useMemo(() => {
    return initialTests.filter(test => {
      const matchesFilter = filter === 'all' || test.status === 'Completed'
      const matchesSearch = test.title.toLowerCase().includes(search.toLowerCase()) ||
        (test.module || '').toLowerCase().includes(search.toLowerCase())
      return matchesFilter && matchesSearch
    })
  }, [initialTests, filter, search])

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black text-[#0f172a] tracking-tight">My Tests</h1>
          <p className="text-slate-500 font-medium mt-2">Access and manage all your unlocked mock tests.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-primary/5">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
          <input
            type="text"
            placeholder="Search tests or modules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border-none rounded-xl md:rounded-2xl font-bold text-sm text-[#0f172a] placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
          />
        </div>

        <div className="flex bg-slate-50 p-1 rounded-xl md:rounded-2xl border border-slate-100 self-start lg:self-auto overflow-x-auto no-scrollbar w-full md:w-auto">
          <button
            onClick={() => setFilter('all')}
            className={`flex-1 md:flex-none px-4 md:px-6 py-2 text-[0.6rem] md:text-[0.65rem] font-black uppercase tracking-widest transition-all rounded-lg md:rounded-xl whitespace-nowrap ${filter === 'all'
              ? 'bg-white text-primary shadow-sm'
              : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            All Access
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`flex-1 md:flex-none px-4 md:px-6 py-2 text-[0.6rem] md:text-[0.65rem] font-black uppercase tracking-widest transition-all rounded-lg md:rounded-xl whitespace-nowrap ${filter === 'completed'
              ? 'bg-white text-primary shadow-sm'
              : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            Completed
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {filteredTests.map((test) => (
          <div key={test.id} className="group bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-primary/5 overflow-hidden hover:border-primary/20 transition-all duration-300 flex flex-col">
            <div className="p-6 md:p-8 flex-1">
              <div className="flex items-start gap-4 mb-6">
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform bg-accent/10 text-accent`}>
                  {test.status === 'Completed' ? <CheckCircle2 className="w-6 h-6 md:w-7 md:h-7" /> : <ClipboardList className="w-6 h-6 md:w-7 md:h-7" />}
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-black text-[#0f172a] mb-1 leading-tight capitalize">{test.title}</h3>
                  <p className="text-[0.6rem] md:text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">{test.module}</p>
                </div>
              </div>

              <div className="space-y-4 mb-6 md:mb-8">
                <div className="flex items-center justify-between text-xs md:text-sm">
                  <span className="text-slate-400 font-bold">Duration</span>
                  <span className="text-[#0f172a] font-black">{test.duration}</span>
                </div>
                <div className="flex items-center justify-between text-xs md:text-sm">
                  <span className="text-slate-400 font-bold">Status</span>
                  <span className={`font-black ${test.status === 'Completed' ? 'text-green-600' : 'text-primary/60'}`}>
                    {test.status}
                  </span>
                </div>
                {test.status === 'Completed' && (
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className="text-slate-400 font-bold">Last Score</span>
                    <span className="text-primary font-black">{test.score}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 md:p-8 pt-0 mt-auto">
              {test.lockoutMinutes > 0 ? (
                <div className="w-full py-3.5 md:py-4 bg-red-50 text-red-600 rounded-xl md:rounded-2xl font-black text-[0.65rem] md:text-xs uppercase tracking-widest border border-red-100 flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2">
                    <LockIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-accent" />
                    Locked
                  </div>
                  <span className="text-[0.55rem] md:text-[0.6rem] font-bold">Retry in {test.lockoutMinutes}m</span>
                </div>
              ) : (
                <StartTestButton testId={test.id} status={test.status} />
              )}
            </div>
          </div>
        ))}

        {filteredTests.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-[3.5rem] border border-slate-100 shadow-xl shadow-primary/5">
            <div className="w-20 h-20 bg-accent/10 text-accent/50 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <Library className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-[#0f172a]">
              {search ? 'No Matches Found' : (filter === 'completed' ? 'No Completed Tests' : 'No Tests Unlocked')}
            </h3>
            <p className="text-slate-500 font-medium">
              {search
                ? `We couldn't find any tests matching "${search}"`
                : (filter === 'completed'
                  ? "You haven't completed any tests yet. Keep practicing!"
                  : "Head over to the modules page to explore and unlock tests.")
              }
            </p>
            {filter === 'all' && (
              <Link href="/dashboard/modules" className="mt-8 inline-block px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all">Browse Modules</Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import React, { useState, useMemo } from 'react'
import { BookOpen, ArrowRight, Lock, Library, Search } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Module {
  id: string
  name: string
  description: string
  price: number
  totalTests: number
  freeTests: number
  paidTests: number
  imageUrl?: string
  iconUrl?: string
  isUnlocked?: boolean
}

interface ModulesClientProps {
  initialModules: Module[]
}

type PriceFilter = 'all' | 'free' | 'paid'

export default function ModulesClient({ initialModules }: ModulesClientProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<PriceFilter>('all')

  const filteredModules = useMemo(() => {
    return initialModules
      .filter(mod => {
        const matchesSearch = (mod.name || '').toLowerCase().includes(search.toLowerCase()) || 
                             (mod.description || '').toLowerCase().includes(search.toLowerCase())
        
        const isPaid = mod.price > 0 || (mod.paidTests && (mod.paidTests > 0))
        const isFree = mod.price === 0 && (mod.paidTests === 0 || !mod.paidTests)

        const matchesFilter =
          filter === 'all' ||
          (filter === 'free' && isFree) ||
          (filter === 'paid' && isPaid)

        return matchesSearch && matchesFilter
      })
      .sort((a, b) => {
        // Prioritize unlocked modules at the top
        if (a.isUnlocked && !b.isUnlocked) return -1
        if (!a.isUnlocked && b.isUnlocked) return 1
        
        // Secondary natural sort by name
        const parseName = (n: string) => {
          const match = n.match(/^(.*?)(\d+)\s*$/)
          return match ? { prefix: match[1].toLowerCase(), num: parseInt(match[2]) } : { prefix: n.toLowerCase(), num: 0 }
        }
        const pa = parseName(a.name), pb = parseName(b.name)
        if (pa.prefix !== pb.prefix) return pa.prefix.localeCompare(pb.prefix)
        return pa.num - pb.num
      })
  }, [initialModules, search, filter])

  return (
    <div className="space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-primary/5">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
          <input
            type="text"
            placeholder="Search modules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border-none rounded-xl md:rounded-2xl font-bold text-sm text-[#0f172a] placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
          />
        </div>

        <div className="flex bg-slate-50 p-1 rounded-xl md:rounded-2xl border border-slate-100 self-start lg:self-auto overflow-x-auto no-scrollbar w-full md:w-auto">
          {(['all', 'free', 'paid'] as PriceFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 md:flex-none px-4 md:px-6 py-2 text-[0.6rem] md:text-[0.65rem] font-black uppercase tracking-widest transition-all rounded-lg md:rounded-xl whitespace-nowrap ${filter === f
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
        {filteredModules.map((module) => (
          <div key={module.id} className="group bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-primary/5 overflow-hidden hover:scale-[1.01] transition-all duration-500 flex flex-col h-full">
            <div className="p-6 md:p-8 flex flex-col h-full">
              <div className="flex items-center justify-between mb-6 md:mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-accent/10 text-accent rounded-xl md:rounded-2xl flex items-center justify-center shrink-0">
                    <Library className="w-6 h-6 md:w-7 md:h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                       <h3 className="text-lg md:text-xl font-black text-[#0f172a] leading-tight capitalize">{module.name}</h3>
                       {module.isUnlocked && (
                         <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-black rounded-md border border-green-100 uppercase">Unlocked</span>
                       )}
                    </div>
                    <p className="text-[0.6rem] md:text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mt-1">Mock Tests</p>
                  </div>
                </div>
              </div>

              <p className="text-slate-500 text-xs md:text-sm font-medium line-clamp-2 md:line-clamp-none mb-6 md:mb-8">{module.description || 'Master the fundamentals and advanced concepts with our curated mock tests.'}</p>

              <div className="bg-slate-50 p-4 md:p-5 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 mb-6 md:mb-8 flex items-center justify-between">
                <div>
                  <p className="text-[0.6rem] md:text-[0.65rem] font-black uppercase tracking-widest text-slate-400 mb-1">Mock tests</p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg md:text-xl font-black text-[#0f172a]">{module.totalTests}</p>
                    <div className="flex gap-1.5 ml-1">
                      {module.freeTests > 0 && (
                        <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-black rounded-md border border-green-100 uppercase tracking-tighter">
                          {module.freeTests} Free
                        </span>
                      )}
                      {module.paidTests > 0 && (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-600 text-[10px] font-black rounded-md border border-amber-100 uppercase tracking-tighter">
                          {module.paidTests} Paid
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 bg-accent/10 rounded-xl md:rounded-2xl flex items-center justify-center text-accent shadow-sm border border-accent/10">
                  <Library className="w-5 h-5 md:w-6 md:h-6" />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-auto">
                <Link
                  href={`/dashboard/modules/${module.id}`}
                  className="flex-1 bg-primary text-white text-center py-3.5 md:py-4 rounded-xl md:rounded-2xl font-black text-[0.65rem] md:text-xs uppercase tracking-widest hover:bg-primary/90 transition-all hover:shadow-xl hover:shadow-primary/20 flex items-center justify-center gap-2 group/btn"
                >
                  View Tests
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
                {(module.price > 0 || module.paidTests > 0) && (
                  <button className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-all border ${module.isUnlocked ? 'bg-green-50 border-green-100 text-green-600' : 'bg-slate-50 border-slate-100 text-accent hover:border-accent/20'}`}>
                    {module.isUnlocked ? <BookOpen className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                  </button>
                )}
              </div>
            </div>

            <div className="h-1.5 bg-slate-100 w-full relative">
              <div className="absolute left-0 top-0 h-full bg-primary" style={{ width: '0%' }}></div>
            </div>
          </div>
        ))}

        {filteredModules.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-primary/5">
            <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Library className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-[#0f172a]">
              {search ? 'No Matches Found' : 'No Modules Available'}
            </h3>
            <p className="text-slate-500 font-medium">
              {search ? `We couldn't find any modules matching "${search}"` : 'Please check back later for new content.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import React from 'react'
import { 
  FileText, 
  Target, 
  Zap, 
  Clock 
} from 'lucide-react'

interface StatsGridProps {
  stats: any
}

export default function StatsGrid({ stats }: StatsGridProps) {
  if (stats.error) {
    return (
        <div className="bg-red-50 p-4 rounded-2xl border border-red-100 text-red-600 font-bold text-sm">
            Error loading stats: {stats.error}
        </div>
    )
  }

  const statsItems = [
    { name: 'Tests Taken', value: stats.testsTaken || '0', icon: FileText, color: 'bg-blue-50 text-blue-600' },
    { name: 'Average Score', value: stats.avgScore || '0%', icon: Target, color: 'bg-green-50 text-green-600' },
    { name: 'Study Streak', value: stats.streak || '0 Days', icon: Zap, color: 'bg-amber-50 text-amber-600' },
    { name: 'Last Session', value: stats.lastSession || 'Never', icon: Clock, color: 'bg-purple-50 text-purple-600' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsItems.map((stat, idx) => (
        <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-primary/5 group hover:scale-[1.02] transition-all cursor-default">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-2xl ${stat.color} transition-transform group-hover:rotate-12`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <span className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">Live Status</span>
          </div>
          <p className="text-2xl font-black text-[#0f172a]">{stat.value}</p>
          <p className="text-sm font-bold text-slate-500 mt-1">{stat.name}</p>
        </div>
      ))}
    </div>
  )
}

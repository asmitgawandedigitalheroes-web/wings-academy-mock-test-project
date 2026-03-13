'use client'

import React from 'react'
import { ArrowRight, Clock, Library, Unlock, FileText } from 'lucide-react'
import Link from 'next/link'

interface RecentActivityProps {
  activities: any[]
}

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'unlock': return <Unlock className="w-5 h-5" />;
    case 'file-text': return <FileText className="w-5 h-5" />;
    default: return <FileText className="w-5 h-5" />;
  }
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-primary/5 h-full flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 bg-accent/10 text-accent/50 rounded-2xl flex items-center justify-center">
          <Library className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-black text-[#0f172a]">No Activity</h3>
          <p className="text-slate-500 max-w-xs font-medium text-sm">Start taking tests to see your recent activity here.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-primary/5 h-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black text-[#0f172a]">Recent Activity</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Latest Updates</p>
        </div>
        <Link href="/dashboard/results" className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors group">
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
        </Link>
      </div>

      <div className="space-y-6">
        {activities.map((activity, idx) => (
          <div key={idx} className="flex items-start gap-4 group cursor-pointer">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-all border border-transparent ${activity.icon === 'unlock' ? 'bg-accent/10 text-accent group-hover:border-accent/20' : 'bg-primary/5 text-primary group-hover:border-primary/10'
              }`}>
              {getIcon(activity.icon)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-bold text-sm text-[#0f172a] truncate">{activity.title}</h4>
                <span className={`text-[0.65rem] font-black uppercase px-2.5 py-1 rounded-lg ${activity.type === 'test_attempt'
                  ? 'bg-primary/5 text-primary'
                  : 'bg-accent/10 text-accent'
                  }`}>
                  {activity.score}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="w-3 h-3 text-slate-300" />
                <span className="text-xs font-bold text-slate-400">{activity.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-8 border-t border-slate-50">
        <button className="w-full py-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-xs font-black text-[#0f172a] uppercase tracking-widest transition-all">
          View All History
        </button>
      </div>
    </div>
  )
}

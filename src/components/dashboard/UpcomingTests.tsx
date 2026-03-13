'use client'

import React from 'react'
import { Calendar, PlayCircle, Library } from 'lucide-react'

interface UpcomingTestsProps {
  data: any[]
}

export default function UpcomingTests({ data }: UpcomingTestsProps) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-primary/5 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-[#0f172a]">Available Tests</h3>
        <button className="text-xs font-black text-primary uppercase tracking-widest hover:underline">View All</button>
      </div>
      
      <div className="space-y-4">
        {data.map((test) => (
          <div key={test.id} className="flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-primary/20 transition-all">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-[#0f172a] text-sm">{test.title}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">{test.date}</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">{test.duration}</span>
                </div>
              </div>
            </div>
            <button className="p-2 hover:bg-primary/10 rounded-full transition-colors text-primary">
              <PlayCircle className="w-8 h-8" />
            </button>
          </div>
        ))}
      </div>
      
      {data.length === 0 && (
        <div className="py-10 text-center space-y-3">
          <div className="flex justify-center">
            <Library className="w-12 h-12 text-slate-300" />
          </div>
          <p className="font-bold text-[#0f172a]">No available tests</p>
          <p className="text-xs text-slate-400">Wait for administrators to publish mock exams.</p>
        </div>
      )}
    </div>
  )
}

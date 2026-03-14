'use client'

import React from 'react'
import { Library } from 'lucide-react'

interface ModuleProgressProps {
  data: any[]
}

export default function ModuleProgress({ data }: ModuleProgressProps) {
  return (
    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-primary/5 space-y-6">
      <h3 className="text-xl font-black text-[#0f172a]">Learning Progress</h3>

      {data.length === 0 ? (
        <div className="py-10 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mx-auto">
            <Library className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <p className="font-black text-[#0f172a]">No modules enrolled yet</p>
            <p className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">Enroll in a course to track progress</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {data.map((item) => (
            <div key={item.name} className="space-y-2.5">
              <div className="flex justify-between items-end">
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{item.name}</span>
                <span className="text-sm font-black text-[#0f172a]">{item.progress}%</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-primary rounded-full transition-all duration-1000`}
                  style={{ width: `${item.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

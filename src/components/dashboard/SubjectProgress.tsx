'use client'

import React from 'react'

interface SubjectProgressProps {
  data: any[]
}

export default function SubjectProgress({ data }: SubjectProgressProps) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-primary/5 space-y-6">
      <h3 className="text-xl font-black text-[#0f172a]">Learning Progress</h3>
      
      {data.length === 0 ? (
        <div className="py-10 text-center space-y-3">
          <div className="text-4xl">📚</div>
          <p className="font-bold text-[#0f172a]">No subjects enrolled yet</p>
          <p className="text-xs text-slate-400">Enroll in a course to track your subject-wise progress.</p>
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
                  className={`h-full ${item.color} rounded-full transition-all duration-1000`} 
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

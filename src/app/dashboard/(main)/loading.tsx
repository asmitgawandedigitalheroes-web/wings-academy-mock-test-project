'use client'

import React from 'react'

export default function MainLoading() {
  return (
    <div className="space-y-8 animate-pulse max-w-7xl mx-auto">
      {/* Header Skeleton */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="h-10 w-64 bg-slate-200 rounded-2xl"></div>
          <div className="h-5 w-96 bg-slate-100 rounded-xl"></div>
        </div>
        <div className="h-12 w-full max-w-sm bg-white border border-slate-100 rounded-2xl"></div>
      </div>

      {/* Content Skeleton */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 min-h-[400px] shadow-sm">
        <div className="space-y-6">
          <div className="h-8 w-48 bg-slate-200 rounded-xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-slate-50 rounded-3xl border border-slate-100 p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-slate-100 rounded-2xl"></div>
                  <div className="w-8 h-8 bg-slate-50 rounded-full"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-slate-100 rounded"></div>
                  <div className="h-8 w-32 bg-slate-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

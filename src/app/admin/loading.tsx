'use client'

import React from 'react'

export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-pulse p-4 sm:p-6 md:p-8">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="h-10 w-64 bg-slate-200 rounded-xl"></div>
          <div className="h-4 w-96 bg-slate-100 rounded-lg"></div>
        </div>
        <div className="h-12 w-48 bg-slate-200 rounded-2xl"></div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 space-y-4">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl"></div>
            <div className="space-y-2">
              <div className="h-3 w-20 bg-slate-100 rounded"></div>
              <div className="h-6 w-32 bg-slate-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm h-96 p-8 space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-slate-200 rounded-lg"></div>
          <div className="h-8 w-32 bg-slate-100 rounded-lg"></div>
        </div>
        <div className="space-y-4 pt-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 w-full bg-slate-50 rounded-xl"></div>
          ))}
        </div>
      </div>
    </div>
  )
}

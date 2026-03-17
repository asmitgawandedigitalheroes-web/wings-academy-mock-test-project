'use client'

import React from 'react'

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse max-w-7xl mx-auto p-4 md:p-8">
      {/* Welcome Skeleton */}
      <div className="space-y-3">
        <div className="h-6 w-32 bg-slate-200 rounded-full"></div>
        <div className="h-10 w-64 bg-slate-300 rounded-xl"></div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-40 bg-white rounded-3xl border border-slate-100 p-6 space-y-4 shadow-sm">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Module Progress Skeleton */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-100 p-8 space-y-6 shadow-sm">
          <div className="h-8 w-48 bg-slate-200 rounded-xl"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 w-full bg-slate-50 rounded-2xl p-4 flex gap-4">
                <div className="w-16 h-16 bg-slate-100 rounded-xl"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-1/3 bg-slate-200 rounded"></div>
                  <div className="h-2 w-full bg-slate-100 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Cards Skeleton */}
        <div className="space-y-6">
          <div className="h-64 bg-slate-900 rounded-[2.5rem] p-8"></div>
          <div className="h-64 bg-primary rounded-[2.5rem] p-8"></div>
        </div>
      </div>
    </div>
  )
}

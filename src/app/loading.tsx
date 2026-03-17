'use client'

import React from 'react'

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[9999] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Loading</h2>
          <p className="text-slate-500 font-medium text-sm">Please wait while we prepare your page...</p>
        </div>
      </div>
    </div>
  )
}

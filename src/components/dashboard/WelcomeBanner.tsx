'use client'

import React from 'react'
import { Trophy, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function WelcomeBanner({ name }: { name: string }) {
  return (
    <div className="relative overflow-hidden bg-primary rounded-[2.5rem] p-6 md:p-12 text-white shadow-2xl shadow-primary/20">
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -ml-10 -mb-10"></div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-xs font-bold uppercase tracking-widest">
            <Trophy className="w-4 h-4 text-accent" />
            Progress Level
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Welcome back, <br />
            <span className="text-accent">{name || 'Explorer'}</span>
          </h1>
          <p className="text-white/70 font-medium max-w-md">
            You're doing great! You've completed 85% of your weekly goal. Keep pushing to reach your target takeoff.
          </p>
        </div>

        <Link href="/dashboard/my-tests" className="flex items-center gap-3 bg-white text-primary px-8 py-4 rounded-2xl font-black hover:bg-accent hover:text-black transition-all shadow-xl shadow-black/10 group">
          Take a New Test
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  )
}

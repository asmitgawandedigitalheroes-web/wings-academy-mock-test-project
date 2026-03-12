import React from 'react'
import { createClient } from '@/utils/supabase/server'
import WelcomeBanner from '@/components/dashboard/WelcomeBanner'
import StatsGrid from '@/components/dashboard/StatsGrid'
import UpcomingTests from '@/components/dashboard/UpcomingTests'
import SubjectProgress from '@/components/dashboard/SubjectProgress'
import { getDashboardStats, getSubjectProgress, getAvailableTests } from '@/app/actions/dashboard'

export default async function StudentDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [stats, progress, upcoming] = await Promise.all([
    getDashboardStats(),
    getSubjectProgress(),
    getAvailableTests()
  ])

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Section */}
      <WelcomeBanner name={user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Student'} />

      {/* Quick Stats */}
      <StatsGrid stats={stats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        <div className="xl:col-span-2 space-y-10">
          <SubjectProgress data={progress} />
          {/* Placeholder for performance chart or detailed analytics */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-primary/5 min-h-[400px] flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-50"></div>
            <div className="text-center space-y-4 relative z-10">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform shadow-inner">
                    <span className="text-2xl">📈</span>
                </div>
                <h3 className="text-2xl font-black text-[#0f172a]">Performance Analytics</h3>
                <p className="text-slate-500 max-w-sm mx-auto font-medium">Complete more tests to unlock detailed performance insights and AI-driven growth charts.</p>
                <div className="pt-4">
                    <button className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-colors">Learn More</button>
                </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-1">
          <UpcomingTests data={upcoming} />
        </div>
      </div>
    </div>
  )
}

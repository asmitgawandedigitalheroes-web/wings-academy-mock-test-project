import React from 'react'
import { createClient } from '@/utils/supabase/server'
import WelcomeBanner from '@/components/dashboard/WelcomeBanner'
import StatsGrid from '@/components/dashboard/StatsGrid'
import DashboardCharts from '@/components/dashboard/DashboardCharts'
import RecentActivity from '@/components/dashboard/RecentActivity'
import { getDashboardStats, getModuleProgress, getPerformanceData, getRecentActivity } from '@/app/actions/dashboard'
import { redirect } from 'next/navigation'

export default async function StudentDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch profile to get real name
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const [stats, progress, chartData, activities] = await Promise.all([
    getDashboardStats(),
    getModuleProgress(),
    getPerformanceData(),
    getRecentActivity()
  ])

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0]

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Welcome Section */}
      <WelcomeBanner name={displayName || 'Student'} />

      {/* Quick Stats */}
      <StatsGrid stats={stats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-10">
        <div className="xl:col-span-2 space-y-6 md:space-y-10">
          <DashboardCharts chartData={chartData} progressData={progress} />
        </div>

        <div className="xl:col-span-1">
          <RecentActivity activities={activities} />
        </div>
      </div>
    </div>
  )
}

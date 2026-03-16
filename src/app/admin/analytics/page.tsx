'use client'

import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Users, 
  BookOpen, 
  DollarSign, 
  Activity, 
  Calendar,
  Filter,
  Download,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Clock
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { getAdminAnalytics, getAdminDashboardStats } from '@/app/actions/admin_dashboard'

const EngagementChart = dynamic(() => import('@/components/admin/EngagementChart'), { 
    ssr: false,
    loading: () => <div className="w-full h-full bg-slate-50 animate-pulse rounded-3xl" />
})

const DistributionChart = dynamic(() => import('@/components/admin/DistributionChart'), { 
    ssr: false,
    loading: () => <div className="w-full h-full bg-slate-50 animate-pulse rounded-full" />
})

const RevenueChart = dynamic(() => import('@/components/admin/RevenueChart'), { 
    ssr: false,
    loading: () => <div className="w-full h-full bg-slate-50 animate-pulse rounded-3xl" />
})

const ActivityHoursChart = dynamic(() => import('@/components/admin/ActivityHoursChart'), { 
    ssr: false,
    loading: () => <div className="w-full h-full bg-slate-50 animate-pulse rounded-3xl" />
})

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('14d')

  const COLORS = ['#EAB308', '#60A5FA', '#F59E0B', '#3B82F6', '#FACC15', '#93C5FD']

  useEffect(() => {
    fetchData()
  }, [timeRange])

  const fetchData = async () => {
    setLoading(true)
    // Parse range string (e.g., '14d' -> 14)
    const days = parseInt(timeRange) || 14
    
    const [dashboardStats, analytics] = await Promise.all([
      getAdminDashboardStats(),
      getAdminAnalytics(days)
    ])
    setStats(dashboardStats)
    setAnalyticsData(analytics)
    setLoading(false)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#0f172a] tracking-tight">System Analytics</h1>
          <p className="text-slate-500 font-medium mt-1">Detailed insights into platform growth and user behavior.</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 p-1 bg-white border border-slate-100 rounded-xl shadow-sm">
                {['7d', '14d', '30d', '90d'].map((range) => (
                    <button
                        key={range}
                        onClick={() => setTimeRange(range)}
                        className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                            timeRange === range 
                            ? 'bg-primary text-white shadow-md shadow-primary/20' 
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        {range}
                    </button>
                ))}
            </div>
          <button className="bg-white border border-slate-200 text-[#0f172a] p-3 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
            <Download className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {[...Array(4)].map((_, i) => (
             <div key={i} className="h-32 bg-slate-100 rounded-[2rem] animate-pulse"></div>
           ))}
        </div>
      ) : (
        <>
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-primary/5 group hover:border-primary/20 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-primary transition-colors">
                            <Users className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                        </div>
                        <span className="flex items-center gap-1 text-primary text-xs font-black">
                            <ArrowUpRight className="w-4 h-4" />
                            Active
                        </span>
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Growth Rate</p>
                    <h3 className="text-3xl font-black text-primary mt-1">{stats?.studentCount}</h3>
                </div>

                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-primary/5 group hover:border-[#EAB308]/20 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-[#EAB308]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#EAB308] transition-colors">
                            <Activity className="w-6 h-6 text-[#EAB308] group-hover:text-white transition-colors" />
                        </div>
                        <span className="flex items-center gap-1 text-[#EAB308] text-xs font-black">
                            <ArrowUpRight className="w-4 h-4" />
                            Live
                        </span>
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Test Attempts</p>
                    <h3 className="text-3xl font-black text-primary mt-1">
                      {analyticsData?.engagement?.reduce((acc: number, curr: any) => acc + curr.completions, 0)}
                    </h3>
                </div>

                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-primary/5 group hover:border-primary/20 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-[#1E3A8A] transition-colors">
                            <BookOpen className="w-6 h-6 text-[#1E3A8A] group-hover:text-white transition-colors" />
                        </div>
                        <span className="flex items-center gap-1 text-[#1E3A8A] text-xs font-black">
                            <ArrowUpRight className="w-4 h-4" />
                            Target
                        </span>
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Avg. Pass Rate</p>
                    <h3 className="text-3xl font-black text-primary mt-1">{stats?.avgPassRate}</h3>
                </div>

                <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-primary/5 group hover:border-[#EAB308]/20 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-[#EAB308]/10 rounded-2xl flex items-center justify-center group-hover:bg-[#EAB308] transition-colors">
                            <DollarSign className="w-6 h-6 text-[#EAB308] group-hover:text-white transition-colors" />
                        </div>
                        <span className="flex items-center gap-1 text-[#EAB308] text-xs font-black">
                            <ArrowUpRight className="w-4 h-4" />
                            Completed
                        </span>
                    </div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Current Revenue</p>
                    <h3 className="text-3xl font-black text-primary mt-1">{stats?.totalRevenue}</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Engagement Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-2xl shadow-primary/5">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-black text-[#0f172a]">User Engagement</h3>
                            <p className="text-sm text-slate-400 font-medium">Daily signups vs test completions</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-[#1E3A8A] rounded-full"></div>
                                <span className="text-xs font-bold text-slate-500">Signups</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-[#EAB308] rounded-full"></div>
                                <span className="text-xs font-bold text-slate-500">Tests</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[350px]">
                        <EngagementChart data={analyticsData?.engagement} />
                    </div>
                </div>

                {/* Module Popularity (Pie) */}
                <div className="bg-[#1E3A8A] p-8 rounded-[3rem] shadow-2xl shadow-primary/20 text-white flex flex-col">
                    <h3 className="text-xl font-black mb-1">Module Split</h3>
                    <p className="text-white/40 text-sm font-medium mb-8">Test distribution by module</p>
                    
                    <div className="flex-1 min-h-[250px] relative">
                        <DistributionChart data={analyticsData?.distribution} colors={COLORS} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-black">Split</span>
                            <span className="text-[10px] uppercase font-black tracking-widest text-white/40">Database</span>
                        </div>
                    </div>

                    <div className="space-y-4 mt-8">
                        {analyticsData?.distribution?.map((item: any, index: number) => (
                            <div key={item.name} className="flex justify-between items-center bg-white/5 p-3 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <span className="text-sm font-bold text-white/80">{item.name}</span>
                                </div>
                                <span className="text-sm font-black">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Revenue Line Chart */}
                <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-2xl shadow-primary/5">
                    <h3 className="text-xl font-black text-[#0f172a] mb-8 flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-orange-500" />
                        </div>
                        Revenue Stream
                    </h3>
                    <div className="h-[250px]">
                        <RevenueChart data={analyticsData?.engagement} />
                    </div>
                </div>

                {/* Active Times (Bar Chart) */}
                <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-2xl shadow-primary/5">
                    <h3 className="text-xl font-black text-[#0f172a] mb-8 flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center">
                            <Clock className="w-5 h-5 text-primary" />
                        </div>
                        Peak Activity Hours
                    </h3>
                    <div className="h-[250px]">
                        <ActivityHoursChart data={analyticsData?.hours} />
                    </div>
                </div>
            </div>
        </>
      )}
    </div>
  )
}

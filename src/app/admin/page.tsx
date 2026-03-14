import StatCard from '@/components/admin/StatCard'
import { 
  Users, 
  BookOpen, 
  FileText, 
  Activity, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  Layers, 
  DollarSign 
} from 'lucide-react'
import { getAdminDashboardStats, getRecentAdminActivity, getAdminAnalytics } from '@/app/actions/admin_dashboard'
import AdminAnalyticsChart from '@/components/admin/AdminAnalyticsChart'
import AnalyticsActions from '@/components/admin/AnalyticsActions'
import Link from 'next/link'

export default async function AdminDashboard() {
  const [dbStats, activity, analytics] = await Promise.all([
    getAdminDashboardStats(),
    getRecentAdminActivity(),
    getAdminAnalytics()
  ])

  const stats = [
    { 
      label: 'Total Students', 
      value: dbStats.studentCount.toLocaleString(), 
      change: '+0%', 
      icon: <Users className="w-6 h-6 text-primary" />,
      bg: 'bg-primary/5' 
    },
    { 
      label: 'Total Modules', 
      value: dbStats.moduleCount.toLocaleString(), 
      change: '+0%', 
      icon: <Layers className="w-6 h-6 text-primary" />,
      bg: 'bg-primary/5' 
    },
    { 
      label: 'Total Mock Tests', 
      value: dbStats.testCount.toLocaleString(), 
      change: '0%', 
      icon: <FileText className="w-6 h-6 text-primary" />,
      bg: 'bg-primary/5' 
    },
    { 
      label: 'Total Questions', 
      value: dbStats.questionCount.toLocaleString(), 
      change: '+0%', 
      icon: <BookOpen className="w-6 h-6 text-primary" />,
      bg: 'bg-primary/5' 
    },
    { 
      label: 'Total Revenue', 
      value: dbStats.totalRevenue, 
      change: '+0%', 
      icon: <DollarSign className="w-6 h-6 text-primary" />,
      bg: 'bg-primary/5' 
    },
    { 
      label: 'Avg. Pass Rate', 
      value: dbStats.avgPassRate, 
      change: '0%', 
      icon: <Activity className="w-6 h-6 text-primary" />,
      bg: 'bg-primary/5' 
    },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-[#0f172a] tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 font-medium mt-1">Welcome back. Here's what's happening today at Wings Academy.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity List */}
        <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#0f172a] flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Recent Activity
            </h2>
            <Link 
              href="/admin/activity"
              className="text-sm font-bold text-primary hover:text-accent transition-colors"
            >
              View All
            </Link>
          </div>
          
          <div className="space-y-6 flex-1">
            {activity.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-10">
                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                  <Activity className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-slate-400 font-bold text-sm">No recent activity</p>
              </div>
            ) : (
              activity.map((item: any) => (
                <div key={item.id} className="flex gap-4 relative last:after:hidden after:absolute after:left-[18px] after:top-10 after:bottom-0 after:w-0.5 after:bg-slate-100">
                  <div className="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center relative z-10 shrink-0">
                    {item.type === 'signup' ? <Users className="w-4 h-4" /> : <CheckCircle className="w-4 h-4 text-green-500" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#0f172a] leading-tight">{item.user}</p>
                    <p className="text-sm text-slate-600 mt-0.5">{item.detail}</p>
                    <p className="text-[0.65rem] font-medium text-slate-400 mt-1 uppercase tracking-tighter">{item.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Analytics */}
        <div className="lg:col-span-2 bg-primary p-8 rounded-3xl border border-primary-light shadow-2xl relative overflow-hidden flex flex-col text-white">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 w-full">
            <div className="flex items-center justify-between mb-2">
                <div>
                    <h2 className="text-2xl font-black leading-tight">Growth & Performance <span className="text-accent underline decoration-4">Analytics</span></h2>
                    <p className="text-white/60 text-sm font-medium mt-1">Activity trend for last 14 days</p>
                </div>
                <TrendingUp className="w-10 h-10 text-accent opacity-50" />
            </div>

            <AdminAnalyticsChart data={analytics.engagement} />

            <AnalyticsActions />
          </div>
        </div>
      </div>
    </div>
  )
}

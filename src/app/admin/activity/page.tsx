'use client'

import React, { useState, useEffect } from 'react'
import { 
  ChevronLeft, 
  Clock, 
  Users, 
  CheckCircle, 
  Activity, 
  Search,
  Filter,
  Calendar,
  ArrowRight,
  ShieldCheck,
  PlusCircle
} from 'lucide-react'
import Link from 'next/link'
import { getAllAdminActivity } from '@/app/actions/admin_dashboard'

export default function ActivityLogPage() {
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')

  const fetchActivities = async () => {
    setLoading(true)
    const data = await getAllAdminActivity()
    setActivities(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchActivities()
  }, [])

  const filteredActivities = activities.filter(activity => {
    const matchesFilter = filter === 'All' || 
                         (filter === 'Signups' && activity.type === 'signup') ||
                         (filter === 'Test Results' && activity.type === 'test') ||
                         (filter === 'Admin Actions' && activity.type === 'admin_action')
    
    const matchesSearch = activity.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.detail.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col gap-4">
        <Link 
          href="/admin"
          className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors font-bold text-sm bg-white/50 w-fit px-4 py-2 rounded-xl border border-slate-100 backdrop-blur-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-white shadow-xl shadow-primary/5 rounded-3xl flex items-center justify-center">
              <Activity className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#0f172a] tracking-tight">Website Activity Log</h1>
              <p className="text-slate-500 font-medium mt-1">Real-time history of all system events and user actions.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search activities..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-sm"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {['All', 'Signups', 'Test Results', 'Admin Actions'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-3.5 rounded-2xl font-black text-sm transition-all whitespace-nowrap flex-1 md:flex-none ${
                filter === f 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Activity List */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-primary/5 overflow-hidden">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <p className="font-black text-slate-400 animate-pulse">Scanning system logs...</p>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-2 text-slate-300">
               <Activity className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-slate-400">No matching activities found</h3>
            <p className="text-slate-400 font-medium max-w-xs mx-auto text-sm">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filteredActivities.map((item) => (
              <div 
                key={item.id} 
                className="p-6 md:p-8 hover:bg-slate-50/50 transition-all group flex flex-col md:flex-row md:items-center gap-6"
              >
                <div className="flex items-center gap-5 flex-1">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110 ${
                    item.type === 'signup' 
                    ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                    : item.type === 'test'
                    ? 'bg-green-50 text-green-600 border border-green-100'
                    : 'bg-purple-50 text-purple-600 border border-purple-100'
                  }`}>
                    {item.type === 'signup' ? <Users className="w-6 h-6" /> : item.type === 'test' ? <CheckCircle className="w-6 h-6" /> : <PlusCircle className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-lg font-black text-[#0f172a]">{item.user}</h4>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                        item.type === 'signup' 
                        ? 'bg-blue-100/50 text-blue-700 border-blue-200' 
                        : item.type === 'test'
                        ? 'bg-green-100/50 text-green-700 border-green-200'
                        : 'bg-purple-100/50 text-purple-700 border-purple-200'
                      }`}>
                        {item.type === 'signup' ? 'Student Signup' : item.type === 'test' ? 'Test Completion' : 'Admin Action'}
                      </span>
                    </div>
                    <p className="text-slate-600 font-medium">{item.detail}</p>
                    {item.score !== undefined && (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${Number(item.score) >= 70 ? 'bg-green-500' : 'bg-orange-500'}`}
                            style={{ width: `${item.score}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-black text-slate-400">{item.score}% Score</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 shrink-0 px-4 md:px-0 ml-14 md:ml-0">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">{item.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-primary font-black">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs">{item.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Footer */}
      {!loading && (
        <div className="bg-primary p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-primary/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-white/60 text-xs font-black uppercase tracking-widest">Total Monitored</p>
              <p className="text-2xl font-black">{filteredActivities.length} Activities Found</p>
            </div>
          </div>
          <p className="text-white/60 text-sm font-medium max-w-sm text-center md:text-right">
            Activity logs are retained for auditing and monitoring purposes. Showing recent items across all categories.
          </p>
        </div>
      )}
    </div>
  )
}

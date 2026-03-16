'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import ModuleProgress from './ModuleProgress'

const PerformanceChart = dynamic(() => import('./PerformanceChart'), { 
  ssr: false,
  loading: () => <div className="w-full h-[300px] bg-slate-50 animate-pulse rounded-[2.5rem]" />
})

interface DashboardChartsProps {
  chartData: any[]
  progressData: any[]
}

export default function DashboardCharts({ chartData, progressData }: DashboardChartsProps) {
  return (
    <>
      <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-primary/5 min-h-[400px]">
        <PerformanceChart data={chartData} />
      </div>
      <ModuleProgress data={progressData} />
    </>
  )
}

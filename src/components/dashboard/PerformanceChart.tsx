'use client'

import React from 'react'
import { ArrowRight, Clock, Library, Unlock, FileText, BarChart3 } from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'

interface PerformanceChartProps {
  data: any[]
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
  const [activeMetric, setActiveMetric] = React.useState<'score' | 'speed'>('score')

  if (!data || data.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center shadow-inner">
          <BarChart3 className="w-8 h-8 text-slate-300" />
        </div>
        <h3 className="text-xl font-black text-[#0f172a]">No Data Yet</h3>
        <p className="text-slate-500 max-w-xs font-medium text-sm">Complete your first mock test to see your performance analytics here.</p>
      </div>
    )
  }

  return (
    <div className="h-full w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black text-[#0f172a]">Performance Over Time</h3>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
            {activeMetric === 'score' ? 'Score History' : 'Speed Analysis'}
          </p>
        </div>
        <div className="flex bg-slate-50 p-1 rounded-xl">
             <button 
                onClick={() => setActiveMetric('score')}
                className={`px-3 py-1.5 text-[0.65rem] font-black uppercase tracking-wider transition-all rounded-lg ${
                  activeMetric === 'score' 
                    ? 'text-primary bg-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Score
              </button>
             <button 
                onClick={() => setActiveMetric('speed')}
                className={`px-3 py-1.5 text-[0.65rem] font-black uppercase tracking-wider transition-all rounded-lg ${
                  activeMetric === 'speed' 
                    ? 'text-primary bg-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                Speed
              </button>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#eab308" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
              dx={-10}
              domain={activeMetric === 'score' ? [0, 100] : ['auto', 'auto']}
              unit={activeMetric === 'speed' ? ' QPM' : ''}
            />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-4 rounded-2xl shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                      <p className="text-sm font-black text-[#0f172a] mb-2">{payload[0].payload.name}</p>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#eab308]" />
                        <p className="text-xl font-black text-[#0f172a]">
                          {payload[0].value}{activeMetric === 'score' ? '%' : ' QPM'}
                        </p>
                      </div>
                      {activeMetric === 'speed' && (
                        <p className="text-[0.6rem] font-bold text-slate-400 mt-1 uppercase">Questions Per Minute</p>
                      )}
                    </div>
                  )
                }
                return null
              }}
            />
            <Area 
              type="monotone" 
              dataKey={activeMetric} 
              stroke="#eab308" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorMetric)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

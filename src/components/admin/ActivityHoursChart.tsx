'use client'

import React from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'

interface ActivityHoursChartProps {
  data: any[]
}

export default function ActivityHoursChart({ data }: ActivityHoursChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
            <YAxis hide />
            <Tooltip cursor={{ fill: '#f8fafc' }} />
            <Bar dataKey="users" fill="#1E3A8A" radius={[10, 10, 0, 0]} />
        </BarChart>
    </ResponsiveContainer>
  )
}

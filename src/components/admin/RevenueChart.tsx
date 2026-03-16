'use client'

import React from 'react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'

interface RevenueChartProps {
  data: any[]
}

export default function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} 
            />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
            <Tooltip />
            <Line 
                type="monotone" 
                dataKey="revenue" 
                name="Revenue"
                stroke="#EAB308" 
                strokeWidth={4}
                dot={{ r: 4, fill: '#EAB308', strokeWidth: 2, stroke: '#fff' }}
            />
        </LineChart>
    </ResponsiveContainer>
  )
}

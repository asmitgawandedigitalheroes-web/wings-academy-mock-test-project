'use client'

import React from 'react'
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'

interface DistributionChartProps {
  data: any[]
  colors: string[]
}

export default function DistributionChart({ data, colors }: DistributionChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
        <PieChart>
            <Pie
                data={data}
                innerRadius={70}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
            >
                {data?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
            </Pie>
            <Tooltip />
        </PieChart>
    </ResponsiveContainer>
  )
}

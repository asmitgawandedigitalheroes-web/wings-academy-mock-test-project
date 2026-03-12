import React from 'react'

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  icon: React.ReactNode;
  bg: string;
}

export default function StatCard({ label, value, change, icon, bg }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-primary/5 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${bg} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        {change && (
          <span className={`text-[0.7rem] font-bold px-2 py-1 rounded-full ${change.startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
            {change}
          </span>
        )}
      </div>
      <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wider">{label}</h3>
      <p className="text-3xl font-black text-[#0f172a] mt-1">{value}</p>
    </div>
  )
}

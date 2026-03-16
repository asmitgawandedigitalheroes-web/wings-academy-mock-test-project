import React from 'react'
import { BookOpen, CheckCircle, BarChart3, ShieldCheck } from 'lucide-react'

const Stats = () => {
  const stats = [
    {
      icon: <BookOpen className="w-6 h-6 text-accent" />,
      label: '17+ Mock Test Series',
      description: 'Comprehensive module coverage'
    },
    {
      icon: <CheckCircle className="w-6 h-6 text-accent" />,
      label: 'Exam-Style Questions',
      description: 'Matched to certifying bodies'
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-accent" />,
      label: 'Performance Analytics',
      description: 'Detailed score breakdowns'
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-accent" />,
      label: 'Certified Content',
      description: 'EASA, GCAA & DGCA focus'
    },
  ]

  return (
    <section className="py-12 bg-primary overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-start gap-4 p-5 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors group">
              <div className="p-3 rounded-xl bg-primary shadow-inner flex-shrink-0 group-hover:scale-105 transition-transform">
                {stat.icon}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-white font-bold text-lg mb-1 leading-tight">{stat.label}</h3>
                <p className="text-slate-300 text-sm leading-relaxed">{stat.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Stats

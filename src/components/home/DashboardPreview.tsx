'use client'

import React from 'react'
import { TrendingUp, Award, Target } from 'lucide-react'

const DashboardPreview = () => {
  return (
    <section className="py-24 bg-white relative overflow-hidden border-t border-slate-50">
      {/* Decorative airplane trail */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03] rotate-180">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,50 Q25,20 50,50 T100,50" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
          </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-black text-primary mb-6 tracking-tight">Track Progress & Improve Every Attempt</h2>
        <p className="text-slate-500 text-lg mb-20 max-w-3xl mx-auto font-medium leading-relaxed">
          Our dashboard gives you a clear view of your preparation. Watch your scores climb as you practice specialized mock tests.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { icon: <TrendingUp className="w-8 h-8" />, label: "Growth Analytics", text: "Visual charts for every module" },
            { icon: <Award className="w-8 h-8" />, label: "Exam Readiness", text: "Probability of passing real flight exams" },
            { icon: <Target className="w-8 h-8" />, label: "Weakness Identification", text: "Focus areas automatically flagged" },
          ].map((item, i) => (
            <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-slate-50 shadow-2xl shadow-slate-200/40 flex flex-col items-center group hover:scale-105 transition-all">
              <div className="w-20 h-20 rounded-3xl bg-primary/5 text-primary flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                {item.icon}
              </div>
              <h4 className="font-black text-2xl text-primary mb-4 tracking-tight">{item.label}</h4>
              <p className="text-slate-500 font-medium leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default DashboardPreview

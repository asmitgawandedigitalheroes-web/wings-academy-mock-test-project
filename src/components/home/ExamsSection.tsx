'use client'

import React from 'react'
import { Plane, ShieldCheck, Globe, BookOpen, ChevronRight } from 'lucide-react'
import Link from 'next/link'

const exams = [
  {
    title: 'EASA Part-66',
    description: 'Comprehensive mock tests for all EASA Part-66 modules (1-17) for Aircraft Maintenance Engineers.',
    icon: Plane,
    tag: 'International',
    count: 'Full-length Mocks'
  },
  {
    title: 'GCAA (UAE)',
    description: 'Specialized preparation for United Arab Emirates General Civil Aviation Authority licensing exams.',
    icon: Globe,
    tag: 'Regulated',
    count: 'Latest Pattern'
  },
  {
    title: 'DGCA',
    description: 'Complete mock tests for DGCA CPL/ATPL and AME regulatory exams based on latest syllabus.',
    icon: ShieldCheck,
    tag: 'National',
    count: '2500+ Questions'
  }
]

export default function ExamsSection() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Decorative airplane trail */}
      <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-[0.05]">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,50 Q25,20 50,50 T100,50" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
              <path d="M0,60 Q25,30 50,60 T100,60" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-accent" />
          </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-sm font-black text-primary uppercase tracking-[0.4em]">Available Examinations</h2>
          <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-primary leading-tight tracking-tight">
            Exams Currently <span className="text-accent italic">Supported</span> by Wings Academy
          </h3>
          <p className="text-slate-500 font-medium text-lg leading-relaxed">
            We provide specialized, high-accuracy mock test sets for the most demanding aviation certifications globally.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {exams.map((exam, idx) => (
            <div 
              key={idx} 
              className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-2xl shadow-slate-200/40 group hover:border-primary/20 hover:scale-[1.02] transition-all flex flex-col sm:flex-row gap-8 items-center sm:items-start text-center sm:text-left"
            >
              <div className="w-20 h-20 bg-primary/5 rounded-[2rem] flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all group-hover:rotate-6 shadow-inner text-primary">
                <exam.icon className="w-8 h-8" />
              </div>
              
              <div className="space-y-4 flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <span className="px-3 py-1 bg-accent/20 text-accent text-[0.65rem] font-black uppercase tracking-widest rounded-full self-center sm:self-auto">
                    {exam.tag}
                  </span>
                  <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">•</span>
                  <span className="text-[0.65rem] font-black text-primary/40 uppercase tracking-widest">
                    {exam.count}
                  </span>
                </div>
                
                <div>
                  <h4 className="text-2xl font-black text-primary tracking-tight">{exam.title}</h4>
                  <p className="text-sm text-slate-500 font-medium mt-3 leading-relaxed">
                    {exam.description}
                  </p>
                </div>
                
                <Link 
                  href="/login" 
                  className="inline-flex items-center gap-2 text-primary text-sm font-black group/link uppercase tracking-widest"
                >
                  Explore Course
                  <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
            <p className="text-sm font-bold text-slate-400 italic">
                Don't see your exam? <Link href="/contact" className="text-primary font-black hover:text-accent underline decoration-primary/20 underline-offset-4 hover:decoration-accent transition-all">Request a module</Link> and we'll prioritize it.
            </p>
        </div>
      </div>
    </section>
  )
}

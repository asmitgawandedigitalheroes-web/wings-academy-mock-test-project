import React from 'react'
import Image from 'next/image'
import { Clock, CheckSquare, BarChart2, BookOpen, Smartphone, ShieldCheck } from 'lucide-react'

const Features = () => {
  const features = [
    { icon: <Clock className="w-5 h-5 text-primary" />, title: 'Timed Mock Exams', description: 'Experience real pressure with our timed simulation.' },
    { icon: <CheckSquare className="w-5 h-5 text-primary" />, title: 'Exam Pattern', description: 'Questions matched to recent EASA, GCAA, and DGCA patterns.' },
    { icon: <BarChart2 className="w-5 h-5 text-primary" />, title: 'Instant Report', description: 'Get your scores and deep-dive performance analysis immediately.' },
    { icon: <BookOpen className="w-5 h-5 text-primary" />, title: 'Module Practice', description: 'Focus your preparation on specific syllabus modules.' },
    { icon: <Smartphone className="w-5 h-5 text-primary" />, title: 'Accessible', description: 'Prepare on laptop, tablet, or phone. Sync progress.' },
    { icon: <ShieldCheck className="w-5 h-5 text-primary" />, title: 'Tailored for AME', description: 'Designed exclusively for Aircraft Maintenance Engineering students.' },
  ]

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          <div className="flex-1">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#0f172a] mb-6">Built for Serious AME Students</h2>
            <p className="text-slate-600 mb-10 text-lg leading-relaxed">
              Everything you need for a rigorous and efficient certification preparation environment. No distractions, just results.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#0f172a] mb-2">{feature.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex-1 w-full relative">
            <div className="aspect-square lg:aspect-[4/5] relative rounded-3xl overflow-hidden shadow-2xl bg-slate-200">
               <Image 
                src="/aircraft_maintenance.png" 
                alt="Aircraft maintenance engineers at work"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {/* Simple decorative element */}
            <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-10" />
            <div className="absolute -top-8 -right-8 w-48 h-48 bg-cyan-400/10 rounded-full blur-3xl -z-10" />
          </div>

        </div>
      </div>
    </section>
  )
}

export default Features

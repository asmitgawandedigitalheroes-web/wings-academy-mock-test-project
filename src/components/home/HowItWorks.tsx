import React from 'react'
import { UserPlus, BookOpenCheck, LineChart } from 'lucide-react'

const HowItWorks = () => {
  const steps = [
    {
      icon: UserPlus,
      title: '1. Register Account',
      description: 'Create a free account and access module-wise mock tests instantly.'
    },
    {
      icon: BookOpenCheck,
      title: '2. Take Mock Tests',
      description: 'Practice timed exams matching EASA, GCAA, and DGCA formats.'
    },
    {
      icon: LineChart,
      title: '3. Track Performance',
      description: 'Analyze scores, identify weak areas, and improve preparation.'
    },
  ]

  return (
    <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-black text-primary mb-4 tracking-tight">How It Works</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg font-medium leading-relaxed">
            Your journey to certification success in three simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <div key={index} className="text-center p-10 border border-slate-50 rounded-[2.5rem] hover:shadow-2xl hover:shadow-primary/5 transition-all bg-slate-50/50 group">
              <div className="w-20 h-20 rounded-3xl bg-primary/5 flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:bg-primary shadow-inner transition-all duration-500 text-primary group-hover:text-white">
                <step.icon className="w-10 h-10 transition-colors" />
              </div>
              <h3 className="text-2xl font-black text-primary mb-4 tracking-tight">{step.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks

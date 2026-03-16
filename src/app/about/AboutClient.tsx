'use client'

import React from 'react'
import { Target, Shield, Users, Award, CheckCircle2 } from 'lucide-react'
import { motion } from 'framer-motion'

interface AboutClientProps {
  stats: { number: string; label: string }[]
  values: { icon: React.ReactNode; title: string; description: string }[]
}

export default function AboutClient({ stats, values }: AboutClientProps) {
  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants: any = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "circOut" }
    }
  }

  return (
    <main className="min-h-screen pt-32 pb-0 bg-[#f8fafc]">
      
      {/* Intro Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-[#0f172a] mb-6 tracking-tight">
            About <span className="text-primary italic">Wings Academy</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
            We are dedicated to providing the most accurate, challenging, and up-to-date mock tests for aspiring Aircraft Maintenance Engineers worldwide.
          </p>
        </motion.div>
        
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-primary/5 border border-slate-100 flex flex-col justify-center relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
            <h2 className="text-3xl md:text-4xl font-black text-primary mb-6">Our Mission</h2>
            <p className="text-slate-600 leading-relaxed mb-10 text-lg font-medium">
              To empower aviation professionals by providing a premium platform that authentically simulates real-world certification exams, helping them build confidence and achieve success on their first attempt.
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-primary mb-6">Our Vision</h2>
            <p className="text-slate-600 leading-relaxed text-lg font-medium">
              To be the globally recognized standard for AME exam preparation, bridging the gap between theoretical knowledge and practical certification success.
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="relative h-full min-h-[400px]"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-[2.5rem] blur-3xl opacity-50"></div>
            <div className="bg-primary p-8 md:p-12 rounded-[2.5rem] border border-white/10 shadow-2xl h-full flex flex-col justify-center text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors duration-700"></div>
              <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-primary">
                      <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-black tracking-tight">Founded by AMEs, for AMEs.</h3>
              </div>
              <p className="text-slate-200 leading-relaxed text-lg font-medium relative z-10">
                We recognized the severe lack of modernized, mobile-friendly, and accurate testing platforms. We built this platform to be the tool we always wished we had during our own certification journeys.
              </p>
              <div className="mt-8 flex items-center gap-2">
                  <div className="w-8 h-0.5 bg-accent rounded-full"></div>
                  <span className="text-accent font-black uppercase text-xs tracking-[0.2em]">The Wings Standard</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-16">
            {stats.map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-6xl font-black text-accent mb-3 tracking-tighter">{stat.number}</div>
                <div className="text-white/60 font-black tracking-[0.2em] uppercase text-xs">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-[#0f172a] mb-6 tracking-tight">Our Core Values</h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium lead-relaxed">
            The principles that drive our platform architecture and content creation.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-8"
        >
          {values.map((value, idx) => (
            <motion.div 
              key={idx}
              variants={itemVariants}
              className="bg-white p-8 rounded-[2rem] shadow-xl shadow-primary/5 border border-slate-100 flex flex-col sm:flex-row gap-6 group hover:border-primary/20 transition-all duration-500"
            >
              <div className="bg-primary/5 p-5 rounded-2xl h-fit group-hover:bg-primary/10 transition-colors border border-primary/5">
                {value.icon}
              </div>
              <div>
                <h3 className="text-xl font-black text-[#0f172a] mb-3 tracking-tight">{value.title}</h3>
                <p className="text-slate-600 leading-relaxed font-medium">{value.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Extra Polish: Bottom CTA area */}
      <section className="pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-100/50 rounded-[3rem] p-12 text-center border border-slate-100">
              <h2 className="text-3xl font-black text-primary mb-6 tracking-tight">Ready to Begin Your Success Story?</h2>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button className="bg-primary text-white px-8 py-4 rounded-2xl font-black hover:brightness-110 transition-all shadow-xl shadow-primary/20">Join Wings Academy</button>
                  <button className="bg-white text-primary border-2 border-slate-200 px-8 py-4 rounded-2xl font-black hover:bg-slate-50 transition-all">Contact Us</button>
              </div>
          </div>
      </section>
    </main>
  )
}

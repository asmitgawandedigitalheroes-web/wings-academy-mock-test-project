'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Clock, MessageSquare } from 'lucide-react'
import ContactForm from '@/components/contact/ContactForm'

interface ContactClientProps {
  contactInfo: {
    icon: React.ReactNode
    title: string
    detail: string
    description: string
    link: string
  }[]
}

export default function ContactClient({ contactInfo }: ContactClientProps) {
  const containerVariants: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  }

  const itemVariants: any = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  }

  return (
    <main className="min-h-screen pt-32 pb-24 bg-[#f8fafc]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-[#0f172a] mb-6 tracking-tight">
            Get in <span className="text-primary italic">Touch</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Have questions about our platform or need support? Our team is here to help you navigate your certification journey.
          </p>
        </motion.div>
        
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          
          {/* Left: Contact Info */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <div className="mb-10">
              <h2 className="text-3xl font-black text-[#0f172a] mb-4">Contact Information</h2>
              <p className="text-slate-500 font-medium">Choose your preferred way to reach us.</p>
            </div>

            {contactInfo.map((info, idx) => (
              <motion.a 
                key={idx}
                href={info.link}
                variants={itemVariants}
                className="block bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-primary/5 group hover:border-primary/20 transition-all duration-500"
              >
                <div className="flex items-start gap-6">
                  <div className="bg-primary/5 p-4 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                    {info.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#0f172a] mb-1 tracking-tight">{info.title}</h3>
                    <p className="text-primary font-bold mb-2">{info.detail}</p>
                    <p className="text-slate-500 text-sm font-medium">{info.description}</p>
                  </div>
                </div>
              </motion.a>
            ))}

            {/* Extra Info */}
            <motion.div 
              variants={itemVariants}
              className="mt-12 bg-primary rounded-[2.5rem] p-8 text-white relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
              <div className="flex items-center gap-4 mb-4">
                  <Clock className="w-6 h-6 text-accent" />
                  <h3 className="text-xl font-black">Support Hours</h3>
              </div>
              <p className="text-slate-300 font-medium leading-relaxed">
                  Our team is available for real-time support from Monday to Friday, 9:00 AM to 6:00 PM. Weekend inquiries are handled on Monday mornings.
              </p>
            </motion.div>
          </motion.div>

          {/* Right: Contact Form Card */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-primary/10 border border-slate-100 relative"
          >
            <div className="absolute -top-6 -left-6 bg-accent text-primary p-4 rounded-2xl shadow-lg rotate-[-10deg] hidden md:block">
              <MessageSquare className="w-8 h-8 font-black" />
            </div>
            <div className="mb-10">
              <h2 className="text-3xl font-black text-[#0f172a] mb-2">Send us a Message</h2>
              <p className="text-slate-500 font-medium">We'll get back to you as soon as possible.</p>
            </div>
            <ContactForm />
          </motion.div>
        </div>
      </div>
    </main>
  )
}

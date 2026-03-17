import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Wings Academy, the premier platform for Aircraft Maintenance Engineers. Our mission is to provide accurate and effective exam preparation tools.",
};
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Target, Shield, Users, Award } from 'lucide-react'

export default function AboutPage() {
  const values = [
    {
      icon: <Target className="w-8 h-8 text-accent" />,
      title: 'Precision & Accuracy',
      description: 'Our question banks are meticulously curated to reflect the exact difficulty and style of official EASA, DGCA, and GCAA exams.'
    },
    {
      icon: <Shield className="w-8 h-8 text-accent" />,
      title: 'Trusted Content',
      description: 'Created by certified aircraft maintenance engineers with decades of industry and instructional experience.'
    },
    {
      icon: <Users className="w-8 h-8 text-accent" />,
      title: 'Student-Centric',
      description: 'We focus on intelligent learning paths, analytics, and intuitive design to make studying efficient and less overwhelming.'
    },
    {
      icon: <Award className="w-8 h-8 text-accent" />,
      title: 'Commitment to Excellence',
      description: 'We continuously update our database to align with the latest regulatory changes and syllabus revisions.'
    }
  ]

  const stats = [
    { number: '10k+', label: 'Active Students' },
    { number: '17+', label: 'Subject Modules' },
    { number: '50k+', label: 'Practice Questions' },
    { number: '98%', label: 'Pass Rate' },
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-32 pb-0 bg-slate-50">

        {/* Intro Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-primary mb-6 tracking-tight">
              About Wings<span className="text-accent"> Academy</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              We are dedicated to providing the most accurate, challenging, and up-to-date mock tests for aspiring Aircraft Maintenance Engineers worldwide.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-primary/5 border border-slate-100 flex flex-col justify-center">
              <h2 className="text-3xl font-bold text-primary mb-6">Our Mission</h2>
              <p className="text-slate-600 leading-relaxed mb-10 text-lg">
                To empower aviation professionals by providing a premium platform that authentically simulates real-world certification exams, helping them build confidence and achieve success on their first attempt.
              </p>
              <h2 className="text-3xl font-bold text-primary mb-6">Our Vision</h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                To be the globally recognized standard for AME exam preparation, bridging the gap between theoretical knowledge and practical certification success.
              </p>
            </div>
            <div className="relative h-full">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-3xl blur-3xl flex items-center justify-center -z-10"></div>
              <div className="bg-primary p-8 md:p-12 rounded-3xl border border-primary-light shadow-2xl h-full flex flex-col justify-center text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                <h3 className="text-2xl font-bold mb-4 relative z-10">Founded by AMEs, for AMEs.</h3>
                <p className="text-slate-300 leading-relaxed text-lg relative z-10">
                  We recognized the severe lack of modernized, mobile-friendly, and accurate testing platforms. We built this platform to be the tool we always wished we had during our own certification journeys.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-primary py-20 border-y border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-4xl md:text-5xl font-black text-accent mb-2">{stat.number}</div>
                  <div className="text-white/80 font-medium tracking-wide uppercase text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Core Values Section */}
        <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-[#0f172a] mb-4">Our Core Values</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              The principles that drive our platform architecture and content creation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl shadow-xl shadow-primary/5 border border-slate-100 flex gap-6 group hover:border-primary/20 transition-all">
                <div className="bg-primary/5 p-4 rounded-2xl h-fit group-hover:bg-primary/10 transition-colors">
                  {value.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#0f172a] mb-3">{value.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

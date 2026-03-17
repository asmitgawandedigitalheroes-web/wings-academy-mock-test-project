import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, BookOpen } from 'lucide-react'
import LoadingButton from '@/components/common/LoadingButton'

const Hero = ({ user }: { user: any }) => {

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 bg-[#f8fafc] overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-block py-1.5 px-4 rounded-full bg-primary/10 text-primary font-black text-xs mb-6 uppercase tracking-[0.2em] border border-primary/5">
              Trusted by Future Engineers
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-primary leading-[1.1] mb-6 tracking-tight">
              Master your Aircraft Maintenance Engineering Exams With <span className="text-accent">Precision</span> Mock Tests
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
              Practice real exam-style questions for EASA, GCAA, and DGCA certifications. Simple, mobile-friendly preparation that guarantees success.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <LoadingButton
                href={user ? "/dashboard" : "/signup"}
                className="w-full sm:w-auto bg-primary text-white px-10 py-5 rounded-2xl font-black text-lg hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-primary/20"
                label={
                  <>
                    {user ? "Go to Dashboard" : "Start Free Tests"}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                }
              />
              <LoadingButton
                href="#modules"
                className="w-full sm:w-auto bg-white text-primary border-2 border-slate-100 shadow-xl shadow-slate-200/50 px-10 py-5 rounded-2xl font-black text-lg hover:bg-slate-50 active:scale-95 transition-all"
                label={
                  <>
                    <BookOpen className="w-5 h-5 mr-2" />
                    View Modules
                  </>
                }
              />
            </div>
          </div>

          {/* Image Content */}
          <div className="flex-1 w-full max-w-2xl lg:max-w-none relative">
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl aspect-[4/3] bg-primary/5 p-2">
              <div className="relative w-full h-full rounded-[2rem] overflow-hidden">
                <Image
                  src="/aircraft_hero.png"
                  alt="Commercial passenger aircraft in flight"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
            {/* Stats card overlaid */}
            <div className="absolute -bottom-8 -left-8 bg-white p-8 rounded-[2rem] shadow-2xl border border-slate-50 flex items-center gap-5 hidden sm:flex transform -rotate-3 hover:rotate-0 transition-transform duration-500">
              <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center text-primary font-black text-xl shadow-lg shadow-accent/20">
                98%
              </div>
              <div>
                <p className="font-black text-primary leading-none text-xl tracking-tight">Pass Rate</p>
                <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">For Active Users</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero

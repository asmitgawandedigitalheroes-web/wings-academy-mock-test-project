import React from 'react'
import { getTestData, unlockTest } from '@/app/actions/dashboard'
import { CreditCard, ShieldCheck, ArrowLeft, ArrowRight, Zap, Target, BookOpen, LockOpen, Landmark, Smartphone } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CheckoutPage({ params }: PageProps) {
  const { id } = await params
  const rawTest = await getTestData(id)
  
  if (!rawTest || (rawTest as any).locked) {
    redirect('/dashboard/modules')
  }
  const test = rawTest as any

  const handleUnlock = async () => {
    'use server'
    const res = await unlockTest(id)
    if (res.success) {
      redirect(`/dashboard/modules/${test.module_id}`)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="space-y-4">
        <Link 
          href={`/dashboard/modules/${test.module_id}`} 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-primary font-bold text-sm transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Cancel & Return
        </Link>
        <h1 className="text-4xl font-black text-[#0f172a] tracking-tight">Unlock Full Access</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Summary Column */}
          <div className="lg:col-span-1 space-y-8">
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-primary/5 space-y-8">
                  <div className="space-y-4">
                      <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                          <LockOpen className="w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-black text-[#0f172a]">{test.title}</h3>
                      <p className="text-slate-500 font-medium text-sm">Gain permanent access to this premium mock test and detailed result explanations.</p>
                  </div>

                  <div className="space-y-4 pt-8 border-t border-slate-50">
                      <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                          <Zap className="w-4 h-4 text-amber-500" />
                          Unlimited attempts
                      </div>
                      <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                          <Target className="w-4 h-4 text-green-500" />
                          Detailed performance analytics
                      </div>
                      <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                          <BookOpen className="w-4 h-4 text-blue-500" />
                          Module-wise benchmarking
                      </div>
                  </div>

                  <div className="pt-8 border-t border-slate-50">
                      <div className="flex items-center justify-between">
                          <span className="text-slate-400 font-black uppercase tracking-widest text-[0.65rem]">Total Amount</span>
                          <span className="text-3xl font-black text-[#0f172a]">AED {test.price || 99}</span>
                      </div>
                  </div>
              </div>
          </div>

          {/* Payment Column */}
          <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-primary/5">
                  <h3 className="text-xl font-black text-[#0f172a] mb-8">Select Payment Method</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                      {[
                          { name: 'Stripe', logo: <CreditCard className="w-6 h-6" /> },
                          { name: 'Telr', logo: <Landmark className="w-6 h-6" /> },
                          { name: 'Tap Payments', logo: <Smartphone className="w-6 h-6" /> },
                      ].map((method, i) => (
                          <button key={i} className={`p-6 rounded-2xl border flex flex-col items-center gap-3 transition-all ${
                              i === 0 ? 'bg-primary/5 border-primary ring-1 ring-primary' : 'bg-slate-50 border-slate-100 hover:border-primary/20'
                          }`}>
                              <span className="text-primary">{method.logo}</span>
                              <span className="text-xs font-black uppercase tracking-widest text-[#0f172a]">{method.name}</span>
                          </button>
                      ))}
                  </div>

                  <div className="space-y-6">
                      <div className="space-y-2">
                          <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-4">Card Holder Name</label>
                          <input type="text" placeholder="ASMIT GAWANDE" className="w-full bg-slate-50 border border-slate-100 py-4 px-6 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 font-bold text-sm" />
                      </div>
                      <div className="space-y-2">
                          <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-4">Card Number</label>
                          <div className="relative">
                              <CreditCard className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                              <input type="text" placeholder="**** **** **** 1234" className="w-full bg-slate-50 border border-slate-100 py-4 pl-14 pr-6 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 font-bold text-sm" />
                          </div>
                      </div>
                  </div>

                  <div className="mt-12 pt-8 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-3 text-slate-400 font-bold text-[0.65rem] uppercase tracking-widest">
                          <ShieldCheck className="w-4 h-4 text-green-500" />
                          Secure 256-bit SSL encrypted payment
                      </div>
                      <form action={handleUnlock}>
                          <button 
                            type="submit"
                            className="w-full md:w-auto bg-primary text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary/90 transition-all hover:shadow-xl hover:shadow-primary/20 flex items-center justify-center gap-3 group"
                          >
                              Complete Payment
                              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </button>
                      </form>
                  </div>
              </div>
          </div>
      </div>
    </div>
  )
}

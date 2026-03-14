import React from 'react'
import { Check } from 'lucide-react'

const Pricing = () => {
  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#0f172a] mb-4">Simple, Transparent Pricing</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Choose the plan that fits your preparation needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <div className="p-8 rounded-2xl border border-slate-200 bg-slate-50 text-center flex flex-col">
            <h3 className="text-2xl font-bold text-[#0f172a] mb-2">Free Starter</h3>
            <div className="text-5xl font-extrabold text-[#0f172a] mb-6">$0</div>
            <p className="text-slate-600 mb-8 text-sm px-4">Great for getting started and understanding the exam pattern.</p>
            
            <ul className="space-y-4 mb-10 flex-grow text-left max-w-xs mx-auto">
              <li className="flex items-center gap-3 text-slate-700">
                <Check className="w-5 h-5 text-green-600" />
                <span>2 free tests per module</span>
              </li>
              <li className="flex items-center gap-3 text-slate-700">
                <Check className="w-5 h-5 text-green-600" />
                <span>Practice basic concepts</span>
              </li>
              <li className="flex items-center gap-3 text-slate-400">
                <span className="w-5" />
                <span className="line-through">Real exam difficulty</span>
              </li>
              <li className="flex items-center gap-3 text-slate-400">
                <span className="w-5" />
                <span className="line-through">Detailed score analysis</span>
              </li>
            </ul>
            
            <button className="w-full py-4 rounded-xl text-primary font-bold border-2 border-primary hover:bg-primary/5 transition-colors">
              Start Free Tests
            </button>
          </div>

          {/* Paid Tier */}
          <div className="p-8 rounded-2xl border bg-primary text-white text-center flex flex-col relative shadow-xl">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-cyan-400 text-[#0f172a] font-bold px-4 py-1 rounded-full text-xs uppercase tracking-wide">
              Most Popular
            </div>
            
            <h3 className="text-2xl font-bold mb-2 mt-4">Full Mock Series</h3>
            <div className="text-5xl font-extrabold mb-6">$29<span className="text-xl text-slate-300 font-normal">/once</span></div>
            <p className="text-slate-300 mb-8 text-sm px-4">Everything you need to guarantee your certification success.</p>
            
            <ul className="space-y-4 mb-10 flex-grow text-left max-w-xs mx-auto">
               <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-cyan-400" />
                <span>3+ advanced tests per module</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-cyan-400" />
                <span>Real exam difficulty & timing</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-cyan-400" />
                <span>Detailed score analysis</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-cyan-400" />
                <span>Lifetime access</span>
              </li>
            </ul>
            
            <button className="w-full py-4 rounded-xl bg-cyan-400 text-[#0f172a] font-bold hover:bg-cyan-300 transition-colors">
              Unlock Full Series
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Pricing

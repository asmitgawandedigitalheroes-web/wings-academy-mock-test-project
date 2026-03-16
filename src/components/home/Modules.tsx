import { Wind, Box, Zap, Cpu, Settings, Wrench, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'

const Modules = async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const modules = [
    { name: 'Aerodynamics', tests: 8, free: true, icon: <Wind className="w-6 h-6 text-primary" /> },
    { name: 'Aircraft Structures', tests: 12, free: true, icon: <Box className="w-6 h-6 text-primary" /> },
    { name: 'Propulsion', tests: 10, free: false, icon: <Zap className="w-6 h-6 text-primary" /> },
  ]

  return (
    <section id="modules" className="py-20 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <h2 className="text-4xl font-black text-primary mb-2 tracking-tight">Exam Modules</h2>
            <p className="text-slate-500 max-w-xl text-lg font-medium leading-relaxed">
              Targeted practice questions across all major AME certification modules.
            </p>
          </div>
          <Link href="/dashboard/modules" className="flex items-center gap-2 text-primary font-black hover:text-accent transition-all text-sm uppercase tracking-widest">
            View All Modules
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map((module, index) => (
            <div key={index} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/20 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all flex flex-col h-full group">
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 rounded-2xl bg-primary/5 text-primary group-hover:scale-110 transition-transform">
                  {module.icon}
                </div>
                {module.free && (
                  <span className="text-[0.65rem] font-black uppercase tracking-[0.15em] bg-accent/20 text-accent-foreground px-3 py-1.5 rounded-full">
                    Free Tests
                  </span>
                )}
              </div>
              <h3 className="text-xl font-black text-primary mb-2 tracking-tight">{module.name}</h3>
              <p className="text-slate-500 font-medium mb-8 flex-grow leading-relaxed">
                {module.tests} Practice tests available.
              </p>
              <Link href={user ? "/dashboard/modules" : "/signup"} className="w-full py-4 rounded-xl text-primary font-black border-2 border-primary/10 hover:bg-primary hover:text-white transition-all text-sm uppercase tracking-widest active:scale-95 text-center">
                {user ? "Explore Modules" : "Explore Tests"}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Modules

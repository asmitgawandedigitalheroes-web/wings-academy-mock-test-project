import { Wind, Box, Zap, Cpu, Settings, Wrench, ArrowRight, Plane, Users, FileText, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import LoadingButton from '@/components/common/LoadingButton'

interface ModuleData {
  id: string
  name: string
  description: string
  price: number
  imageUrl?: string
  iconUrl?: string
  totalTests: number
  freeTests: number
}

const getModuleIcon = (name: string, iconUrl?: string) => {
  if (iconUrl) {
    return <img src={iconUrl} alt={name} className="w-6 h-6 object-contain" />
  }

  const n = name.toLowerCase()
  if (n.includes('aerodynamics')) return <Wind className="w-6 h-6 text-primary" />
  if (n.includes('structure')) return <Box className="w-6 h-6 text-primary" />
  if (n.includes('propulsion') || n.includes('electrical') || n.includes('electronic')) return <Zap className="w-6 h-6 text-primary" />
  if (n.includes('engine') || n.includes('propeller') || n.includes('piston')) return <Settings className="w-6 h-6 text-primary" />
  if (n.includes('maintenance') || n.includes('hardware')) return <Wrench className="w-6 h-6 text-primary" />
  if (n.includes('human')) return <Users className="w-6 h-6 text-primary" />
  if (n.includes('legislation')) return <FileText className="w-6 h-6 text-primary" />
  if (n.includes('aeroplane') || n.includes('helicopter')) return <Plane className="w-6 h-6 text-primary" />
  return <Cpu className="w-6 h-6 text-primary" />
}

const Modules = ({ user, initialModules }: { user: any, initialModules?: ModuleData[] }) => {
  const displayModules = initialModules && initialModules.length > 0 
    ? initialModules 
    : [
        { id: '1', name: 'Aerodynamics', description: 'Targeted practice questions for Aerodynamics.', totalTests: 8, freeTests: 2, price: 0 },
        { id: '2', name: 'Aircraft Structures', description: 'Master aircraft structural components and maintenance.', totalTests: 12, freeTests: 4, price: 0 },
        { id: '3', name: 'Propulsion', description: 'In-depth tests for aircraft propulsion systems.', totalTests: 10, freeTests: 0, price: 0 },
      ]

  return (
    <section id="modules" className="py-20 bg-white border-t border-slate-100 overflow-hidden">
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
          {displayModules.map((module: any, index: number) => (
            <div key={module.id || index} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/20 hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all flex flex-col h-full group">
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 rounded-2xl bg-primary/5 text-primary group-hover:scale-110 transition-transform">
                  {getModuleIcon(module.name, module.iconUrl)}
                </div>
                {(module.freeTests > 0 || module.totalTests > 0) && (
                  <span className="text-[0.65rem] font-black uppercase tracking-[0.15em] bg-accent/20 text-accent-foreground px-3 py-1.5 rounded-full">
                    {module.freeTests > 0 ? 'Free Tests' : 'Premium'}
                  </span>
                )}
              </div>
              <h3 className="text-xl font-black text-primary mb-2 tracking-tight line-clamp-2 min-h-[3.5rem]">{module.name}</h3>
              <p className="text-slate-500 font-medium mb-8 flex-grow leading-relaxed line-clamp-2">
                {module.totalTests} Practice tests available.
              </p>
              <LoadingButton 
                href={user ? `/dashboard/modules/${module.id}` : "/signup"} 
                className="w-full py-4 rounded-xl text-primary font-black border-2 border-primary/10 hover:bg-primary hover:text-white transition-all text-sm uppercase tracking-widest active:scale-95 text-center"
                label={user ? "Explore Module" : "Explore Tests"}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Modules

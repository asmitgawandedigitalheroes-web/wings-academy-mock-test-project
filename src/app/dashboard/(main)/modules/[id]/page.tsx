import { Clock, FileText, Lock as LockIcon, Library, Unlock, Zap, Target, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import BackButton from '@/components/common/BackButton'
import StartTestButton from '@/components/test/StartTestButton'
import { getModuleTests } from '@/app/actions/dashboard'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ModuleDetailPage({ params }: PageProps) {
  const { id } = await params
  const { module, tests } = (await getModuleTests(id)) as { module: any, tests: any[] }

  if (!module) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-black text-[#0f172a]">Module not found</h2>
        <Link href="/dashboard/modules" className="text-primary font-bold mt-4 inline-block">Back to modules</Link>
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header & Breadcrumbs */}
      <div className="space-y-4">
        <BackButton variant="ghost" className="-ml-3" />
        <div>
          <h1 className="text-4xl font-black text-[#0f172a] tracking-tight">{module.name}</h1>
          <p className="text-slate-500 font-medium mt-2 max-w-2xl">{module.description || 'Access all mock tests for this module. Practice with timed exams to improve your performance.'}</p>
        </div>
      </div>

      {/* Module Purchase CTA */}
      {!module.isUnlocked && (module.enable_purchase || module.price > 0) && (
        <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl transition-all group-hover:bg-primary/10" />
          <div className="relative z-10 space-y-4">
            <h2 className="text-2xl md:text-3xl font-black text-[#0f172a]">Unlock Complete Module</h2>
            <p className="text-slate-500 font-medium max-w-xl">Get full access to all 5 tests in this module, including detailed explanations and performance tracking for just <span className="text-primary font-black">AED {module.price || 49}</span>.</p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500" /> 3 Paid Tests</span>
              <span className="flex items-center gap-2"><Target className="w-4 h-4 text-green-500" /> Lifetime Access</span>
            </div>
          </div>
          <Link 
            href={`/dashboard/checkout/module/${module.id}`}
            className="relative z-10 bg-primary text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#152e75] hover:scale-105 transition-all shadow-xl shadow-primary/20 flex items-center gap-3 group/btn"
          >
            Purchase Module
            <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}

      {/* Tests List */}
      <div className="grid grid-cols-1 gap-6">
        {tests.map((test) => (
          <div key={test.id} className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-primary/5 overflow-hidden hover:border-primary/20 transition-all duration-300">
            <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex flex-col md:flex-row md:items-center gap-8 flex-1">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${
                    test.isUnlocked ? 'bg-green-50 text-green-600' : 'bg-slate-50 text-slate-400'
                }`}>
                  {test.isUnlocked ? <Unlock className="w-7 h-7" /> : <LockIcon className="w-7 h-7" />}
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-black text-[#0f172a]">{test.title}</h3>
                    <span className={`text-[0.6rem] font-black uppercase px-2.5 py-1 rounded-lg ${
                        test.isPaid ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
                    }`}>
                        {test.isPaid ? 'Paid Test' : 'Free Test'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-300" />
                        <span className="text-xs font-bold text-slate-500">{test.questionCount} Questions</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-300" />
                        <span className="text-xs font-bold text-slate-500">{test.duration}</span>
                    </div>
                    {test.attemptsAllowed > 0 && (
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-300" />
                        <span className="text-xs font-bold text-slate-500">
                          {test.completedAttempts}/{test.attemptsAllowed} Attempts
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {test.lockoutMinutes > 0 ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="px-6 py-3 bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest border border-red-100 flex items-center gap-2">
                      <LockIcon className="w-4 h-4" />
                      Locked
                    </div>
                    <span className="text-[0.65rem] font-bold text-red-400">Try in {test.lockoutMinutes} mins</span>
                  </div>
                ) : test.isLimitReached ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="px-6 py-3 bg-amber-50 text-amber-600 rounded-2xl font-black text-xs uppercase tracking-widest border border-amber-100 flex items-center gap-2">
                      <LockIcon className="w-4 h-4" />
                      Limit Reached
                    </div>
                    <span className="text-[0.65rem] font-bold text-amber-400">Max attempts used</span>
                  </div>
                ) : test.isUnlocked ? (
                  <StartTestButton testId={test.id} status="Start" />
                ) : (
                  <Link 
                    href={`/dashboard/checkout/module/${module.id}`}
                    className="w-full md:w-auto px-8 py-4 bg-slate-50 text-[#0f172a] hover:bg-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-100 flex items-center justify-center gap-3 transition-all"
                  >
                    Unlock to access
                    <LockIcon className="w-5 h-5 text-amber-500" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}

        {tests.length === 0 && (
            <div className="py-20 text-center bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-primary/5">
                <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Library className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-[#0f172a]">No Tests Available</h3>
                <p className="text-slate-500 font-medium">Please check back later for new mock tests in this module.</p>
            </div>
        )}
      </div>
    </div>
  )
}

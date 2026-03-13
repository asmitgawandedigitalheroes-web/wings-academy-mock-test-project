import React from 'react'
import { Clock, FileText, Lock as LockIcon, Library, Unlock } from 'lucide-react'
import Link from 'next/link'
import BackButton from '@/components/common/BackButton'
import StartTestButton from '@/components/test/StartTestButton'
import { getSubjectTests } from '@/app/actions/dashboard'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function SubjectDetailPage({ params }: PageProps) {
  const { id } = await params
  const { subject, tests } = await getSubjectTests(id)

  if (!subject) {
    return (
      <div className="py-20 text-center">
        <h2 className="text-2xl font-black text-[#0f172a]">Subject not found</h2>
        <Link href="/dashboard/subjects" className="text-primary font-bold mt-4 inline-block">Back to subjects</Link>
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header & Breadcrumbs */}
      <div className="space-y-4">
        <BackButton variant="ghost" className="-ml-3" />
        <div>
          <h1 className="text-4xl font-black text-[#0f172a] tracking-tight">{subject.name}</h1>
          <p className="text-slate-500 font-medium mt-2 max-w-2xl">{subject.description || 'Access all mock tests for this subject. Practice with timed exams to improve your performance.'}</p>
        </div>
      </div>

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
                ) : test.isUnlocked ? (
                  <StartTestButton testId={test.id} status="Start" />
                ) : (
                  <Link 
                    href={`/dashboard/checkout/${test.id}`}
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
                <p className="text-slate-500 font-medium">Please check back later for new mock tests in this subject.</p>
            </div>
        )}
      </div>
    </div>
  )
}

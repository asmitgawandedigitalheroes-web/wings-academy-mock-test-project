import React from 'react'
import { getResultsHistory } from '@/app/actions/dashboard'
import { Trophy, ArrowRight, Calendar, Search, FileCheck, Award } from 'lucide-react'
import Link from 'next/link'

export default async function ResultsHistoryPage() {
  const history = await getResultsHistory()

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-[#0f172a] tracking-tight">Results History</h1>
          <p className="text-slate-500 font-medium mt-2">Track your progress and review past performances.</p>
        </div>
        <div className="relative group max-w-sm w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search results..."
            className="w-full bg-white border border-slate-100 py-3 pl-12 pr-6 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white focus:border-primary/20 transition-all font-medium text-sm text-[#0f172a] shadow-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-primary/5 overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="px-8 py-6 text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Mock Test / Module</th>
                <th className="px-8 py-6 text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Score</th>
                <th className="px-8 py-6 text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-6 text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Attempted Date</th>
                <th className="px-8 py-6 text-[0.65rem] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {history.map((record) => (
                <tr key={record.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                        <FileCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-[#0f172a] leading-tight">{record.title}</p>
                        <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mt-1">{record.module}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xl font-black text-[#0f172a]">{record.score}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[0.65rem] font-black uppercase tracking-wider ${record.status === 'Passed' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                      }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${record.status === 'Passed' ? 'bg-green-600' : 'bg-red-600'}`}></div>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                      <Calendar className="w-4 h-4 text-slate-300" />
                      {record.date}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Link
                      href={`/dashboard/results/${record.id}`}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-black text-[0.65rem] uppercase tracking-widest hover:bg-primary/90 transition-all group/btn shadow-lg shadow-primary/10"
                    >
                      View Report
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-slate-50">
          {history.map((record) => (
            <div key={record.id} className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0f172a] leading-tight">{record.title}</h4>
                    <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mt-1">{record.module}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[0.6rem] font-black uppercase tracking-wider shrink-0 ${record.status === 'Passed' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  }`}>
                  {record.status}
                </span>
              </div>
              
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">Score</p>
                  <p className="text-2xl font-black text-[#0f172a]">{record.score}</p>
                </div>
                <div className="text-right space-y-2">
                  <div className="flex items-center justify-end gap-1.5 text-slate-500 font-bold text-[0.7rem]">
                    <Calendar className="w-3 h-3 text-slate-300" />
                    {record.date}
                  </div>
                  <Link
                    href={`/dashboard/results/${record.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-black text-[0.6rem] uppercase tracking-widest shadow-lg shadow-primary/10"
                  >
                    Details
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {history.length === 0 && (
          <div className="py-20 text-center">
            <div className="w-20 h-20 bg-primary/5 text-primary rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Award className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-[#0f172a]">No Results Yet</h3>
            <p className="text-slate-500 font-medium">Start your first mock test to see your history here.</p>
            <Link href="/dashboard/modules" className="mt-8 inline-block px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20">Browse Tests</Link>
          </div>
        )}
      </div>
    </div>
  )
}

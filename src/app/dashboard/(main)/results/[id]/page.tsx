import React from 'react'
import { getResultDetails } from '@/app/actions/dashboard'
import { CheckCircle2, XCircle, ArrowRight, Share2, ClipboardList, TrendingUp, Clock, Target, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import BackButton from '@/components/common/BackButton'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ResultSummaryPage({ params }: PageProps) {
  const { id } = await params
  const result = await getResultDetails(id)

  if (!result) {
    redirect('/dashboard/results')
  }

  const isPassed = result.status === 'Passed'

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <BackButton variant="ghost" className="-ml-3" />
      
      {/* Result Card Header */}
      <div className={`p-10 md:p-14 rounded-[3rem] border shadow-2xl flex flex-col items-center text-center ${
          isPassed ? 'bg-accent/5 border-accent/10 shadow-accent/5' : 'bg-primary/5 border-primary/10 shadow-primary/5'
      }`}>
          <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-8 text-5xl shadow-xl transition-transform hover:scale-110 ${
                isPassed ? 'bg-white text-accent' : 'bg-white text-primary'
          }`}>
              {isPassed ? <CheckCircle2 className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
          </div>
          <h1 className="text-4xl font-black text-[#0f172a] mb-2">{result.showScore ? `Test ${result.status}!` : 'Test Completed!'}</h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
              {result.showScore 
                ? (isPassed ? 'Excellent work! You have cleared the benchmark.' : 'Don\'t give up! Practice more to improve your score.')
                : 'Your submission has been received. Thank you for taking the test.'
              }
          </p>
          
          {result.showScore && (
            <div className="mt-12 flex flex-col md:flex-row items-center gap-12">
                <div className="text-center">
                    <p className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mb-2">Final Score</p>
                    <p className={`text-6xl font-black ${isPassed ? 'text-accent' : 'text-primary'}`}>{Math.round(result.score)}%</p>
                </div>
                <div className="h-20 w-[1px] bg-slate-200 hidden md:block"></div>
                <div className="text-center">
                    <p className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mb-2">Accuracy</p>
                    <p className="text-4xl font-black text-[#0f172a]">{result.accuracy}%</p>
                </div>
            </div>
          )}
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
              { label: 'Correct', value: result.showScore ? result.correct_answers : '---', icon: CheckCircle2, color: 'text-accent bg-accent/5' },
              { label: 'Incorrect', value: result.showScore ? (result.total_questions - result.correct_answers) : '---', icon: XCircle, color: 'text-primary bg-primary/5' },
              { label: 'Total Qs', value: result.total_questions, icon: ClipboardList, color: 'text-primary bg-primary/5' },
              { label: 'Time Spent', value: `${Math.floor(result.time_spent_seconds / 60)}m`, icon: Clock, color: 'text-primary bg-primary/5' },
          ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-primary/5 flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                      <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
                      <p className="text-xl font-black text-[#0f172a] mt-1">{stat.value}</p>
                  </div>
              </div>
          ))}
      </div>

      {/* Actions */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-primary/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                  <BarChart3 className="w-8 h-8" />
              </div>
              <div>
                  <h3 className="font-black text-[#0f172a]">{result.test_sets.title}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{result.moduleName}</p>
              </div>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
              <Link 
                href="/dashboard/results"
                className="flex-1 md:flex-none px-8 py-4 bg-slate-50 text-[#0f172a] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100 text-center"
              >
                  Results History
              </Link>
              <Link 
                href={`/dashboard/test/${result.test_sets.id}`}
                target="_blank"
                className="flex-1 md:flex-none px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#152e75] transition-all hover:shadow-xl hover:shadow-primary/20 flex items-center justify-center gap-2 group"
              >
                  Retake Test
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
          </div>
      </div>

      {/* Review Section */}
      {result.reviewItems && result.reviewItems.length > 0 && (
          <div className="space-y-6">
              <div className="flex items-center gap-3 ml-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-black text-[#0f172a] uppercase tracking-tight">Question Review</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                  {result.reviewItems.map((item: any, idx: number) => {
                      const isCorrect = item.isCorrect
                      const showAnswer = result.showAnswers
                      const showExplanation = result.showExplanation

                      return (
                          <div key={item.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-primary/5 overflow-hidden">
                              <div className="p-8 space-y-6">
                                  <div className="flex items-start justify-between gap-4">
                                      <div className="flex items-start gap-4">
                                            <span className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-slate-400 shrink-0">
                                                {idx + 1}
                                            </span>
                                            <h4 className="text-lg font-bold text-[#0f172a] leading-relaxed pt-2">
                                                {item.questionText}
                                            </h4>
                                      </div>
                                      {showAnswer && (
                                          <div className={`px-4 py-2 rounded-xl border font-black text-[0.6rem] uppercase tracking-widest shrink-0 ${
                                              isCorrect ? 'bg-green-50 border-green-100 text-green-600' : 'bg-red-50 border-red-100 text-red-600'
                                          }`}>
                                              {isCorrect ? 'Correct' : 'Incorrect'}
                                          </div>
                                      )}
                                  </div>

                                  <div className="grid grid-cols-1 gap-3 ml-14">
                                      {item.options.map((option: string, oIdx: number) => {
                                          const isSelected = item.selectedOption === oIdx
                                          const isCorrectOption = item.correctOption === oIdx
                                          
                                          let btnClass = "bg-slate-50 border-slate-100 text-slate-500"
                                          if (showAnswer) {
                                              if (isCorrectOption) btnClass = "bg-green-50 border-green-200 text-green-700 ring-1 ring-green-200"
                                              else if (isSelected && !isCorrectOption) btnClass = "bg-red-50 border-red-200 text-red-700 ring-1 ring-red-200"
                                          } else if (isSelected) {
                                              btnClass = "bg-primary/5 border-primary/20 text-primary"
                                          }

                                          return (
                                              <div key={oIdx} className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${btnClass}`}>
                                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                                                      isSelected ? 'bg-current text-white' : 'bg-white border border-slate-100'
                                                  }`}>
                                                      {String.fromCharCode(65 + oIdx)}
                                                  </div>
                                                  <span className="font-bold text-sm">{option}</span>
                                                  {showAnswer && isSelected && !isCorrectOption && <XCircle className="w-4 h-4 ml-auto" />}
                                                  {showAnswer && isCorrectOption && <CheckCircle2 className="w-4 h-4 ml-auto" />}
                                              </div>
                                          )
                                      })}
                                  </div>

                                  {showExplanation && item.explanation && (
                                      <div className="ml-14 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                          <p className="text-[0.6rem] font-black text-primary uppercase tracking-[0.2em] mb-2">Explanation</p>
                                          <p className="text-sm font-medium text-slate-500 leading-relaxed italic">
                                              {item.explanation}
                                          </p>
                                      </div>
                                  )}
                              </div>
                          </div>
                      )
                  })}
              </div>
          </div>
      )}
    </div>
  )
}

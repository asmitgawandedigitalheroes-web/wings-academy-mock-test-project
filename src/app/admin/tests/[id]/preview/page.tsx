'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ChevronLeft, 
  Clock, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Loader2,
  Star,
  Info,
  ChevronRight,
  Eye
} from 'lucide-react'
import Link from 'next/link'
import { getTestDetails, getQuestionsByTest } from '@/app/actions/admin'

export default function TestPreviewPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [test, setTest] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number[]>>({})
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [testData, questionsData] = await Promise.all([
          getTestDetails(id),
          getQuestionsByTest(id)
        ])
        setTest(testData)
        setQuestions(questionsData)
      } catch (error) {
        console.error('Error fetching preview data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="font-black text-slate-400 animate-pulse uppercase tracking-widest text-xs">Preparing Preview...</p>
      </div>
    )
  }

  if (!test || questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center space-y-6">
        <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center mx-auto text-slate-400">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-black text-[#0f172a]">No Questions Found</h2>
        <p className="text-slate-500 font-medium">Add some questions to this test first to see a preview.</p>
        <Link 
          href={`/admin/tests/${id}`}
          className="inline-flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.05] transition-all"
        >
          <HelpCircle className="w-5 h-5" />
          Add Questions
        </Link>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]

  const handleOptionSelect = (optIdx: number) => {
    const qId = currentQuestion.id
    if (currentQuestion.question_type === 'single') {
      setSelectedAnswers(prev => ({ ...prev, [qId]: [optIdx] }))
    } else {
      const current = selectedAnswers[qId] || []
      const updated = current.includes(optIdx)
        ? current.filter(i => i !== optIdx)
        : [...current, optIdx]
      setSelectedAnswers(prev => ({ ...prev, [qId]: updated }))
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-primary/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <button 
            onClick={() => router.back()}
            className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 transition-all group"
          >
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[0.65rem] font-black text-primary uppercase tracking-[0.2em]">Preview Mode</span>
              <span className="text-slate-200">•</span>
              <span className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em] capitalize">{test.modules?.name}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-[#0f172a] capitalize">{test.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-6 px-6 py-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase leading-none">Time Limit</span>
                <span className="text-sm font-black text-[#0f172a]">{test.time_limit_minutes}m</span>
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-400 uppercase leading-none">Total Marks</span>
                <span className="text-sm font-black text-[#0f172a]">
                  {questions.reduce((acc, q) => acc + (q.marks || 1), 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar (Desktop) */}
        <div className="lg:col-span-3 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-primary/5 sticky top-24 hidden lg:block">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 px-2">Question Palette</h3>
          <div className="grid grid-cols-4 gap-2">
            {questions.map((_: any, idx: number) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`w-full aspect-square rounded-xl text-xs font-black transition-all ${
                  currentQuestionIndex === idx 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' 
                    : selectedAnswers[questions[idx].id]?.length > 0
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Main Question Area */}
        <div className="lg:col-span-9 space-y-6">
          <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-primary/5 relative overflow-hidden min-h-[500px] flex flex-col">
            <div className="absolute top-0 left-0 w-full h-2 bg-slate-50">
              <div 
                className="h-full bg-primary transition-all duration-500" 
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary font-black text-sm">
                  {currentQuestionIndex + 1}
                </span>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                      {currentQuestion.question_type === 'multiple' ? 'Multiple Choice' : 'Single Choice'}
                    </span>
                    <span className="text-slate-200">•</span>
                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {currentQuestion.marks || 1} Marks
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8 flex-1">
              <h2 className="text-xl md:text-2xl font-bold text-[#0f172a] leading-relaxed">
                {currentQuestion.question_text}
              </h2>

              {currentQuestion.image_url && (
                <div className="w-full max-w-2xl aspect-video rounded-3xl overflow-hidden border border-slate-100 bg-slate-50 mx-auto shadow-inner">
                  <img src={currentQuestion.image_url} alt="Question" className="w-full h-full object-contain" />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options.map((option: string, idx: number) => {
                  const isSelected = selectedAnswers[currentQuestion.id]?.includes(idx)
                  const isCorrect = currentQuestion.correct_options ? currentQuestion.correct_options.includes(idx) : currentQuestion.correct_option_index === idx
                  const showCorrect = showExplanation[currentQuestion.id]

                  return (
                    <button
                      key={idx}
                      onClick={() => !showCorrect && handleOptionSelect(idx)}
                      disabled={showCorrect}
                      className={`p-5 rounded-2xl border text-left flex items-start gap-4 transition-all group ${
                        showCorrect
                          ? isCorrect
                            ? 'bg-green-50 border-green-200 ring-2 ring-green-100'
                            : isSelected
                              ? 'bg-red-50 border-red-200 opacity-80'
                              : 'bg-slate-50 border-slate-100 opacity-60'
                          : isSelected
                            ? 'bg-primary/5 border-primary ring-2 ring-primary/10'
                            : 'bg-white border-slate-100 hover:border-primary/30 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 transition-all ${
                        showCorrect
                          ? isCorrect
                            ? 'bg-green-500 text-white'
                            : isSelected
                              ? 'bg-red-500 text-white'
                              : 'bg-slate-200 text-slate-400'
                          : isSelected
                            ? 'bg-primary text-white'
                            : 'bg-slate-50 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <span className={`text-sm font-bold block ${isSelected ? 'text-primary' : 'text-slate-600'}`}>
                          {option}
                        </span>
                        {showCorrect && isCorrect && (
                          <span className="text-[10px] font-black text-green-600 uppercase tracking-widest flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Correct Answer
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Explanation & Answer Key */}
            {showExplanation[currentQuestion.id] && (
              <div className="mt-10 p-6 bg-primary/5 rounded-3xl border border-primary/10 space-y-4 animate-in slide-in-from-top-4 duration-300">
                <div className="flex items-center gap-2 text-primary">
                  <Info className="w-5 h-5" />
                  <h4 className="text-sm font-black uppercase tracking-widest">Correct Answer Explanation</h4>
                </div>
                <p className="text-slate-600 font-medium leading-relaxed">
                  {currentQuestion.explanation || 'No detailed explanation provided for this question.'}
                </p>
              </div>
            )}

            {/* Footer Navigation */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-slate-50">
              <button
                onClick={() => setShowExplanation(prev => ({ ...prev, [currentQuestion.id]: !prev[currentQuestion.id] }))}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  showExplanation[currentQuestion.id]
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-primary border border-primary/20 hover:bg-primary/5'
                }`}
              >
                <Eye className="w-4 h-4" />
                {showExplanation[currentQuestion.id] ? 'Hide Explanation' : 'Show Answer'}
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-6 py-3 bg-slate-50 text-slate-400 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-slate-50 transition-all"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className="px-8 py-3 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.05] disabled:opacity-30 disabled:hover:scale-100 transition-all"
                >
                  Next Question
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-slate-400">
            <Info className="w-4 h-4" />
            <p className="text-[10px] font-bold uppercase tracking-widest">This is an administrative preview. Results are not saved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

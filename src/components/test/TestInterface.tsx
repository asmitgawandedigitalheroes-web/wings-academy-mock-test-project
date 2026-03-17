'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Flag,
  RotateCcw,
  ArrowLeft,
  PenTool,
  Shield,
  Layout,
  MousePointer,
  Monitor,
  Maximize
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { startTestSession, updateTestProgress, finalizeTest, getSessionProgress } from '@/app/actions/dashboard'
import { useAntiCheat } from '@/hooks/useAntiCheat'

interface TestInterfaceProps {
  test: {
    id: string;
    title: string;
    description?: string;
    time_limit_minutes: number;
    marks_per_question?: number;
    negative_marks?: number;
    module_name?: string;
    questions?: any[];
  }
  user?: {
    id?: string;
    email?: string;
  }
}

export default function TestInterface({ test, user }: TestInterfaceProps) {
  const router = useRouter()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number | number[]>>({})
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set())
  const [visitedQuestions, setVisitedQuestions] = useState<Set<string>>(new Set())
  const [timeLeft, setTimeLeft] = useState(() => test.time_limit_minutes * 60)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [isExamStarted, setIsExamStarted] = useState(false)
  const [startConfirmText, setStartConfirmText] = useState('')
  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false)
  const [isViolationTerminated, setIsViolationTerminated] = useState(false)

  // Anti-cheat system
  const {
    violations,
    isFullscreen,
    showWarning,
    warningMessage,
    isTerminated,
    violationCount,
    maxViolations,
    requestFullscreen,
    exitFullscreen,
    logViolation
  } = useAntiCheat({
    userId: user?.id || 'guest',
    examId: test.id,
    userEmail: user?.email,
    config: {
      enablePrintScreenDetection: true,
      enableTabSwitchDetection: true,
      enableFullscreenMode: true,
      enableRightClickBlock: true,
      enableTextSelectionBlock: true,
      enableCopyPasteDetection: true,
      enableWatermark: true,
      maxViolations: 5
    },
    onMaxViolationsReached: () => {
      handleSubmit(false, true)
    }
  })

  // Question randomization state
  const [shuffledQuestions, setShuffledQuestions] = useState<any[]>([])
  const [shuffledOptions, setShuffledOptions] = useState<Record<string, any[]>>({})

  const originalQuestions = test.questions || []
  const currentQuestion = shuffledQuestions.length > 0 
    ? shuffledQuestions[currentQuestionIdx] 
    : originalQuestions[currentQuestionIdx]
  const isTimeExpiredRef = useRef(false)
  const hasSubmittedRef = useRef(false)

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs > 0 ? hrs + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleSubmit = useCallback(async (isAutoSubmit = false, isViolation = false) => {
    if (hasSubmittedRef.current || !sessionId) return
    if (isSubmitting && !isAutoSubmit) return

    hasSubmittedRef.current = true
    setIsSubmitting(true)

    if (isAutoSubmit) {
      setShowConfirmSubmit(false)
      setIsAutoSubmitting(true)
    }

    if (isViolation) {
      setIsViolationTerminated(true)
    }

    try {
      const response: any = await finalizeTest(sessionId, isViolation)
      if (response.success) {
        sessionStorage.removeItem(`test_session_${test.id}`)
        
        if (isViolation) return

        await exitFullscreen()
        router.push(`/dashboard/results/${response.resultId}`)
      } else {
        hasSubmittedRef.current = false
        setIsAutoSubmitting(false)
        alert('Error submitting test: ' + (response.error || 'Unknown error'))
      }
    } catch (err) {
      console.error('Submission failed:', err)
      hasSubmittedRef.current = false
      setIsAutoSubmitting(false)
    } finally {
      setIsSubmitting(false)
    }
  }, [sessionId, isSubmitting, router, test.id, exitFullscreen])

  // Timer logic
  useEffect(() => {
    if (!isExamStarted) return
    if (timeLeft <= 0 && !isTimeExpiredRef.current) {
      isTimeExpiredRef.current = true
      handleSubmit(true)
      return
    }

    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, handleSubmit, isExamStarted])

  // Question Randomization
  useEffect(() => {
    if (!isExamStarted) return

    // Use sessionId for seed if available to keep order consistent on refresh
    const seedString = `${sessionId || 'new'}-${user?.id || 'guest'}-${test.id}`
    let seed = 0
    for (let i = 0; i < seedString.length; i++) {
      seed = (seed << 5) - seed + seedString.charCodeAt(i)
      seed |= 0
    }

    const seededRandom = () => {
      seed = (seed * 9301 + 49297) % 233280
      return seed / 233280
    }

    // Shuffle Questions
    const indices = originalQuestions.map((_, i) => i)
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom() * (i + 1))
      ;[indices[i], indices[j]] = [indices[j], indices[i]]
    }
    const shuffled = indices.map((i: number) => originalQuestions[i])
    setShuffledQuestions(shuffled)

    // Shuffle Options
    const shuffledOpts: Record<string, any[]> = {}
    shuffled.forEach((q: any) => {
      if (q && q.options && Array.isArray(q.options) && q.options.length > 0) {
        const optIndices = q.options.map((_: any, i: number) => i)
        for (let i = optIndices.length - 1; i > 0; i--) {
          const j = Math.floor(seededRandom() * (i + 1))
          ;[optIndices[i], optIndices[j]] = [optIndices[j], optIndices[i]]
        }
        shuffledOpts[q.id] = optIndices.map((i: number) => {
          const opt = q.options![i]
          return {
            text: opt ? (typeof opt === 'string' ? opt : opt.text || '') : '',
            originalIndex: i
          }
        })
      }
    })
    setShuffledOptions(shuffledOpts)
  }, [isExamStarted, originalQuestions, test.id, user?.id])

  // Track visited questions
  useEffect(() => {
    // Only track if shuffledQuestions is populated to avoid race conditions
    if (isExamStarted && currentQuestion?.id && shuffledQuestions.length > 0) {
      setVisitedQuestions(prev => {
        if (prev.has(currentQuestion.id)) return prev
        const next = new Set(prev)
        next.add(currentQuestion.id)
        return next
      })
    }
  }, [isExamStarted, currentQuestionIdx, currentQuestion?.id, shuffledQuestions.length])

  const saveProgress = useCallback(async (qId: string, selection: number | number[] | null, flagged: boolean) => {
    if (!sessionId) return
    try {
      await updateTestProgress(sessionId, qId, selection, flagged)
    } catch (err) {
      console.error('Failed to save progress:', err)
    }
  }, [sessionId])

  const handleOptionSelect = (optionIdx: number) => {
    const isMultiple = currentQuestion.question_type === 'multiple'
    setAnswers(prev => {
      let newSelection: number | number[] | null = null
      if (isMultiple) {
        const current = (prev[currentQuestion.id] as number[]) || []
        if (current.includes(optionIdx)) {
          newSelection = current.filter((id: number) => id !== optionIdx)
        } else {
          newSelection = [...current, optionIdx]
        }
      } else {
        newSelection = optionIdx
      }
      const next = { ...prev, [currentQuestion.id]: newSelection as any }
      saveProgress(currentQuestion.id, newSelection, flaggedQuestions.has(currentQuestion.id))
      return next
    })
  }

  const toggleFlag = () => {
    const willBeFlagged = !flaggedQuestions.has(currentQuestion.id)
    setFlaggedQuestions(prev => {
      const next = new Set(prev)
      if (next.has(currentQuestion.id)) next.delete(currentQuestion.id)
      else next.add(currentQuestion.id)
      return next
    })
    saveProgress(currentQuestion.id, answers[currentQuestion.id] ?? null, willBeFlagged)
  }

  // Session Initialization
  useEffect(() => {
    const initSession = async () => {
      const storageKey = `test_session_${test.id}`
      const savedSessionId = sessionStorage.getItem(storageKey)

      if (savedSessionId) {
        const res = await startTestSession(test.id, savedSessionId)
        if (res.sessionId) {
          setSessionId(res.sessionId)
          if (res.startTime) {
            const startedAt = new Date(res.startTime).getTime()
            const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000)
            const remaining = (res.timeLimit * 60) - elapsedSeconds
            if (remaining <= 0) {
              setTimeLeft(0)
            } else {
              setTimeLeft(remaining)
            }
          }
          const progress = await getSessionProgress(res.sessionId)
          if (progress.answers) {
            const loadedAnswers: Record<string, number | number[]> = {}
            const loadedFlagged = new Set<string>()
            progress.answers.forEach((a: any) => {
              if (a.selected_options && a.selected_options.length > 0) {
                loadedAnswers[a.question_id] = a.selected_options
              } else if (a.selected_option_index !== null && a.selected_option_index !== -1) {
                loadedAnswers[a.question_id] = a.selected_option_index
              }
              if (a.is_flagged) loadedFlagged.add(a.question_id)
            })
            setAnswers(loadedAnswers)
            setFlaggedQuestions(loadedFlagged)
          }
        }
      }
      setIsReady(true)
    }
    initSession()
  }, [test.id])

  const handleStartExam = async () => {
    if (startConfirmText.toUpperCase() === 'START') {
      setIsSubmitting(true)
      try {
        // Request fullscreen INSTANTLY on user gesture
        // Async calls below (like startTestSession) will break the gesture context
        requestFullscreen()

        if (!sessionId) {
          const res = await startTestSession(test.id)
          if (res.sessionId) {
            setSessionId(res.sessionId)
            sessionStorage.setItem(`test_session_${test.id}`, res.sessionId)
            setTimeLeft(res.timeLimit * 60)
          } else {
            alert('Failed to start test session: ' + res.error)
            setIsSubmitting(false)
            return
          }
        }
        setIsExamStarted(true)
      } catch (err) {
        console.error('Failed to start exam:', err)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  if (!isReady) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center gap-6">
        <div className="w-16 h-16 border-4 border-slate-100 border-t-primary rounded-full animate-spin"></div>
        <h3 className="text-xl font-black text-[#0f172a]">Loading Test...</h3>
      </div>
    )
  }

  if (!isExamStarted) {
    const instructions = [
      {
        icon: <Maximize className="w-5 h-5" />,
        title: "Fullscreen Mode",
        text: "The exam will run in fullscreen mode. Exiting fullscreen will be logged as a violation."
      },
      {
        icon: <Layout className="w-5 h-5" />,
        title: "Tab Switching",
        text: "Switching tabs or minimizing the window is strictly prohibited and monitored."
      },
      {
        icon: <MousePointer className="w-5 h-5" />,
        title: "Interactions",
        text: "Right-click and text selection are disabled. Screenshot attempts will be detected."
      },
      {
        icon: <Monitor className="w-5 h-5" />,
        title: "Single Screen",
        text: "Please use only one monitor. Extended displays are not allowed during the exam."
      }
    ]

    return (
      <div className="max-w-6xl mx-auto space-y-12 pb-20 pt-12 px-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard/modules')}
            className="flex items-center gap-2 text-slate-400 hover:text-primary font-black text-[0.65rem] uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>

        <div className="bg-white p-8 md:p-16 rounded-[3.5rem] border border-slate-100 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left Section: Details */}
            <div className="space-y-12">
              <div className="space-y-6">
                <div className="w-20 h-20 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary">
                  <PenTool className="w-10 h-10" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-[#0f172a] tracking-tight uppercase leading-tight">
                  {test.title}
                </h1>
                <p className="text-slate-500 text-lg font-medium leading-relaxed">
                  {test.description || 'Please review the following instructions carefully before you begin your examination.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Questions', value: originalQuestions.length },
                  { label: 'Marks/Q', value: test.marks_per_question || 1 },
                  { label: 'Duration', value: `${test.time_limit_minutes} Min` },
                  { label: 'Total Marks', value: originalQuestions.length * (test.marks_per_question || 1) }
                ].map((stat, i) => (
                  <div key={i} className="p-6 bg-slate-50 border border-slate-100 rounded-[1.5rem]">
                    <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className="text-xl font-black text-[#0f172a]">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-8 pt-4">
                <div className="space-y-4">
                  <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Type <span className="text-primary font-black">START</span> to confirm
                  </label>
                  <input
                    type="text"
                    value={startConfirmText}
                    onChange={(e) => setStartConfirmText(e.target.value)}
                    placeholder="ENTER START"
                    className="w-full px-8 py-5 bg-slate-50 border border-slate-200 rounded-3xl font-black text-sm tracking-widest focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all uppercase"
                  />
                </div>
                <button
                  onClick={handleStartExam}
                  disabled={startConfirmText.toUpperCase() !== 'START' || isSubmitting}
                  className="w-full bg-primary text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.3em] hover:bg-slate-900 transition-all disabled:opacity-20 shadow-xl shadow-primary/20 flex items-center justify-center gap-4 group"
                >
                  {isSubmitting ? 'Starting...' : 'Start Exam'} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Right Section: Instructions */}
            <div className="bg-slate-50/50 rounded-[2.5rem] p-8 md:p-10 border border-slate-100 space-y-8">
              <div className="flex items-center gap-3 ml-2">
                <Shield className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-black text-[#0f172a] uppercase tracking-tight">Exam Instructions</h2>
              </div>

              <div className="space-y-6">
                {instructions.map((item, idx) => (
                  <div key={idx} className="flex gap-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md hover:border-primary/10 group">
                    <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-black text-[#0f172a] text-sm mb-1">{item.title}</h3>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-red-50 rounded-2xl border border-red-100">
                <p className="text-[0.65rem] font-black text-red-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Final Warning
                </p>
                <p className="text-xs text-red-700/80 font-medium leading-relaxed font-bold">
                  The system will automatically terminate your exam after {maxViolations} violations. All suspicious activities are logged for review by the administrators.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isViolationTerminated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-2xl w-full bg-white p-12 md:p-16 rounded-[3.5rem] border border-red-100 shadow-2xl text-center space-y-8 animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 bg-red-50 text-red-600 rounded-[2rem] flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-12 h-12" />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-black text-[#0f172a] tracking-tight uppercase">EXAM TERMINATED</h1>
            <p className="text-slate-500 font-medium text-lg leading-relaxed">
              Your examination has been automatically terminated due to multiple security violations.
            </p>
          </div>
          
          <div className="bg-red-50 p-6 rounded-3xl border border-red-100 text-left">
            <h3 className="text-red-600 font-black text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4" /> Security Violation Record
            </h3>
            <p className="text-xs text-red-700/80 font-bold leading-relaxed">
              A 1-hour penalty has been applied. You will not be able to attempt this test again until the lockout period expires. All security events have been logged for administrative review.
            </p>
          </div>

          <button
            onClick={async () => {
              await exitFullscreen()
              router.push('/dashboard/my-tests')
            }}
            className="w-full bg-[#0f172a] text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-red-600 transition-all shadow-xl shadow-red-900/10 flex items-center justify-center gap-3 group"
          >
            Return to Dashboard <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col gap-8 pb-20 p-4 md:p-8">
      {/* Header */}
      <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 sticky top-0 z-50">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-[#0f172a]">{test.title}</h1>
          <div className="flex items-center gap-4 text-slate-400 font-bold text-xs uppercase tracking-widest">
            <span>{shuffledQuestions.length} Questions</span>
            <span>•</span>
            <span>{test.module_name || 'General'}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border ${timeLeft < 300 ? 'bg-red-50 border-red-100 text-red-600' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
            <Clock className="w-5 h-5" />
            <span className="text-xl font-black tabular-nums">{formatTime(timeLeft)}</span>
          </div>
          <button
            onClick={() => setShowConfirmSubmit(true)}
            className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all"
          >
            Submit Test
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 flex-1">
        {/* Main Area */}
        <div className="xl:col-span-3 space-y-8">
          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-2xl min-h-[500px] flex flex-col">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <span className="px-4 py-2 bg-slate-50 border border-slate-100 text-[#0f172a] rounded-xl font-black text-xs uppercase tracking-widest">
                  Question {currentQuestionIdx + 1} of {shuffledQuestions.length}
                </span>
                <button
                  onClick={toggleFlag}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[0.65rem] font-black uppercase tracking-widest transition-all ${flaggedQuestions.has(currentQuestion.id) ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-amber-500'}`}
                >
                  <Flag className={`w-3.5 h-3.5 ${flaggedQuestions.has(currentQuestion.id) ? 'fill-current' : ''}`} />
                  {flaggedQuestions.has(currentQuestion.id) ? 'Flagged' : 'Flag for Review'}
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-10">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 border rounded-full text-[0.55rem] font-black uppercase tracking-widest ${currentQuestion?.question_type === 'multiple' ? 'bg-primary/5 text-primary border-primary/10' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                    {currentQuestion?.question_type === 'multiple' ? 'Multiple Choice' : 'Single Choice'}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-[#0f172a] leading-tight">
                  {currentQuestion?.question_text}
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {(shuffledOptions[currentQuestion?.id] || []).map((option, idx) => {
                  const isSelected = Array.isArray(answers[currentQuestion?.id])
                    ? (answers[currentQuestion?.id] as number[]).includes(option.originalIndex)
                    : answers[currentQuestion?.id] === option.originalIndex

                  return (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(option.originalIndex)}
                      className={`p-6 rounded-[1.5rem] text-left transition-all flex items-center gap-6 border ${isSelected ? 'bg-primary/5 border-primary ring-1 ring-primary' : 'bg-slate-50 border-slate-100 hover:border-primary/20'}`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${isSelected ? 'bg-primary text-white' : 'bg-white border border-slate-100 text-slate-400'}`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className="flex-1 font-bold text-[#0f172a]">{option.text}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center justify-between mt-12 pt-8 border-t border-slate-50">
              <button
                disabled={currentQuestionIdx === 0}
                onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 hover:text-primary transition-all disabled:opacity-30"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setAnswers(prev => {
                      const next = { ...prev }
                      delete next[currentQuestion.id]
                      return next
                    })
                    saveProgress(currentQuestion.id, null, flaggedQuestions.has(currentQuestion.id))
                  }}
                  className="px-6 py-4 text-xs font-black text-slate-400 hover:text-red-500 transition-colors flex items-center gap-2 uppercase tracking-widest"
                >
                  <RotateCcw className="w-4 h-4" /> Clear Selection
                </button>
                <button
                  onClick={() => {
                    if (currentQuestionIdx < shuffledQuestions.length - 1) {
                      setCurrentQuestionIdx(prev => prev + 1)
                    } else {
                      setShowConfirmSubmit(true)
                    }
                  }}
                  className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary transition-all flex items-center gap-3"
                >
                  {currentQuestionIdx === shuffledQuestions.length - 1 ? 'Review & Submit' : 'Save & Next'}
                  <ChevronRight className="w-5 h-5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-1">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl sticky top-32">
            <h3 className="text-xl font-black text-[#0f172a] mb-6">Question Palette</h3>
            
            <div className="grid grid-cols-4 sm:grid-cols-6 xl:grid-cols-4 gap-3 mb-8">
              {shuffledQuestions.map((q, idx) => {
                const isCurrent = currentQuestionIdx === idx
                const isAnswered = answers[q.id] !== undefined
                const isFlagged = flaggedQuestions.has(q.id)
                const isVisited = visitedQuestions.has(q.id)

                let statusClass = 'bg-slate-50 text-slate-400 border-slate-100'
                if (isCurrent) statusClass = 'bg-primary text-white border-primary scale-110'
                else if (isFlagged) statusClass = 'bg-amber-50 text-amber-600 border-amber-200'
                else if (isAnswered) statusClass = 'bg-green-50 text-green-600 border-green-100'
                else if (isVisited) statusClass = 'bg-blue-50 text-blue-600 border-blue-100'

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestionIdx(idx)}
                    className={`aspect-square rounded-xl flex items-center justify-center font-black text-xs transition-all border ${statusClass}`}
                  >
                    {idx + 1}
                  </button>
                )
              })}
            </div>

            <div className="space-y-4 pt-8 border-t border-slate-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">Answered</span>
                </div>
                <span className="text-xs font-black text-slate-600">{Object.keys(answers).length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">For Review</span>
                </div>
                <span className="text-xs font-black text-slate-600">{flaggedQuestions.size}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">Visited</span>
                </div>
                <span className="text-xs font-black text-slate-600">{visitedQuestions.size}</span>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-50 space-y-4">
              <div className="flex items-center justify-between px-2">
                <span className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Violations</span>
                <span className={`text-sm font-black ${violationCount > 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {violationCount} / {maxViolations}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${violationCount >= maxViolations - 1 ? 'bg-red-500' : violationCount >= maxViolations / 2 ? 'bg-amber-500' : 'bg-green-500'}`}
                  style={{ width: `${(violationCount / maxViolations) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlays */}
      {showWarning && (
        <div className="fixed top-8 right-8 z-[200] animate-in slide-in-from-right-10 duration-500">
          <div className="bg-white rounded-[1.5rem] p-6 shadow-2xl border-l-4 border-red-500 max-w-sm flex gap-4 items-start">
            <div className="p-2 bg-red-50 text-red-500 rounded-xl">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black text-[#0f172a] text-sm">Security Alert</p>
              <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">{warningMessage}</p>
            </div>
          </div>
        </div>
      )}

      {!isFullscreen && isExamStarted && (
        <div className="fixed top-8 left-8 z-[200] animate-in slide-in-from-top-10 duration-500">
          <button 
            onClick={requestFullscreen}
            className="bg-amber-500 text-white px-6 py-3 rounded-2xl font-black text-[0.65rem] uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-amber-500/20"
          >
            <Maximize className="w-4 h-4" /> Go Fullscreen
          </button>
        </div>
      )}
      {isAutoSubmitting && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[120] flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] p-10 max-w-md w-full text-center">
            <h3 className="text-2xl font-black text-[#0f172a] mb-4">Time&apos;s Up!</h3>
            <p className="text-slate-500 font-medium mb-6">Submitting your exam...</p>
            <div className="w-12 h-12 border-4 border-slate-100 border-t-primary rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      )}

      {showConfirmSubmit && !isAutoSubmitting && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-black text-[#0f172a] text-center mb-4">Submit Exam?</h3>
            <p className="text-slate-500 text-center font-medium mb-8">
              Answered: <span className="text-primary font-black">{Object.keys(answers).length}</span> / {shuffledQuestions.length}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setShowConfirmSubmit(false)} className="py-4 bg-slate-50 rounded-2xl font-black uppercase tracking-widest text-xs">Cancel</button>
              <button onClick={() => handleSubmit(false)} disabled={isSubmitting} className="py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs disabled:opacity-50">
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

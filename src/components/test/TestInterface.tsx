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
  AlertTriangle,
  Lock,
  ShieldAlert,
  Monitor,
  Type,
  ArrowLeft,
  FileEdit,
  PenTool
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { startTestSession, updateTestProgress, finalizeTest, getSessionProgress, logTestViolation, terminateTestSession } from '@/app/actions/dashboard'


interface TestInterfaceProps {
  test: any
}

export default function TestInterface({ test }: TestInterfaceProps) {
  const router = useRouter()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number | number[]>>({})
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set())
  const [timeLeft, setTimeLeft] = useState(test.time_limit_minutes * 60)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false)
  const [tabSwitchCount, setTabSwitchCount] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const [isExamStarted, setIsExamStarted] = useState(false)
  const [startConfirmText, setStartConfirmText] = useState('')
  const [isWindowFocused, setIsWindowFocused] = useState(true)
  const [showWarningModal, setShowWarningModal] = useState(false)
  const [warningMessage, setWarningMessage] = useState('')

  const questions = test.questions || []
  const currentQuestion = questions[currentQuestionIdx]
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const tabSwitchCountRef = useRef(0)

  // Handle Security Events
  const reportViolation = useCallback(async (type: string, details: any = {}) => {
    if (sessionId) {
      await logTestViolation(sessionId, test.id, type, details)
    }
  }, [sessionId, test.id])

  const triggerFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen()
      }
    } catch (err) {
      console.error('Fullscreen failed:', err)
    }
  }

  const handleStartExam = async () => {
    if (startConfirmText.toUpperCase() === 'START') {
      setIsSubmitting(true)
      try {
        if (!sessionId) {
          const res = await startTestSession(test.id)
          if (res.sessionId) {
            setSessionId(res.sessionId)
            const storageKey = `test_session_${test.id}`
            sessionStorage.setItem(storageKey, res.sessionId)
            setTimeLeft(res.timeLimit * 60)
          } else {
            alert('Failed to start test session: ' + res.error)
            setIsSubmitting(false)
            return
          }
        }
        await triggerFullscreen()
        setIsExamStarted(true)
      } catch (err) {
        console.error('Failed to start exam:', err)
        alert('An unexpected error occurred. Please try again.')
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleSubmit = useCallback(async () => {
    if (isSubmitting || !sessionId) return
    setIsSubmitting(true)

    const response = await finalizeTest(sessionId)

    if (response.success) {
      // Clear session from storage on successful submission
      sessionStorage.removeItem(`test_session_${test.id}`)
      sessionStorage.removeItem(`test_violation_count_${test.id}`)

      const resultUrl = `/dashboard/results/${response.resultId}`

      // Attempt to redirect the opener and close this window
      if (window.opener && !window.opener.closed) {
        try {
          window.opener.location.href = resultUrl
          window.close()

          // Fallback if window.close() is blocked
          router.push(resultUrl)
        } catch (e) {
          // If opener access is blocked (cross-origin), just redirect here
          router.push(resultUrl)
        }
      } else {
        // Fallback: regular redirection in same tab
        router.push(resultUrl)
      }
    } else {
      alert('Error submitting test: ' + response.error)
      setIsSubmitting(false)
    }
  }, [sessionId, isSubmitting, router])

  // Initialize Session
  useEffect(() => {
    const initSession = async () => {
      // Check for existing session ID in sessionStorage for this specific test
      const storageKey = `test_session_${test.id}`
      const savedSessionId = sessionStorage.getItem(storageKey)

      if (savedSessionId) {
        const res = await startTestSession(test.id, savedSessionId)
        if (res.sessionId) {
          setSessionId(res.sessionId)

          // Calculate remaining time
          if (res.startTime) {
            const startedAt = new Date(res.startTime).getTime()
            const now = new Date().getTime()
            const elapsedSeconds = Math.floor((now - startedAt) / 1000)
            const remaining = (res.timeLimit * 60) - elapsedSeconds

            if (remaining <= 0) {
              alert('Time has expired for this session.')
              setTimeLeft(0)
              sessionStorage.removeItem(storageKey) // Clear expired session
            } else {
              setTimeLeft(remaining)
            }
          }

          // Load progress if existing
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
              if (a.is_flagged) {
                loadedFlagged.add(a.question_id)
              }
            })

            setAnswers(loadedAnswers)
            setFlaggedQuestions(loadedFlagged)
          }
          // Initialize count from sessionStorage if exists
          const savedCount = sessionStorage.getItem(`test_violation_count_${test.id}`)
          if (savedCount) {
            const count = parseInt(savedCount)
            setTabSwitchCount(count)
            tabSwitchCountRef.current = count
          }
        } else if (res.lockoutMinutes) {
          setWarningMessage(res.error)
          setShowWarningModal(true)
        }
      }

      setIsReady(true)
    }
    initSession()

    // Security: Event Handlers
    const handleContextMenu = (e: MouseEvent) => {
      if (!isExamStarted) return
      e.preventDefault()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isExamStarted) return

      // Disable Copy/Paste/Cut/Select All/Print
      if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'a', 'p', 's'].includes(e.key.toLowerCase())) {
        e.preventDefault()
        reportViolation('keyboard_shortcut_blocked', { key: e.key })
        navigator.clipboard.writeText('') // Clear clipboard just in case
        return
      }

      // Disable DevTools
      if (e.key === 'F12' || ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'c', 'j'].includes(e.key.toLowerCase()))) {
        e.preventDefault()
        reportViolation('devtools_attempted', { key: e.key })
        return
      }

      // Print Screen protection & Mac Screenshot shortcuts (Cmd+Shift+3/4/5)
      if (e.key === 'PrintScreen' || ((e.ctrlKey || e.metaKey) && e.shiftKey && ['3', '4', '5', 's'].includes(e.key.toLowerCase()))) {
        e.preventDefault()
        reportViolation('screenshot_attempted')
        navigator.clipboard.writeText('') // Clear clipboard
        alert('Screenshots and copying are strictly prohibited during the exam.')
        return
      }
    }

    const handleVisibilityChange = () => {
      if (!isExamStarted) return

      if (document.hidden) {
        setIsWindowFocused(false)
        tabSwitchCountRef.current += 1
        const newCount = tabSwitchCountRef.current
        setTabSwitchCount(newCount)
        sessionStorage.setItem(`test_violation_count_${test.id}`, newCount.toString())

        reportViolation('tab_switch', { count: newCount })

        if (newCount >= 3) {
          setWarningMessage('Final Warning: Multiple violations detected. Terminating test and locking account for 1 hour.')
          setShowWarningModal(true)

          if (sessionId) {
            terminateTestSession(sessionId)
            sessionStorage.removeItem(`test_session_${test.id}`)
            sessionStorage.removeItem(`test_violation_count_${test.id}`)
          }

          setTimeout(() => window.close(), 3000)
        } else {
          setWarningMessage(`Warning: Tab switching detected. Violation count: ${newCount}/3`)
          setShowWarningModal(true)
        }
      } else {
        setIsWindowFocused(true)
      }
    }

    const handleBlur = () => {
      if (!isExamStarted) return
      setIsWindowFocused(false)
      reportViolation('focus_lost')
    }

    const handleFocus = () => {
      if (!isExamStarted) return
      setIsWindowFocused(true)
    }

    const handleFullscreenChange = () => {
      if (!isExamStarted) return
      if (!document.fullscreenElement) {
        reportViolation('fullscreen_exit')
        setWarningMessage('Warning: You exited fullscreen mode. Please remain in fullscreen.')
        setShowWarningModal(true)
      }
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isExamStarted || isSubmitting) return
      e.preventDefault()
      e.returnValue = ''
    }

    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [test.id, isExamStarted, isSubmitting, reportViolation, handleSubmit])

  // Timer logic
  useEffect(() => {
    if (!isExamStarted) return
    if (timeLeft <= 0) {
      handleSubmit()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, handleSubmit, isExamStarted])

  // Auto-save logic
  const saveProgress = useCallback(async (qId: string, selection: number | number[] | null, flagged: boolean) => {
    if (!sessionId) return
    await updateTestProgress(sessionId, qId, selection, flagged)
  }, [sessionId])

  useEffect(() => {
    // Periodic auto-save every 30 seconds for current answers state
    autoSaveTimerRef.current = setInterval(() => {
      if (sessionId && Object.keys(answers).length > 0) {
        // Just a heartbeat or bulk save if needed.
      }
    }, 30000)
    return () => {
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current)
    }
  }, [sessionId, answers])

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs > 0 ? hrs + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleOptionSelect = (optionIdx: number) => {
    const isMultiple = currentQuestion.question_type === 'multiple'
    
    setAnswers(prev => {
      let newSelection: number | number[] | null = null
      
      if (isMultiple) {
        const current = (prev[currentQuestion.id] as number[]) || []
        if (current.includes(optionIdx)) {
          newSelection = current.filter(id => id !== optionIdx)
        } else {
          newSelection = [...current, optionIdx]
        }
      } else {
        newSelection = optionIdx
      }

      const next = {
        ...prev,
        [currentQuestion.id]: newSelection as any // cast for record safety
      }

      saveProgress(currentQuestion.id, newSelection, flaggedQuestions.has(currentQuestion.id))
      return next
    })
  }

  const toggleFlag = () => {
    const willBeFlagged = !flaggedQuestions.has(currentQuestion.id)
    setFlaggedQuestions(prev => {
      const next = new Set(prev)
      if (next.has(currentQuestion.id)) {
        next.delete(currentQuestion.id)
      } else {
        next.add(currentQuestion.id)
      }
      return next
    })
    saveProgress(currentQuestion.id, answers[currentQuestion.id] ?? null, willBeFlagged)
  }

  if (!isReady) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center gap-6 animate-in fade-in duration-700">
        <div className="w-20 h-20 border-4 border-slate-100 border-t-primary rounded-full animate-spin"></div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-black text-[#0f172a]">Preparing Exam Environment</h3>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Securing your Exam Environment...</p>
        </div>
      </div>
    )
  }

  // TEST OVERVIEW SCREEN
  if (!isExamStarted) {
    return (
      <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 pt-12 px-6">
        {/* Top Navbar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              sessionStorage.removeItem(`test_session_${test.id}`)
              router.push('/dashboard/modules')
            }}
            className="flex items-center gap-2 text-slate-400 hover:text-primary font-black text-[0.65rem] uppercase tracking-[0.2em] transition-all group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
        </div>

        <div className="bg-white p-10 md:p-20 rounded-[3.5rem] border border-slate-100/50 shadow-2xl shadow-primary/5 relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -mr-32 -mt-32 opacity-50 blur-3xl"></div>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-10 mb-16 relative z-10">
            <div className="space-y-4 max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-black text-[#0f172a] tracking-tight uppercase">{test.title}</h1>
              <span className="px-3 py-1 bg-primary/5 text-primary border border-primary/10 rounded-full text-[0.5rem] font-black uppercase tracking-[0.25em]">Secure Exam Mode</span>
              <p className="text-slate-400 text-lg font-medium pt-2 leading-relaxed">
                {test.description || 'Please read the instructions carefully before starting the exam.'}
              </p>
            </div>
            <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center text-primary shadow-inner border border-primary/20 relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <PenTool className="w-10 h-10 transform -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16 relative z-10">
            {[
              { label: 'Questions', value: questions.length },
              { label: 'Marks/Q', value: test.marks_per_question || 1 },
              { label: 'Total Marks', value: questions.length * (test.marks_per_question || 1) },
              { label: 'Duration', value: `${test.time_limit_minutes} Min` }
            ].map((stat, i) => (
              <div key={i} className="p-8 bg-slate-50/50 border border-slate-100 rounded-[2rem] space-y-2 group hover:bg-white hover:border-primary/20 transition-all duration-500 hover:shadow-xl hover:shadow-primary/5">
                <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-primary transition-colors">{stat.label}</p>
                <p className="text-2xl font-black text-[#0f172a]">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-amber-50/30 border border-amber-100/50 rounded-[2.5rem] p-10 md:p-14 space-y-8 mb-16 relative z-10">
            <div className="flex items-center gap-4 text-amber-600">
              <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-[0.15em]">Exam Instructions</h3>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {[
                'Start the exam only when you are ready.',
                'Do not refresh or close the page during the exam.',
                'Tab switching is strictly prohibited (3 warnings max).',
                'Copy/Paste and Right-click are disabled.',
                'The test will auto-submit when the timer expires.',
                'Ensure a stable internet connection.'
              ].map((inst, i) => (
                <li key={i} className="flex gap-4 text-sm font-bold text-slate-600/80 leading-relaxed">
                  <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                  {inst}
                </li>
              ))}
            </ul>
          </div>

          <div className="max-w-xl space-y-8 relative z-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Type className="w-4 h-4 text-slate-300" />
                <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.25em]">
                  Type <span className="text-primary tracking-normal font-black">START</span> to confirm
                </label>
              </div>
              <input
                type="text"
                value={startConfirmText}
                onChange={(e) => setStartConfirmText(e.target.value)}
                placeholder="ENTER START"
                className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl font-black text-sm tracking-[0.3em] focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all uppercase placeholder:text-slate-200"
              />
            </div>
            <button
              onClick={handleStartExam}
              disabled={startConfirmText.toUpperCase() !== 'START'}
              className="w-full bg-[#0f172a] text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.3em] hover:bg-[#152e75] transition-all hover:shadow-2xl hover:shadow-primary/20 flex items-center justify-center gap-4 disabled:opacity-10 disabled:cursor-not-allowed group"
            >
              <Lock className="w-4 h-4" />
              Start Exam
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`transition-all duration-500 ${!isWindowFocused ? 'blur-2xl grayscale pointer-events-none scale-95' : ''} select-none`}
      onCopy={(e: React.ClipboardEvent) => e.preventDefault()}
      onCut={(e: React.ClipboardEvent) => e.preventDefault()}
      onPaste={(e: React.ClipboardEvent) => e.preventDefault()}
      onContextMenu={(e: React.MouseEvent) => e.preventDefault()}
    >
      {/* Focus Security Overlay */}
      {!isWindowFocused && isExamStarted && (
        <div className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-3xl flex items-center justify-center p-6 text-center animate-in fade-in duration-300">
           <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl max-w-md w-full space-y-6">
              <div className="w-24 h-24 bg-red-50 rounded-[2.5rem] flex items-center justify-center mx-auto">
                <ShieldAlert className="w-12 h-12 text-red-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-[#0f172a] uppercase tracking-tight">Security Shield Active</h3>
                <p className="text-slate-500 font-bold leading-relaxed lowercase first-letter:uppercase">
                  The exam content is hidden because the window lost focus. Please click back into the window to resume.
                </p>
              </div>
              <div className="pt-4">
                <button 
                  onClick={() => setIsWindowFocused(true)}
                  className="w-full bg-[#0f172a] text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-[#152e75] transition-all"
                >
                  Return to Exam
                </button>
              </div>
           </div>
        </div>
      )}
      <div className="min-h-[calc(100vh-40px)] flex flex-col gap-8 animate-in fade-in duration-500 pb-20 p-4 md:p-8">
        {/* Test Header */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-primary/5 flex flex-col md:flex-row md:items-center justify-between gap-6 sticky top-0 z-50">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-[#0f172a]">{test.title}</h1>
            <div className="flex items-center gap-4 text-slate-400 font-bold text-xs uppercase tracking-widest">
              <span>Module: {test.module_name || 'General'}</span>
              <span>•</span>
              <span>{questions.length} Questions</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border ${timeLeft < 300 ? 'bg-red-50 border-red-100 text-red-600 animate-pulse' : 'bg-slate-50 border-slate-100 text-slate-600'
              }`}>
              <Clock className="w-5 h-5" />
              <span className="text-xl font-black tabular-nums">{formatTime(timeLeft)}</span>
            </div>
            <button
              onClick={() => setShowConfirmSubmit(true)}
              className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg shadow-primary/20"
            >
              Submit Test
            </button>
          </div>
        </div>

        {/* Anti-screenshot Watermark overlay */}
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden opacity-[0.06] mix-blend-multiply flex flex-wrap content-start">
          {Array.from({ length: 50 }).map((_, i) => (
            <div key={i} className="transform -rotate-45 text-2xl font-black p-20 whitespace-nowrap">
              {test.title} - CONFIDENTIAL
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 flex-1 relative z-10">
          {/* Main Question Area */}
          <div className="xl:col-span-3 space-y-8">
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-primary/5 min-h-[500px] flex flex-col">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <span className="px-4 py-2 bg-slate-50 border border-slate-100 text-[#0f172a] rounded-xl font-black text-xs uppercase tracking-widest">
                    Question {currentQuestionIdx + 1} of {questions.length}
                  </span>
                  <button
                    onClick={toggleFlag}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[0.65rem] font-black uppercase tracking-widest transition-all ${flaggedQuestions.has(currentQuestion.id)
                      ? 'bg-amber-50 border-amber-200 text-amber-600'
                      : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-amber-500'
                      }`}
                  >
                    <Flag className={`w-3.5 h-3.5 ${flaggedQuestions.has(currentQuestion.id) ? 'fill-current' : ''}`} />
                    {flaggedQuestions.has(currentQuestion.id) ? 'Marked as Review' : 'Mark as Review'}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Marks: </span>
                  <span className="text-xs font-black text-primary">+{test.marks_per_question || 1} / -{test.negative_marks || 0}</span>
                </div>
              </div>

              <div className="flex-1 space-y-10">
                <div className="space-y-3">
                  {currentQuestion?.question_type === 'multiple' && (
                    <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[0.55rem] font-black uppercase tracking-widest inline-block">
                      Multiple Choice
                    </span>
                  )}
                  <h2 className="text-2xl font-bold text-[#0f172a] leading-relaxed select-none first-letter:uppercase">
                    {currentQuestion?.question_text}
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {currentQuestion?.options?.map((option: any, idx: number) => {
                    const optionText = typeof option === 'string' ? option : option.text
                    const optionIdx = typeof option === 'string' ? idx : option.index
                    
                    const currentSelection = answers[currentQuestion.id]
                    const isSelected = Array.isArray(currentSelection) 
                       ? currentSelection.includes(optionIdx)
                       : currentSelection === optionIdx

                    return (
                      <button
                        key={idx}
                        onClick={() => handleOptionSelect(optionIdx)}
                        className={`p-6 rounded-[1.5rem] text-left transition-all flex items-center gap-6 group border ${isSelected
                          ? 'bg-primary/5 border-primary shadow-lg shadow-primary/5 ring-1 ring-primary'
                          : 'bg-slate-50 border-slate-100 hover:border-primary/20 hover:bg-white'
                          }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-colors ${isSelected
                          ? 'bg-primary text-white'
                          : 'bg-white border border-slate-100 text-slate-400 group-hover:text-primary group-hover:border-primary/20'
                          }`}>
                          {currentQuestion.question_type === 'multiple' ? (
                            <div className={`w-4 h-4 rounded-sm border-2 ${isSelected ? 'border-none bg-white/20' : 'border-slate-200'} flex items-center justify-center`}>
                               {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                            </div>
                          ) : String.fromCharCode(65 + idx)}
                        </div>
                        <span className={`font-bold text-base leading-tight ${isSelected ? 'text-primary' : 'text-[#0f172a]'
                          }`}>
                          {optionText}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex md:items-center justify-between mt-12 pt-8 border-t border-slate-50">
                <button
                  disabled={currentQuestionIdx === 0}
                  onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                  className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-100 hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
                >
                  <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
                </button>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setAnswers(prev => {
                        const newAnswers = { ...prev }
                        delete newAnswers[currentQuestion.id]
                        return newAnswers
                      })
                      saveProgress(currentQuestion.id, null, flaggedQuestions.has(currentQuestion.id))
                    }}
                    className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Clear Selection
                  </button>
                  <button
                    onClick={() => {
                      if (currentQuestionIdx < questions.length - 1) {
                        setCurrentQuestionIdx(prev => prev + 1)
                      } else {
                        setShowConfirmSubmit(true)
                      }
                    }}
                    className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#152e75] transition-all hover:shadow-xl hover:shadow-primary/20 flex items-center gap-3 group"
                  >
                    {currentQuestionIdx === questions.length - 1 ? 'Review & Submit' : 'Save & Next'}
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Navigation Palette */}
          <div className="xl:col-span-1 space-y-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-primary/5 sticky top-28">
              <div className="mb-6">
                <h3 className="text-xl font-black text-[#0f172a]">Direct Jump</h3>
                <p className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mt-1">Question Palette</p>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 xl:grid-cols-4 gap-3">
                {questions.map((q: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestionIdx(idx)}
                    className={`w-full aspect-square rounded-xl flex items-center justify-center font-black text-xs transition-all border ${currentQuestionIdx === idx
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-110'
                      : flaggedQuestions.has(q.id)
                        ? 'bg-amber-50 text-amber-600 border-amber-200'
                        : answers[q.id] !== undefined
                          ? 'bg-green-50 text-green-600 border-green-100'
                          : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-primary/20'
                      }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-slate-50 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">Answered</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">Mark as Review</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                  <span className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest">Unvisited</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmSubmit && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <div className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-4xl">🚀</div>
              <h3 className="text-2xl font-black text-[#0f172a] text-center mb-4">Submit Mock Test?</h3>
              <p className="text-slate-500 text-center font-medium mb-10 leading-relaxed">
                You have answered <span className="text-primary font-black">{Object.keys(answers).length}</span> out of <span className="text-[#0f172a] font-black">{questions.length}</span> questions. Once submitted, you cannot change your answers.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setShowConfirmSubmit(false)}
                  className="py-4 bg-slate-50 text-[#0f172a] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100"
                >
                  Go Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#152e75] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Yes, Submit'}
                  {!isSubmitting && <CheckCircle2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Warning Modal */}
        {showWarningModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110] flex items-center justify-center p-6">
            <div className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 text-center">
              <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-4xl">⚠️</div>
              <h3 className="text-2xl font-black text-red-600 mb-4">Security Warning</h3>
              <p className="text-slate-500 font-medium mb-10 leading-relaxed">
                {warningMessage}
              </p>
              <button
                onClick={() => {
                  if (sessionId) {
                    setShowWarningModal(false)
                    triggerFullscreen() // Re-trigger fullscreen
                  } else {
                    window.close()
                  }
                }}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#152e75] transition-all"
              >
                {sessionId ? 'I Understand, Return to Test' : 'I Understand, Close Window'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

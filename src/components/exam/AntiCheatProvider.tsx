'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useAntiCheat, UseAntiCheatOptions, AntiCheatConfig } from '@/hooks/useAntiCheat'

interface AntiCheatContextType {
  violations: any[]
  isFullscreen: boolean
  showWarning: boolean
  warningMessage: string
  isTerminated: boolean
  violationCount: number
  maxViolations: number
  requestFullscreen: () => Promise<void>
  logViolation: (type: any, details?: any) => Promise<void>
}

const AntiCheatContext = createContext<AntiCheatContextType | undefined>(undefined)

interface AntiCheatProviderProps {
  children: ReactNode
  userId: string
  examId: string
  userEmail?: string
  config?: Partial<AntiCheatConfig>
  onViolation?: (violation: any) => void
  onMaxViolationsReached?: () => void
}

export function AntiCheatProvider({
  children,
  userId,
  examId,
  userEmail,
  config,
  onViolation,
  onMaxViolationsReached
}: AntiCheatProviderProps) {
  const antiCheat = useAntiCheat({
    userId,
    examId,
    userEmail,
    config,
    onViolation,
    onMaxViolationsReached
  })

  return (
    <AntiCheatContext.Provider value={antiCheat}>
      {children}
    </AntiCheatContext.Provider>
  )
}

export function useAntiCheatContext() {
  const context = useContext(AntiCheatContext)
  if (context === undefined) {
    throw new Error('useAntiCheatContext must be used within an AntiCheatProvider')
  }
  return context
}

// Warning popup component
export function AntiCheatWarning() {
  const { showWarning, warningMessage } = useAntiCheatContext()

  if (!showWarning) return null

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-lg animate-pulse">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700 font-medium">
              {warningMessage}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Violation counter component
export function ViolationCounter() {
  const { violationCount, maxViolations, isTerminated } = useAntiCheatContext()

  const getRiskColor = () => {
    if (isTerminated) return 'bg-red-500'
    if (violationCount >= maxViolations * 0.8) return 'bg-orange-500'
    if (violationCount >= maxViolations * 0.5) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className={`px-3 py-2 rounded-full text-white text-sm font-semibold ${getRiskColor()}`}>
        Violations: {violationCount}/{maxViolations}
        {isTerminated && ' - TERMINATED'}
      </div>
    </div>
  )
}

// Fullscreen indicator component
export function FullscreenIndicator() {
  const { isFullscreen, requestFullscreen } = useAntiCheatContext()

  if (isFullscreen) return null

  return (
    <div className="fixed top-4 left-4 z-50">
      <button
        onClick={requestFullscreen}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
      >
        Enter Fullscreen Mode
      </button>
    </div>
  )
}

// Fullscreen lockout component
export function FullscreenLockout() {
  const { isFullscreen, requestFullscreen, isTerminated } = useAntiCheatContext()

  if (isFullscreen || isTerminated) return null

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 text-center backdrop-blur-3xl bg-slate-900/40">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 max-w-md w-full space-y-8 animate-in zoom-in duration-300">
        <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mx-auto">
          {!isFullscreen ? (
            <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          ) : (
            <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          )}
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-[#0f172a] tracking-tight">
            {!isFullscreen ? 'Exam Mode Exit' : 'Multiple Displays'}
          </h2>
          <p className="text-slate-500 font-medium">
            {!isFullscreen 
              ? 'To maintain exam integrity, you must be in full-screen mode to continue.'
              : 'Please disconnect additional monitors or disable extended display to continue.'}
          </p>
        </div>

        <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl">
          <p className="text-xs font-bold text-orange-700">
            ⚠️ Exiting full-screen has been logged as a violation. Multiple violations will terminate your exam.
          </p>
        </div>

        <button
          onClick={requestFullscreen}
          className="w-full bg-primary text-white py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:bg-[#152e75] hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
        >
          Re-enter Exam Mode
        </button>
      </div>
    </div>
  )
}

// Internal wrapper to access context
function AntiCheatContent({ children }: { children: ReactNode }) {
  const { isFullscreen, isTerminated, violations } = useAntiCheatContext()
  const hasMultiMonitor = violations.some(v => v.violation_type === 'multi_monitor')
  const isLockedOut = (!isFullscreen || hasMultiMonitor) && !isTerminated

  return (
    <div className="relative min-h-screen">
      <div className={`transition-all duration-500 ${isLockedOut ? 'blur-xl grayscale opacity-30 scale-95 pointer-events-none' : ''}`}>
        {children}
      </div>
      <AntiCheatWarning />
      <ViolationCounter />
      <FullscreenLockout />
    </div>
  )
}

// Main anti-cheating wrapper component
export function AntiCheatWrapper({
  children,
  ...props
}: AntiCheatProviderProps) {
  return (
    <AntiCheatProvider {...props}>
      <AntiCheatContent>{children}</AntiCheatContent>
    </AntiCheatProvider>
  )
}

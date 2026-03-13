'use client'

import React from 'react'
import { PlayCircle } from 'lucide-react'

interface StartTestButtonProps {
  testId: string
  status: string
}

export default function StartTestButton({ testId, status }: StartTestButtonProps) {
  const handleStartTest = () => {
    const url = `/dashboard/test/${testId}`
    // Open the test in a new tab
    const newWindow = window.open(url, '_blank')

    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      alert('Pop-up blocked! Please allow pop-ups for this site to start the test.')
    } else {
      newWindow.focus()
    }
  }

  return (
    <button
      onClick={handleStartTest}
      className="w-full bg-primary text-white py-4 px-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#152e75] transition-all hover:shadow-xl hover:shadow-primary/20 flex items-center justify-center gap-2 group/btn"
    >
      {status === 'Completed' ? 'Retake Test' : 'Start Test'}
      <PlayCircle className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
    </button>
  )
}

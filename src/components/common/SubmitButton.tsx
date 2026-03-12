'use client'

import React from 'react'
import { useFormStatus } from 'react-dom'
import { ArrowRight } from 'lucide-react'

interface SubmitButtonProps {
  label: string
  loadingLabel?: string
  className?: string
  icon?: React.ReactNode
}

export default function SubmitButton({ 
  label, 
  loadingLabel, 
  className, 
  icon 
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className={`${className} ${pending ? 'opacity-80 cursor-not-allowed' : ''} flex justify-center items-center gap-2`}
    >
      {pending ? (
        <>
          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          {loadingLabel || label}
        </>
      ) : (
        <>
          {label}
          {icon || <ArrowRight className="w-4 h-4" />}
        </>
      )}
    </button>
  )
}

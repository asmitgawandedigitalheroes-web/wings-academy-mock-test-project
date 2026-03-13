'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

interface BackButtonProps {
  label?: string
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
}

export default function BackButton({ 
  label = 'Back', 
  className = '',
  variant = 'default'
}: BackButtonProps) {
  const router = useRouter()

  const variants = {
    default: 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200 shadow-sm',
    outline: 'bg-transparent text-slate-600 hover:bg-slate-50 border-slate-300',
    ghost: 'bg-transparent text-slate-500 hover:bg-slate-100 border-transparent'
  }

  return (
    <button
      onClick={() => router.back()}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold transition-all active:scale-95 group ${variants[variant]} ${className}`}
    >
      <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
      {label}
    </button>
  )
}

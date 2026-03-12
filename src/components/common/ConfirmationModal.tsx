'use client'

import React, { useState, useEffect } from 'react'
import { AlertCircle, X, DollarSign, Trash2, HelpCircle } from 'lucide-react'

interface ConfirmationModalProps {
  isOpen: boolean
  title: string
  message: string
  type?: 'danger' | 'info' | 'prompt'
  confirmLabel?: string
  cancelLabel?: string
  defaultValue?: string
  onConfirm: (value?: string) => void
  onCancel: () => void
  isLoading?: boolean
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  type = 'info',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  defaultValue = '',
  onConfirm,
  onCancel,
  isLoading = false
}: ConfirmationModalProps) {
  const [inputValue, setInputValue] = useState(defaultValue)

  useEffect(() => {
    if (isOpen) {
      setInputValue(defaultValue)
    }
  }, [isOpen, defaultValue])

  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm(type === 'prompt' ? inputValue : undefined)
  }

  const getIcon = () => {
    switch (type) {
      case 'danger': return <Trash2 className="w-6 h-6 text-red-500" />;
      case 'prompt': return <DollarSign className="w-6 h-6 text-green-500" />;
      default: return <HelpCircle className="w-6 h-6 text-primary" />;
    }
  }

  const getButtonClass = () => {
    switch (type) {
      case 'danger': return 'bg-red-500 hover:bg-red-600 shadow-red-200';
      case 'prompt': return 'bg-green-600 hover:bg-green-700 shadow-green-200';
      default: return 'bg-primary hover:bg-[#152e75] shadow-primary/20';
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div 
        className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 pb-0 flex justify-between items-start">
          <div className={`p-4 rounded-2xl ${type === 'danger' ? 'bg-red-50' : type === 'prompt' ? 'bg-green-50' : 'bg-primary/5'}`}>
            {getIcon()}
          </div>
          <button 
            onClick={onCancel}
            className="p-2 hover:bg-slate-50 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-8 space-y-4">
          <div>
            <h3 className="text-2xl font-black text-[#0f172a] mb-2">{title}</h3>
            <p className="text-slate-500 font-medium leading-relaxed">{message}</p>
          </div>

          {type === 'prompt' && (
            <div className="relative pt-2">
              <input 
                type="text"
                autoFocus
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-black text-[#0f172a] focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                placeholder="Enter value..."
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4">
            <button 
              onClick={onCancel}
              className="py-4 bg-slate-50 text-slate-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-100 transition-all"
            >
              {cancelLabel}
            </button>
            <button 
              onClick={handleConfirm}
              disabled={isLoading}
              className={`py-4 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 ${getButtonClass()} ${isLoading ? 'opacity-80' : ''}`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                confirmLabel
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

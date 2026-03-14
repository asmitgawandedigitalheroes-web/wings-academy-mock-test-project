'use client'

import React, { useState } from 'react'
import { Rocket, Clock, CheckCircle2, X, Calendar, ArrowRight } from 'lucide-react'

interface PostUploadActionModalProps {
  isOpen: boolean
  onClose: () => void
  onPublishNow: () => void
  onSchedule: (date: string) => void
  questionCount: number
}

export default function PostUploadActionModal({
  isOpen,
  onClose,
  onPublishNow,
  onSchedule,
  questionCount
}: PostUploadActionModalProps) {
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [scheduledDate, setScheduledDate] = useState('')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div 
        className="bg-white w-full max-w-lg rounded-[3.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-10 pb-0 flex justify-between items-start">
          <div className="w-20 h-20 bg-green-50 rounded-[2rem] flex items-center justify-center text-green-500 shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-slate-50 rounded-full transition-colors text-slate-300 hover:text-slate-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-10 space-y-8">
          <div className="space-y-3">
            <h3 className="text-3xl font-black text-[#0f172a] leading-tight">
              {questionCount} Questions Uploaded!
            </h3>
            <p className="text-slate-500 font-medium leading-relaxed italic">
              Success! Your questions are now part of this test set. Would you like to make it live for students now?
            </p>
          </div>

          {!showDatePicker ? (
            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={onPublishNow}
                className="w-full py-5 bg-primary text-white rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-[#152e75] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group"
              >
                <Rocket className="w-5 h-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                Publish Now
              </button>
              
              <button 
                onClick={() => setShowDatePicker(true)}
                className="w-full py-5 bg-white border-2 border-slate-100 text-[#0f172a] rounded-3xl font-black text-sm uppercase tracking-widest hover:border-primary/30 hover:bg-slate-50 transition-all flex items-center justify-center gap-3 group"
              >
                <Clock className="w-5 h-5 text-amber-500 group-hover:rotate-12 transition-transform" />
                Schedule for later
              </button>

              <button 
                onClick={onClose}
                className="w-full py-4 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600 transition-colors"
              >
                Keep as Draft for now
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="space-y-4">
                <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  Select Launch Date & Time
                </label>
                <input 
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 font-black text-[#0f172a] focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => onSchedule(scheduledDate)}
                  disabled={!scheduledDate}
                  className="w-full py-5 bg-primary text-white rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-[#152e75] transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100"
                >
                  Confirm Schedule
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setShowDatePicker(false)}
                  className="w-full py-2 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600 transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

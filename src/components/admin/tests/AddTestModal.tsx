'use client'

import React, { useState } from 'react'
import { X, Clock, FileText, Layers, DollarSign, CheckCircle2 } from 'lucide-react'
import { addTest } from '@/app/actions/admin'

interface AddTestModalProps {
  moduleId: string
  existingTests: any[]
  freeLimit?: number
  paidLimit?: number
  onCancel: () => void
  onSuccess: () => void
}

export default function AddTestModal({ 
  moduleId, 
  existingTests, 
  freeLimit = 2, 
  paidLimit = 3, 
  onCancel, 
  onSuccess 
}: AddTestModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState(60)
  const [targetQuestions, setTargetQuestions] = useState(30)
  const [passPercentage, setPassPercentage] = useState(40)
  const [attemptsAllowed, setAttemptsAllowed] = useState(1)
  const [marksPerQuestion, setMarksPerQuestion] = useState(1)
  const [negativeMarks, setNegativeMarks] = useState(0)
  const [testType, setTestType] = useState<'short' | 'full'>('full')
  const [isPaid, setIsPaid] = useState(false)
  const [price, setPrice] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const freeCount = existingTests.filter(t => !t.is_paid).length
  const paidCount = existingTests.filter(t => t.is_paid).length

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Enforce business rules
    if (!isPaid && freeCount >= freeLimit) {
      setError(`Limit Reached: This module is limited to ${freeLimit} Free Tests in settings.`)
      return
    }
    if (isPaid && paidCount >= paidLimit) {
      setError(`Limit Reached: This module is limited to ${paidLimit} Paid Tests in settings.`)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await addTest({ 
        title, 
        description,
        moduleId, 
        duration, 
        passPercentage,
        targetQuestions,
        attemptsAllowed,
        testType,
        isPaid,
        price: isPaid ? price : 0,
        marksPerQuestion,
        negativeMarks
      })
      if (result.error) {
        setError(result.error)
      } else {
        onSuccess()
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-[2.5rem] p-8 w-[95%] max-w-2xl shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-[#0f172a] tracking-tight">Create New Test</h2>
          <p className="text-slate-500 text-sm font-medium mt-1">Setup a mock exam for this module.</p>
        </div>
        <button 
          onClick={onCancel}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-slate-400" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${!isPaid ? 'border-primary bg-primary/5' : 'border-slate-100'}`} onClick={() => setIsPaid(false)}>
                <p className="text-[0.6rem] font-black uppercase tracking-widest text-slate-400 mb-1">Testing Type</p>
                <p className="font-black text-[#0f172a]">Free Test</p>
                <p className="text-[0.65rem] text-slate-500 font-medium">({Math.max(0, freeLimit - freeCount)} remaining)</p>
            </div>
            <div className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${isPaid ? 'border-primary bg-primary/5' : 'border-slate-100'}`} onClick={() => setIsPaid(true)}>
                <p className="text-[0.6rem] font-black uppercase tracking-widest text-slate-400 mb-1">Testing Type</p>
                <p className="font-black text-[#0f172a]">Paid Test</p>
                <p className="text-[0.65rem] text-slate-500 font-medium">({Math.max(0, paidLimit - paidCount)} remaining)</p>
            </div>
        </div>

        {isPaid && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Test Price (Stripe Mock)</label>
                <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        required
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                        placeholder="e.g. 9.99"
                        min="0"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold"
                    />
                </div>
            </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Test Title</label>
          <div className="relative">
            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              required
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Module 7 - Part 1 Final Mock"
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold placeholder:text-slate-300"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Test Description (Instructions)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. This test covers Module 7 concepts. Negative marking applies."
            className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold placeholder:text-slate-300 min-h-[100px] resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Duration (Min)</label>
                <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        required
                        type="number"
                        value={duration}
                        onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                        min="1"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold"
                    />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Target Questions</label>
                <div className="relative">
                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        required
                        type="number"
                        value={targetQuestions}
                        onChange={(e) => setTargetQuestions(parseInt(e.target.value) || 0)}
                        min="1"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold"
                    />
                </div>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Pass Percentage (%)</label>
                <div className="relative">
                    <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        required
                        type="number"
                        value={passPercentage}
                        onChange={(e) => setPassPercentage(parseInt(e.target.value) || 0)}
                        min="0"
                        max="100"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold"
                    />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Attempts Allowed</label>
                <div className="relative">
                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        required
                        type="number"
                        value={attemptsAllowed}
                        onChange={(e) => setAttemptsAllowed(parseInt(e.target.value) || 0)}
                        min="1"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold"
                    />
                </div>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Marks per Question</label>
                <div className="relative">
                    <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        required
                        type="number"
                        step="0.1"
                        value={marksPerQuestion}
                        onChange={(e) => setMarksPerQuestion(parseFloat(e.target.value) || 0)}
                        min="0"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold"
                    />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Negative Marking</label>
                <div className="relative">
                    <X className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        required
                        type="number"
                        step="0.1"
                        value={negativeMarks}
                        onChange={(e) => setNegativeMarks(parseFloat(e.target.value) || 0)}
                        min="0"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold"
                    />
                </div>
            </div>
        </div>

        <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Time Structure</label>
            <select
                value={testType}
                onChange={(e) => setTestType(e.target.value as 'short' | 'full')}
                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-[#0f172a] cursor-pointer"
            >
                <option value="full">Full Length</option>
                <option value="short">Short Mock</option>
            </select>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-4 px-6 border-2 border-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-50 transition-all font-black"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-[2] py-4 px-6 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:bg-[#152e75] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Creating...' : 'Create Test Set'}
          </button>
        </div>
      </form>
    </div>
  )
}

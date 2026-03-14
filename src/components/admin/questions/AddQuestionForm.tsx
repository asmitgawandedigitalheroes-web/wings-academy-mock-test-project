'use client'

import React, { useState } from 'react'
import { X } from 'lucide-react'
import { addQuestion } from '@/app/actions/admin'
import ConfirmationModal from '@/components/common/ConfirmationModal'

interface QuestionFormProps {
  modules: { id: string, name: string, categories: { name: string } }[]
  onSuccess: () => void
  onCancel: () => void
}

export default function AddQuestionForm({ modules, onSuccess, onCancel }: QuestionFormProps) {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState(['', '', '', ''])
  const [type, setType] = useState<'single' | 'multiple'>('single')
  const [correctIndices, setCorrectIndices] = useState<number[]>([0])
  const [moduleId, setModuleId] = useState('')
  const [explanation, setExplanation] = useState('')
  const [loading, setLoading] = useState(false)
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: 'danger' | 'info' | 'prompt'
    confirmLabel: string
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    confirmLabel: 'Confirm',
    onConfirm: () => {}
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const result = await addQuestion({
        moduleId,
        question_text: question,
        options,
        question_type: type,
        correct_options: correctIndices,
        explanation
    })

    setLoading(false)
    if (result.success) {
      onSuccess()
    } else {
      setModalConfig({
        isOpen: true,
        title: 'Error Saving Question',
        message: result.error || 'Check your internet connection and try again.',
        type: 'danger',
        confirmLabel: 'Close',
        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
      })
    }
  }

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl space-y-6 max-w-2xl w-full">
      <ConfirmationModal 
        {...modalConfig}
        onCancel={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
      />

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-[#0f172a]">Add New Question</h2>
        <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <X className="w-6 h-6 text-slate-400" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Select Module</label>
          <select 
            required
            value={moduleId}
            onChange={(e) => setModuleId(e.target.value)}
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-[#0f172a]"
          >
            <option value="">Choose a module...</option>
            {modules.map(m => (
              <option key={m.id} value={m.id} className="capitalize">{m.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Question Text</label>
          <textarea 
            required
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-[#0f172a] min-h-[100px]"
            placeholder="Type the question here..."
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-6 p-2 bg-slate-50/50 rounded-2xl border border-slate-100">
            <button 
              type="button"
              onClick={() => {
                setType('single')
                setCorrectIndices(prev => [prev[0] || 0])
              }}
              className={`flex-1 py-3 px-4 rounded-xl font-black text-[0.65rem] uppercase tracking-widest transition-all ${type === 'single' ? 'bg-white shadow-md text-primary' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Single Choice
            </button>
            <button 
              type="button"
              onClick={() => setType('multiple')}
              className={`flex-1 py-3 px-4 rounded-xl font-black text-[0.65rem] uppercase tracking-widest transition-all ${type === 'multiple' ? 'bg-white shadow-md text-primary' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Multiple Choice
            </button>
          </div>

          <label className="block text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
            Options ({type === 'multiple' ? 'Select all correct ones' : 'Select the correct one'})
          </label>
          {options.map((opt, idx) => (
            <div key={idx} className="flex gap-4 items-center group">
              <input 
                type={type === 'multiple' ? 'checkbox' : 'radio'} 
                name="correct" 
                checked={correctIndices.includes(idx)} 
                onChange={() => {
                  if (type === 'multiple') {
                    setCorrectIndices(prev => 
                      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
                    )
                  } else {
                    setCorrectIndices([idx])
                  }
                }}
                className={`w-5 h-5 accent-primary cursor-pointer border-2 border-slate-200 rounded-lg transition-all`}
              />
              <input 
                required
                type="text" 
                value={opt}
                onChange={(e) => {
                  const newOpts = [...options]
                  newOpts[idx] = e.target.value
                  setOptions(newOpts)
                }}
                className="flex-1 px-5 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-[#0f172a]"
                placeholder={`Option ${idx + 1}`}
              />
            </div>
          ))}
        </div>

        <div>
          <label className="block text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Explanation (Optional)</label>
          <textarea 
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold text-[#0f172a] min-h-[80px]"
            placeholder="Explain why the answer is correct..."
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            type="button"
            onClick={onCancel}
            className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all font-bold"
          >
            Cancel
          </button>
          <button 
            type="submit"
            disabled={loading}
            className="flex-2 py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Save Question'}
          </button>
        </div>
      </form>
    </div>
)
}

'use client'

import React, { useState } from 'react'
import { X, HelpCircle, CheckCircle2, AlertCircle, Circle, CheckSquare, Square, Plus, Trash2, Star } from 'lucide-react'
import { addQuestionToTest, updateQuestion } from '@/app/actions/admin'

interface AddQuestionToTestModalProps {
  testSetId: string
  subjectId: string
  initialData?: any
  onCancel: () => void
  onSuccess: () => void
}

export default function AddQuestionToTestModal({ 
  testSetId, 
  subjectId,
  initialData,
  onCancel, 
  onSuccess 
}: AddQuestionToTestModalProps) {
  const [questionText, setQuestionText] = useState(initialData?.question_text || '')
  const [questionType, setQuestionType] = useState<'single' | 'multiple'>(initialData?.question_type || 'single')
  const [options, setOptions] = useState<string[]>(initialData?.options || ['', '', '', ''])
  const [correctOptions, setCorrectOptions] = useState<number[]>(
    initialData?.correct_options ? initialData.correct_options :
    (initialData?.correct_option_index !== undefined && initialData?.correct_option_index !== null ? [initialData.correct_option_index] : [0])
  )
  const [explanation, setExplanation] = useState(initialData?.explanation || '')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>(initialData?.difficulty_level || 'medium')
  const [marks, setMarks] = useState<number>(initialData?.marks ?? 1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleOptionChange = (idx: number, value: string) => {
    const newOptions = [...options]
    newOptions[idx] = value
    setOptions(newOptions)
  }

  const addOption = () => {
    setOptions([...options, ''])
  }

  const removeOption = (idx: number) => {
    if (options.length <= 2) return
    
    const newOptions = options.filter((_, i) => i !== idx)
    setOptions(newOptions)
    
    // Update correctOptions if needed
    if (correctOptions.includes(idx)) {
      setCorrectOptions(correctOptions.filter(i => i !== idx))
    }
    
    // Shift remaining correct option indices
    const updatedCorrectOptions = correctOptions
      .filter(i => i !== idx)
      .map(i => i > idx ? i - 1 : i)
    
    setCorrectOptions(updatedCorrectOptions.length > 0 ? updatedCorrectOptions : [0])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (options.some(opt => !opt.trim())) {
      setError('Please fill in all options')
      setLoading(false)
      return
    }

    if (correctOptions.length === 0) {
      setError('Please select at least one correct option')
      setLoading(false)
      return
    }

    try {
      const payload = {
        question_text: questionText,
        question_type: questionType,
        options,
        correct_options: correctOptions,
        difficulty_level: difficulty,
        explanation,
        marks
      };

      let result;
      if (initialData) {
        result = await updateQuestion(initialData.id, testSetId, payload)
      } else {
        result = await addQuestionToTest({
          testSetId,
          subjectId,
          ...payload
        })
      }

      if (result.error) {
        setError(result.error)
      } else {
        onSuccess()
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-[2.5rem] p-8 w-[95%] max-w-2xl shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-[#0f172a] tracking-tight">{initialData ? 'Edit Test Question' : 'Add Test Question'}</h2>
          <p className="text-slate-500 text-sm font-medium mt-1">{initialData ? 'Update the details for this question.' : 'Add a new question with multiple choice options.'}</p>
        </div>
        <button 
          onClick={onCancel}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-6 h-6 text-slate-400" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="space-y-4">
          <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Question Type</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => {
                setQuestionType('single')
                if (correctOptions.length > 1) setCorrectOptions([correctOptions[0]])
              }}
              className={`p-4 rounded-2xl border flex items-center justify-center gap-3 font-bold transition-all ${questionType === 'single' ? 'bg-primary/5 border-primary text-primary shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-white'}`}
            >
              <Circle className="w-5 h-5" />
              Single Answer
            </button>
            <button
              type="button"
              onClick={() => setQuestionType('multiple')}
              className={`p-4 rounded-2xl border flex items-center justify-center gap-3 font-bold transition-all ${questionType === 'multiple' ? 'bg-primary/5 border-primary text-primary shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-white'}`}
            >
              <CheckSquare className="w-5 h-5" />
              Multiple Answers
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Question Text</label>
          <textarea
            required
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Type the question here..."
            className="w-full p-6 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold min-h-[120px]"
          />
        </div>

        <div className="space-y-4">
          <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Difficulty Level</label>
          <div className="grid grid-cols-3 gap-4">
            {['easy', 'medium', 'hard'].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setDifficulty(level as any)}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-1 font-bold transition-all capitalize ${
                  difficulty === level 
                  ? 'bg-primary/5 border-primary text-primary shadow-sm' 
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-white'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${
                  level === 'easy' ? 'bg-green-500' : level === 'medium' ? 'bg-orange-500' : 'bg-red-500'
                }`} />
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Marks for this Question</label>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-amber-100 text-amber-600 rounded-lg">
                <Star className="w-4 h-4" />
              </div>
              <input
                type="number"
                min="0"
                step="0.5"
                value={marks}
                onChange={(e) => setMarks(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-[#0f172a]"
              />
            </div>
            <div className="text-xs font-bold text-slate-400 whitespace-nowrap">marks</div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Options (Select the correct one)</label>
          <div className="grid grid-cols-1 gap-4">
            {options.map((option, idx) => {
              const isCorrect = correctOptions.includes(idx)
              return (
                <div key={idx} className="flex gap-3">
                  <div className="relative group flex-1">
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${isCorrect ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-white text-slate-400 border border-slate-200'}`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <input
                      required
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                      className={`w-full pl-16 pr-14 py-4 rounded-2xl border outline-none transition-all font-bold ${isCorrect ? 'bg-green-50/30 border-green-200 ring-4 ring-green-100/20' : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-primary'}`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (questionType === 'single') {
                          setCorrectOptions([idx])
                        } else {
                          if (correctOptions.includes(idx)) {
                            setCorrectOptions(correctOptions.filter(i => i !== idx))
                          } else {
                            setCorrectOptions([...correctOptions, idx])
                          }
                        }
                      }}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${isCorrect ? 'text-green-500 bg-green-100' : 'text-slate-300 hover:text-slate-400 hover:bg-slate-100'}`}
                    >
                      {isCorrect ? <CheckCircle2 className="w-5 h-5" /> : (questionType === 'single' ? <Circle className="w-5 h-5" /> : <Square className="w-5 h-5" />)}
                    </button>
                  </div>
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(idx)}
                      className="p-3 self-center hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-xl transition-all border border-transparent hover:border-red-100 shrink-0"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )
            })}
            <button
              type="button"
              onClick={addOption}
              className="mt-2 w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-black hover:border-primary/30 hover:bg-slate-50 hover:text-primary transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Another Option
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Explanation (Optional)</label>
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Explain why the correct answer is right..."
            className="w-full p-6 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold min-h-[100px]"
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-4 px-6 border-2 border-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-[2] py-4 px-6 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:bg-[#152e75] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Saving...' : (initialData ? 'Update Question' : 'Save Question')}
          </button>
        </div>
      </form>
    </div>
  )
}

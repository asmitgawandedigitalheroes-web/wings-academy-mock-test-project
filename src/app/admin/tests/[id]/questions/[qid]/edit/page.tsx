'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ChevronLeft, 
  ChevronRight,
  Save, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  Circle, 
  CheckSquare, 
  Square, 
  Plus, 
  Trash2, 
  Star,
  FileText,
  Edit2,
  Loader2,
  ImagePlus,
  Upload,
  X as CloseIcon
} from 'lucide-react'
import Link from 'next/link'
import { updateQuestion, getQuestionById, getTestDetails, uploadQuestionImage } from '@/app/actions/admin'

export default function EditQuestionPage() {
  const params = useParams()
  const router = useRouter()
  const testId = params.id as string
  const questionId = params.qid as string

  const [test, setTest] = useState<any>(null)
  const [questionText, setQuestionText] = useState('')
  const [questionType, setQuestionType] = useState<'single' | 'multiple'>('single')
  const [options, setOptions] = useState<string[]>(['', '', '', ''])
  const [correctOptions, setCorrectOptions] = useState<number[]>([0])
  const [explanation, setExplanation] = useState('')
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [marks, setMarks] = useState<number>(1)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      const [testData, questionData] = await Promise.all([
        getTestDetails(testId),
        getQuestionById(questionId)
      ])
      setTest(testData)
      if (questionData) {
        setQuestionText(questionData.question_text || '')
        setQuestionType(questionData.question_type || 'single')
        setOptions(questionData.options || ['', '', '', ''])
        setCorrectOptions(
          questionData.correct_options ? questionData.correct_options :
          (questionData.correct_option_index !== undefined && questionData.correct_option_index !== null ? [questionData.correct_option_index] : [0])
        )
        setExplanation(questionData.explanation || '')
        setDifficulty(questionData.difficulty_level || 'medium')
        setMarks(questionData.marks ?? 1)
        setImageUrl(questionData.image_url || null)
      }
      setPageLoading(false)
    }
    fetchData()
  }, [testId, questionId])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    setError(null)
    try {
      const res = await uploadQuestionImage(file)
      if (res.error) {
        setError(res.error)
      } else if (res.url) {
        setImageUrl(res.url)
      }
    } catch {
      setError('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

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
      const result = await updateQuestion(questionId, testId, {
        question_text: questionText,
        question_type: questionType,
        options,
        correct_options: correctOptions,
        difficulty_level: difficulty,
        explanation,
        marks,
        image_url: imageUrl
      })

      if (result.error) {
        setError(result.error)
      } else {
        router.push(`/admin/tests/${testId}`)
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (pageLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="font-black text-slate-400">Loading question...</p>
      </div>
    )
  }

  return (
    <div className="w-full px-4 md:px-10 py-6 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Breadcrumb */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
          <Link href="/admin/modules" className="hover:text-primary transition-colors">Modules</Link>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <Link href={`/admin/tests/${testId}`} className="hover:text-primary transition-colors capitalize">{test?.title}</Link>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <span className="text-slate-600">Edit Question</span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 md:gap-5">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-white shadow-xl shadow-primary/5 rounded-2xl md:rounded-3xl flex items-center justify-center border border-slate-50 shrink-0">
              <Edit2 className="w-6 h-6 md:w-8 md:h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-[#0f172a] tracking-tight">Edit Question</h1>
              <p className="text-sm md:text-base text-slate-500 font-medium">Update the details for this question.</p>
            </div>
          </div>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto bg-primary text-white px-8 py-3.5 rounded-2xl font-black shadow-lg shadow-primary/20 hover:bg-[#152e75] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            <span>Update Question</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
        {/* Left Column - Main Content */}
        <div className="md:col-span-2 space-y-8">
          {/* Question Text */}
          <Section title="Question Text" icon={<FileText className="w-5 h-5" />}>
            <textarea
              required
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Type the question here..."
              className="w-full p-6 bg-slate-50/50 border-2 border-slate-100 rounded-[2rem] outline-none focus:ring-8 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold min-h-[140px] hover:bg-white resize-none"
            />
          </Section>

          {/* Quick Settings - Now in Main Flow for Mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Question Type */}
            <Section title="Question Type" icon={<CheckSquare className="w-5 h-5" />}>
              <div className="relative group">
                <select
                  value={questionType}
                  onChange={(e) => {
                    const val = e.target.value as 'single' | 'multiple'
                    setQuestionType(val)
                    if (val === 'single' && correctOptions.length > 1) {
                      setCorrectOptions([correctOptions[0]])
                    }
                  }}
                  className="w-full p-4.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-[#0f172a] appearance-none cursor-pointer hover:bg-white"
                >
                  <option value="single">Single Answer</option>
                  <option value="multiple">Multiple Answers</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronLeft className="w-5 h-5 -rotate-90" />
                </div>
              </div>
            </Section>

            {/* Difficulty */}
            <Section title="Difficulty Level" icon={<AlertCircle className="w-5 h-5" />}>
              <div className="relative group">
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                  className="w-full p-4.5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-[#0f172a] appearance-none cursor-pointer hover:bg-white"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <ChevronLeft className="w-5 h-5 -rotate-90" />
                </div>
              </div>
            </Section>
          </div>

          {/* Options */}
          <Section title="Answer Options" icon={<CheckCircle2 className="w-5 h-5" />}>
            <div className="space-y-4">
              <p className="text-xs text-slate-400 font-bold ml-1">Click the circle/checkbox icon to mark the correct answer(s).</p>
              {options.map((option, idx) => {
                const isCorrect = correctOptions.includes(idx)
                return (
                  <div key={idx} className="flex gap-3">
                    <div className="relative group flex-1">
                      <div className={`absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${isCorrect ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-white text-slate-400 border border-slate-200'}`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <input
                        required
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                        className={`w-full pl-16 pr-14 py-4.5 rounded-2xl border-2 outline-none transition-all font-bold ${isCorrect ? 'bg-green-50/30 border-green-200 ring-4 ring-green-100/20' : 'bg-slate-50/50 border-slate-100 focus:bg-white focus:border-primary/20'}`}
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
          </Section>

          {/* Explanation */}
          <Section title="Explanation (Optional)" icon={<HelpCircle className="w-5 h-5" />}>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Explain why the correct answer is right..."
              className="w-full p-6 bg-slate-50/50 border-2 border-slate-100 rounded-[2rem] outline-none focus:ring-8 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold min-h-[120px] hover:bg-white resize-none"
            />
          </Section>
        </div>

        {/* Right Column - Settings */}
        <div className="space-y-8">
          {/* Marks */}
          <Section title="Marks" icon={<Star className="w-5 h-5" />}>
            <div className="space-y-3">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-amber-100 text-amber-600 rounded-lg">
                  <Star className="w-4 h-4" />
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={marks}
                  onChange={(e) => setMarks(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full pl-14 pr-6 py-4 bg-slate-50/50 border-2 border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/20 transition-all font-bold text-[#0f172a] hover:bg-white"
                />
              </div>
              <p className="text-xs text-slate-400 font-bold ml-1">Marks awarded for a correct answer.</p>
            </div>
          </Section>

          {/* Question Image */}
          <Section title="Question Image (Optional)" icon={<ImagePlus className="w-5 h-5" />}>
            <div className="space-y-4">
              {imageUrl ? (
                <div className="relative w-full max-w-md aspect-video rounded-2xl overflow-hidden border-2 border-slate-100">
                  <img src={imageUrl} alt="Question" className="w-full h-full object-contain bg-slate-50" />
                  <button
                    type="button"
                    onClick={() => setImageUrl(null)}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <CloseIcon className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-200 rounded-[2rem] cursor-pointer hover:bg-slate-50 hover:border-primary/30 transition-all group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {uploadingImage ? (
                      <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                    ) : (
                      <Upload className="w-8 h-8 text-slate-300 group-hover:text-primary transition-colors mb-3" />
                    )}
                    <p className="text-xs text-slate-500 font-black">Click to upload image</p>
                  </div>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                </label>
              )}
            </div>
          </Section>
        </div>
      </form>
    </div>
  )
}

function Section({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
  return (
    <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 shadow-xl shadow-primary/5 space-y-5 md:space-y-6 transition-all duration-500 hover:shadow-primary/10">
      <div className="flex items-center gap-4 border-b border-slate-50 pb-5">
        <div className="p-2.5 md:p-3 bg-primary/5 text-primary rounded-xl md:rounded-2xl">
          {icon}
        </div>
        <div>
          <h2 className="text-lg md:text-xl font-black text-[#0f172a] tracking-tight">{title}</h2>
        </div>
      </div>
      <div>
        {children}
      </div>
    </div>
  )
}

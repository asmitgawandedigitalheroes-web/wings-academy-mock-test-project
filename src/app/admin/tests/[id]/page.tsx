'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ChevronLeft,
  Plus,
  HelpCircle,
  CheckCircle2,
  Trash2,
  Edit2,
  LayoutList,
  ChevronRight,
  BookOpen,
  FileText,
  UploadCloud,
  Download,
  EyeOff,
  Eye,
  Settings,
  Star,
  MoreVertical,
  Loader2,
  Target,
  Award,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import BackButton from '@/components/common/BackButton'
import { getTestDetails, getQuestionsByTest, deleteQuestion, bulkUploadQuestions, toggleTestStatus, updateTestSettings } from '@/app/actions/admin'
import ConfirmationModal from '@/components/common/ConfirmationModal'
import PostUploadActionModal from '@/components/admin/PostUploadActionModal'
import * as XLSX from 'xlsx'

export default function TestQuestionsPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [test, setTest] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

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
    onConfirm: () => { }
  })

  const [uploadSuccessCount, setUploadSuccessCount] = useState(0)
  const [uploadLimitInfo, setUploadLimitInfo] = useState<{ limitReached: boolean, skippedCount: number }>({
    limitReached: false,
    skippedCount: 0
  })
  const [isPostUploadModalOpen, setIsPostUploadModalOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)

  const handleEdit = (question: any) => {
    router.push(`/admin/tests/${id}/questions/${question.id}/edit`)
  }

  useEffect(() => {
    fetchData()
  }, [id])

  async function fetchData() {
    try {
      setLoading(true)
      const testData = await getTestDetails(id)
      setTest(testData)
      const qData = await getQuestionsByTest(id)
      setQuestions(qData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const totalMarks = questions.reduce((acc, q) => acc + (Number(q.marks) || 0), 0)

  const handleManualAdd = () => {
    if (questions.length >= (test?.questions_limit || 0)) {
      setModalConfig({
        isOpen: true,
        title: 'Limit Exceeded',
        message: 'Question limit is exceed . If you want to add more question go to test setting and update the questions number.',
        type: 'info',
        confirmLabel: 'Go to Settings',
        onConfirm: () => {
          setModalConfig(prev => ({ ...prev, isOpen: false }));
          router.push(`/admin/tests/${id}/settings`);
        }
      });
      return;
    }
    router.push(`/admin/tests/${id}/questions/new`);
  }

  const handleDelete = async (questionId: string) => {
    setModalConfig({
      isOpen: true,
      title: 'Delete Question',
      message: 'Are you sure you want to delete this question? This action cannot be undone.',
      type: 'danger',
      confirmLabel: 'Delete',
      onConfirm: async () => {
        try {
          await deleteQuestion(questionId, id)
          setQuestions(questions.filter(q => q.id !== questionId))
          setModalConfig(prev => ({ ...prev, isOpen: false }))
        } catch (err) {
          console.error(err)
        }
      }
    })
  }

  const handleToggleStatus = async () => {
    try {
      setIsTogglingStatus(true)
      const res = await toggleTestStatus(id, test?.module_id, test?.status || 'draft')
      if (res.success) {
        await fetchData()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsTogglingStatus(false)
    }
  }

  const handlePublishNow = async () => {
    try {
      setLoading(true)
      const res = await toggleTestStatus(id, test?.module_id, 'draft') // Force publish from draft
      if (res.success) {
        fetchData()
        setIsPostUploadModalOpen(false)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSchedule = async (date: string) => {
    try {
      setLoading(true)
      // Call updateTestSettings with the new start_date and status='published'
      const res = await updateTestSettings(id, test?.module_id, {
        ...test,
        start_date: date,
        status: 'published'
      })
      if (res.success) {
        fetchData()
        setIsPostUploadModalOpen(false)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeMenu && !(event.target as Element).closest('.actions-menu')) {
        setActiveMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [activeMenu])

  if (loading && !test) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="font-black text-slate-400 animate-pulse">Loading test questions...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <ConfirmationModal
        {...modalConfig}
        onCancel={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
      />

      <PostUploadActionModal
        isOpen={isPostUploadModalOpen}
        onClose={() => setIsPostUploadModalOpen(false)}
        onPublishNow={handlePublishNow}
        onSchedule={handleSchedule}
        questionCount={uploadSuccessCount}
        limitReached={uploadLimitInfo.limitReached}
        skippedCount={uploadLimitInfo.skippedCount}
      />

      <BackButton variant="ghost" className="-ml-3" />

      {/* Header Section */}
      <div className="flex flex-col gap-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
              <Link href="/admin/modules" className="hover:text-primary transition-colors">Modules</Link>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <span className="text-slate-600 capitalize">{test?.title}</span>
            </div>
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-white shadow-xl shadow-primary/5 rounded-[2rem] flex items-center justify-center border border-slate-50">
                <LayoutList className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-[#0f172a] tracking-tight capitalize">{test?.title}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-slate-400 font-bold text-sm uppercase tracking-wider">{test?.module_name}</span>
                  <span className="text-slate-200">•</span>
                  <button
                    onClick={handleToggleStatus}
                    disabled={loading || isTogglingStatus}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-black text-[0.65rem] uppercase tracking-widest transition-all border ${test?.status === 'published'
                      ? 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100'
                      : 'bg-accent/10 border-accent/20 text-accent hover:bg-accent/20'
                      } ${isTogglingStatus ? 'opacity-70 pointer-events-none' : ''}`}
                  >
                    {isTogglingStatus ? (
                      <><Loader2 className="w-3 h-3 animate-spin" /> Updating...</>
                    ) : test?.status === 'published' ? (
                      <><Eye className="w-3 h-3" /> Published</>
                    ) : (
                      <><EyeOff className="w-3 h-3" /> Draft</>
                    )}
                  </button>

                  <Link
                    href={`/admin/tests/${id}/settings`}
                    replace
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary/60 hover:text-primary font-black text-xs uppercase tracking-widest transition-all"
                  >
                    <Settings className="w-3 h-3" />
                    Settings
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
            <label className={`cursor-pointer bg-white border-2 border-slate-200 text-[#0f172a] px-8 py-4 rounded-2xl font-black shadow-lg shadow-slate-200/50 hover:bg-slate-50 hover:border-primary/50 hover:text-primary transition-all flex items-center justify-center gap-3 whitespace-nowrap ${isUploading ? 'opacity-70 pointer-events-none' : ''}`}>
              {isUploading ? (
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              ) : (
                <UploadCloud className="w-6 h-6 shrink-0" />
              )}
              {isUploading ? 'Uploading Questions...' : 'Upload Excel/CSV'}
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                disabled={loading}
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setIsUploading(true);
                    setLoading(true);
                    const reader = new FileReader();
                    reader.onload = async (event) => {
                      try {
                        const data = event.target?.result;
                        const workbook = XLSX.read(data, { type: 'binary' });
                        const sheetName = workbook.SheetNames[0];
                        const sheet = workbook.Sheets[sheetName];
                        const json = XLSX.utils.sheet_to_json(sheet);

                        // Sanitize data to ensure it's a plain object (removes any hidden methods/prototype chains from XLSX)
                        const plainJson = JSON.parse(JSON.stringify(json));
                        
                        const result = await bulkUploadQuestions(id, test?.module_id, plainJson);
                        if (result.success) {
                          setUploadSuccessCount(result.successCount)
                          setUploadLimitInfo({
                            limitReached: !!result.limitReached,
                            skippedCount: result.skippedCount || 0
                          })
                          setIsPostUploadModalOpen(true)
                          fetchData();
                        } else {
                          setModalConfig({
                            isOpen: true,
                            title: 'Upload Failed',
                            message: `Error: ${result.error}`,
                            type: 'danger',
                            confirmLabel: 'Close',
                            onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
                          });
                        }
                      } catch (err) {
                        console.error('Parsing error:', err);
                        setModalConfig({
                          isOpen: true,
                          title: 'Upload Failed',
                          message: 'Could not parse the file. Please use the provided template.',
                          type: 'danger',
                          confirmLabel: 'Close',
                          onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
                        });
                      } finally {
                        setLoading(false);
                        setIsUploading(false);
                      }
                    };
                    reader.readAsBinaryString(file);
                  }
                }}
              />
            </label>
            <a
              href="/questions_template.xlsx"
              download="wings_academy_questions_template.xlsx"
              className="bg-accent/10 border-2 border-accent/20 text-accent px-8 py-4 rounded-2xl font-black shadow-lg shadow-accent/5 hover:bg-accent hover:text-white transition-all flex items-center justify-center gap-3 whitespace-nowrap"
            >
              <Download className="w-6 h-6 shrink-0" />
              Download Excel Template
            </a>
            <button
              onClick={handleManualAdd}
              className="bg-primary text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:bg-[#152e75] hover:scale-[1.02] transition-all flex items-center justify-center gap-3 whitespace-nowrap"
            >
              <Plus className="w-6 h-6 shrink-0" />
              Add Question
            </button>
          </div>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Link 
          href={`/admin/tests/${id}/settings`}
          replace
          className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-xl shadow-primary/5 hover:border-primary/20 hover:shadow-primary/10 transition-all group flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all text-primary">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Total Questions</p>
            <p className="text-xl font-black text-[#0f172a]">{questions.length}</p>
          </div>
        </Link>

        <Link 
          href={`/admin/tests/${id}/settings`}
          replace
          className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-xl shadow-primary/5 hover:border-primary/20 hover:shadow-primary/10 transition-all group flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-all text-amber-500">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Questions Limit</p>
            <p className="text-xl font-black text-[#0f172a]">{test?.target_questions || 0}</p>
          </div>
        </Link>

        <Link 
          href={`/admin/tests/${id}/settings`}
          replace
          className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-xl shadow-primary/5 hover:border-primary/20 hover:shadow-primary/10 transition-all group flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-all text-green-500">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Total Marks</p>
            <p className="text-xl font-black text-[#0f172a]">{totalMarks}</p>
          </div>
        </Link>

        <Link 
          href={`/admin/tests/${id}/settings`}
          replace
          className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-xl shadow-primary/5 hover:border-primary/20 hover:shadow-primary/10 transition-all group flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-all text-purple-500">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Time Limit</p>
            <p className="text-xl font-black text-[#0f172a]">{test?.time_limit_minutes || 0}m</p>
          </div>
        </Link>
      </div>

      {/* Questions Stack */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-[#0f172a] flex items-center gap-3">
            <LayoutList className="w-6 h-6 text-primary" />
            Questions List ({questions.length})
          </h2>
        </div>

        {questions.length === 0 ? (
          <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl shadow-primary/5 p-20 text-center space-y-6">
            <div className="w-24 h-24 bg-primary/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-2xl font-black text-[#0f172a]">This test is empty</h3>
            <p className="text-slate-500 max-w-sm mx-auto font-medium">Add your first question to this test set to make it available for students.</p>
            <button
              onClick={() => router.push(`/admin/tests/${id}/questions/new`)}
              className="bg-primary text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.05] transition-all"
            >
              Add First Question
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-white p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-lg shadow-primary/5 hover:border-primary/20 transition-all group overflow-visible relative">
                <div className="absolute top-0 left-0 w-2 h-full bg-primary/10 group-hover:bg-primary transition-colors rounded-l-[2.5rem]"></div>

                <div className="flex justify-between items-start gap-3 md:gap-6 relative z-10">
                  <div className="flex-1 space-y-6">
                    <div className="flex items-start md:items-center gap-3 md:gap-4">
                      <span className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary font-black text-xs md:text-sm shrink-0">#{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-[0.6rem] md:text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">{q.question_type === 'multiple' ? 'Multiple Choice' : 'Single Choice'}</span>
                          <span className="text-slate-200 hidden md:inline">•</span>
                          <span className={`text-[0.6rem] md:text-[0.65rem] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${q.difficulty_level === 'easy' ? 'bg-green-100 text-green-700' :
                            q.difficulty_level === 'hard' ? 'bg-red-100 text-red-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                            {q.difficulty_level || 'medium'}
                          </span>
                          <span className="text-slate-200 hidden md:inline">•</span>
                          <span className="inline-flex items-center gap-1 text-[0.6rem] md:text-[0.65rem] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                            <Star className="w-2.5 h-2.5 md:w-3 md:h-3" />
                            {q.marks ?? 1} {(q.marks ?? 1) === 1 ? 'mark' : 'marks'}
                          </span>
                        </div>
                        <p className="text-base md:text-lg font-bold text-[#0f172a] leading-relaxed first-letter:uppercase">{q.question_text}</p>
                        {q.image_url && (
                          <div className="mt-4 w-[100px] h-[100px] rounded-xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50">
                            <img src={q.image_url} alt="Question" className="w-full h-full object-contain" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {q.options.map((opt: string, optIdx: number) => {
                        const isCorrect = q.correct_options ? q.correct_options.includes(optIdx) : q.correct_option_index === optIdx;
                        return (
                          <div
                            key={optIdx}
                            className={`p-3 md:p-4 rounded-xl md:rounded-2xl border flex items-center gap-2 md:gap-3 text-xs md:text-sm font-bold ${isCorrect ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-50 border-slate-100 text-slate-500'}`}
                          >
                            <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-[10px] md:text-xs font-black shrink-0 ${isCorrect ? 'bg-green-500 text-white' : 'bg-white text-slate-300'}`}>
                              {String.fromCharCode(65 + optIdx)}
                            </div>
                            <span className="truncate">{opt}</span>
                            {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 md:w-4 md:h-4 ml-auto shrink-0" />}
                          </div>
                        )
                      })}
                    </div>

                    {q.explanation && (
                      <div className="p-3 md:p-4 bg-primary/5 rounded-xl md:rounded-2xl border border-primary/10 overflow-hidden">
                        <p className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-widest mb-1 flex items-center gap-1.5">
                          <ChevronRight className="w-2.5 h-2.5 md:w-3 md:h-3" />
                          Explanation
                        </p>
                        <p className="text-xs md:text-sm text-slate-600 font-medium">{q.explanation}</p>
                      </div>
                    )}
                  </div>

                  {/* 3-Dot Actions Menu */}
                  <div className="relative actions-menu">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(activeMenu === q.id ? null : q.id);
                      }}
                      className={`p-2 rounded-xl transition-all ${activeMenu === q.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-slate-100 text-slate-400'}`}
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {activeMenu === q.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 py-2 animate-in fade-in zoom-in duration-200">
                        <button
                          onClick={() => {
                            handleEdit(q);
                            setActiveMenu(null);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-primary transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit Question
                        </button>
                        <hr className="my-1 border-slate-50" />
                        <button
                          onClick={() => {
                            handleDelete(q.id);
                            setActiveMenu(null);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Question
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

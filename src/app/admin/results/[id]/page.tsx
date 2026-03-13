'use client'

import React, { useState, useEffect, use } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ChevronLeft, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Target,
  ClipboardList,
  User,
  Calendar,
  BookOpen,
  Award,
  TrendingUp,
  Mail
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

export default function ResultDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchResultDetail()
  }, [id])

  const fetchResultDetail = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('test_results')
      .select(`
        *,
        profiles (
          id,
          full_name,
          email,
          role
        ),
        test_sets (
          id,
          title,
          pass_percentage,
          marks_per_question,
          negative_marks,
          subjects (name)
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching result detail:', error)
      setResult(null)
    } else {
      setResult(data)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="font-black text-slate-400 animate-pulse">Loading result details...</p>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="text-center py-20 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl">
        <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-[#0f172a]">Result Not Found</h2>
        <p className="text-slate-500 mt-2 font-medium">The test result you're looking for doesn't exist or has been deleted.</p>
        <Link 
          href="/admin/results"
          className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-hover transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Results
        </Link>
      </div>
    )
  }

  const isPassed = result.score >= (result.test_sets?.pass_percentage || 70)
  const accuracy = result.total_questions > 0 
    ? Math.round((result.correct_answers / result.total_questions) * 100) 
    : 0
  const timeSpentMin = Math.floor(result.time_spent_seconds / 60)
  const timeSpentSec = result.time_spent_seconds % 60

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <Link 
          href="/admin/results"
          className="inline-flex items-center gap-2 text-slate-400 font-bold hover:text-primary transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Results
        </Link>
        <div className="flex items-center gap-3">
          <span className={`px-4 py-1.5 rounded-full text-[0.65rem] font-black uppercase tracking-widest ${
            isPassed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {isPassed ? 'Passed' : 'Failed'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Performance Card */}
        <div className="lg:col-span-8 space-y-8">
          <div className={`p-10 md:p-14 rounded-[3rem] border shadow-2xl flex flex-col items-center text-center relative overflow-hidden bg-white`}>
            {/* Pass/Fail Status Indicator */}
            <div className={`absolute top-0 left-0 w-full h-2 ${isPassed ? 'bg-green-500' : 'bg-red-500'}`}></div>

            <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-8 text-5xl shadow-xl transition-transform hover:scale-110 ${
                  isPassed ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'
            }`}>
                {isPassed ? <CheckCircle2 className="w-12 h-12" /> : <XCircle className="w-12 h-12" />}
            </div>
            
            <h1 className="text-4xl font-black text-[#0f172a] mb-2">Test {isPassed ? 'Passed' : 'Failed'}!</h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
                Performance Breakdown for {result.test_sets?.title}
            </p>
            
            <div className="mt-12 flex flex-col md:flex-row items-center gap-12">
                <div className="text-center">
                    <p className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mb-2">Final Score</p>
                    <p className={`text-6xl font-black ${isPassed ? 'text-green-600' : 'text-red-600'}`}>{Math.round(result.score)}%</p>
                </div>
                <div className="h-20 w-[1px] bg-slate-100 hidden md:block"></div>
                <div className="text-center">
                    <p className="text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mb-2">Accuracy</p>
                    <p className="text-4xl font-black text-[#0f172a]">{accuracy}%</p>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 w-full mt-14 pt-10 border-t border-slate-50">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
                <p className="text-2xl font-black text-[#0f172a] leading-none">{result.correct_answers}</p>
                <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mt-1">Correct</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <XCircle className="w-6 h-6 text-red-500" />
                </div>
                <p className="text-2xl font-black text-[#0f172a] leading-none">{result.total_questions - result.correct_answers}</p>
                <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mt-1">Incorrect</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <ClipboardList className="w-6 h-6 text-blue-500" />
                </div>
                <p className="text-2xl font-black text-[#0f172a] leading-none">{result.total_questions}</p>
                <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mt-1">Total Qs</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-purple-500" />
                </div>
                <p className="text-2xl font-black text-[#0f172a] leading-none">{timeSpentMin}m {timeSpentSec}s</p>
                <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mt-1">Time Taken</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-10">
            <h3 className="text-xl font-black text-[#0f172a] mb-6 flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-primary" />
              Additional Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[0.65rem]">Pass Benchmark</span>
                  <span className="font-black text-[#0f172a]">{result.test_sets?.pass_percentage || 70}%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[0.65rem]">Marks Per Correct</span>
                  <span className="font-black text-[#0f172a]">+{result.test_sets?.marks_per_question || 1}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[0.65rem]">Negative Marking</span>
                  <span className="font-black text-red-500">-{result.test_sets?.negative_marks || 0}</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[0.65rem]">Date Taken</span>
                  <span className="font-black text-[#0f172a]">{new Date(result.completed_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[0.65rem]">Attempt Time</span>
                  <span className="font-black text-[#0f172a]">{new Date(result.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Student & Test Info */}
        <div className="lg:col-span-4 space-y-8">
          {/* Student Profile Quick View */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-8 text-center overlow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
            <div className="w-20 h-20 bg-slate-50 border-4 border-white shadow-lg rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-[#0f172a]">{result.profiles?.full_name}</h3>
            <p className="text-slate-400 font-medium text-xs truncate mb-4">{result.profiles?.email}</p>
            
            <div className="flex justify-center mb-6">
              <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[0.65rem] font-black uppercase tracking-wider">
                Student
              </span>
            </div>

            <Link 
              href={`/admin/users/${result.profiles?.id}`}
              className="w-full py-4 px-6 bg-slate-50 hover:bg-primary/5 text-[#0f172a] hover:text-primary rounded-2xl font-black text-[0.65rem] uppercase tracking-widest transition-all inline-flex items-center justify-center gap-2"
            >
              View Full Profile
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Test Metadata */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-8">
            <h4 className="text-lg font-black text-[#0f172a] mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Test Information
            </h4>
            <div className="space-y-6">
              <div>
                <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mb-1">Subject</p>
                <p className="font-black text-primary uppercase text-xs">{result.test_sets?.subjects?.name || 'General'}</p>
              </div>
              <div>
                <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mb-1">Test Title</p>
                <p className="font-black text-[#0f172a]">{result.test_sets?.title}</p>
              </div>
              <div>
                <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mb-1">Assessment Type</p>
                <p className="font-bold text-slate-600 text-sm">Full Mock Test</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  )
}

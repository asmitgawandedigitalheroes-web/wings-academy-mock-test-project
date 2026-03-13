'use client'

import React from 'react'
import {
  ArrowLeft, Clock, CheckCircle2, Trophy, Calendar, FileText,
  TrendingUp, Target, Activity, Zap, AlertCircle
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts'

interface TestResult {
  id: string
  testTitle: string
  score: number
  date: string
  passed: boolean
}

interface SubjectProgressDetailProps {
  subject: {
    name: string
    description: string
  }
  stats: {
    totalAttempts: number
    avgScore: number
    highestScore: number
    passRate: number
  } | null
  history: TestResult[]
  accuracy: {
    correct: number
    total: number
    percentage: number
  } | null
  difficultyBreakdown: { name: string, value: number }[]
  tests: any[]
  onBack: () => void
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444']

export default function SubjectProgressDetail({
  subject, stats, history, accuracy, difficultyBreakdown, tests, onBack
}: SubjectProgressDetailProps) {

  const completionRate = tests.length > 0
    ? Math.round((tests.filter(t => t.result).length / tests.length) * 100)
    : 0

  return (
    <div className="space-y-8 md:space-y-10 animate-in fade-in slide-in-from-left-4 duration-500 pb-20">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-slate-400 hover:text-primary font-bold text-sm transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Overview
      </button>

      {/* Header Card */}
      <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-xl shadow-primary/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-3 md:gap-4 mb-4">
            <div className="px-3 md:px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[0.6rem] md:text-[0.65rem] font-black uppercase tracking-widest">
              Detailed Analysis
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-[0.65rem] md:text-xs font-bold">
              <Calendar className="w-3 md:w-3.5 h-3 md:h-3.5" />
              Updated Today
            </div>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-[#0f172a] tracking-tight mb-4 capitalize">{subject.name}</h2>
          <p className="text-slate-500 font-medium max-w-2xl text-sm md:text-lg leading-relaxed">{subject.description || 'Comprehensive evaluation of your performance and progress in this subject category.'}</p>
        </div>
      </div>

      {/* Performance Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Attempts', value: stats?.totalAttempts || 0, icon: FileText, color: 'text-[#1e3a8a]', bg: 'bg-[#1e3a8a]/5' },
          { label: 'Avg Score', value: `${stats?.avgScore || 0}%`, icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Highest', value: `${stats?.highestScore || 0}%`, icon: Trophy, color: 'text-accent', bg: 'bg-accent/10' },
          { label: 'Pass Rate', value: `${stats?.passRate || 0}%`, icon: Target, color: 'text-sky-500', bg: 'bg-sky-50' },
        ].map((item, i) => (
          <div key={i} className="bg-white p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 md:w-14 md:h-14 ${item.bg} ${item.color} rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6`}>
              <item.icon className="w-5 h-5 md:w-7 md:h-7" />
            </div>
            <p className="text-[0.6rem] md:text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
            <h4 className="text-xl md:text-3xl font-black text-[#0f172a]">{item.value}</h4>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Performance Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 md:mb-10">
            <div>
              <h3 className="text-lg md:text-xl font-black text-[#0f172a]">Performance Trend</h3>
              <p className="text-xs md:text-sm font-medium text-slate-400">Score progress across your last attempts</p>
            </div>
            <div className="flex items-center gap-2 text-primary font-black text-[0.65rem] md:text-sm px-3 md:px-4 py-1.5 md:py-2 bg-primary/5 rounded-lg md:rounded-xl self-start sm:self-auto">
              <TrendingUp className="w-3.5 md:w-4 h-3.5 md:h-4" />
              +12% Improvements
            </div>
          </div>
          <div className="h-[250px] md:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 800, fontSize: '10px' }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#1e3a8a"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorScore)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Accuracy Breakdown */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-lg md:text-xl font-black text-[#0f172a] mb-1 md:mb-2">Accuracy Breakdown</h3>
          <p className="text-xs md:text-sm font-medium text-slate-400 mb-6 md:mb-8">Overall question success rate</p>

          <div className="flex-1 flex items-center justify-center relative min-h-[200px]">
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl md:text-3xl font-black text-[#0f172a]">{accuracy?.percentage || 0}%</span>
              <span className="text-[0.55rem] md:text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest">Accuracy</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Correct', value: accuracy?.correct || 0 },
                    { name: 'Incorrect', value: (accuracy?.total || 0) - (accuracy?.correct || 0) }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#f1f5f9" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 md:mt-8 space-y-3 md:space-y-4">
            <div className="flex justify-between items-center bg-slate-50 p-3 md:p-4 rounded-xl md:rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[0.7rem] md:text-xs font-bold text-slate-500">Correct Answers</span>
              </div>
              <span className="text-xs md:text-sm font-black text-[#0f172a]">{accuracy?.correct}</span>
            </div>
            <div className="flex justify-between items-center bg-slate-50 p-3 md:p-4 rounded-xl md:rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                <span className="text-[0.7rem] md:text-xs font-bold text-slate-500">Incorrect/Skipped</span>
              </div>
              <span className="text-xs md:text-sm font-black text-[#0f172a]">{(accuracy?.total || 0) - (accuracy?.correct || 0)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {/* Test Completion Progress */}
        <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6 md:mb-8">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/5 rounded-xl md:rounded-2xl flex items-center justify-center">
                <Zap className="w-5 h-5 md:w-6 md:h-6 text-accent" />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-[#0f172a]">Test Completion</h3>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-[0.65rem] md:text-sm font-bold text-slate-400 uppercase tracking-widest">Progress</span>
                <span className="text-2xl md:text-4xl font-black text-[#0f172a]">{completionRate}%</span>
              </div>
              <div className="h-3 md:h-4 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-1000"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <p className="text-slate-500 font-medium text-xs md:text-sm pt-2 md:pt-4 leading-relaxed">
                You completed <span className="text-primary font-black">{tests.filter(t => t.result).length}</span> of <span className="font-black text-[#0f172a]">{tests.length}</span> tests.
              </p>
            </div>
          </div>
        </div>

        {/* Insights & Focus */}
        <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4 mb-6 md:mb-8">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-red-50 rounded-xl md:rounded-2xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-accent" />
            </div>
            <h3 className="text-xl md:text-2xl font-black text-[#0f172a]">Insights & Focus</h3>
          </div>

          <div className="space-y-3 md:space-y-4">
            {difficultyBreakdown.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 md:p-4 bg-slate-50 rounded-xl md:rounded-2xl">
                <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                  <div className={`w-1.5 h-6 md:h-8 rounded-full shrink-0 ${item.name === 'hard' ? 'bg-red-500' : item.name === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />
                  <div className="overflow-hidden">
                    <p className="text-[0.75rem] md:text-sm font-black capitalize text-[#0f172a] truncate">{item.name} Topics</p>
                    <p className="text-[0.55rem] md:text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest truncate">{item.value} Questions</p>
                  </div>
                </div>
                <div className="shrink-0 ml-2">
                  <span className={`text-[0.55rem] md:text-[0.65rem] font-black uppercase px-2 py-0.5 md:py-1 rounded-lg ${item.name === 'hard' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'
                    }`}>
                    {item.name === 'hard' ? 'Target' : 'Stable'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attempt History */}
      <div className="bg-white rounded-[2rem] md:rounded-[3rem] border border-slate-100 shadow-xl shadow-primary/5 overflow-hidden">
        <div className="p-6 md:p-10 border-b border-slate-50">
          <h3 className="text-xl md:text-2xl font-black text-[#0f172a]">Attempt History</h3>
          <p className="text-slate-500 font-medium mt-1 text-xs md:text-sm">Manage your test sessions in {subject.name}.</p>
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-5 text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Mock Test Title</th>
                <th className="px-10 py-5 text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Date Attempted</th>
                <th className="px-10 py-5 text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Score</th>
                <th className="px-10 py-5 text-[0.65rem] font-black text-slate-400 uppercase tracking-widest text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {history.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-10 py-6">
                    <span className="text-sm font-black text-[#0f172a] capitalize">{record.testTitle}</span>
                  </td>
                  <td className="px-10 py-6 text-sm font-bold text-slate-500">{record.date}</td>
                  <td className="px-10 py-6">
                    <span className={`text-sm font-black ${record.passed ? 'text-emerald-500' : 'text-red-500'}`}>
                      {record.score}%
                    </span>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <span className={`px-4 py-1.5 rounded-full text-[0.6rem] font-black uppercase tracking-widest ${record.passed ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                      }`}>
                      {record.passed ? 'Passed' : 'Failed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-slate-50">
          {history.map((record) => (
            <div key={record.id} className="p-6 space-y-3">
              <div className="flex justify-between items-start gap-3">
                <h4 className="text-sm font-black text-[#0f172a] leading-tight">{record.testTitle}</h4>
                <span className={`px-2.5 py-1 rounded-lg text-[0.55rem] font-black uppercase tracking-widest shrink-0 ${record.passed ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  }`}>
                  {record.passed ? 'Passed' : 'Failed'}
                </span>
              </div>
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-1.5 text-slate-400 text-[0.65rem] font-bold">
                  <Calendar className="w-3 h-3" />
                  {record.date}
                </div>
                <div className="text-right">
                  <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mb-0.5">Score</p>
                  <p className={`text-lg font-black ${record.passed ? 'text-emerald-500' : 'text-red-500'}`}>{record.score}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {(history.length === 0) && (
          <div className="px-6 md:px-10 py-16 md:py-20 text-center">
            <p className="text-slate-400 font-bold text-sm">No test attempts recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}

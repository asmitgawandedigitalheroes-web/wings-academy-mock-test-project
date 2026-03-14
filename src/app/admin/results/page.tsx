'use client'

import React, { useState, useEffect } from 'react'
import {
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Calendar,
  User,
  BookOpen,
  ChevronDown
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

export default function ResultsPage() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pass' | 'fail'>('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchResults()
  }, [])

  const fetchResults = async () => {
    setLoading(true)

    // Fetch completed test attempts and join with profiles and test_sets
    const { data, error } = await supabase
      .from('test_results')
      .select(`
        id,
        user_id,
        test_set_id,
        score,
        completed_at,
        profiles (
          full_name,
          email
        ),
        test_sets (
          title,
          pass_percentage,
          module_id,
          modules (name)
        )
      `)
      .order('completed_at', { ascending: false })

    if (error) {
      console.error('Detailed Error fetching results:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      setResults([])
    } else {
      // Map completed_at to created_at so the rest of the UI doesn't break
      const mappedData = (data || []).map(item => ({
        ...item,
        created_at: item.completed_at
      }))
      setResults(mappedData as any)
    }

    setLoading(false)
  }

  const handleDeleteResult = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this test result? This action cannot be undone.')) {
      return
    }

    setDeletingId(id)
    const { error } = await supabase
      .from('test_results')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting result:', error)
      alert('Failed to delete result. Please try again.')
    } else {
      setResults(results.filter(r => r.id !== id))
    }
    setDeletingId(null)
  }

  const filteredResults = results.filter(res => {
    const matchesSearch =
      res.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.test_sets?.title?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'pass' && res.score >= (res.test_sets?.pass_percentage || 70)) ||
      (statusFilter === 'fail' && res.score < (res.test_sets?.pass_percentage || 70))

    return matchesSearch && matchesStatus
  })

  // Group stats
  const totalAttempts = results.length
  const passCount = results.filter(r => r.score >= (r.test_sets?.pass_percentage || 70)).length
  const passRate = totalAttempts > 0 ? Math.round((passCount / totalAttempts) * 100) : 0

  // Calculate today's tests
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todaysTests = results.filter(r => new Date(r.created_at) >= today).length

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#0f172a] tracking-tight">Test Results</h1>
          <p className="text-slate-500 font-medium mt-1">Monitor student performance and exam attempts.</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-white border-2 border-slate-200 text-[#0f172a] px-6 py-3 rounded-2xl font-black shadow-lg shadow-slate-200/50 hover:bg-slate-50 transition-all flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-primary/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Attempts</p>
              <h3 className="text-2xl font-black text-[#0f172a]">{totalAttempts}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-primary/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Pass Rate</p>
              <h3 className="text-2xl font-black text-[#0f172a]">{passRate}%</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-primary/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Today's Tests</p>
              <h3 className="text-2xl font-black text-[#0f172a]">{todaysTests}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-xl shadow-primary/5 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search students or tests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-48">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none appearance-none font-bold cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="pass">Passed</option>
              <option value="fail">Failed</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Results Desktop Table */}
      <div className="hidden md:block bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-primary/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Student</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Module / Test</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center">Score</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Date</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="font-bold text-slate-400">Loading results...</p>
                  </td>
                </tr>
              ) : filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <p className="font-bold text-slate-400">No results found matching your criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredResults.map((result) => {
                  const isPass = result.score >= (result.test_sets?.pass_percentage || 70)
                  return (
                    <tr key={result.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                            <User className="w-5 h-5 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-[#0f172a]">{result.profiles?.full_name || 'Deleted User'}</p>
                            <p className="text-xs text-slate-400 font-medium">{result.profiles?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div>
                          <p className="text-sm font-bold text-[#0f172a]">{result.test_sets?.title}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl font-black text-sm ${isPass ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                          {result.score}%
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {new Date(result.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.65rem] font-black uppercase tracking-wider ${isPass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {isPass ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {isPass ? 'Pass' : 'Fail'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2 transition-opacity">
                          <Link
                            href={`/admin/results/${result.id}`}
                            className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all text-slate-400 hover:text-primary border border-transparent hover:border-slate-100"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteResult(result.id)}
                            disabled={deletingId === result.id}
                            className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all text-slate-400 hover:text-red-500 border border-transparent hover:border-slate-100 disabled:opacity-50"
                          >
                            {deletingId === result.id ? (
                              <div className="w-4 h-4 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Results Mobile Card View */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 text-center">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="font-bold text-slate-400">Loading results...</p>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 text-center font-bold text-slate-400">
            No results found.
          </div>
        ) : (
          filteredResults.map((result) => {
            const isPass = result.score >= (result.test_sets?.pass_percentage || 70)
            return (
              <div key={result.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-primary/5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-[#0f172a]">{result.profiles?.full_name}</p>
                    </div>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${isPass ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {result.score}%
                  </div>
                </div>

                <div className="bg-slate-50/50 p-3 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Attempt Details</p>
                  <p className="text-xs font-bold text-[#0f172a] group-hover:text-primary transition-colors">{result.test_sets?.title}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 truncate">{result.test_sets?.modules?.name}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 font-bold">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(result.created_at).toLocaleDateString()}
                    </span>
                    <span className={`flex items-center gap-1 ${isPass ? 'text-green-600' : 'text-red-500'}`}>
                      {isPass ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {isPass ? 'Passed' : 'Failed'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Link
                    href={`/admin/results/${result.id}`}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View Detail
                  </Link>
                  <button
                    onClick={() => handleDeleteResult(result.id)}
                    disabled={deletingId === result.id}
                    className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    {deletingId === result.id ? (
                      <div className="w-4 h-4 border-2 border-red-400/20 border-t-red-400 rounded-full animate-spin"></div>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

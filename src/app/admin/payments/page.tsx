'use client'

import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Download, 
  DollarSign, 
  TrendingUp, 
  CheckCircle2, 
  Clock,
  User,
  CreditCard,
  ChevronDown,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('payments')
      .select(`
        id,
        amount,
        status,
        transaction_id,
        created_at,
        profiles (full_name, email),
        test_sets (title)
      `)
      .order('created_at', { ascending: false })

    if (!error) {
      setPayments(data || [])
    }
    setLoading(false)
  }

  const filteredPayments = payments.filter(pay => 
    pay.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pay.test_sets?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pay.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0)
  const averageTicket = payments.length > 0 ? Math.round(totalRevenue / payments.length) : 0

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#0f172a] tracking-tight">Payments & Revenue</h1>
          <p className="text-slate-500 font-medium mt-1">Track transactions and platform earnings.</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-white border-2 border-slate-200 text-[#0f172a] px-6 py-3 rounded-2xl font-black shadow-lg shadow-slate-200/50 hover:bg-slate-50 transition-all flex items-center gap-2">
            <Download className="w-5 h-5" />
            Financial Report
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-primary/5">
          <div className="flex flex-col gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Revenue</p>
              <h3 className="text-3xl font-black text-[#0f172a] mt-1">₹{totalRevenue.toLocaleString()}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-primary/5">
          <div className="flex flex-col gap-4">
            <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Avg. Transaction</p>
              <h3 className="text-3xl font-black text-[#0f172a] mt-1">₹{averageTicket}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-primary/5">
          <div className="flex flex-col gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
              <ArrowUpRight className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Sales</p>
              <h3 className="text-3xl font-black text-[#0f172a] mt-1">{payments.length}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-primary/5">
          <div className="flex flex-col gap-4">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Success Rate</p>
              <h3 className="text-3xl font-black text-[#0f172a] mt-1">98.5%</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-xl shadow-primary/5 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by student, test or transaction ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold"
          />
        </div>
        <div className="relative w-full md:w-48">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none appearance-none font-bold cursor-pointer">
            <option>All Methods</option>
            <option>Credit Card</option>
            <option>UPI</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Payments Desktop Table */}
      <div className="hidden md:block bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-primary/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Transaction ID</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Student</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Test Unlocked</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Amount</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Date</th>
                <th className="px-8 py-6 text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="font-bold text-slate-400">Loading transactions...</p>
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-bold">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-slate-300" />
                        <span className="text-sm font-black text-[#0f172a] uppercase tracking-tighter">
                          {p.transaction_id || 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#0f172a]">{p.profiles?.full_name}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{p.profiles?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                        <p className="text-sm font-bold text-[#0f172a]">{p.test_sets?.title}</p>
                        <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-0.5">Mock Test</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-[#0f172a]">₹{p.amount}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {new Date(p.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.65rem] font-black uppercase tracking-wider bg-green-100 text-green-700">
                        <CheckCircle2 className="w-3 h-3" />
                        Completed
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payments Mobile Card View */}
      <div className="md:hidden space-y-4">
        {loading ? (
             <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 text-center">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                <p className="font-bold text-slate-400">Loading transactions...</p>
             </div>
        ) : filteredPayments.length === 0 ? (
             <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 text-center font-bold text-slate-400">
                No transactions found.
             </div>
        ) : (
            filteredPayments.map((p) => (
                <div key={p.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-primary/5 space-y-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.transaction_id || 'Pay-ID'}</p>
                                <p className="text-sm font-black text-[#0f172a]">₹{p.amount}</p>
                            </div>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.6rem] font-black uppercase tracking-wider bg-green-100 text-green-700">
                            Completed
                        </span>
                    </div>

                    <div className="bg-slate-50/50 p-3 rounded-2xl space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                <User className="w-4 h-4 text-slate-400" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-[#0f172a]">{p.profiles?.full_name}</p>
                                <p className="text-[10px] text-slate-400 font-bold">{p.profiles?.email}</p>
                            </div>
                        </div>
                        <div className="pt-2 border-t border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Source</p>
                            <p className="text-xs font-bold text-primary">{p.test_sets?.title}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold px-1">
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(p.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5" />
                            Card Payment
                        </div>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  )
}

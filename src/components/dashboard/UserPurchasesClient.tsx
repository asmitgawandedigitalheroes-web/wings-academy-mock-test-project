'use client'

import React, { useState } from 'react'
import { 
  Search, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ShoppingBag,
  ExternalLink,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'

interface UserPurchasesClientProps {
  initialPurchases: any[]
}

export default function UserPurchasesClient({ initialPurchases }: UserPurchasesClientProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredPurchases = initialPurchases.filter(p => 
    (p.test_sets?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.modules?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.transaction_id || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#0f172a] tracking-tight">Purchase History</h1>
          <p className="text-slate-500 font-medium mt-1">Track your mock test and module transactions.</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-xl shadow-primary/5">
        <div className="relative w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by test name, module or transaction ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-sm"
          />
        </div>
      </div>

      {/* Purchases List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredPurchases.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-primary/5">
            <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-[#0f172a]">No Purchases Found</h3>
            <p className="text-slate-500 font-medium">You haven't made any purchases yet.</p>
            <Link href="/dashboard/modules" className="mt-8 inline-block px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all">
              Explore Modules
            </Link>
          </div>
        ) : (
          filteredPurchases.map((purchase) => (
            <div key={purchase.id} className="group bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-xl shadow-primary/5 overflow-hidden hover:border-primary/20 transition-all duration-300">
              <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6 flex-1">
                  <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${
                    purchase.status === 'completed' 
                      ? 'bg-green-50 border-green-100 text-green-600' 
                      : 'bg-amber-50 border-amber-100 text-amber-600'
                  }`}>
                    {purchase.status === 'completed' ? <CheckCircle2 className="w-7 h-7" /> : <Clock className="w-7 h-7" />}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg md:text-xl font-black text-[#0f172a]">{purchase.test_sets?.title || purchase.modules?.name}</h3>
                      <span className={`text-[0.6rem] font-black uppercase px-2 py-0.5 rounded-md border ${
                        purchase.test_sets?.title 
                          ? 'bg-primary/5 text-primary border-primary/10' 
                          : 'bg-accent/5 text-accent border-accent/10'
                      }`}>
                        {purchase.test_sets?.title ? 'Mock Test' : 'Full Module'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-[0.65rem] md:text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> {purchase.transaction_id || 'Pay-ID'}</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(purchase.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-8 border-t md:border-t-0 pt-4 md:pt-0">
                  <div className="text-right">
                    <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mb-0.5">Amount Paid</p>
                    <p className="text-lg md:text-xl font-black text-[#0f172a]">AED {purchase.amount}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={`px-4 py-2 rounded-xl font-black text-[0.65rem] uppercase tracking-widest border flex items-center gap-2 ${
                      purchase.status === 'completed'
                        ? 'bg-green-50 text-green-700 border-green-100'
                        : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {purchase.status === 'completed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                      {purchase.status}
                    </div>
                    {purchase.status === 'pending' && (
                      <span className="text-[0.6rem] font-bold text-amber-500 max-w-[120px] text-right">Payment processing</span>
                    )}
                    {purchase.status === 'completed' && (
                      <Link 
                        href={purchase.test_sets?.title ? `/dashboard/my-tests` : `/dashboard/modules/${purchase.module_id}`}
                        className="text-primary hover:text-primary/70 text-[0.65rem] font-black uppercase tracking-widest flex items-center gap-1 transition-colors"
                      >
                        Access Now <ChevronRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Help Section */}
      <div className="bg-slate-50 rounded-[2.5rem] p-8 md:p-10 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-start gap-6">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-slate-100 text-primary">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-[#0f172a]">Need assistance?</h3>
            <p className="text-slate-500 font-medium max-w-lg text-sm">If your purchase is pending for more than 24 hours or you encounter any issues with unlocking, please contact our support team with your transaction ID.</p>
          </div>
        </div>
        <Link 
          href="/dashboard/profile"
          className="bg-white text-[#0f172a] px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-200 hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
        >
          Contact Support
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}

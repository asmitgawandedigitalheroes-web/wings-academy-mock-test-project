'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Mail,
  Trash2,
  CheckCircle,
  Clock,
  Archive,
  Search,
  Filter,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ArrowLeft
} from 'lucide-react'
import { getEnquiries, updateEnquiryStatus, deleteEnquiry } from '@/app/actions/enquiries'
import { format } from 'date-fns'

interface Enquiry {
  id: string
  first_name: string
  last_name: string
  email: string
  message: string
  status: 'pending' | 'replied' | 'archived'
  created_at: string
}

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null)

  useEffect(() => {
    fetchEnquiries()
  }, [])

  async function fetchEnquiries() {
    setLoading(true)
    const result = await getEnquiries()
    if (result.data) {
      setEnquiries(result.data as Enquiry[])
    }
    setLoading(false)
  }

  async function handleStatusUpdate(id: string, newStatus: string) {
    const result = await updateEnquiryStatus(id, newStatus)
    if (result.success) {
      setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status: newStatus as any } : e))
      if (selectedEnquiry?.id === id) {
        setSelectedEnquiry(prev => prev ? { ...prev, status: newStatus as any } : null)
      }
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this enquiry?')) return

    const result = await deleteEnquiry(id)
    if (result.success) {
      setEnquiries(prev => prev.filter(e => e.id !== id))
      if (selectedEnquiry?.id === id) {
        setSelectedEnquiry(null)
      }
    }
  }

  const filteredEnquiries = enquiries.filter(enquiry => {
    const matchesSearch =
      `${enquiry.first_name} ${enquiry.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enquiry.message.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = statusFilter === 'all' || enquiry.status === statusFilter

    return matchesSearch && matchesFilter
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold border border-amber-200 flex items-center gap-1 w-fit"><Clock className="w-3 h-3" /> Pending</span>
      case 'replied':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200 flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3" /> Replied</span>
      case 'archived':
        return <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold border border-slate-200 flex items-center gap-1 w-fit"><Archive className="w-3 h-3" /> Archived</span>
      default:
        return status
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-[#0f172a] tracking-tight">Enquiries</h1>
              <p className="text-slate-500 font-medium text-sm md:text-base">Manage student enquiries and contact form submissions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 md:gap-8 min-h-[calc(100vh-250px)]">
        {/* Main List */}
        <div className={`lg:w-2/3 space-y-4 md:space-y-6 ${selectedEnquiry ? 'hidden lg:block' : 'block'}`}>
          <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl shadow-primary/5 border border-slate-100 overflow-hidden">
            {/* Filters */}
            <div className="p-4 md:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-3 md:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search enquiries..."
                  className="w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3 bg-white border border-slate-200 rounded-xl md:rounded-2xl focus:ring-primary focus:border-primary outline-none transition-all font-medium text-xs md:text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <select
                  className="flex-1 sm:flex-none bg-white border border-slate-200 rounded-xl md:rounded-2xl px-3 md:px-4 py-2.5 md:py-3 outline-none focus:ring-primary focus:border-primary font-medium text-xs md:text-sm transition-all"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="replied">Replied</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            {/* List */}
            <div className="overflow-x-auto no-scrollbar">
              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-slate-500 font-medium font-outfit text-sm">Loading enquiries...</p>
                </div>
              ) : filteredEnquiries.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="bg-slate-100 w-12 h-12 md:w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-6 h-6 md:w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-[#0f172a] mb-1">No enquiries found</h3>
                  <p className="text-xs md:text-sm text-slate-500 max-w-xs mx-auto">Try adjusting your search or filters to find what you're looking for.</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-[0.6rem] md:text-[0.7rem] uppercase tracking-widest font-black border-b border-slate-100">
                      <th className="px-4 md:px-6 py-3 md:py-4">Sender</th>
                      <th className="hidden md:table-cell px-6 py-4">Message Preview</th>
                      <th className="hidden sm:table-cell px-6 py-4">Date</th>
                      <th className="px-4 md:px-6 py-3 md:py-4">Status</th>
                      <th className="hidden md:table-cell px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEnquiries.map((enquiry) => (
                      <tr
                        key={enquiry.id}
                        className={`hover:bg-slate-50/80 transition-colors cursor-pointer group ${selectedEnquiry?.id === enquiry.id ? 'bg-primary/5' : ''}`}
                        onClick={() => setSelectedEnquiry(enquiry)}
                      >
                        <td className="px-4 md:px-6 py-3 md:py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-[#0f172a] text-xs md:text-sm group-hover:text-primary transition-colors capitalize">
                              {enquiry.first_name} {enquiry.last_name}
                            </span>
                            <span className="text-[0.65rem] md:text-xs text-slate-500 font-medium truncate max-w-[120px] md:max-w-none">{enquiry.email}</span>
                            <span className="sm:hidden text-[0.6rem] text-slate-400 mt-1">
                              {format(new Date(enquiry.created_at), 'MMM dd, yyyy')}
                            </span>
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-6 py-4 max-w-xs truncate">
                          <p className="text-sm text-slate-600 font-medium truncate italic capitalize">
                            "{enquiry.message}"
                          </p>
                        </td>
                        <td className="hidden sm:table-cell px-6 py-4 text-xs font-bold text-slate-500 whitespace-nowrap">
                          {format(new Date(enquiry.created_at), 'MMM dd, yyyy')}
                        </td>
                        <td className="px-4 md:px-6 py-3 md:py-4">
                          {getStatusBadge(enquiry.status)}
                        </td>
                        <td className="hidden md:table-cell px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusUpdate(enquiry.id, 'replied');
                              }}
                              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                              title="Mark as Replied"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(enquiry.id);
                              }}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Details Sidebar / Mobile Active View */}
        <div className={`lg:w-1/3 ${selectedEnquiry ? 'block' : 'hidden lg:block'}`}>
          {selectedEnquiry ? (
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl shadow-primary/5 border border-slate-100 overflow-hidden sticky top-8">
              {/* Mobile Back Button */}
              <div className="lg:hidden p-4 border-b border-slate-100 bg-white flex items-center gap-3">
                <button
                  onClick={() => setSelectedEnquiry(null)}
                  className="p-2 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <span className="font-bold text-[#0f172a]">Enquiry Details</span>
              </div>

              <div className="p-5 md:p-6 bg-primary text-white">
                <div className="flex justify-between items-start mb-4 md:mb-6">
                  <div className="bg-white/10 p-2.5 md:p-3 rounded-xl md:rounded-2xl backdrop-blur-sm">
                    <Mail className="w-5 h-5 md:w-6 h-6 text-accent" />
                  </div>
                  <div className="flex gap-1 md:gap-2">
                    <button
                      onClick={() => handleStatusUpdate(selectedEnquiry.id, 'archived')}
                      className="p-2 hover:bg-white/10 rounded-lg md:rounded-xl transition-colors text-white/70 hover:text-white"
                      title="Archive"
                    >
                      <Archive className="w-4 h-4 md:w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(selectedEnquiry.id)}
                      className="p-2 hover:bg-red-500/20 rounded-lg md:rounded-xl transition-colors text-red-400 hover:text-red-300"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 md:w-5 h-5" />
                    </button>
                  </div>
                </div>
                <h2 className="text-lg md:text-xl font-black tracking-tight leading-tight capitalize">{selectedEnquiry.first_name} {selectedEnquiry.last_name}</h2>
                <p className="text-slate-400 text-xs md:text-sm font-medium mt-1 truncate">{selectedEnquiry.email}</p>
                <div className="mt-4">
                  {getStatusBadge(selectedEnquiry.status)}
                </div>
              </div>

              <div className="p-6 md:p-8 space-y-6 md:space-y-8">
                <div>
                  <h3 className="text-[0.6rem] md:text-[0.65rem] font-black text-slate-400 uppercase tracking-widest mb-3">Message Content</h3>
                  <div className="bg-slate-50 p-5 md:p-6 rounded-xl md:rounded-2xl border border-slate-100 relative">
                    <div className="absolute top-0 left-6 -translate-y-1/2 bg-white px-2 text-slate-300 hidden md:block">
                      <svg width="20" height="15" viewBox="0 0 20 15" fill="currentColor"><path d="M0 15V7.5L5 0H9.5L5.5 7.5H9.5V15H0ZM10.5 15V7. 5L15.5 0H20L16 7.5H20V15H10.5Z" /></svg>
                    </div>
                    <p className="text-slate-600 font-medium text-sm md:text-base leading-relaxed whitespace-pre-wrap italic">
                      {selectedEnquiry.message}
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex flex-col gap-3">
                  <a
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${selectedEnquiry.email}&su=Regarding your enquiry at Wings Academy&body=Dear ${selectedEnquiry.first_name},%0D%0A%0D%0AReferring to your message: "${selectedEnquiry.message}"%0D%0A%0D%0AKind regards,%0D%0AWings Academy Team`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3.5 md:py-4 bg-primary text-white rounded-xl md:rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-[#152e75] transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Reply via Gmail
                  </a>
                  <button
                    onClick={() => handleStatusUpdate(selectedEnquiry.id, 'replied')}
                    className="w-full py-3.5 md:py-4 bg-white border-2 border-slate-100 text-[#0f172a] rounded-xl md:rounded-2xl font-bold text-sm hover:bg-slate-50 hover:border-slate-200 transition-all"
                  >
                    Mark as Replied
                  </button>
                </div>

                <div className="text-center">
                  <p className="text-[0.6rem] md:text-[0.65rem] text-slate-400 font-bold uppercase tracking-widest">Received On</p>
                  <p className="text-xs md:text-sm font-black text-[#0f172a] mt-1">
                    {format(new Date(selectedEnquiry.created_at), 'MMMM dd, yyyy @ hh:mm a')}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full bg-slate-50 rounded-2xl md:rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-8 md:p-12 text-center text-slate-400">
              <div className="bg-white p-3 md:p-4 rounded-2xl md:rounded-3xl shadow-sm mb-4">
                <Mail className="w-6 h-6 md:w-8 h-8 text-slate-300" />
              </div>
              <p className="font-bold text-xs md:text-sm">Select an enquiry to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

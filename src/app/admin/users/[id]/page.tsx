'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  User,
  Mail,
  Calendar,
  Shield,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Clock,
  BookOpen,
  Award,
  History,
  LogOut,
  LockOpen,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import BackButton from '@/components/common/BackButton'
import { createClient } from '@/utils/supabase/client'
import { updateUserStatus, forceLogoutUser, grantModuleAccess, revokeModuleAccess, getStudentGrantedModuleIds } from '@/app/actions/admin'
import ConfirmationModal from '@/components/common/ConfirmationModal'

export default function StudentProfilePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [recentTests, setRecentTests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [paidModules, setPaidModules] = useState<any[]>([])
  const [grantingModuleId, setGrantingModuleId] = useState<string | null>(null)
  const [revokingModuleId, setRevokingModuleId] = useState<string | null>(null)
  const [grantedModuleIds, setGrantedModuleIds] = useState<Set<string>>(new Set())
  const [grantError, setGrantError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'performance' | 'access'>('performance')
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean,
    title: string,
    message: string,
    type: 'info' | 'danger',
    onConfirm: () => void,
    confirmLabel?: string
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: () => {},
  })

  const supabase = createClient()

  useEffect(() => {
    fetchStudentData()
  }, [id])

  const fetchStudentData = async () => {
    setLoading(true)
    
    // Fetch profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
    
    // Fetch test results
    const { data: resultsData } = await supabase
      .from('test_results')
      .select(`
        *,
        test_sets (title, pass_percentage, modules (name))
      `)
      .eq('user_id', id)
      .order('completed_at', { ascending: false })

    setProfile(profileData)
    
    // Map data for UI
    const mappedResults = (resultsData || []).map(r => ({
      ...r,
      score: typeof r.score === 'string' ? parseFloat(r.score) : r.score,
      created_at: r.completed_at
    }))
    
    setRecentTests(mappedResults)
    
    // Calculate stats
    if (mappedResults.length > 0) {
      const totalScore = mappedResults.reduce((sum, r) => sum + r.score, 0)
      const avgScore = Math.round(totalScore / mappedResults.length)
      const passedTests = mappedResults.filter(r => r.score >= (r.test_sets?.pass_percentage || 70)).length
      
      setStats({
        totalTests: mappedResults.length,
        avgScore,
        passPercentage: Math.round((passedTests / mappedResults.length) * 100)
      })
    } else {
      setStats({
        totalTests: 0,
        avgScore: 0,
        passPercentage: 0
      })
    }

    // Fetch all modules that have paid tests so admin can grant module access
    const { data: allModules } = await supabase
      .from('modules')
      .select('id, name, price')
      .order('name', { ascending: true })

    // Filter to only modules that have at least one paid test
    const { data: paidTestModuleIds } = await supabase
      .from('test_sets')
      .select('module_id')
      .eq('is_paid', true)

    const moduleIdsWithPaidTests = new Set((paidTestModuleIds || []).map((t: any) => t.module_id))
    const modulesWithPaidTests = (allModules || []).filter((m: any) => moduleIdsWithPaidTests.has(m.id))
    setPaidModules(modulesWithPaidTests)

    // Fetch which modules this student already has access to (via server action to bypass RLS)
    const grantedIds = await getStudentGrantedModuleIds(id)
    setGrantedModuleIds(new Set(grantedIds))

    setLoading(false)
  }

  const handleGrantAccess = async (moduleId: string) => {
    setGrantingModuleId(moduleId)
    setGrantError(null)
    const res = await grantModuleAccess(id, moduleId)
    if (res.error) {
      setGrantError(res.error)
    } else {
      setGrantedModuleIds(prev => new Set([...prev, moduleId]))
    }
    setGrantingModuleId(null)
  }

  const handleRevokeAccess = async (moduleId: string, moduleName: string) => {
    setModalConfig({
      isOpen: true,
      title: 'Revoke Module Access',
      message: `Are you sure you want to revoke access to "${moduleName}" for this student? Correct payment records will be removed and the student will lose access immediately.`,
      type: 'danger',
      confirmLabel: 'Revoke Access',
      onConfirm: async () => {
        setRevokingModuleId(moduleId)
        setActionLoading(true)
        setGrantError(null)
        const res = await revokeModuleAccess(id, moduleId)
        if (res.error) {
          setGrantError(res.error)
        } else {
          setGrantedModuleIds(prev => {
            const next = new Set(prev)
            next.delete(moduleId)
            return next
          })
        }
        setRevokingModuleId(null)
        setActionLoading(false)
        setModalConfig(prev => ({ ...prev, isOpen: false }))
      }
    })
  }

  const handleStatusToggle = () => {
    if (!profile) return
    const isSuspended = profile.status === 'suspended'
    const newStatus = isSuspended ? 'active' : 'suspended'
    
    setModalConfig({
      isOpen: true,
      title: isSuspended ? 'Activate Student' : 'Suspend Student',
      message: `Are you sure you want to ${isSuspended ? 'activate' : 'suspend'} this student? They will ${isSuspended ? 'regain' : 'lose'} access to the platform.`,
      type: isSuspended ? 'info' : 'danger',
      confirmLabel: isSuspended ? 'Activate' : 'Suspend',
      onConfirm: async () => {
        setActionLoading(true)
        const res = await updateUserStatus(id, newStatus)
        if (res.error) {
          setModalConfig({
            isOpen: true,
            title: 'Error',
            message: res.error,
            type: 'danger',
            confirmLabel: 'OK',
            onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
          })
        } else {
          await fetchStudentData()
          setModalConfig({
            isOpen: true,
            title: 'Success',
            message: `User status updated to ${newStatus}`,
            type: 'info',
            confirmLabel: 'OK',
            onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
          })
        }
        setActionLoading(false)
      }
    })
  }

  const handleForceLogout = () => {
    setModalConfig({
      isOpen: true,
      title: 'Force Logout',
      message: 'Are you sure you want to force logout this student from all devices? This will invalidate all active sessions immediately.',
      type: 'danger',
      confirmLabel: 'Force Logout',
      onConfirm: async () => {
        setActionLoading(true)
        const res = await forceLogoutUser(id)
        if (res.error) {
          setModalConfig({
            isOpen: true,
            title: 'Error',
            message: res.error,
            type: 'danger',
            confirmLabel: 'OK',
            onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
          })
        } else {
          setModalConfig({
            isOpen: true,
            title: 'Logged Out',
            message: 'Student has been logged out from all devices.',
            type: 'info',
            confirmLabel: 'OK',
            onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
          })
        }
        setActionLoading(false)
      }
    })
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="font-black text-slate-400 animate-pulse">Loading student profile...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <BackButton variant="ghost" className="-ml-3" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-primary/5 p-8 text-center relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-1 ${profile?.status === 'suspended' ? 'bg-red-500' : 'bg-green-500'}`}></div>
            
            <div className="w-24 h-24 bg-slate-50 border-4 border-white shadow-xl rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-12 h-12 text-slate-300" />
            </div>
            
            <h1 className="text-2xl font-black text-[#0f172a]">{profile?.full_name}</h1>
            <p className="text-slate-400 font-medium">{profile?.email}</p>
            
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <span className={`px-3 py-1 rounded-full text-[0.65rem] font-black uppercase tracking-wider ${
                profile?.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'
              }`}>
                {profile?.role || 'student'}
              </span>
              <span className={`px-3 py-1 rounded-full text-[0.65rem] font-black uppercase tracking-wider ${
                profile?.status === 'suspended' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
              }`}>
                {profile?.status || 'active'}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 mt-8 pt-8 border-t border-slate-50 text-left">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-300" />
                <span className="text-sm font-bold text-slate-500 truncate">{profile?.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-slate-300" />
                <span className="text-sm font-bold text-slate-500 line-clamp-1">Joined {new Date(profile?.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-primary/5 p-8 space-y-4">
            <h3 className="text-lg font-black text-[#0f172a] flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Quick Actions
            </h3>
            <button 
              onClick={handleStatusToggle}
              disabled={actionLoading}
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all text-left flex items-center justify-between ${
                profile?.status === 'suspended' 
                  ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                  : 'bg-red-50 text-red-600 hover:bg-red-100'
              } disabled:opacity-50`}
            >
              {profile?.status === 'suspended' ? 'Activate Student' : 'Suspend Student'}
              {profile?.status === 'suspended' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            </button>
            <button 
              onClick={handleForceLogout}
              disabled={actionLoading}
              className="w-full py-3 px-4 bg-slate-50 hover:bg-primary/5 text-slate-600 hover:text-primary rounded-xl font-bold text-sm transition-all text-left flex items-center justify-between disabled:opacity-50"
            >
              Force Logout
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats & History */}
        <div className="lg:col-span-8 space-y-8">
          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-primary/5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Tests Taken</p>
              </div>
              <h4 className="text-3xl font-black text-[#0f172a]">{stats?.totalTests || 0}</h4>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-primary/5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Avg. Score</p>
              </div>
              <h4 className="text-3xl font-black text-[#0f172a]">{stats?.avgScore || 0}%</h4>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-primary/5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                  <Award className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Pass Rate</p>
              </div>
              <h4 className="text-3xl font-black text-[#0f172a]">{stats?.passPercentage || 0}%</h4>
            </div>
          </div>
          
          {/* Tabs Navigation */}
          <div className="flex items-center gap-1 border-b border-slate-100 mb-6 bg-slate-50/50 p-1.5 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab('performance')}
              className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${
                activeTab === 'performance' 
                  ? 'bg-white text-primary shadow-sm ring-1 ring-slate-100' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <History className="w-4 h-4" />
              Performance
            </button>
            <button
              onClick={() => setActiveTab('access')}
              className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${
                activeTab === 'access' 
                  ? 'bg-white text-primary shadow-sm ring-1 ring-slate-100' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <LockOpen className="w-4 h-4" />
              Access Management
            </button>
          </div>

          {activeTab === 'performance' ? (
            /* Test History */
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-primary/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-xl font-black text-[#0f172a] flex items-center gap-3">
                  <History className="w-6 h-6 text-primary" />
                  Performance History
                </h3>
              </div>
              <div className="overflow-x-auto">
                {recentTests.length === 0 ? (
                  <div className="p-20 text-center text-slate-400 font-bold">
                    No test attempts found for this student.
                  </div>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Test Title</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Result</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {recentTests.map((t) => {
                        const isPass = t.score >= (t.test_sets?.pass_percentage || 70)
                        return (
                          <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-8 py-4">
                              <p className="text-sm font-black text-[#0f172a]">{t.test_sets?.title}</p>
                              <p className="text-[10px] text-primary font-bold uppercase">{t.test_sets?.modules?.name}</p>
                            </td>
                            <td className="px-8 py-4">
                              <span className={`font-black text-sm ${isPass ? 'text-green-600' : 'text-red-600'}`}>
                                {t.score}%
                              </span>
                            </td>
                            <td className="px-8 py-4">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                isPass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {isPass ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                {isPass ? 'Pass' : 'Fail'}
                              </span>
                            </td>
                            <td className="px-8 py-4">
                              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                <Clock className="w-3 h-3" />
                                {new Date(t.created_at).toLocaleDateString()}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ) : (
            /* Grant Module Access Section */
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-primary/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-8 border-b border-slate-50 flex items-center gap-3">
                <LockOpen className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="text-xl font-black text-[#0f172a]">Grant Module Access</h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">Unlock all paid tests in a module for this student — useful for testing or after verifying Ziina payment.</p>
                </div>
              </div>
              {grantError && (
                <div className="mx-8 mt-4 p-3 bg-red-50 text-red-600 text-sm font-bold rounded-2xl border border-red-100 flex items-center justify-between gap-2">
                  <span>{grantError}</span>
                  <button onClick={() => setGrantError(null)} className="text-red-400 hover:text-red-600 font-black text-lg leading-none">×</button>
                </div>
              )}
              <div className="divide-y divide-slate-50">
                {paidModules.length > 0 ? (
                  paidModules.map((mod: any) => {
                    const hasAccess = grantedModuleIds.has(mod.id)
                    const isGranting = grantingModuleId === mod.id
                    return (
                      <div key={mod.id} className="px-8 py-5 flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-[#0f172a] truncate">{mod.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Unlocks all paid tests in this module</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          {mod.price > 0 && (
                            <span className="text-xs font-black text-slate-400">AED {mod.price}</span>
                          )}
                          {hasAccess ? (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[0.65rem] font-black uppercase tracking-widest bg-green-100 text-green-700">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Access Granted
                              </span>
                              <button
                                onClick={() => handleRevokeAccess(mod.id, mod.name)}
                                disabled={revokingModuleId === mod.id}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Revoke Access"
                              >
                                {revokingModuleId === mod.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <XCircle className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleGrantAccess(mod.id)}
                              disabled={isGranting}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[0.65rem] font-black uppercase tracking-widest bg-primary text-white hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isGranting ? (
                                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Granting...</>
                              ) : (
                                <><LockOpen className="w-3.5 h-3.5" /> Grant Access</>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="p-12 text-center text-slate-400 font-bold">
                    No paid modules available.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        confirmLabel={modalConfig.confirmLabel}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        isLoading={actionLoading}
      />
    </div>
  )
}

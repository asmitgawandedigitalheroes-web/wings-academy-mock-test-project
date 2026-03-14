'use client'

import React, { useState, useEffect } from 'react'
import { 
  Settings, 
  Bell, 
  Shield, 
  Database, 
  Mail, 
  Globe, 
  Save, 
  CheckCircle2, 
  AlertTriangle,
  CreditCard,
  Lock,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react'
import { getPlatformSettings, updatePlatformSettings, getAdminEmail, updateAdminCredentials, flushPlatformCache } from '@/app/actions/admin'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'payments' | 'security' | 'notifications'>('general')
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Security Form State
  const [adminEmail, setAdminEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isUpdatingSecurity, setIsUpdatingSecurity] = useState(false)
  const [securityMessage, setSecurityMessage] = useState({ type: '', text: '' })
  
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Cache Flush State
  const [isFlushing, setIsFlushing] = useState(false)
  const [flushMessage, setFlushMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  // Form State
  const [settings, setSettings] = useState<any>({
    platform_name: '',
    support_email: '',
    support_phone: '',
    office_address: '',
    maintenance_mode: false,
    default_test_price: 199
  })

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      setIsLoading(true)
      const data = await getPlatformSettings()
      if (data) {
        setSettings({
          platform_name: data.platform_name || '',
          support_email: data.support_email || '',
          support_phone: data.support_phone || '',
          office_address: data.office_address || '',
          maintenance_mode: data.maintenance_mode || false,
          default_test_price: data.default_test_price || 199
        })
      }
      const email = await getAdminEmail()
      if (email) {
          setAdminEmail(email)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const res = await updatePlatformSettings({
          ...settings,
          default_test_price: parseInt(settings.default_test_price as any) || 0
      })
      if (res.success) {
        // Show success state
      } else {
        alert('Error saving settings: ' + res.error)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSecurityUpdate = async () => {
    setSecurityMessage({ type: '', text: '' })
    
    // Validation
    if (!adminEmail.trim()) {
      setSecurityMessage({ type: 'error', text: 'Email cannot be empty.' })
      return
    }
    if (newPassword && newPassword !== confirmPassword) {
      setSecurityMessage({ type: 'error', text: 'Passwords do not match.' })
      return
    }
    if (newPassword && newPassword.length < 6) {
      setSecurityMessage({ type: 'error', text: 'Password must be at least 6 characters.' })
      return
    }

    try {
      setIsUpdatingSecurity(true)
      const res = await updateAdminCredentials({ 
          email: adminEmail, 
          password: newPassword || undefined 
      })

      if (res.success) {
        setSecurityMessage({ type: 'success', text: 'Security credentials updated successfully. You may need to verify your new email if you changed it.' })
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setSecurityMessage({ type: 'error', text: res.error || 'Failed to update credentials.' })
      }
    } catch (err: any) {
      console.error(err)
      setSecurityMessage({ type: 'error', text: 'An unexpected error occurred.' })
    } finally {
      setIsUpdatingSecurity(false)
    }
  }

  const handleFlushCache = async () => {
    try {
      setIsFlushing(true)
      setFlushMessage(null)
      const res = await flushPlatformCache()
      if (res.success) {
        setFlushMessage({ type: 'success', text: 'Cache flushed successfully!' })
        // Clear message after 3 seconds
        setTimeout(() => setFlushMessage(null), 3000)
      } else {
        setFlushMessage({ type: 'error', text: res.error || 'Failed to flush cache.' })
      }
    } catch (err) {
      console.error(err)
      setFlushMessage({ type: 'error', text: 'An unexpected error occurred.' })
    } finally {
      setIsFlushing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="font-black text-slate-400 animate-pulse">Loading settings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#0f172a] tracking-tight">Platform Settings</h1>
          <p className="text-slate-500 font-medium mt-1">Manage global configurations and preferences.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:bg-[#152e75] hover:scale-[1.02] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          ) : (
            <Save className="w-5 h-5" />
          )}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl font-black transition-all ${
                activeTab === tab.id 
                ? 'bg-primary text-white shadow-xl shadow-primary/20 translate-x-1' 
                : 'bg-white text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === tab.id ? 'rotate-90' : ''}`} />
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-primary/5 p-8 md:p-12">
            
            {activeTab === 'general' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-black text-[#0f172a] flex items-center gap-3">
                    <Globe className="w-6 h-6 text-primary" />
                    Global Configuration
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Platform Name</label>
                      <input 
                        type="text" 
                        value={settings.platform_name}
                        onChange={(e) => setSettings({ ...settings, platform_name: e.target.value })}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Support Email</label>
                      <input 
                        type="email" 
                        value={settings.support_email}
                        onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Support Phone</label>
                      <input 
                        type="tel" 
                        value={settings.support_phone}
                        onChange={(e) => setSettings({ ...settings, support_phone: e.target.value })}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Office Address</label>
                      <textarea 
                        value={settings.office_address}
                        onChange={(e) => setSettings({ ...settings, office_address: e.target.value })}
                        rows={2}
                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold resize-none" 
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-50">
                  <h3 className="text-xl font-black text-[#0f172a] flex items-center gap-3">
                    <Database className="w-6 h-6 text-primary" />
                    Data Management
                  </h3>
                  <div className="mt-8 space-y-4">
                    <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group">
                      <div>
                        <p className="text-sm font-black text-[#0f172a]">Maintenance Mode</p>
                        <p className="text-xs text-slate-500 font-medium">Temporarily disable student access for maintenance.</p>
                      </div>
                      <div 
                        onClick={() => setSettings({ ...settings, maintenance_mode: !settings.maintenance_mode })}
                        className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${settings.maintenance_mode ? 'bg-primary' : 'bg-slate-200'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.maintenance_mode ? 'right-1' : 'left-1'}`}></div>
                      </div>
                    </div>
                    <div className="flex flex-col p-6 bg-red-50/30 rounded-[2rem] border border-red-100 group gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-black text-red-600">Flush Cache</p>
                          <p className="text-xs text-red-400 font-medium">Clear all server-side cached data.</p>
                        </div>
                        <button 
                          onClick={handleFlushCache}
                          disabled={isFlushing}
                          className="px-4 py-2 bg-white text-red-500 border border-red-100 rounded-xl text-xs font-black hover:bg-red-50 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                          {isFlushing ? (
                            <div className="w-3 h-3 border-2 border-red-200 border-t-red-500 rounded-full animate-spin"></div>
                          ) : null}
                          {isFlushing ? 'Executing...' : 'Execute'}
                        </button>
                      </div>
                      {flushMessage && (
                        <div className={`text-xs font-bold p-2 rounded-lg ${
                          flushMessage.type === 'success' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                        }`}>
                          {flushMessage.text}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="space-y-8">
                <div className="p-6 bg-yellow-50 rounded-[2rem] border border-yellow-100 flex gap-4">
                  <AlertTriangle className="w-6 h-6 text-yellow-600 shrink-0" />
                  <div>
                    <h4 className="text-sm font-black text-yellow-800">Integration Pending</h4>
                    <p className="text-xs text-yellow-700 font-medium mt-1">Stripe integration is currently in sandbox mode. No live transactions will be processed.</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xl font-black text-[#0f172a] flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-primary" />
                    Pricing Rules
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Default Paid Test Price (₹)</label>
                        <input 
                            type="text" 
                            value={settings.default_test_price}
                            onChange={(e) => setSettings({ ...settings, default_test_price: e.target.value.replace(/[^0-9]/g, '') })}
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold" 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Currency Code</label>
                        <input 
                            type="text" 
                            defaultValue="INR"
                            disabled
                            className="w-full p-4 bg-slate-100 border border-slate-100 rounded-2xl outline-none text-slate-400 font-bold" 
                        />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8">
                <div className="text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-4 border border-slate-100">
                        <Shield className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-black text-[#0f172a]">Security & Access</h3>
                    <p className="text-slate-500 font-medium mt-2 max-w-sm mx-auto">
                        Manage your administrative login credentials. Changes to your email may require verification.
                    </p>
                </div>

                {securityMessage.text && (
                    <div className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-3 ${
                        securityMessage.type === 'error' 
                        ? 'bg-red-50 text-red-600 border border-red-100' 
                        : 'bg-green-50 text-green-600 border border-green-100'
                    }`}>
                        {securityMessage.type === 'error' ? <AlertTriangle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
                        {securityMessage.text}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50/50 p-6 md:p-8 rounded-[2.5rem] border border-slate-100">
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-black text-[#0f172a] mb-1 flex items-center gap-2">
                                <Mail className="w-4 h-4 text-slate-400" />
                                Admin Email
                            </h4>
                            <p className="text-xs text-slate-500 mb-4 font-medium">Used for login and critical alerts.</p>
                            <input 
                                type="email" 
                                value={adminEmail}
                                onChange={(e) => setAdminEmail(e.target.value)}
                                placeholder="admin@example.com"
                                className="w-full p-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-700" 
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-black text-[#0f172a] mb-1 flex items-center gap-2">
                                <Lock className="w-4 h-4 text-slate-400" />
                                Update Password
                            </h4>
                            <p className="text-xs text-slate-500 mb-4 font-medium">Leave blank if you don't want to change it.</p>
                            
                            <div className="space-y-4">
                                <div className="relative">
                                    <input 
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="New Password"
                                        className="w-full p-4 pr-12 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-medium" 
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                <div className="relative">
                                    <input 
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm New Password"
                                        className="w-full p-4 pr-12 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-medium" 
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button 
                        onClick={handleSecurityUpdate}
                        disabled={isUpdatingSecurity}
                        className="bg-[#0f172a] text-white px-8 py-4 rounded-2xl font-black shadow-xl hover:bg-slate-800 hover:scale-[1.02] transition-all flex items-center gap-3 disabled:opacity-50"
                    >
                        {isUpdatingSecurity ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Lock className="w-4 h-4" />
                        )}
                        {isUpdatingSecurity ? 'Updating...' : 'Update Security Settings'}
                    </button>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                 <h3 className="text-xl font-black text-[#0f172a] flex items-center gap-3">
                    <Bell className="w-6 h-6 text-primary" />
                    Admin Alerts
                  </h3>
                  <div className="space-y-3">
                    {['New User Registration', 'Payment Success', 'Failed Test Attempt', 'Server Health'].map((notif) => (
                        <div key={notif} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                            <span className="text-sm font-bold text-[#0f172a]">{notif}</span>
                            <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-all"></div>
                            </div>
                        </div>
                    ))}
                  </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

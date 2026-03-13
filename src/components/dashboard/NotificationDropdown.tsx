'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Bell, Check, Clock, X, Info, FileText, CreditCard } from 'lucide-react'
import { getNotifications, markNotificationAsRead } from '@/app/actions/dashboard'

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchNotifications()
    
    // Auto refresh every 5 minutes
    const interval = setInterval(fetchNotifications, 300000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications()
      setNotifications(data)
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    }
  }

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await markNotificationAsRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  const getIcon = (type: string) => {
    switch (type) {
      case 'test_completed':
        return <FileText className="w-4 h-4" />
      case 'payment_success':
        return <CreditCard className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const getIconColor = (type: string) => {
    switch (type) {
      case 'test_completed':
        return 'bg-green-50 text-green-600'
      case 'payment_success':
        return 'bg-blue-50 text-blue-600'
      default:
        return 'bg-amber-50 text-amber-600'
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-slate-500 hover:bg-slate-50 rounded-xl transition-all group focus:outline-none"
      >
        <Bell className="w-5 h-5 group-hover:text-primary" />
        {unreadCount > 0 && (
          <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-accent rounded-full border-2 border-white ring-2 ring-accent/20 flex items-center justify-center animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-[-60px] sm:right-0 mt-4 w-[calc(100vw-2rem)] sm:w-[26rem] max-w-[26rem] bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="p-8 pb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-[#0f172a]">Notifications</h3>
              <p className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mt-1">Recent Activity</p>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-slate-50 rounded-xl transition-colors group"
            >
              <X className="w-5 h-5 text-slate-300 group-hover:text-slate-600 transition-colors" />
            </button>
          </div>

          <div className="px-8 pb-6">
            <div className="min-h-[200px] flex flex-col items-center justify-center bg-white border border-slate-50 rounded-[2rem]">
              {notifications.length === 0 ? (
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto ring-8 ring-white">
                      <Bell className="w-8 h-8 text-slate-200" />
                  </div>
                  <h4 className="text-base font-bold text-slate-400">All caught up!</h4>
                </div>
              ) : (
                <div className="w-full divide-y divide-slate-50 max-h-[400px] overflow-y-auto custom-scrollbar">
                  {notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`py-5 hover:bg-slate-50/80 transition-colors relative group ${!n.is_read ? 'bg-primary/[0.01]' : ''}`}
                    >
                      <div className="flex gap-4">
                        <div className={`p-2 rounded-xl shrink-0 h-fit ${getIconColor(n.type)}`}>
                          {getIcon(n.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start gap-2">
                            <p className={`text-sm font-bold leading-tight ${!n.is_read ? 'text-[#0f172a]' : 'text-slate-500'}`}>
                              {n.title}
                            </p>
                            {!n.is_read && (
                              <button 
                                onClick={(e) => handleMarkAsRead(n.id, e)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-primary/10 rounded transition-all"
                              >
                                <Check className="w-3 h-3 text-primary" />
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">{n.message}</p>
                          <p className="text-[0.6rem] font-black text-slate-300 uppercase tracking-widest mt-2">{new Date(n.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="px-8 pb-6">
            <button 
              className="w-full py-4 text-sm font-black text-[#1e3a8a] uppercase tracking-[0.2em] bg-white hover:bg-slate-50 rounded-[1.5rem] border border-slate-100 transition-all shadow-sm active:scale-[0.98]"
              onClick={() => setIsOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Bell, Check, Clock, X } from 'lucide-react'
import { getNotifications, markNotificationAsRead } from '@/app/actions/admin_dashboard'

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchNotifications()
    
    // Auto refresh every 3 minutes
    const interval = setInterval(fetchNotifications, 180000)
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
    const data = await getNotifications()
    setNotifications(data)
  }

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-primary transition-colors focus:outline-none"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white text-[10px] font-black text-white flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-4 w-80 sm:w-96 bg-white rounded-[2rem] border border-slate-100 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <div>
              <h3 className="font-black text-[#0f172a]">Notifications</h3>
              <p className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Administrative Alerts</p>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-10 text-center space-y-3">
                <div className="text-4xl text-slate-100"></div>
                <p className="text-sm font-bold text-slate-400">All caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`p-5 hover:bg-slate-50/80 transition-colors relative group ${!n.is_read ? 'bg-primary/[0.02]' : ''}`}
                  >
                    {!n.is_read && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                    )}
                    <div className="flex gap-4">
                      <div className={`p-2 rounded-xl shrink-0 h-fit ${
                        n.type === 'signup' ? 'bg-blue-50 text-blue-600' :
                        n.type === 'test' ? 'bg-green-50 text-green-600' :
                        'bg-amber-50 text-amber-600'
                      }`}>
                        {n.type === 'signup' ? <Bell className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start gap-2">
                          <p className={`text-sm font-bold leading-tight ${!n.is_read ? 'text-[#0f172a]' : 'text-slate-500'}`}>
                            {n.title}
                          </p>
                          {!n.is_read && (
                            <button 
                              onClick={() => handleMarkAsRead(n.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-primary/10 rounded transition-all"
                              title="Mark as read"
                            >
                              <Check className="w-3 h-3 text-primary" />
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{n.message}</p>
                        <p className="text-[0.6rem] font-black text-slate-300 uppercase tracking-widest mt-2">
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-50/50 border-t border-slate-100">
            <button 
              className="w-full py-2.5 text-[0.7rem] font-black text-primary uppercase tracking-widest hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all shadow-none hover:shadow-sm"
              onClick={() => setIsOpen(false)}
            >
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

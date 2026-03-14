'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Search, User, LogOut, Menu, Database, FileText, ArrowRight } from 'lucide-react'
import { signout } from '@/app/actions/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import NotificationCenter from './NotificationCenter'
import { globalSearch } from '@/app/actions/admin'

export default function AdminHeader({ userEmail, onMenuClick }: { userEmail?: string, onMenuClick?: () => void }) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<{users: any[], modules: any[], tests: any[]}>({ users: [], modules: [], tests: [] })
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const fetchResults = async () => {
      if (!searchQuery.trim()) {
        setResults({ users: [], modules: [], tests: [] })
        setIsDropdownOpen(false)
        return
      }
      setIsSearching(true)
      setIsDropdownOpen(true)
      
      try {
        const res = await globalSearch(searchQuery)
        setResults(res)
      } catch (err) {
        console.error('Search error:', err)
      } finally {
        setIsSearching(false)
      }
    }

    const timer = setTimeout(() => {
      fetchResults()
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setIsDropdownOpen(false)
      router.push(`/admin/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleLogout = async () => {
    await signout()
    router.push('/login')
  }

  return (
    <header className="h-20 bg-white border-b border-slate-100 px-4 md:px-8 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-2 md:gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-400 hover:text-primary transition-colors focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div ref={dropdownRef} className="hidden md:flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 w-96 relative">
          <Search className="w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search for anything..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => { if(searchQuery.trim()) setIsDropdownOpen(true) }}
            onKeyDown={handleSearch}
            className="bg-transparent border-none outline-none text-sm w-full font-medium"
          />

          {/* Search Dropdown */}
          {isDropdownOpen && (
            <div className="absolute top-12 left-0 w-[450px] bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden z-50 flex flex-col max-h-[80vh]">
              {isSearching ? (
                <div className="p-8 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                </div>
              ) : results.users.length === 0 && results.modules.length === 0 && results.tests.length === 0 ? (
                <div className="p-8 text-center text-slate-500 font-medium">
                  No results found for "<span className="text-primary font-bold">{searchQuery}</span>"
                </div>
              ) : (
                <div className="overflow-y-auto p-2">
                  {results.users.length > 0 && (
                    <div className="mb-2">
                      <div className="px-3 py-2 text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <User className="w-3 h-3" /> Users
                      </div>
                      {results.users.map(user => (
                        <Link 
                          href={`/admin/users/${user.id}`} 
                          key={user.id} 
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group"
                        >
                          <div>
                            <p className="font-bold text-[#0f172a] group-hover:text-primary transition-colors">{user.full_name || 'Unnamed'}</p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </Link>
                      ))}
                    </div>
                  )}

                  {results.modules.length > 0 && (
                    <div className="mb-2">
                      <div className="px-3 py-2 text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Database className="w-3 h-3" /> Modules
                      </div>
                      {results.modules.map(module => (
                        <Link 
                          href={`/admin/modules/${module.id}`} 
                          key={module.id} 
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group"
                        >
                          <div>
                            <p className="font-bold text-[#0f172a] group-hover:text-primary transition-colors">{module.name}</p>
                            <p className="text-xs text-slate-500 line-clamp-1">{module.description || 'No description'}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </Link>
                      ))}
                    </div>
                  )}

                  {results.tests.length > 0 && (
                    <div>
                      <div className="px-3 py-2 text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <FileText className="w-3 h-3" /> Tests
                      </div>
                      {results.tests.map(test => (
                        <Link 
                          href={`/admin/tests/${test.id}`} 
                          key={test.id} 
                          onClick={() => setIsDropdownOpen(false)}
                          className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group"
                        >
                          <div>
                            <p className="font-bold text-[#0f172a] group-hover:text-primary transition-colors">{test.title}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </Link>
                      ))}
                    </div>
                  )}
                  
                  <button 
                    onClick={() => { setIsDropdownOpen(false); router.push(`/admin/search?q=${encodeURIComponent(searchQuery.trim())}`); }}
                    className="w-full text-center p-3 text-sm font-bold text-primary hover:bg-slate-50 rounded-xl mt-2 transition-colors border border-transparent hover:border-slate-100"
                  >
                    View all results
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <NotificationCenter />
        
        <div className="h-8 w-[1px] bg-slate-200"></div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-[#0f172a] leading-none">Admin Settings</p>
            <p className="text-[0.7rem] font-medium text-slate-500 mt-1">{userEmail || 'admin@windacademy.com'}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <User className="w-6 h-6" />
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

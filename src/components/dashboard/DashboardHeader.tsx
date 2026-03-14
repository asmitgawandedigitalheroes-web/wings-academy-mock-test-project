'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Search, Bell, UserCircle, Database, FileText, ArrowRight, LogOut, Menu } from 'lucide-react'
import NotificationDropdown from './NotificationDropdown'
import { studentSearch } from '@/app/actions/dashboard'
import { signout } from '@/app/actions/auth'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import Image from 'next/image'

export default function DashboardHeader({ 
  user, 
  displayName,
  avatarUrl,
  onMenuClick
}: { 
  user: any, 
  displayName?: string,
  avatarUrl?: string | null,
  onMenuClick?: () => void
}) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<{ modules: any[], tests: any[] }>({ modules: [], tests: [] })
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
        setResults({ modules: [], tests: [] })
        setIsDropdownOpen(false)
        return
      }
      setIsSearching(true)
      setIsDropdownOpen(true)

      try {
        const res = await studentSearch(searchQuery)
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
    }
  }

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between border-b border-slate-50">
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Menu Button */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-500 hover:text-primary hover:bg-slate-50 rounded-xl transition-all"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex-1 max-w-xl hidden md:block">
          <div ref={dropdownRef} className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search for tests, modules, or questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { if (searchQuery.trim()) setIsDropdownOpen(true) }}
              onKeyDown={handleSearch}
              className="w-full bg-slate-50 border border-slate-100 py-3 pl-12 pr-6 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white focus:border-primary/20 transition-all font-medium text-sm text-[#0f172a]"
            />

            {/* Search Dropdown */}
            {isDropdownOpen && (
              <div className="absolute top-14 left-0 w-full bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden z-50 flex flex-col max-h-[80vh]">
                {isSearching ? (
                  <div className="p-8 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  </div>
                ) : results.modules.length === 0 && results.tests.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 font-medium">
                    No results found for "<span className="text-primary font-bold">{searchQuery}</span>"
                  </div>
                ) : (
                  <div className="overflow-y-auto p-2">
                    {results.modules.length > 0 && (
                      <div className="mb-2">
                        <div className="px-3 py-2 text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Database className="w-3 h-3" /> Modules
                        </div>
                        {results.modules.map(module => (
                          <Link
                            href={`/dashboard/modules/${module.id}`}
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
                            href={`/dashboard/modules/${test.module_id}?test=${test.id}`}
                            key={test.id}
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group"
                          >
                            <div>
                              <p className="font-bold text-[#0f172a] group-hover:text-primary transition-colors">{test.title}</p>
                              <p className="text-xs text-slate-500 line-clamp-1">{test.description || 'No description'}</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        <NotificationDropdown />

        <div className="h-8 w-[1px] bg-slate-100 mx-1 hidden sm:block"></div>

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-black text-[#0f172a] leading-tight">
              {displayName || user?.user_metadata?.full_name || user?.email?.split('@')[0]}
            </p>
            <p className="text-[0.65rem] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Student Explorer</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary group cursor-pointer hover:border-primary/20 transition-all overflow-hidden relative">
            {avatarUrl ? (
              <Image 
                src={avatarUrl} 
                alt={displayName || 'User profile'} 
                fill 
                className="object-cover"
              />
            ) : (
              <UserCircle className="w-6 h-6" />
            )}
          </div>
          <button
            onClick={() => signout()}
            className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all group lg:block hidden"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  )
}

'use client'

import React from 'react'
import {
  LayoutGrid,
  Library,
  ClipboardList,
  Award,
  UserCircle,
  Wallet,
  BarChart3,
  ChevronRight,
  LogOut,
  X
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { signout } from '@/app/actions/auth'

const navItems = [
  { name: 'Dashboard', icon: LayoutGrid, href: '/dashboard' },
  { name: 'Subjects', icon: Library, href: '/dashboard/subjects' },
  { name: 'My Tests', icon: ClipboardList, href: '/dashboard/my-tests' },
  { name: 'Progress', icon: BarChart3, href: '/dashboard/progress' },
  { name: 'Results', icon: Award, href: '/dashboard/results' },
  { name: 'Profile', icon: UserCircle, href: '/dashboard/profile' },
]

export default function DashboardSidebar({ 
  isOpen, 
  onClose 
}: { 
  isOpen?: boolean, 
  onClose?: () => void 
}) {
  const pathname = usePathname()

  return (
    <aside className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-100 flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    }`}>
      <div className="p-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 flex items-center justify-center overflow-hidden">
            <Image src="/logo.jpg" alt="Logo" fill className="object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black text-[#0f172a] leading-none tracking-tight">WINGS</span>
            <span className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest mt-0.5">STUDENT</span>
          </div>
        </Link>
        
        {/* Close button for mobile */}
        <button 
          onClick={onClose}
          className="lg:hidden p-2 text-slate-400 hover:text-primary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center justify-between p-4 rounded-2xl transition-all group ${isActive
                ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]'
                : 'text-slate-500 hover:bg-slate-50 hover:text-primary'
                }`}
            >
              <div className="flex items-center gap-4">
                <item.icon className={`w-5 h-5 ${isActive ? 'text-accent' : 'text-slate-400 group-hover:text-primary'}`} />
                <span className={`font-bold text-sm tracking-tight ${isActive ? 'text-white' : ''}`}>{item.name}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-accent" />}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-slate-50">
        <button
          onClick={() => signout()}
          className="w-full flex items-center gap-4 p-4 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all font-bold text-sm"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  )
}

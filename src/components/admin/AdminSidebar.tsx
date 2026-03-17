'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  ChevronRight,
  HelpCircle,
  CreditCard,
  ClipboardList,
  TrendingUp,
  Settings,
  Layers,
  Activity,
  Mail,
  LayoutGrid,
  LogOut,
  X
} from 'lucide-react'
import Image from 'next/image'
import { getPlatformSettings } from '@/app/actions/admin'
import { useRouter } from 'next/navigation'
import { signout } from '@/app/actions/auth'

const menuItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Students', href: '/admin/users', icon: Users },
  { name: 'Categories', href: '/admin/categories', icon: LayoutGrid },
  { name: 'Modules', href: '/admin/modules', icon: Layers },
  { name: 'Tests', href: '/admin/tests', icon: FileText },
  { name: 'Results', href: '/admin/results', icon: ClipboardList },
  { name: 'Enquiries', href: '/admin/enquiries', icon: Mail },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard },
  // { name: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
  { name: 'Activity Log', href: '/admin/activity', icon: Activity },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

interface AdminSidebarProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

export default function AdminSidebar({ isOpen, setIsOpen }: AdminSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [platformName, setPlatformName] = React.useState('Wings Academy Admin')

  React.useEffect(() => {
    async function loadSettings() {
      const data = await getPlatformSettings()
      if (data?.platform_name) {
        setPlatformName(data.platform_name)
      }
    }
    loadSettings()
  }, [])

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed left-0 top-0 h-screen w-64 bg-[#0f172a] text-slate-300 flex flex-col z-50 transition-transform duration-300 border-r border-slate-800 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Brand Logo */}
        <div className="p-6 border-b border-slate-800">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 flex items-center justify-center overflow-hidden bg-white rounded-lg">
              <Image src="/logo.png" alt="Logo" fill className="object-contain" />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-sm font-black text-white leading-none tracking-tight">WINGS <span className="text-accent">ACADEMY</span></span>
              <span className="text-[0.55rem] font-bold text-slate-500 uppercase tracking-widest mt-1 w-full text-center">Prepare for take off</span>
            </div>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors absolute top-6 right-4"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 mt-6 px-4 space-y-2 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => {
            const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between p-3 rounded-xl transition-all group ${isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'hover:bg-slate-800 hover:text-white'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-accent' : 'text-slate-400 group-hover:text-accent'} transition-colors`} />
                  <span className="font-semibold text-sm">{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-white/50" />}
              </Link>
            )
          })}

          <button
            onClick={async () => {
              await signout()
              router.push('/login')
            }}
            className="w-full flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-red-500/10 hover:text-red-500 group"
          >
            <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500 transition-colors" />
            <span className="font-semibold text-sm">Logout</span>
          </button>
        </nav>

        {/* Footer Info */}
        <div className="p-6 border-t border-slate-800 text-[0.65rem] text-slate-500 font-medium">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-sm shadow-green-500/50"></div>
            <span>System Online</span>
          </div>
          <p>© {new Date().getFullYear()} {platformName}</p>
        </div>
      </aside>
    </>
  )
}

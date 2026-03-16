'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Plane, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import { signout } from '@/app/actions/auth'

export default function NavbarClient({ user, role }: { user: any, role?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignOut = async () => {
    await signout()
    router.refresh()
  }

  const navLinks = [
    { name: 'Home', href: '/' },
    ...(user ? [{ name: 'Dashboard', href: '/dashboard' }] : []),
    { name: 'About', href: '/about' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Contact', href: '/contact' },
  ]

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'glass py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-12 h-12 flex items-center justify-center overflow-hidden group-hover:-translate-y-1 transition-transform">
              <Image src="/logo.png" alt="Wings Academy Logo" fill className="object-contain" priority />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-primary leading-none tracking-tight">WINGS <span className="text-accent">ACADEMY</span></span>
              <span className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Prepare for Takeoff</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-2 py-1 font-bold transition-all duration-300 ${isActive
                      ? 'text-primary'
                      : 'text-slate-500 hover:text-primary'
                    }`}
                >
                  {link.name}
                </Link>
              )
            })}
            <div className="flex items-center space-x-4 border-l border-slate-200 pl-6 ml-2">
              {user ? (
                <>
                  <div className="flex flex-col text-right">
                    <div className="font-semibold text-primary leading-none">
                      Hi, {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </div>
                    {role === 'admin' ? (
                      <Link href="/admin" className="text-[0.65rem] font-bold text-accent uppercase tracking-wider hover:underline mt-1">
                        Admin Panel
                      </Link>
                    ) : (
                      <Link href="/dashboard" className="text-[0.65rem] font-bold text-accent uppercase tracking-wider hover:underline mt-1">
                        Go to Dashboard
                      </Link>
                    )}
                  </div>
                  <button onClick={handleSignOut} className="text-slate-500 hover:text-red-500 transition-colors flex items-center gap-1 font-semibold">
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="font-bold text-[#0f172a] hover:text-primary transition-colors">
                    Log in
                  </Link>
                  <Link href="/signup" className="bg-primary text-white px-6 py-2.5 rounded-full font-bold hover:brightness-110 transition-all shadow-lg shadow-primary/20">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-primary hover:text-accent p-2 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-b border-primary/10"
          >
            <div className="px-4 pt-2 pb-6 space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`block px-5 py-4 text-base font-bold transition-all ${isActive
                        ? 'text-primary'
                        : 'text-slate-600 hover:text-primary'
                      }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </Link>
                )
              })}
              <div className="pt-4 flex flex-col gap-3">
                {user ? (
                  <>
                    <div className="px-3 py-2 font-semibold text-primary border-b border-slate-200">
                      Logged in as {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </div>
                    <button onClick={() => { handleSignOut(); setIsOpen(false); }} className="w-full flex justify-center text-red-500 hover:bg-red-50 border border-red-200 px-6 py-3 rounded-xl font-bold transition-colors">
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="w-full flex justify-center text-primary hover:bg-slate-50 border border-slate-200 px-6 py-3 rounded-xl font-bold transition-colors">
                      Log in
                    </Link>
                    <Link href="/signup" className="w-full flex justify-center bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:brightness-110 transition-colors">
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

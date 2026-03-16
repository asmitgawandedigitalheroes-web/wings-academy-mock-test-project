import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { resetPasswordForEmail } from '../actions/auth'
import SubmitButton from '@/components/common/SubmitButton'

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const resolvedParams = await searchParams;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden pt-32">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-primary/5 rounded-full blur-[100px]" />
          <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-accent/10 rounded-full blur-[100px]" />
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link href="/" className="flex justify-center items-center gap-3 group mb-8">
            <div className="relative w-16 h-16 flex items-center justify-center overflow-hidden group-hover:-translate-y-1 transition-transform">
              <Image src="/logo.png" alt="Wings Academy Logo" fill className="object-contain" priority />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-2xl font-black text-primary leading-none tracking-tight">WINGS <span className="text-accent">ACADEMY</span></span>
              <span className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-widest mt-1">Prepare for Takeoff</span>
            </div>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-primary">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Enter your email address and we will send you a link to reset your password.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md mb-20">
          <div className="bg-white py-8 px-4 shadow-2xl shadow-primary/5 sm:rounded-2xl sm:px-10 border border-slate-100">
            <form className="space-y-6" action={resetPasswordForEmail}>
              {resolvedParams?.error && (
                <div className="bg-red-50 text-red-500 font-bold p-3 rounded-xl text-center text-sm border border-red-100">
                  {resolvedParams.error}
                </div>
              )}
              {resolvedParams?.message && (
                <div className="bg-green-50 text-green-600 font-bold p-3 rounded-xl text-center text-sm border border-green-100">
                  {resolvedParams.message}
                </div>
              )}
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-slate-700">
                  Email address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-slate-300 rounded-xl py-3 bg-slate-50 border border-slate-200 outline-none transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4 pt-2">
                <SubmitButton
                  label="Send Reset Link"
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-primary/20 text-sm font-bold text-white bg-primary hover:bg-[#152e75] transition-all"
                />
                <Link
                  href="/login"
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 transition-all font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

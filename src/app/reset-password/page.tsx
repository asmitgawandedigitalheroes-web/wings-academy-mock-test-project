import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { updatePassword } from '../actions/auth'
import PasswordInput from '@/components/form/PasswordInput'
import SubmitButton from '@/components/common/SubmitButton'

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const resolvedParams = await searchParams;
  // Trigger turbopack rebuild to clear cached actions
  
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
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-primary">
            Set new password
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Please enter your new password below.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md mb-20">
          <div className="bg-white py-8 px-4 shadow-2xl shadow-primary/5 sm:rounded-2xl sm:px-10 border border-slate-100">
            <form className="space-y-6" action={updatePassword}>
              {resolvedParams?.error && (
                <div className="bg-red-50 text-red-500 font-bold p-3 rounded-xl text-center text-sm border border-red-100">
                  {resolvedParams.error}
                </div>
              )}
              
              <div>
                <label htmlFor="password" className="block text-sm font-bold text-slate-700">
                  New Password
                </label>
                <PasswordInput id="password" name="password" placeholder="New password" />
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-bold text-slate-700">
                  Confirm Password
                </label>
                <PasswordInput id="confirm-password" name="confirm-password" placeholder="Confirm new password" />
              </div>

              <div className="flex flex-col gap-4 pt-2">
                <SubmitButton
                  label="Update Password"
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

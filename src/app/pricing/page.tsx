import React from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Pricing",
  description: "Flexible pricing plans for Aircraft Maintenance Engineers. Buy individual modules and get access to premium mock tests for your certification success.",
};
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import PricingComponent from '@/components/home/Pricing'
import { createClient } from '@/utils/supabase/server'

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-32 pb-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl md:text-5xl font-black text-primary mb-6 tracking-tight">
              Pay As You <span className="text-accent">Learn</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Unlock individual modules for targeted practice. Register now to access free tests and start your journey.
            </p>
          </div>

          {/* Reuse the existing Pricing component without its internal heading */}
          <PricingComponent showHeading={false} user={user} />
        </div>
      </main>
      <Footer />
    </>
  )
}

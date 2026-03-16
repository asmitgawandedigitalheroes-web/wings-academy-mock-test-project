import React from 'react'
import { getTestData } from '@/app/actions/dashboard'
import TestInterface from '@/components/test/TestInterface'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TestPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const [{ data: { user } }, test] = await Promise.all([
    supabase.auth.getUser(),
    getTestData(id)
  ])

  if (!test) {
    redirect('/dashboard/modules')
  }

  return (
    <div className="min-h-screen">
      {user ? <TestInterface test={test} user={user} /> : <div>Loading user data...</div>}
    </div>
  )
}

import React from 'react'
import { getTestData } from '@/app/actions/dashboard'
import TestInterface from '@/components/test/TestInterface'
import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TestPage({ params }: PageProps) {
  const { id } = await params
  const test = await getTestData(id)

  if (!test) {
    redirect('/dashboard/subjects')
  }

  return (
    <div className="min-h-screen">
      <TestInterface test={test} />
    </div>
  )
}

import React from 'react'
import { getMyTests } from '@/app/actions/dashboard'
import MyTestsClient from '@/components/dashboard/MyTestsClient'

export default async function MyTestsPage() {
  const tests = await getMyTests()

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <MyTestsClient initialTests={tests} />
    </div>
  )
}

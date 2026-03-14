import React from 'react'
import { getDetailedModuleProgress } from '@/app/actions/dashboard'
import ProgressClient from '@/components/dashboard/ProgressClient'

export default async function LearningProgressPage() {
  const progressData = await getDetailedModuleProgress()

  return (
    <ProgressClient initialData={progressData} />
  )
}

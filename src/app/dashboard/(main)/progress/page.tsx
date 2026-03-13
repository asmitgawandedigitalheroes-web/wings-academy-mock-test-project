import React from 'react'
import { getDetailedSubjectProgress } from '@/app/actions/dashboard'
import ProgressClient from '@/components/dashboard/ProgressClient'

export default async function LearningProgressPage() {
  const progressData = await getDetailedSubjectProgress()

  return (
    <ProgressClient initialData={progressData} />
  )
}

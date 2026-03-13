import React from 'react'
import { getSubjects } from '@/app/actions/dashboard'
import SubjectsClient from '@/components/dashboard/SubjectsClient'

export default async function SubjectsPage() {
  const subjects = await getSubjects()

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#0f172a] tracking-tight">Browse Subjects</h1>
          <p className="text-slate-500 font-medium mt-2">Choose a subject to start your mock test preparation.</p>
        </div>
      </div>

      <SubjectsClient initialSubjects={subjects} />
    </div>
  )
}

import React from 'react'
import { getModules } from '@/app/actions/dashboard'
import ModulesClient from '@/components/dashboard/ModulesClient'

export default async function ModulesPage() {
  const modules = await getModules()

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-[#0f172a] tracking-tight">Browse Modules</h1>
          <p className="text-slate-500 font-medium mt-2">Choose a module to start your mock test preparation.</p>
        </div>
      </div>

      <ModulesClient initialModules={modules} />
    </div>
  )
}

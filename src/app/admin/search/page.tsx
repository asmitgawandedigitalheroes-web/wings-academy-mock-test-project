import React from 'react'
import { Search, User, FileText, Database, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { globalSearch } from '@/app/actions/admin'

export default async function AdminSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const query = (await searchParams).q || ''
  
  const results = await globalSearch(query)
  
  const hasResults = results.users.length > 0 || results.modules.length > 0 || results.tests.length > 0

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-black text-[#0f172a] tracking-tight">Search Results</h1>
        <p className="text-slate-500 font-medium mt-1">
          {query ? (
             <span>Showing results for <span className="text-primary font-bold">"{query}"</span></span>
          ) : (
            'Enter a search term in the top bar.'
          )}
        </p>
      </div>

      {!hasResults && query && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-16 text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-[#0f172a] mb-2">No results found</h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto">
                We couldn't find any users, modules, or tests matching your search query. Try adjusting your terms.
            </p>
        </div>
      )}

      {hasResults && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Users Column */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                        <User className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-black text-[#0f172a]">Users ({results.users.length})</h2>
                </div>
                
                <div className="space-y-4">
                    {results.users.map((user: any) => (
                        <div key={user.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <h3 className="font-bold text-[#0f172a] truncate">{user.full_name || 'Unnamed User'}</h3>
                            <p className="text-sm font-medium text-slate-500 truncate mb-4">{user.email}</p>
                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wider">
                                {user.role}
                            </span>
                        </div>
                    ))}
                    {results.users.length === 0 && (
                        <p className="text-sm text-slate-400 font-bold p-6 text-center border-2 border-dashed border-slate-200 rounded-3xl">No users found</p>
                    )}
                </div>
            </div>

            {/* Modules Column */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                        <Database className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-black text-[#0f172a]">Modules ({results.modules.length})</h2>
                </div>

                <div className="space-y-4">
                    {results.modules.map((module: any) => (
                        <Link href={`/admin/modules/${module.id}`} key={module.id} className="block bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group">
                            <h3 className="font-bold text-[#0f172a] truncate group-hover:text-primary transition-colors">{module.name}</h3>
                            <p className="text-sm font-medium text-slate-500 line-clamp-2 mt-1 mb-4">{module.description || 'No description'}</p>
                            <div className="flex items-center text-xs font-bold text-primary gap-1">
                                View Module <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    ))}
                    {results.modules.length === 0 && (
                        <p className="text-sm text-slate-400 font-bold p-6 text-center border-2 border-dashed border-slate-200 rounded-3xl">No modules found</p>
                    )}
                </div>
            </div>

            {/* Tests Column */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 mb-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                        <FileText className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-black text-[#0f172a]">Tests ({results.tests.length})</h2>
                </div>

                <div className="space-y-4">
                    {results.tests.map((test: any) => (
                        <Link href={`/admin/tests/${test.id}`} key={test.id} className="block bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-primary/30 transition-all group">
                            <h3 className="font-bold text-[#0f172a] truncate group-hover:text-primary transition-colors">{test.title}</h3>
                            <p className="text-sm font-medium text-slate-500 truncate mt-1 mb-4">
                                Module: {test.modules?.name || 'Unknown Module'}
                            </p>
                            <div className="flex items-center text-xs font-bold text-primary gap-1">
                                View Test <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    ))}
                    {results.tests.length === 0 && (
                        <p className="text-sm text-slate-400 font-bold p-6 text-center border-2 border-dashed border-slate-200 rounded-3xl">No tests found</p>
                    )}
                </div>
            </div>

        </div>
      )}
    </div>
  )
}

import React from 'react'
import { getProfileData, getPurchases } from '@/app/actions/dashboard'
import {
    Calendar, Target, FileText, Award,
    Wallet, ExternalLink, ShoppingBag, CreditCard, Globe
} from 'lucide-react'
import Link from 'next/link'
import { ProfileAvatar } from '@/components/dashboard/ProfileAvatar'
import { ProfileForm } from '@/components/dashboard/ProfileForm'

export default async function ProfilePage() {
    const profile = await getProfileData()
    const purchases = await getPurchases()

    if (!profile) return null




    return (
        <div className="w-full space-y-8 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
                <ProfileAvatar
                    initialAvatarUrl={profile.avatar_url}
                    initialName={profile.full_name}
                />
                <div className="text-center md:text-left">
                    <h1 className="text-3xl md:text-4xl font-black text-[#0f172a] tracking-tight">{profile.full_name || 'Student'}</h1>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 mt-4">
                        <div className="flex items-center gap-2 text-slate-400 font-bold text-[0.65rem] md:text-sm uppercase tracking-widest">
                            <Calendar className="w-3.5 md:w-4 h-3.5 md:h-4" />
                            {profile.joinDate}
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 font-bold text-[0.65rem] md:text-sm uppercase tracking-widest">
                            <Globe className="w-3.5 md:w-4 h-3.5 md:h-4" />
                            United Arab Emirates
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
                {/* Stats Column */}
                <div className="lg:col-span-1 space-y-6 md:space-y-8">
                    <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-primary/5 space-y-6 md:space-y-8">
                        <h3 className="text-lg md:text-xl font-black text-[#0f172a]">Learning Stats</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4 md:gap-6">
                            <div className="flex items-center gap-4 md:gap-5 bg-slate-50/50 p-4 rounded-2xl border border-slate-50 md:bg-transparent md:p-0 md:border-0">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary/5 text-primary flex items-center justify-center shrink-0">
                                    <FileText className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <div>
                                    <p className="text-[0.55rem] md:text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">Total Tests</p>
                                    <p className="text-lg md:text-xl font-black text-[#0f172a]">{profile.totalTests}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 md:gap-5 bg-slate-50/50 p-4 rounded-2xl border border-slate-50 md:bg-transparent md:p-0 md:border-0">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary/5 text-primary flex items-center justify-center shrink-0">
                                    <Target className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <div>
                                    <p className="text-[0.55rem] md:text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">Avg Score</p>
                                    <p className="text-lg md:text-xl font-black text-[#0f172a]">{profile.avgScore}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 md:gap-5 bg-slate-50/50 p-4 rounded-2xl border border-slate-50 md:bg-transparent md:p-0 md:border-0">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary/5 text-primary flex items-center justify-center shrink-0">
                                    <Award className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <div>
                                    <p className="text-[0.55rem] md:text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">Awards</p>
                                    <p className="text-lg md:text-xl font-black text-[#0f172a]">12</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Form Column */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-primary/5">
                        <ProfileForm initialData={{
                            full_name: profile.full_name,
                            email: profile.email,
                            phone: profile.phone,
                            country: profile.country
                        }} />
                    </div>
                </div>
            </div>


            {/* Purchase History Section */}
            <div className="space-y-6 md:space-y-8 pt-10 border-t border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary/5 text-primary flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-black text-[#0f172a] tracking-tight">Purchase History</h2>
                        <p className="text-slate-500 font-medium text-xs md:text-sm">Review your previous test purchases and transactions.</p>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-primary/5 overflow-hidden">
                    {/* Desktop View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-50">
                                    <th className="px-8 py-6 text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Purchased Item</th>
                                    <th className="px-8 py-6 text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Price</th>
                                    <th className="px-8 py-6 text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-6 text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Date</th>
                                    <th className="px-8 py-6 text-[0.65rem] font-black text-slate-400 uppercase tracking-widest">Transaction ID</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {purchases.map((purchase) => (
                                    <tr key={purchase.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                                                    <Wallet className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-[#0f172a] leading-tight">{purchase.testName}</p>
                                                    <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mt-1">{purchase.module}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-lg font-black text-[#0f172a]">{purchase.price}</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[0.65rem] font-black uppercase tracking-wider ${purchase.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                                                }`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${purchase.status === 'completed' ? 'bg-green-600' : 'bg-amber-600'}`}></div>
                                                {purchase.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                                                <Calendar className="w-4 h-4 text-slate-300" />
                                                {purchase.date}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-slate-400 font-mono text-[0.65rem] font-bold">
                                                {purchase.transactionId}
                                                <ExternalLink className="w-3 h-3 cursor-pointer hover:text-primary transition-colors" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden divide-y divide-slate-50">
                        {purchases.map((purchase) => (
                            <div key={purchase.id} className="p-6 space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary grow-0 shrink-0">
                                        <Wallet className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="font-bold text-[#0f172a] leading-tight truncate">{purchase.testName}</p>
                                        <p className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest mt-0.5 truncate">{purchase.module}</p>
                                    </div>
                                    <div className="text-right grow-0 shrink-0">
                                        <p className="text-lg font-black text-[#0f172a]">{purchase.price}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-2">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[0.55rem] font-black uppercase tracking-wider ${purchase.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                                        }`}>
                                        <div className={`w-1 h-1 rounded-full ${purchase.status === 'completed' ? 'bg-green-600' : 'bg-amber-600'}`}></div>
                                        {purchase.status}
                                    </span>
                                    <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[0.65rem]">
                                        <Calendar className="w-3.5 h-3.5 text-slate-300" />
                                        {purchase.date}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-slate-400 font-mono text-[0.6rem] font-bold bg-slate-50 p-2 rounded-lg">
                                    <span className="truncate mr-2">ID: {purchase.transactionId}</span>
                                    <ExternalLink className="w-3 h-3 grow-0 shrink-0" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {purchases.length === 0 && (
                        <div className="py-16 md:py-20 text-center">
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/5 text-primary rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <ShoppingBag className="w-8 h-8 md:w-10 md:h-10" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-black text-[#0f172a]">No Purchases Yet</h3>
                            <p className="text-slate-500 font-medium text-xs md:text-sm">Any test purchases you make will appear here.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}

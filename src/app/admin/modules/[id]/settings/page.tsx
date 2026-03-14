'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ChevronLeft, 
  Save, 
  Settings2, 
  Info, 
  Eye, 
  BarChart3, 
  CreditCard, 
  Image as ImageIcon,
  CheckCircle2,
  Circle,
  HelpCircle,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { getModuleDetails, updateModuleSettings, uploadModuleAsset, getCategories } from '@/app/actions/admin'
import AssetUpload from '@/components/admin/modules/AssetUpload'

export default function ModuleSettingsPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const [module, setModule] = useState<any>(null)
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState<any>({
        name: '',
        code: '',
        category_id: '' as string | null,
        description: '',
        status: 'enabled',
        free_tests_limit: 2,
        paid_tests_limit: 3,
        enable_purchase: false,
        price: 0,
        icon_url: '',
        image_url: ''
    })

    useEffect(() => {
        const fetchData = async () => {
            const [data, cats] = await Promise.all([
                getModuleDetails(id),
                getCategories()
            ])
            setCategories(cats)
            if (data) {
                setModule(data)
                setFormData({
                    name: data.name || '',
                    code: data.code || '',
                    category_id: data.category_id || '',
                    description: data.description || '',
                    status: data.status === 'enabled' ? 'published' : data.status === 'disabled' ? 'draft' : data.status || 'draft',
                    free_tests_limit: data.free_tests_limit ?? 2,
                    paid_tests_limit: data.paid_tests_limit ?? 3,
                    enable_purchase: data.enable_purchase || false,
                    price: data.price || 0,
                    icon_url: data.icon_url || '',
                    image_url: data.image_url || ''
                })
            }
            setLoading(false)
        }
        fetchData()
    }, [id])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        const dbStatus = formData.status === 'published' ? 'enabled' : formData.status === 'draft' ? 'disabled' : formData.status
        const res = await updateModuleSettings(id, { 
            ...formData, 
            status: dbStatus,
            free_tests_limit: parseInt(formData.free_tests_limit) || 0,
            paid_tests_limit: parseInt(formData.paid_tests_limit) || 0,
            price: parseFloat(formData.price) || 0
        } as any)
        setSaving(false)
        if (res.success) {
            router.replace(`/admin/modules/${id}`)
        } else {
            alert(res.error || 'Failed to save settings')
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="font-black text-slate-400">Loading settings...</p>
            </div>
        )
    }

    return (
        <div className="w-full px-4 md:px-10 py-6 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Link 
                    href={`/admin/modules/${id}`}
                    replace
                    className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors font-bold text-sm"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Module
                </Link>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-4 md:gap-5">
                        <div className="w-14 h-14 md:w-16 md:h-16 bg-white shadow-xl shadow-primary/5 rounded-2xl md:rounded-3xl flex items-center justify-center border border-slate-50 shrink-0">
                            <Settings2 className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-[#0f172a] tracking-tight">Module Settings</h1>
                            <p className="text-sm md:text-base text-slate-500 font-medium">Configure basic info, visibility, and pricing.</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full sm:w-auto bg-primary text-white px-8 py-3.5 rounded-2xl font-black shadow-lg shadow-primary/20 hover:bg-[#152e75] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        <span>Save Changes</span>
                    </button>
                </div>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
                {/* Left Column - Main Settings */}
                <div className="md:col-span-2 space-y-8">
                    {/* Basic Info */}
                    <Section title="Basic Info" icon={<Info className="w-5 h-5" />}>
                        <div className="space-y-8">
                            <InputGroup 
                                label="Module Name"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Enter module name..."
                            />
                             <InputGroup 
                                 label="Module Code"
                                 value={formData.code}
                                 onChange={e => setFormData({ ...formData, code: e.target.value })}
                                 placeholder="e.g. ELEC-01"
                             />
                             <div className="space-y-3">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em] group-focus-within/input:text-primary transition-colors">Module Category</label>
                                    <span className="text-[10px] font-black text-slate-300 uppercase">Optional</span>
                                </div>
                                <div className="relative group/select">
                                    <select 
                                        value={formData.category_id || ''}
                                        onChange={e => setFormData({ ...formData, category_id: e.target.value || null })}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:ring-8 focus:ring-primary/5 transition-all font-bold text-[#0f172a] appearance-none cursor-pointer"
                                    >
                                        <option value="">No Category (Uncategorized)</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <ChevronLeft className="w-4 h-4 -rotate-90" />
                                    </div>
                                </div>
                             </div>
                            <div className="space-y-3">
                                <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Description</label>
                                <textarea 
                                    rows={4}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe the module goals and coverage..."
                                    className="w-full px-7 py-5 bg-slate-50/50 border-2 border-slate-100 rounded-[2rem] outline-none focus:ring-8 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold text-[#0f172a] placeholder:text-slate-300 resize-none hover:bg-white"
                                />
                            </div>
                        </div>
                    </Section>

                    {/* Test Limits */}
                    <Section title="Test Limits" icon={<BarChart3 className="w-5 h-5" />}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <InputGroup 
                                label="Free Tests Limit"
                                icon={<BarChart3 className="w-4 h-4" />}
                                type="text"
                                value={formData.free_tests_limit}
                                onChange={e => setFormData({ ...formData, free_tests_limit: e.target.value.replace(/[^0-9]/g, '') })}
                            />
                            <InputGroup 
                                label="Paid Tests Limit"
                                icon={<BarChart3 className="w-4 h-4" />}
                                type="text"
                                value={formData.paid_tests_limit}
                                onChange={e => setFormData({ ...formData, paid_tests_limit: e.target.value.replace(/[^0-9]/g, '') })}
                            />
                        </div>
                    </Section>

                    {/* Pricing */}
                    <Section title="Pricing" icon={<CreditCard className="w-5 h-5" />}>
                        <div className="space-y-8">
                            <div className="flex items-center justify-between p-6 bg-slate-50/50 rounded-[2rem] border-2 border-slate-100 transition-all hover:bg-white hover:shadow-xl hover:shadow-primary/5 group/toggle">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-400 group-hover/toggle:text-primary transition-colors">
                                        <CreditCard className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="font-black text-[#0f172a]">Enable Module Purchase</p>
                                        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Premium Access Toggle</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.enable_purchase}
                                        onChange={e => setFormData({ ...formData, enable_purchase: e.target.checked })}
                                        className="sr-only peer" 
                                    />
                                    <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[24px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all duration-500 peer-checked:bg-primary"></div>
                                </label>
                            </div>
                            {formData.enable_purchase && (
                                    <InputGroup 
                                        label="Module Price (₹)"
                                        icon={<CreditCard className="w-4 h-4" />}
                                        type="text"
                                        value={formData.price}
                                        onChange={e => {
                                            const val = e.target.value.replace(/[^0-9.]/g, '');
                                            if ((val.match(/\./g) || []).length <= 1) {
                                                setFormData({ ...formData, price: val });
                                            }
                                        }}
                                        placeholder="0.00"
                                    />
                            )}
                        </div>
                    </Section>
                </div>

                {/* Right Column - Visibility & Assets */}
                <div className="space-y-8">
                    <Section title="Visibility" icon={<Eye className="w-5 h-5" />}>
                        <div className="space-y-4">
                            <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Status</label>
                            <div className="relative group/select">
                                <select 
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:ring-8 focus:ring-primary/5 transition-all font-bold text-[#0f172a] appearance-none cursor-pointer"
                                >
                                    <option value="published">Published</option>
                                    <option value="draft">Draft</option>
                                    <option value="hidden">Hidden</option>
                                </select>
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover/select:text-primary transition-colors">
                                    <ChevronLeft className="w-4 h-4 -rotate-90" />
                                </div>
                            </div>
                            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 flex items-center gap-2">
                                    <Info className="w-3 h-3" />
                                    What does this mean?
                                </p>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                    {formData.status === 'published' && 'Students can find and take tests for this module.'}
                                    {formData.status === 'draft' && 'Module is being prepared. It is hidden from all students.'}
                                    {formData.status === 'hidden' && 'Module is not visible in the main catalog but can be accessed via direct links.'}
                                </p>
                            </div>
                        </div>
                    </Section>

                    {/* Assets */}
                    <Section title="Assets" icon={<ImageIcon className="w-5 h-5" />}>
                        <div className="space-y-8">
                            <AssetUpload 
                                label="Module Icon"
                                currentValue={formData.icon_url}
                                onUpload={(url: string) => setFormData({ ...formData, icon_url: url })}
                                uploadFn={(file: File) => uploadModuleAsset(file, `icons`)}
                                aspectRatio="square"
                            />
                            <AssetUpload 
                                label="Module Cover Image"
                                currentValue={formData.image_url}
                                onUpload={(url: string) => setFormData({ ...formData, image_url: url })}
                                uploadFn={(file: File) => uploadModuleAsset(file, `covers`)}
                                aspectRatio="video"
                            />
                        </div>
                    </Section>
                </div>
            </form>
        </div>
    )
}

function Section({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
    return (
        <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 shadow-xl shadow-primary/5 space-y-5 md:space-y-6 transition-all duration-500 hover:shadow-primary/10">
            <div className="flex items-center gap-4 border-b border-slate-50 pb-5">
                <div className="p-2.5 md:p-3 bg-primary/5 text-primary rounded-xl md:rounded-2xl">
                    {icon}
                </div>
                <div>
                    <h2 className="text-lg md:text-xl font-black text-[#0f172a] tracking-tight">{title}</h2>
                </div>
            </div>
            <div>
                {children}
            </div>
        </div>
    )
}

function InputGroup({ label, icon, ...props }: { label: string, icon?: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <div className="space-y-3 group/input">
            <div className="flex items-center justify-between ml-1">
                <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em] group-focus-within/input:text-primary transition-colors">{label}</label>
                {props.required && <span className="text-[10px] font-black text-primary/40 uppercase">Required</span>}
            </div>
            <div className="relative flex items-center group/field">
                {icon && (
                    <div className="absolute left-5 text-slate-400 group-focus-within/field:text-primary transition-colors">
                        {icon}
                    </div>
                )}
                <input 
                    {...props}
                    className={`w-full ${icon ? 'pl-14' : 'px-6'} py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:ring-8 focus:ring-primary/5 transition-all duration-300 font-bold text-[#0f172a] placeholder:text-slate-300 hover:bg-white`}
                    onKeyDown={(e) => {
                        const isControlKey = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', 'Escape'].includes(e.key);
                        const isNumber = /[0-9]/.test(e.key);
                        const isDecimal = e.key === '.' && props.type === 'text';

                        if (!isNumber && !isControlKey && !isDecimal) {
                            e.preventDefault();
                        }
                    }}
                />
            </div>
        </div>
    )
}

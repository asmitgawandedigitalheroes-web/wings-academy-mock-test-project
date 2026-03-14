'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ChevronLeft, 
  Save, 
  Settings, 
  Globe, 
  Lock, 
  Clock, 
  Layers, 
  CheckCircle2, 
  Eye, 
  EyeOff,
  Calendar,
  Shuffle,
  DollarSign,
  AlertCircle,
  BarChart3,
  CreditCard,
  Info,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { getTestDetails, updateTestSettings } from '@/app/actions/admin'
import CustomTimePicker from '@/components/form/CustomTimePicker'

export default function TestSettingsPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const [test, setTest] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        time_limit_minutes: 60,
        pass_percentage: 40,
        target_questions: 0,
        attempts_allowed: 1,
        cooldown_hours: 0,
        is_paid: false,
        price: 0,
        status: 'draft' as 'published' | 'draft',
        show_score: true,
        show_answers: true,
        show_explanation: true,
        start_date: '',
        end_date: '',
        randomize_questions: false,
        randomize_answers: false,
        marks_per_question: 1,
        negative_marks: 0
    })

    useEffect(() => {
        async function fetchDetails() {
            setLoading(true)
            const data = await getTestDetails(id)
            if (data) {
                setTest(data)
                setFormData({
                    title: data.title || '',
                    description: data.description || '',
                    time_limit_minutes: data.time_limit_minutes || 60,
                    pass_percentage: data.pass_percentage || 40,
                    target_questions: data.target_questions || 0,
                    attempts_allowed: data.attempts_allowed || 1,
                    cooldown_hours: data.cooldown_hours || 0,
                    is_paid: data.is_paid || false,
                    price: data.price || 0,
                    status: data.status || 'draft',
                    show_score: data.show_score ?? true,
                    show_answers: data.show_answers ?? true,
                    show_explanation: data.show_explanation ?? true,
                    start_date: data.start_date ? new Date(data.start_date).toISOString().slice(0, 16) : '',
                    end_date: data.end_date ? new Date(data.end_date).toISOString().slice(0, 16) : '',
                    randomize_questions: data.randomize_questions || false,
                    randomize_answers: data.randomize_answers || false,
                    marks_per_question: data.marks_per_question || 1,
                    negative_marks: data.negative_marks || 0
                })
            }
            setLoading(false)
        }
        fetchDetails()
    }, [id])

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        setSaving(true)
        setError(null)
        setMessage(null)

        if (!test?.module_id) {
            setError('Module ID not found. Cannot save.')
            setSaving(false)
            return
        }

        const result = await updateTestSettings(id, test.module_id, {
            ...formData,
            start_date: formData.start_date || null,
            end_date: formData.end_date || null
        })

        if (result.error) {
            setError(result.error)
        } else {
            setMessage('Settings saved successfully!')
            setTimeout(() => setMessage(null), 3000)
            router.push(`/admin/tests/${id}`)
        }
        setSaving(false)
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="font-black text-slate-400">Loading settings...</p>
            </div>
        )
    }

    if (!test) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <AlertCircle className="w-12 h-12 text-red-400" />
                <h2 className="text-xl font-black text-[#0f172a]">Test Not Found</h2>
                <p className="text-slate-500 font-medium">The test you're looking for doesn't exist.</p>
                <Link href="/admin/modules" className="text-primary font-black hover:underline uppercase tracking-widest text-sm mt-2">
                    Back to Modules
                </Link>
            </div>
        )
    }

    return (
        <div className="w-full px-4 md:px-10 py-6 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Link 
                    href={`/admin/tests/${id}`}
                    className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors font-bold text-sm"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Test
                </Link>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-4 md:gap-5">
                        <div className="w-14 h-14 md:w-16 md:h-16 bg-white shadow-xl shadow-primary/5 rounded-2xl md:rounded-3xl flex items-center justify-center border border-slate-50 shrink-0">
                            <Settings className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-[#0f172a] tracking-tight">Test Settings</h1>
                            <p className="text-sm md:text-base text-slate-500 font-medium">Configure rules, attempts, results and scheduling.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        {message && (
                            <div className="hidden lg:block px-4 py-2 bg-green-50 text-green-600 rounded-xl text-xs font-bold border border-green-100">
                                {message}
                            </div>
                        )}
                        <button 
                            onClick={() => handleSave()}
                            disabled={saving}
                            className="w-full sm:w-auto bg-primary text-white px-8 py-3.5 rounded-2xl font-black shadow-lg shadow-primary/20 hover:bg-[#152e75] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            <span>Save Changes</span>
                        </button>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
                {/* Left Column - Main Settings */}
                <div className="md:col-span-2 space-y-8">
                    {/* Basic Info */}
                    <Section title="Basic Info" icon={<Info className="w-5 h-5" />}>
                        <div className="space-y-6">
                            <InputGroup 
                                label="Test Title"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter test title..."
                            />
                            <div className="space-y-3">
                                <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Instructions / Description</label>
                                <textarea 
                                    rows={4}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Enter instructions for students..."
                                    className="w-full px-7 py-5 bg-slate-50/50 border-2 border-slate-100 rounded-[2rem] outline-none focus:ring-8 focus:ring-primary/5 focus:border-primary/20 transition-all font-bold text-[#0f172a] placeholder:text-slate-300 resize-none hover:bg-white"
                                />
                            </div>
                        </div>
                    </Section>

                    {/* Configuration */}
                    <Section title="Configuration" icon={<BarChart3 className="w-5 h-5" />}>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <InputGroup 
                                label="Duration (Min)"
                                type="number"
                                min="0"
                                value={formData.time_limit_minutes}
                                onChange={e => setFormData({ ...formData, time_limit_minutes: Math.max(0, parseInt(e.target.value) || 0) })}
                            />
                            <InputGroup 
                                label="Pass Percentage (%)"
                                type="number"
                                min="0"
                                max="100"
                                value={formData.pass_percentage}
                                onChange={e => setFormData({ ...formData, pass_percentage: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                            />
                            <InputGroup 
                                label="Target Questions"
                                type="number"
                                min="0"
                                value={formData.target_questions}
                                onChange={e => setFormData({ ...formData, target_questions: Math.max(0, parseInt(e.target.value) || 0) })}
                            />
                        </div>
                    </Section>

                    {/* Grading & Marking */}
                    <Section title="Grading & Marking" icon={<CheckCircle2 className="w-5 h-5" />}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3 group/input">
                                <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Marks per Question</label>
                                <input 
                                    min="0"
                                    step="0.1"
                                    value={formData.marks_per_question}
                                    onChange={e => setFormData({ ...formData, marks_per_question: Math.max(0, parseFloat(e.target.value) || 0) })}
                                    className="w-full px-5 py-3.5 md:px-6 md:py-4 bg-slate-50 border-2 border-slate-100 rounded-xl md:rounded-2xl outline-none focus:border-primary/20 focus:ring-8 focus:ring-primary/5 transition-all duration-300 font-bold text-[#0f172a] hover:bg-white"
                                />
                            </div>
                            <div className="space-y-3 group/input">
                                <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Negative Marking per Question</label>
                                <input 
                                    min="0"
                                    step="0.1"
                                    value={formData.negative_marks}
                                    onChange={e => setFormData({ ...formData, negative_marks: Math.max(0, parseFloat(e.target.value) || 0) })}
                                    className="w-full px-5 py-3.5 md:px-6 md:py-4 bg-slate-50 border-2 border-slate-100 rounded-xl md:rounded-2xl outline-none focus:border-primary/20 focus:ring-8 focus:ring-primary/5 transition-all duration-300 font-bold text-[#0f172a] hover:bg-white"
                                />
                            </div>
                        </div>
                        <div className="mt-4 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 flex items-center gap-2">
                                <Info className="w-3 h-3" />
                                Grading Logic
                            </p>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                Total Score = (Correct Answers × Marks per Question) - (Wrong Answers × Negative Marking). 
                                Questions skipped or marked as 'unanswered' do not incur negative marks.
                            </p>
                        </div>
                    </Section>

                    {/* Access & Results */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Section title="Access Control" icon={<Lock className="w-5 h-5" />}>
                            <div className="space-y-6">
                                <InputGroup 
                                    label="Attempts (0 for ∞)"
                                    type="number"
                                    min="0"
                                    value={formData.attempts_allowed}
                                    onChange={e => setFormData({ ...formData, attempts_allowed: Math.max(0, parseInt(e.target.value) || 0) })}
                                />
                                <InputGroup 
                                    label="Cooldown (Hours)"
                                    type="number"
                                    min="0"
                                    value={formData.cooldown_hours}
                                    onChange={e => setFormData({ ...formData, cooldown_hours: Math.max(0, parseInt(e.target.value) || 0) })}
                                />
                            </div>
                        </Section>

                        <Section title="Results Visibility" icon={<Eye className="w-5 h-5" />}>
                            <div className="space-y-2">
                                <CheckboxItem 
                                    label="Show score after finish"
                                    checked={formData.show_score}
                                    onChange={checked => setFormData({ ...formData, show_score: checked })}
                                />
                                <CheckboxItem 
                                    label="Show correct answers"
                                    checked={formData.show_answers}
                                    onChange={checked => setFormData({ ...formData, show_answers: checked })}
                                />
                                <CheckboxItem 
                                    label="Show explanations"
                                    checked={formData.show_explanation}
                                    onChange={checked => setFormData({ ...formData, show_explanation: checked })}
                                />
                            </div>
                        </Section>
                    </div>

                    {/* Advanced */}
                    <Section title="Advanced" icon={<Shuffle className="w-5 h-5" />}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <ToggleItem 
                                label="Randomize Questions"
                                description="Shuffle question order"
                                active={formData.randomize_questions}
                                onClick={() => setFormData({ ...formData, randomize_questions: !formData.randomize_questions })}
                            />
                            <ToggleItem 
                                label="Randomize Answers"
                                description="Shuffle option order"
                                active={formData.randomize_answers}
                                onClick={() => setFormData({ ...formData, randomize_answers: !formData.randomize_answers })}
                            />
                        </div>
                    </Section>
                </div>

                {/* Right Column - Status & Pricing */}
                <div className="space-y-8">
                    <Section title="Visibility" icon={<Globe className="w-5 h-5" />}>
                        <div className="space-y-4">
                            <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Status</label>
                            <div className="relative group/select">
                                <select 
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:ring-8 focus:ring-primary/5 transition-all font-bold text-[#0f172a] appearance-none cursor-pointer"
                                >
                                    <option value="published">Published</option>
                                    <option value="draft">Draft</option>
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
                                    {formData.status === 'published' ? 'Test is visible and student can play.' : 'Draft tests are hidden from everyone but admins.'}
                                </p>
                            </div>
                        </div>
                    </Section>

                    <Section title="Pricing" icon={<CreditCard className="w-5 h-5" />}>
                         <div className="space-y-6">
                            <div className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl border-2 border-slate-100 transition-all hover:bg-white group/toggle">
                                <div>
                                    <p className="font-black text-[#0f172a] text-sm">Premium Test</p>
                                    <p className="text-[9px] uppercase font-black text-slate-400 tracking-widest">Paid Access</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={formData.is_paid}
                                        onChange={e => setFormData({ ...formData, is_paid: e.target.checked })}
                                        className="sr-only peer" 
                                    />
                                    <div className="w-12 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[20px] after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                            {formData.is_paid && (
                                <div className="animate-in slide-in-from-top-2 duration-300">
                                    <InputGroup 
                                        label="Test Price (₹)"
                                        type="number"
                                        min="0"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: Math.max(0, parseFloat(e.target.value) || 0) })}
                                    />
                                </div>
                            )}
                        </div>
                    </Section>

                    <Section title="Scheduling" icon={<Calendar className="w-5 h-5" />}>
                        <div className="space-y-8">
                            {/* Start Date & Time */}
                            <div className="space-y-4">
                                <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Start Date/Time</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative group/input">
                                        <input 
                                            type="date"
                                            value={formData.start_date.split('T')[0] || ''}
                                            onChange={e => {
                                                const time = formData.start_date.split('T')[1] || '00:00'
                                                setFormData({ ...formData, start_date: e.target.value ? `${e.target.value}T${time}` : '' })
                                            }}
                                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:ring-8 focus:ring-primary/5 transition-all font-bold text-[#0f172a]"
                                        />
                                    </div>
                                    <div className="relative group/input">
                                        <CustomTimePicker 
                                            value={formData.start_date.split('T')[1]?.slice(0, 5) || '00:00'}
                                            onChange={time => {
                                                const date = formData.start_date.split('T')[0] || new Date().toISOString().split('T')[0]
                                                setFormData({ ...formData, start_date: `${date}T${time}` })
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* End Date & Time */}
                            <div className="space-y-4">
                                <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">End Date/Time</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative group/input">
                                        <input 
                                            type="date"
                                            value={formData.end_date.split('T')[0] || ''}
                                            onChange={e => {
                                                const time = formData.end_date.split('T')[1] || '00:00'
                                                setFormData({ ...formData, end_date: e.target.value ? `${e.target.value}T${time}` : '' })
                                            }}
                                            className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary/20 focus:ring-8 focus:ring-primary/5 transition-all font-bold text-[#0f172a]"
                                        />
                                    </div>
                                    <div className="relative group/input">
                                        <CustomTimePicker 
                                            value={formData.end_date.split('T')[1]?.slice(0, 5) || '00:00'}
                                            onChange={time => {
                                                const date = formData.end_date.split('T')[0] || new Date().toISOString().split('T')[0]
                                                setFormData({ ...formData, end_date: `${date}T${time}` })
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
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

function InputGroup({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <div className="space-y-3 group/input">
            <div className="flex items-center justify-between ml-1">
                <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em] group-focus-within/input:text-primary transition-colors">{label}</label>
            </div>
            <input 
                {...props}
                className="w-full px-5 py-3.5 md:px-6 md:py-4 bg-slate-50 border-2 border-slate-100 rounded-xl md:rounded-2xl outline-none focus:border-primary/20 focus:ring-8 focus:ring-primary/5 transition-all duration-300 font-bold text-[#0f172a] placeholder:text-slate-300 hover:bg-white"
            />
        </div>
    )
}

function CheckboxItem({ label, checked, onChange }: { label: string, checked: boolean, onChange: (checked: boolean) => void }) {
    return (
        <label className="flex items-center gap-3 p-4 bg-slate-50/50 rounded-2xl cursor-pointer hover:bg-white border-2 border-transparent hover:border-slate-100 transition-all">
            <input 
                type="checkbox" 
                checked={checked}
                onChange={e => onChange(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-primary cursor-pointer"
            />
            <span className="font-bold text-sm text-[#0f172a]">{label}</span>
        </label>
    )
}

function ToggleItem({ label, description, active, onClick }: { label: string, description: string, active: boolean, onClick: () => void }) {
    return (
        <div 
            onClick={onClick}
            className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group ${active ? 'border-primary bg-primary/5' : 'border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200'}`}
        >
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl transition-colors ${active ? 'bg-primary text-white' : 'bg-white text-slate-400 shadow-sm'}`}>
                    <Shuffle className="w-4 h-4" />
                </div>
                <div>
                    <p className="font-black text-[#0f172a] text-sm">{label}</p>
                    <p className="text-[10px] text-slate-500 font-medium">{description}</p>
                </div>
            </div>
            <div className={`w-10 h-5 rounded-full p-1 transition-colors ${active ? 'bg-primary' : 'bg-slate-200'}`}>
                <div className={`w-3 h-3 rounded-full bg-white transition-transform ${active ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </div>
        </div>
    )
}

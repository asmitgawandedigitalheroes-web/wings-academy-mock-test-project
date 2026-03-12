'use client'

import React, { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'

interface AssetUploadProps {
    label: string
    currentValue?: string
    onUpload: (url: string) => void
    uploadFn: (file: File) => Promise<{ success?: boolean, url?: string, error?: string }>
    aspectRatio?: 'square' | 'video'
}

export default function AssetUpload({ label, currentValue, onUpload, uploadFn, aspectRatio = 'square' }: AssetUploadProps) {
    const [preview, setPreview] = useState(currentValue)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Preview
        const reader = new FileReader()
        reader.onloadend = () => {
            setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)

        // Upload
        setUploading(true)
        const res = await uploadFn(file)
        setUploading(false)

        if (res.success && res.url) {
            onUpload(res.url)
        } else {
            alert(res.error || 'Upload failed')
            setPreview(currentValue)
        }
    }

    return (
        <div className="space-y-4 group/upload">
            <div className="flex items-center justify-between ml-1">
                <label className="text-[0.65rem] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</label>
                {uploading && <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />}
            </div>
            
            <div className={`relative rounded-2xl overflow-hidden transition-all duration-300 bg-slate-50 border-2 border-dashed border-slate-200 hover:border-primary/20 hover:bg-white mx-auto sm:mx-0 ${aspectRatio === 'square' ? 'w-32 h-32 md:w-36 md:h-36' : 'w-full aspect-video'}`}>
                {preview ? (
                    <div className="relative w-full h-full group/image">
                        <img src={preview} alt={label} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/image:opacity-100 transition-all duration-300 backdrop-blur-[2px] flex items-center justify-center gap-2">
                             <button 
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2.5 bg-white rounded-xl text-primary hover:scale-110 active:scale-95 transition-all shadow-lg"
                                title="Change Image"
                             >
                                <Upload className="w-4 h-4" />
                             </button>
                             <button 
                                type="button"
                                onClick={() => {
                                    setPreview(undefined)
                                    onUpload('')
                                }}
                                className="p-2.5 bg-white rounded-xl text-red-500 hover:scale-110 active:scale-95 transition-all shadow-lg"
                                title="Remove Image"
                             >
                                <X className="w-4 h-4" />
                             </button>
                        </div>
                    </div>
                ) : (
                    <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-primary transition-colors"
                    >
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                            <ImageIcon className="w-5 h-5" />
                        </div>
                        <div className="text-center px-2">
                            <span className="block text-[10px] font-black uppercase tracking-widest">Upload {label}</span>
                        </div>
                    </button>
                )}

                {uploading && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20">
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-5 h-5 text-primary animate-spin" />
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest animate-pulse">Uploading...</span>
                        </div>
                    </div>
                )}
            </div>
            
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
            />
        </div>
    )
}

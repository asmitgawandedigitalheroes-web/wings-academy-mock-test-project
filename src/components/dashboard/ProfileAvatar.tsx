'use client'

import React, { useState, useRef } from 'react'
import { Camera, Loader2, X } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { updateProfileAvatar } from '@/app/actions/dashboard'
import Image from 'next/image'

interface ProfileAvatarProps {
  initialAvatarUrl?: string | null
  initialName?: string
}

export function ProfileAvatar({ initialAvatarUrl, initialName }: ProfileAvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl || null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)

      // 1. Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // 2. Upload image to storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // 3. Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // 4. Update profile in database
      const result = await updateProfileAvatar(publicUrl)
      if ('error' in result) throw new Error(result.error)

      setAvatarUrl(publicUrl)
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert('Error uploading avatar. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemovePhoto = async () => {
    try {
      setIsUploading(true)
      const result = await updateProfileAvatar(null)
      if ('error' in result) throw new Error(result.error)
      setAvatarUrl(null)
    } catch (error) {
      console.error('Error removing avatar:', error)
      alert('Error removing avatar. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="relative group flex flex-col items-center">
      <div
        className={`w-32 h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden relative transition-all duration-300 ${isUploading ? 'opacity-50 pointer-events-none' : ''
          }`}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt="Profile Avatar"
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-primary flex items-center justify-center text-4xl text-white font-black italic">
            {initialName?.[0] || 'S'}
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 z-10">
          <button
            onClick={triggerFileInput}
            disabled={isUploading}
            className="w-24 py-1.5 bg-white text-primary text-xs font-bold rounded-lg hover:bg-accent hover:text-black transition-colors"
          >
            Change
          </button>
          
          {avatarUrl && (
            <button
              onClick={handleRemovePhoto}
              disabled={isUploading}
              className="w-24 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors"
            >
              Remove
            </button>
          )}
        </div>

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-20">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  )
}

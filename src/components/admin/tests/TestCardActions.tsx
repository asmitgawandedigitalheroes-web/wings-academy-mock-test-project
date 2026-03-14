'use client'

import React, { useState, useRef, useEffect } from 'react'
import { 
  MoreVertical, 
  Eye, 
  EyeOff, 
  DollarSign, 
  Unlock, 
  Trash2,
  AlertCircle,
  Settings
} from 'lucide-react'
import { toggleTestStatus, toggleTestPaid, deleteTestSet } from '@/app/actions/admin'
import ConfirmationModal from '@/components/common/ConfirmationModal'
import Link from 'next/link'

interface TestCardActionsProps {
  test: any
  moduleId: string
  onRefresh: () => void
}

export default function TestCardActions({ test, moduleId, onRefresh }: TestCardActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: 'danger' | 'info' | 'prompt'
    confirmLabel: string
    defaultValue?: string
    onConfirm: (val?: string) => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    confirmLabel: 'Confirm',
    onConfirm: () => {}
  })

  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggleStatus = async () => {
    setLoading(true)
    const res = await toggleTestStatus(test.id, moduleId, test.status || 'draft')
    if (res.error) {
      setModalConfig({
        isOpen: true,
        title: 'Error',
        message: res.error,
        type: 'danger',
        confirmLabel: 'Close',
        onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
      })
    }
    setIsOpen(false)
    setLoading(false)
    onRefresh()
  }

  const handleTogglePaid = () => {
    if (test.is_paid) {
      // Toggle to free
      setModalConfig({
        isOpen: true,
        title: 'Make Test Free?',
        message: `This will make "${test.title}" accessible to all students for free.`,
        type: 'info',
        confirmLabel: 'Make Free',
        onConfirm: async () => {
          setLoading(true)
          const res = await toggleTestPaid(test.id, moduleId, true, 0)
          if (res.error) {
            setModalConfig({
              isOpen: true,
              title: 'Error',
              message: res.error,
              type: 'danger',
              confirmLabel: 'Close',
              onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
            })
          } else {
            setModalConfig(prev => ({ ...prev, isOpen: false }))
          }
          setLoading(false)
          onRefresh()
        }
      })
    } else {
      // Toggle to paid
      setModalConfig({
        isOpen: true,
        title: 'Set Test Price',
        message: `Please enter the price for "${test.title}".`,
        type: 'prompt',
        confirmLabel: 'Set Price',
        defaultValue: '499',
        onConfirm: async (val) => {
          const price = parseFloat(val || '0')
          setLoading(true)
          const res = await toggleTestPaid(test.id, moduleId, false, price)
          if (res.error) {
            setModalConfig({
              isOpen: true,
              title: 'Error',
              message: res.error,
              type: 'danger',
              confirmLabel: 'Close',
              onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
            })
          } else {
            setModalConfig(prev => ({ ...prev, isOpen: false }))
          }
          setLoading(false)
          onRefresh()
        }
      })
    }
    setIsOpen(false)
  }

  const handleDelete = () => {
    setModalConfig({
      isOpen: true,
      title: 'Delete Test Set?',
      message: `Are you sure you want to delete "${test.title}"? This action cannot be undone and will remove all associated question links.`,
      type: 'danger',
      confirmLabel: 'Delete Permanently',
      onConfirm: async () => {
        setLoading(true)
        const res = await deleteTestSet(test.id, moduleId)
        if (res.error) {
          setModalConfig({
            isOpen: true,
            title: 'Error',
            message: res.error,
            type: 'danger',
            confirmLabel: 'Close',
            onConfirm: () => setModalConfig(prev => ({ ...prev, isOpen: false }))
          })
        } else {
          setModalConfig(prev => ({ ...prev, isOpen: false }))
        }
        setLoading(false)
        onRefresh()
      }
    })
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={menuRef}>
      <ConfirmationModal 
        {...modalConfig}
        onCancel={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
      />

      <button 
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="p-2 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
      >
        <MoreVertical className="w-5 h-5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in duration-200">
          <Link 
            href={`/admin/tests/${test.id}/settings`}
            replace
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors text-left"
          >
            <Settings className="w-4 h-4" />
            Edit Settings
          </Link>

          <button 
            onClick={handleToggleStatus}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors text-left"
          >
            {test.status === 'published' ? (
              <>
                <EyeOff className="w-4 h-4" />
                Move to Draft
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Publish Test
              </>
            )}
          </button>

          <button 
            onClick={handleTogglePaid}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors text-left"
          >
            {test.is_paid ? (
              <>
                <Unlock className="w-4 h-4" />
                Make Free
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4" />
                Make Paid
              </>
            )}
          </button>

          <div className="h-px bg-slate-100 my-1 mx-2" />

          <button 
            onClick={handleDelete}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors text-left"
          >
            <Trash2 className="w-4 h-4" />
            Remove Test
          </button>
        </div>
      )}
    </div>
  )
}


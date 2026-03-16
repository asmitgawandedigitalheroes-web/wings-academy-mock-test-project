'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface LoadingButtonProps {
  label: React.ReactNode
  href?: string
  onClick?: () => void | Promise<void>
  className?: string
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit'
}

export default function LoadingButton({
  label,
  href,
  onClick,
  className,
  loading: externalLoading,
  disabled,
  type = 'button'
}: LoadingButtonProps) {
  const [internalLoading, setInternalLoading] = useState(false)
  const router = useRouter()
  
  const isLoading = externalLoading || internalLoading

  const handleClick = async (e: React.MouseEvent) => {
    if (disabled || isLoading) {
      e.preventDefault()
      return
    }

    if (onClick) {
      setInternalLoading(true)
      try {
        await onClick()
      } finally {
        setInternalLoading(false)
      }
    } else if (href) {
      setInternalLoading(true)
      // Navigation will eventually swap the page, but the loader provides immediate feedback
    }
  }

  const content = (
    <>
      {isLoading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2 shrink-0"></div>
      )}
      {label}
    </>
  )

  const commonProps = {
    className: `${className} flex items-center justify-center transition-all ${
      isLoading ? 'opacity-70 cursor-wait' : ''
    }`,
    onClick: handleClick,
  }

  if (href && !isLoading) {
    return (
      <Link href={href} {...commonProps}>
        {content}
      </Link>
    )
  }

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      {...commonProps}
    >
      {content}
    </button>
  )
}

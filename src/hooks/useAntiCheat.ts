'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

// Types for anti-cheating system
export interface ViolationLog {
  user_id: string
  exam_id: string
  violation_type: 'printscreen' | 'tab_switch' | 'window_minimize' | 'fullscreen_exit' | 'right_click' | 'devtools' | 'copy_paste' | 'keyboard_shortcut'
  timestamp: string
  details?: Record<string, any>
  test_set_id?: string // Added for consistency with DB schema
  attempt_id?: string  // Added for consistency with DB schema
}

export interface AntiCheatConfig {
  enablePrintScreenDetection: boolean
  enableTabSwitchDetection: boolean
  enableFullscreenMode: boolean
  enableRightClickBlock: boolean
  enableTextSelectionBlock: boolean
  enableCopyPasteDetection: boolean
  enableWatermark: boolean
  maxViolations: number
  violationTimeout: number // in minutes
}

export interface UseAntiCheatOptions {
  userId: string
  examId: string
  userEmail?: string
  config?: Partial<AntiCheatConfig>
  onViolation?: (violation: ViolationLog) => void
  onMaxViolationsReached?: () => void
}

const DEFAULT_CONFIG: AntiCheatConfig = {
  enablePrintScreenDetection: true,
  enableTabSwitchDetection: true,
  enableFullscreenMode: true,
  enableRightClickBlock: true,
  enableTextSelectionBlock: true,
  enableCopyPasteDetection: true,
  enableWatermark: true,
  maxViolations: 5,
  violationTimeout: 30
}

export function useAntiCheat({
  userId,
  examId,
  userEmail = '',
  config = {},
  onViolation,
  onMaxViolationsReached
}: UseAntiCheatOptions) {
  const [violations, setViolations] = useState<ViolationLog[]>([])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [warningMessage, setWarningMessage] = useState('')
  const [isTerminated, setIsTerminated] = useState(false)
  
  const violationTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map())
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const finalConfig = { ...DEFAULT_CONFIG, ...config }

  // Log violation to Supabase
  const logViolation = useCallback(async (violationType: ViolationLog['violation_type'], details?: Record<string, any>) => {
    if (isTerminated) return

    const violation: ViolationLog = {
      user_id: userId,
      exam_id: examId,
      violation_type: violationType,
      timestamp: new Date().toISOString(),
      details
    }

    try {
      // Log to Supabase
      const { error } = await supabase
        .from('exam_violations')
        .insert({
          user_id: userId,
          exam_id: examId,
          violation_type: violationType,
          details: {
            ...details,
            sessionId: details?.sessionId || null
          }
        })

      if (error) {
        console.error('Failed to log violation:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          violation: {
            user_id: userId,
            exam_id: examId,
            violation_type: violationType
          }
        })
      }

      // Update local state
      setViolations(prev => {
        const newViolations = [...prev, violation]
        return newViolations
      })

      // Call callback
      onViolation?.(violation)

      // Set timeout for violation expiry
      const timeoutId = setTimeout(() => {
        setViolations(prev => prev.filter(v => v.timestamp !== violation.timestamp))
        violationTimeouts.current.delete(violation.timestamp)
      }, finalConfig.violationTimeout * 60 * 1000)

      violationTimeouts.current.set(violation.timestamp, timeoutId)

    } catch (error) {
      console.error('Error logging violation:', error)
    }
  }, [userId, examId, finalConfig.violationTimeout, isTerminated, onViolation])

  useEffect(() => {
    if (!isTerminated && violations.length >= finalConfig.maxViolations) {
      setIsTerminated(true)
      onMaxViolationsReached?.()
    }
  }, [violations.length, isTerminated, finalConfig.maxViolations, onMaxViolationsReached])

  // Show warning message
  const showWarningMessage = useCallback((message: string) => {
    setWarningMessage(message)
    setShowWarning(true)
    setTimeout(() => setShowWarning(false), 5000)
  }, [])

  // PrintScreen detection
  const detectPrintScreen = useCallback(() => {
    if (!finalConfig.enablePrintScreenDetection) return

    const handlePrintScreen = (e: KeyboardEvent) => {
      // PrintScreen key detection
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault()
        logViolation('printscreen', { key: e.key, keyCode: e.keyCode })
        showWarningMessage('⚠️ Screenshot detected! This violation has been logged.')
        
        // Optional: Blackout screen briefly
        document.body.style.backgroundColor = 'black'
        setTimeout(() => {
          document.body.style.backgroundColor = ''
        }, 200)
      }
    }

    // Also detect common screenshot shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      // Windows: Win + Shift + S
      // Mac: Cmd + Shift + 3/4/5
      if (
        (e.metaKey || e.ctrlKey) && 
        e.shiftKey && 
        (e.key === '3' || e.key === '4' || e.key === '5' || e.key === 'S')
      ) {
        e.preventDefault()
        logViolation('printscreen', { shortcut: `${e.metaKey ? 'Cmd' : 'Ctrl'} + Shift + ${e.key}` })
        showWarningMessage('⚠️ Screenshot shortcut detected! This violation has been logged.')
      }
    }

    document.addEventListener('keydown', handlePrintScreen)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handlePrintScreen)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [finalConfig.enablePrintScreenDetection, logViolation, showWarningMessage])

  // Tab switch and window focus detection
  const detectTabSwitch = useCallback(() => {
    if (!finalConfig.enableTabSwitchDetection) return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        logViolation('tab_switch', { 
          hidden: true, 
          timestamp: Date.now() 
        })
        showWarningMessage('⚠️ Tab switching detected! This violation has been logged.')
      }
    }

    const handleBlur = () => {
      logViolation('window_minimize', { 
        timestamp: Date.now() 
      })
      showWarningMessage('⚠️ Window focus lost! This violation has been logged.')
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
    }
  }, [finalConfig.enableTabSwitchDetection, logViolation, showWarningMessage])

  // Fullscreen management
  const requestFullscreen = useCallback(async () => {
    if (!finalConfig.enableFullscreenMode) return

    try {
      const element = document.documentElement
      if (element.requestFullscreen) {
        await element.requestFullscreen()
      } else if ((element as any).webkitRequestFullscreen) {
        await (element as any).webkitRequestFullscreen()
      } else if ((element as any).msRequestFullscreen) {
        await (element as any).msRequestFullscreen()
      }
      setIsFullscreen(true)
    } catch (error) {
      console.error('Failed to request fullscreen:', error)
    }
  }, [finalConfig.enableFullscreenMode])

  const detectFullscreenExit = useCallback(() => {
    if (!finalConfig.enableFullscreenMode) return

    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement
      )

      setIsFullscreen(isCurrentlyFullscreen)

      if (!isCurrentlyFullscreen && isFullscreen) {
        logViolation('fullscreen_exit', { 
          timestamp: Date.now() 
        })
        showWarningMessage('⚠️ Fullscreen mode exited! This violation has been logged.')
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('msfullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('msfullscreenchange', handleFullscreenChange)
    }
  }, [finalConfig.enableFullscreenMode, isFullscreen, logViolation, showWarningMessage])

  const exitFullscreen = useCallback(async () => {
    if (typeof document === 'undefined') return

    try {
      if (document.fullscreenElement || 
          (document as any).webkitFullscreenElement || 
          (document as any).msFullscreenElement) {
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen()
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen()
        }
      }
      setIsFullscreen(false)
    } catch (error) {
      // Catch "Permissions check failed" or other browser-specific errors
      console.warn('Fullscreen exit handled but with error:', error)
      setIsFullscreen(false) // Assume we are out or failed gracefully
    }
  }, [])

  // Right click and text selection blocking
  const blockInteractions = useCallback(() => {
    const cleanup: (() => void)[] = []

    // Block right click
    if (finalConfig.enableRightClickBlock) {
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault()
        logViolation('right_click', { 
          x: e.clientX, 
          y: e.clientY 
        })
        showWarningMessage('⚠️ Right click is disabled! This violation has been logged.')
        return false
      }

      document.addEventListener('contextmenu', handleContextMenu)
      cleanup.push(() => document.removeEventListener('contextmenu', handleContextMenu))
    }

    // Block text selection
    if (finalConfig.enableTextSelectionBlock) {
      const handleSelectStart = (e: Event) => {
        e.preventDefault()
        return false
      }

      const handleDragStart = (e: Event) => {
        e.preventDefault()
        return false
      }

      document.addEventListener('selectstart', handleSelectStart)
      document.addEventListener('dragstart', handleDragStart)
      
      // Add CSS styles
      const style = document.createElement('style')
      style.textContent = `
        * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
        }
      `
      document.head.appendChild(style)

      cleanup.push(() => {
        document.removeEventListener('selectstart', handleSelectStart)
        document.removeEventListener('dragstart', handleDragStart)
        document.head.removeChild(style)
      })
    }

    return () => cleanup.forEach(fn => fn())
  }, [finalConfig.enableRightClickBlock, finalConfig.enableTextSelectionBlock, logViolation, showWarningMessage])

  // Copy paste detection
  const detectCopyPaste = useCallback(() => {
    if (!finalConfig.enableCopyPasteDetection) return

    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault()
      logViolation('copy_paste', { type: e.type })
      showWarningMessage(`⚠️ ${e.type.charAt(0).toUpperCase() + e.type.slice(1)} is disabled! This violation has been logged.`)
      return false
    }

    document.addEventListener('copy', handleCopyPaste)
    document.addEventListener('cut', handleCopyPaste)
    document.addEventListener('paste', handleCopyPaste)

    return () => {
      document.removeEventListener('copy', handleCopyPaste)
      document.removeEventListener('cut', handleCopyPaste)
      document.removeEventListener('paste', handleCopyPaste)
    }
  }, [finalConfig.enableCopyPasteDetection, logViolation, showWarningMessage])

  // Watermark creation
  const createWatermark = useCallback(() => {
    if (!finalConfig.enableWatermark || !userEmail) return

    const watermarkContainer = document.createElement('div')
    watermarkContainer.id = 'anti-cheat-watermark'
    watermarkContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
      opacity: 0.1;
      font-size: 20px;
      font-weight: bold;
      color: #000;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    `

    // Create multiple watermark texts
    for (let i = 0; i < 50; i++) {
      const watermark = document.createElement('div')
      watermark.textContent = `${userEmail} - EXAM MODE`
      watermark.style.cssText = `
        position: absolute;
        transform: rotate(-45deg);
        white-space: nowrap;
        padding: 10px;
        font-size: 16px;
        color: #333;
      `
      
      // Random positioning
      const x = Math.random() * 100
      const y = Math.random() * 100
      watermark.style.left = `${x}%`
      watermark.style.top = `${y}%`
      
      watermarkContainer.appendChild(watermark)
    }

    document.body.appendChild(watermarkContainer)

    return () => {
      const existingWatermark = document.getElementById('anti-cheat-watermark')
      if (existingWatermark) {
        document.body.removeChild(existingWatermark)
      }
    }
  }, [finalConfig.enableWatermark, userEmail])

  // Initialize all protections
  useEffect(() => {
    if (isTerminated) return

    const cleanupFunctions: (() => void)[] = []

    // Initialize all detection methods
    const printScreenCleanup = detectPrintScreen()
    const tabSwitchCleanup = detectTabSwitch()
    const fullscreenCleanup = detectFullscreenExit()
    const interactionsCleanup = blockInteractions()
    const copyPasteCleanup = detectCopyPaste()
    const watermarkCleanup = createWatermark()

    // Add only defined cleanup functions
    if (printScreenCleanup) cleanupFunctions.push(printScreenCleanup)
    if (tabSwitchCleanup) cleanupFunctions.push(tabSwitchCleanup)
    if (fullscreenCleanup) cleanupFunctions.push(fullscreenCleanup)
    if (interactionsCleanup) cleanupFunctions.push(interactionsCleanup)
    if (copyPasteCleanup) cleanupFunctions.push(copyPasteCleanup)
    if (watermarkCleanup) cleanupFunctions.push(watermarkCleanup)

    // Multi-monitor detection
    const detectMultiMonitor = () => {
      const checkScreens = () => {
        // Method 1: Screen count if browser supports it
        if (typeof window !== 'undefined' && window.screen) {
          // Method 2: Position heuristic
          const screenLeft = window.screenX || window.screenLeft || 0
          const screenWidth = window.screen.width
          
          // If window is shifted far to the left or right beyond one screen width
          const isOffscreen = screenLeft < -10 || screenLeft > (screenWidth - 100)
          
          // Method 3: Dimensions heuristic
          let isExtended = false
          try {
            isExtended = (window.screen as any).isExtended || false
          } catch (e) {
            // Some browsers throw permission errors on screen property access
            console.debug('isExtended check bypassed:', e)
          }
          
          if (isOffscreen || isExtended) {
            // Only log if it's one of the allowed types in the DB
            // Removing multi_monitor for now as it's not in the DB check constraint
            showWarningMessage('⚠️ Multiple monitors or extended display detected! Please use only one screen.')
          }
        }
      }

      // Check periodically
      const intervalId = setInterval(checkScreens, 10000)
      checkScreens() // Initial check
      
      return () => clearInterval(intervalId)
    }

    const multiMonitorCleanup = detectMultiMonitor()
    cleanupFunctions.push(multiMonitorCleanup)

    // requestFullscreen is now called on user gesture from TestInterface.tsx

    // Cleanup on unmount
    return () => {
      cleanupFunctions.forEach(fn => fn())
      
      // Clear all timeouts
      violationTimeouts.current.forEach(timeoutId => clearTimeout(timeoutId))
      violationTimeouts.current.clear()
    }
  }, [isTerminated])

  return {
    violations,
    isFullscreen,
    showWarning,
    warningMessage,
    isTerminated,
    violationCount: violations.length,
    maxViolations: finalConfig.maxViolations,
    requestFullscreen,
    exitFullscreen,
    logViolation
  }
}

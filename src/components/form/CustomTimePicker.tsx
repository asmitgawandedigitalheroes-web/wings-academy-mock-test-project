'use client'

import React, { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface CustomTimePickerProps {
  value: string // 24h format "HH:mm"
  onChange: (value: string) => void
}

export default function CustomTimePicker({ value, onChange }: CustomTimePickerProps) {
  // Parse initial 24h value into 12h format
  const parseValue = (val: string) => {
    if (!val) return { hour: '12', minute: '00', period: 'AM' }
    const [h24, min] = val.split(':')
    const hNum = parseInt(h24)
    const period = hNum >= 12 ? 'PM' : 'AM'
    const h12 = hNum === 0 ? '12' : hNum > 12 ? (hNum - 12).toString() : hNum.toString()
    return { hour: h12.padStart(2, '0'), minute: min.padStart(2, '0'), period }
  }

  const [time, setTime] = useState(parseValue(value))

  // Update internal state when prop changes
  useEffect(() => {
    setTime(parseValue(value))
  }, [value])

  // Convert 12h back to 24h and notify parent
  const handleTimeChange = (hour: string, minute: string, period: string) => {
    let hNum = parseInt(hour)
    if (period === 'PM' && hNum < 12) hNum += 12
    if (period === 'AM' && hNum === 12) hNum = 0
    
    const h24 = hNum.toString().padStart(2, '0')
    const m24 = minute.padStart(2, '0')
    onChange(`${h24}:${m24}`)
  }

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'))
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'))

  return (
    <div className="flex items-center gap-2 p-1.5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] hover:bg-white hover:border-primary/20 transition-all">
      {/* Hour Selector */}
      <div className="relative group/select">
        <select 
          value={time.hour}
          onChange={(e) => handleTimeChange(e.target.value, time.minute, time.period)}
          className="appearance-none bg-white px-4 py-2.5 rounded-xl font-black text-sm text-[#0f172a] outline-none cursor-pointer pr-8 border border-slate-100 group-hover/select:border-primary/20 transition-all"
        >
          {hours.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none group-hover/select:text-primary transition-colors" />
      </div>

      <span className="font-black text-slate-300">:</span>

      {/* Minute Selector */}
      <div className="relative group/select">
        <select 
          value={time.minute}
          onChange={(e) => handleTimeChange(time.hour, e.target.value, time.period)}
          className="appearance-none bg-white px-4 py-2.5 rounded-xl font-black text-sm text-[#0f172a] outline-none cursor-pointer pr-8 border border-slate-100 group-hover/select:border-primary/20 transition-all"
        >
          {minutes.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none group-hover/select:text-primary transition-colors" />
      </div>

      {/* Period Selector */}
      <div className="relative group/select">
        <select 
          value={time.period}
          onChange={(e) => handleTimeChange(time.hour, time.minute, e.target.value)}
          className="appearance-none bg-white px-4 py-2.5 rounded-xl font-black text-sm text-[#0f172a] outline-none cursor-pointer pr-8 border border-slate-100 group-hover/select:border-primary/20 transition-all uppercase tracking-widest"
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none group-hover/select:text-primary transition-colors" />
      </div>
    </div>
  )
}

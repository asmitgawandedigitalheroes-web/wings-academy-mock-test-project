'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getReportData } from '@/app/actions/admin_dashboard'

export default function AnalyticsActions() {
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()

  const generateCSV = async () => {
    try {
      setIsGenerating(true)
      const { students, results } = await getReportData()
      
      let csvContent = "data:text/csv;charset=utf-8,"
      
      // Header for Students
      csvContent += "--- STUDENTS REPORT ---\n"
      csvContent += "ID,Name,Email,Role,Registered At\n"
      students?.forEach(s => {
        csvContent += `${s.id},${s.full_name},${s.email},${s.role},${s.created_at}\n`
      })
      
      csvContent += "\n--- TEST RESULTS REPORT ---\n"
      csvContent += "Student,Email,Test Title,Score,Correct,Total,Time Spent,Completed At\n"
      results?.forEach((r: any) => {
        csvContent += `${r.profiles?.full_name},${r.profiles?.email},${r.test_sets?.title},${r.score},${r.correct_answers},${r.total_questions},${r.time_spent},${r.completed_at}\n`
      })

      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", `WingsAcademy_Report_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Failed to generate report:', error)
      alert('Failed to generate report. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="mt-6">
      <button 
        onClick={generateCSV}
        disabled={isGenerating}
        className="bg-accent text-primary px-8 py-3 rounded-2xl font-black shadow-xl shadow-accent/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
      >
        {isGenerating ? 'Generating...' : 'Generate Report'}
      </button>
    </div>
  )
}

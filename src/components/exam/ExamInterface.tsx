'use client'

import React, { useState } from 'react'
import { AntiCheatWrapper } from './AntiCheatProvider'

interface ExamInterfaceProps {
  userId: string
  examId: string
  userEmail: string
  examTitle: string
  questions: any[]
  timeLimit: number // in minutes
}

export function ExamInterface({
  userId,
  examId,
  userEmail,
  examTitle,
  questions,
  timeLimit
}: ExamInterfaceProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Anti-cheating configuration
  const antiCheatConfig = {
    enablePrintScreenDetection: true,
    enableTabSwitchDetection: true,
    enableFullscreenMode: true,
    enableRightClickBlock: true,
    enableTextSelectionBlock: true,
    enableWatermark: true,
    maxViolations: 5,
    violationTimeout: 30 // minutes
  }

  // Handle violation events
  const handleViolation = (violation: any) => {
    console.log('Violation detected:', violation)
    
    // You can implement additional logic here:
    // - Send real-time notifications to admins
    // - Update user risk score
    // - Trigger additional monitoring
  }

  // Handle max violations reached
  const handleMaxViolationsReached = () => {
    console.log('Max violations reached - terminating exam')
    setIsSubmitted(true)
    
    // Auto-submit the exam
    submitExam()
  }

  // Submit exam function
  const submitExam = async () => {
    try {
      // Submit to your backend
      const response = await fetch('/api/exams/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          examId,
          answers,
          submittedAt: new Date().toISOString()
        })
      })

      if (response.ok) {
        setIsSubmitted(true)
        // Redirect to results page
        window.location.href = `/exam/results/${examId}`
      }
    } catch (error) {
      console.error('Failed to submit exam:', error)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Exam Terminated</h1>
          <p className="text-gray-600 mb-4">
            Your exam has been terminated due to multiple violations. 
            Your current progress has been submitted.
          </p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <AntiCheatWrapper
      userId={userId}
      examId={examId}
      userEmail={userEmail}
      config={antiCheatConfig}
      onViolation={handleViolation}
      onMaxViolationsReached={handleMaxViolationsReached}
    >
      <div className="min-h-screen bg-gray-50">
        {/* Exam Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{examTitle}</h1>
                <p className="text-sm text-gray-500">
                  Question {currentQuestion + 1} of {questions.length}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  Time Remaining: {timeLimit} min
                </div>
                <button
                  onClick={submitExam}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  Submit Exam
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Exam Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Question */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {questions[currentQuestion]?.question}
              </h2>
              
              {/* Options */}
              <div className="space-y-4">
                {questions[currentQuestion]?.options?.map((option: any, index: number) => (
                  <label
                    key={index}
                    className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion}`}
                      value={index}
                      checked={answers[currentQuestion] === index}
                      onChange={(e) => {
                        setAnswers(prev => ({
                          ...prev,
                          [currentQuestion]: parseInt(e.target.value)
                        }))
                      }}
                      className="mr-3"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <button
                onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                disabled={currentQuestion === questions.length - 1}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>

          {/* Question Navigation */}
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Question Navigation</h3>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`p-2 rounded-lg text-sm font-medium ${
                    currentQuestion === index
                      ? 'bg-blue-500 text-white'
                      : answers[index] !== undefined
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    </AntiCheatWrapper>
  )
}

// Usage example in a page component:
/*
export default function ExamPage() {
  // Get user and exam data from your auth/context
  const user = { id: 'user-123', email: 'student@example.com' }
  const exam = {
    id: 'exam-456',
    title: 'Mathematics Final Exam',
    questions: [
      {
        question: 'What is 2 + 2?',
        options: ['3', '4', '5', '6']
      },
      // ... more questions
    ],
    timeLimit: 60 // minutes
  }

  return (
    <ExamInterface
      userId={user.id}
      examId={exam.id}
      userEmail={user.email}
      examTitle={exam.title}
      questions={exam.questions}
      timeLimit={exam.timeLimit}
    />
  )
}
*/

'use client'

import React, { useState } from 'react'
import { Send, CheckCircle2, AlertCircle } from 'lucide-react'
import { submitEnquiry } from '@/app/actions/enquiries'

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setResult(null)

    const formData = new FormData(event.currentTarget)
    const response = await submitEnquiry(formData)

    setIsSubmitting(false)
    setResult(response)

    if (response.success) {
      (event.target as HTMLFormElement).reset()
    }
  }

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl shadow-primary/5 border border-slate-100 h-fit">
      <h2 className="text-2xl font-bold text-[#0f172a] mb-6">Send a Message</h2>
      
      {result?.success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <p className="font-medium">Thank you! Your message has been sent successfully.</p>
        </div>
      )}

      {result?.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="font-medium">{result.error}</p>
        </div>
      )}

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label htmlFor="first-name" className="block text-sm font-bold text-slate-700 mb-2">First Name</label>
            <input 
              type="text" 
              id="first-name" 
              name="first-name"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-primary focus:border-primary outline-none transition-colors" 
              placeholder="John" 
            />
          </div>
          <div>
            <label htmlFor="last-name" className="block text-sm font-bold text-slate-700 mb-2">Last Name</label>
            <input 
              type="text" 
              id="last-name" 
              name="last-name"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-primary focus:border-primary outline-none transition-colors" 
              placeholder="Doe" 
            />
          </div>
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
          <input 
            type="email" 
            id="email" 
            name="email"
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-primary focus:border-primary outline-none transition-colors" 
            placeholder="you@example.com" 
          />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-bold text-slate-700 mb-2">Your Message</label>
          <textarea 
            id="message" 
            name="message"
            rows={4} 
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-primary focus:border-primary outline-none transition-colors resize-none" 
            placeholder="How can we help you?"
          ></textarea>
        </div>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-primary/20 text-sm font-bold text-white bg-primary hover:bg-[#152e75] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Sending...' : 'Send Message'}
          {!isSubmitting && <Send className="w-4 h-4" />}
        </button>
      </form>
    </div>
  )
}

import React from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Mail, Phone, MapPin, Send } from 'lucide-react'
import { getPlatformSettings } from '../actions/admin'

export default async function ContactPage() {
  const settings = await getPlatformSettings()
  
  const email = settings?.support_email || 'support@wingsacademy.com'
  const phone = settings?.support_phone || '+1 (234) 567-890'
  const addressLines = (settings?.office_address || 'Aviation Center Blvd\nSuite 100\nNew York, NY 10001').split('\n')

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-32 pb-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-black text-[#0f172a] mb-6 tracking-tight">
              Get in <span className="text-primary">Touch</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Have questions about our platform or need support? Our team is here to help you navigate your certification journey.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Details */}
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-3xl shadow-xl shadow-primary/5 border border-slate-100 flex items-start gap-4">
                <div className="bg-primary/10 p-4 rounded-full text-primary">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0f172a] mb-1">Email Us</h3>
                  <p className="text-slate-600 mb-2">For general inquiries and support</p>
                  <a href={`mailto:${email}`} className="text-primary font-semibold hover:text-accent transition-colors">{email}</a>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-3xl shadow-xl shadow-primary/5 border border-slate-100 flex items-start gap-4">
                <div className="bg-primary/10 p-4 rounded-full text-primary">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0f172a] mb-1">Call Us</h3>
                  <p className="text-slate-600 mb-2">Mon-Fri from 9am to 6pm</p>
                  <a href={`tel:${phone.replace(/\D/g,'')}`} className="text-primary font-semibold hover:text-accent transition-colors">{phone}</a>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-xl shadow-primary/5 border border-slate-100 flex items-start gap-4">
                <div className="bg-primary/10 p-4 rounded-full text-primary">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0f172a] mb-1">Our Office</h3>
                  <p className="text-slate-600">
                    {addressLines.map((line: string, i: number) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < addressLines.length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-primary/5 border border-slate-100 h-fit">
              <h2 className="text-2xl font-bold text-[#0f172a] mb-6">Send a Message</h2>
              <form className="space-y-6" action="#" method="POST">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="first-name" className="block text-sm font-bold text-slate-700 mb-2">First Name</label>
                    <input type="text" id="first-name" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-primary focus:border-primary outline-none transition-colors" placeholder="John" />
                  </div>
                  <div>
                    <label htmlFor="last-name" className="block text-sm font-bold text-slate-700 mb-2">Last Name</label>
                    <input type="text" id="last-name" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-primary focus:border-primary outline-none transition-colors" placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                  <input type="email" id="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-primary focus:border-primary outline-none transition-colors" placeholder="you@example.com" />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-bold text-slate-700 mb-2">Your Message</label>
                  <textarea id="message" rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 focus:ring-primary focus:border-primary outline-none transition-colors resize-none" placeholder="How can we help you?"></textarea>
                </div>
                <button type="button" className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-primary/20 text-sm font-bold text-white bg-primary hover:bg-[#152e75] transition-all">
                  Send Message
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

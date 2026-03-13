import React from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Mail, Phone, MapPin } from 'lucide-react'
import { getPlatformSettings } from '../actions/admin'
import ContactForm from '@/components/contact/ContactForm'

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
            <ContactForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

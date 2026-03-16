import Link from 'next/link'
import Image from 'next/image'
import { Plane, Twitter, Linkedin, Facebook, Mail, MapPin, Phone, Clock } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'

const Footer = async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return (
    <footer className="bg-primary text-white pt-24 pb-12 relative overflow-hidden">
      {/* Subtle top highlight */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 group mb-8">
              <div className="relative w-14 h-14 flex items-center justify-center overflow-hidden group-hover:-translate-y-1 transition-transform">
                <Image src="/logo.png" alt="Wings Academy Logo" fill className="object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white leading-none tracking-tight">WINGS <span className="text-accent">ACADEMY</span></span>

              </div>
            </Link>
            <p className="text-slate-400 mb-8 leading-relaxed font-medium">
              Empowering Aircraft Maintenance Engineers with precision-engineered mock tests for global certification excellence.
            </p>
            <div className="flex space-x-5">
              <Link href="#" className="bg-white/5 p-3 rounded-2xl hover:bg-accent hover:text-primary transition-all shadow-lg hover:shadow-accent/20">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="bg-white/5 p-3 rounded-2xl hover:bg-accent hover:text-primary transition-all shadow-lg hover:shadow-accent/20">
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link href="#" className="bg-white/5 p-3 rounded-2xl hover:bg-accent hover:text-primary transition-all shadow-lg hover:shadow-accent/20">
                <Facebook className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-black mb-8 uppercase tracking-widest text-accent">Navigation</h4>
            <ul className="space-y-4 text-slate-400 font-bold text-decoration-none">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              {user && (
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              )}
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-black mb-8 uppercase tracking-widest text-accent">Legal</h4>
            <ul className="space-y-4 text-slate-400 font-bold">
              <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/cookie-policy" className="hover:text-white transition-colors">Cookie Policy</Link></li>
              <li><Link href="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-black mb-8 uppercase tracking-widest text-accent">Contact Us</h4>
            <div className="space-y-6">

              {/* <div>
                <p className="text-white font-bold mb-1">Visit Us</p>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">Aviation Center Blvd, Suite 100New York, NY 10001</p>
              </div> */}

              <div>
                <p className="text-white font-bold mb-1">Call Us</p>
                <p className="text-slate-400 text-sm font-medium">+91 98765 43210</p>
              </div>

              <div>
                <p className="text-white font-bold mb-1">Office Hours</p>
                <p className="text-slate-400 text-sm font-medium">Mon - Sat: 9 AM - 6 PM</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm font-bold tracking-wide">
          <p>© {new Date().getFullYear()} Wings Academy. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex items-center gap-2">
            <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy policy</Link>
            <span> | </span>
            <Link href="/terms-of-service" className="hover:text-white transition-colors">Terms of service</Link>
            <span> | </span>
            <Link href="/cookie-policy" className="hover:text-white transition-colors">Cookie policy</Link>
            <span> | </span>
            <Link href="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

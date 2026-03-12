'use client';

import React from 'react';
import Link from 'next/link';
import { Hammer, Clock, Home } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary px-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent rounded-full blur-[150px]"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-white rounded-full blur-[150px]"></div>
      </div>

      <div className="max-w-md w-full text-center relative z-10">
        {/* Illustration/Icon Area */}
        <div className="relative mb-10 flex justify-center">
          <div className="absolute inset-0 bg-accent/20 rounded-full blur-2xl scale-125 animate-pulse"></div>
          <div className="relative bg-[#1a2542] p-8 rounded-full shadow-2xl border border-accent/20">
            <Hammer className="w-16 h-16 text-accent animate-bounce" />
          </div>
        </div>

        {/* Content Area */}
        <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
          Under <span className="text-accent">Maintenance</span>
        </h1>
        <p className="text-lg text-slate-300 mb-10 leading-relaxed font-medium">
          We're currently performing some scheduled maintenance to improve your experience. 
          <span className="block font-bold text-white mt-3">
            We'll be back shortly!
          </span>
        </p>

        {/* Status Card */}
        <div className="bg-[#1a2542]/50 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/5 mb-10">
          <div className="flex items-center justify-center space-x-3 text-slate-300">
            <Clock className="w-5 h-5 text-accent" />
            <span className="text-sm font-medium tracking-wide">Estimated time: <span className="text-white italic">Back in a few minutes</span></span>
          </div>
        </div>

        {/* Back Button */}
        <Link 
          href="/"
          className="inline-flex items-center px-8 py-4 border-2 border-accent text-lg font-black rounded-xl text-primary bg-accent hover:bg-transparent hover:text-accent transition-all duration-300 shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:shadow-[0_0_40px_rgba(212,175,55,0.5)] uppercase tracking-widest"
        >
          <Home className="w-5 h-5 mr-3" />
          Back to Home
        </Link>
        
        <p className="mt-12 text-sm text-slate-500 font-medium">
          Thank you for your patience and understanding.
        </p>
      </div>
    </div>
  );
}

import Image from 'next/image'
import { CheckCircle2 } from 'lucide-react'

const ExcellenceSection = () => {
  return (
    <section className="bg-[#122353] py-20 lg:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* Image Content */}
          <div className="flex-1 w-full relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[16/9] lg:aspect-[4/3]">
              <Image
                src="/engine_excellence.png"
                alt="Aircraft Engine Precision Engineering"
                fill
                className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {/* Subtle Overlay to match the design style */}
              <div className="absolute inset-0 bg-blue-900/10 mix-blend-multiply"></div>
            </div>
          </div>

          {/* Text Content */}
          <div className="flex-1 text-white">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6 leading-tight">
              Designed for <span className="text-accent">Excellence</span>
            </h2>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed font-medium">
              Our platform is engineered with the same precision as the aircraft you fly.
              We focus on providing the most accurate, up-to-date, and pedagogically sound
              training materials available.
            </p>

            <ul className="space-y-4">
              {[
                "Real-time regulatory updates and FAA/EASA alignment.",
                "Detailed rationales for every practice question.",
                "Offline access and mobile-first learning design."
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-4">
                  <div className="mt-1 flex-shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-accent fill-accent/10" />
                  </div>
                  <span className="text-slate-200 font-semibold tracking-tight leading-snug">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ExcellenceSection

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import LoadingButton from '@/components/common/LoadingButton'

const FinalCTA = ({ user }: { user: any }) => {
  return (
    <section className="py-24 bg-primary text-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent opacity-[0.03] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-[0.03] rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-white mb-8 tracking-tight">
          Ready to Ace Your <span className="text-accent underline decoration-4 underline-offset-8">AME Examination</span>?
        </h2>
        <p className="text-slate-400 text-xl font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
          Join thousands of AME students who have accelerated their careers with our specialized mock tests.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <LoadingButton
            href={user ? "/dashboard" : "/signup"}
            className="w-full sm:w-auto bg-accent text-primary px-10 py-5 rounded-2xl font-black text-xl hover:brightness-110 active:scale-95 transition-all shadow-2xl shadow-accent/20"
            label={
              <>
                {user ? "Go to Dashboard" : "Start Practicing Now"}
                <ArrowRight className="w-6 h-6 ml-3" />
              </>
            }
          />
          <Link href="/contact" className="w-full sm:w-auto bg-white/5 border border-white/10 text-white px-10 py-5 rounded-2xl font-black text-xl hover:bg-white/10 active:scale-95 transition-all">
            Contact Sales
          </Link>
        </div>
      </div>
    </section>
  )
}

export default FinalCTA

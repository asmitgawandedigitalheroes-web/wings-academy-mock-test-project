import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Hero from '@/components/home/Hero'
import Stats from '@/components/home/Stats'
import HowItWorks from '@/components/home/HowItWorks'
import Modules from '@/components/home/Modules'
import Features from '@/components/home/Features'
import PerformanceSection from '@/components/home/PerformanceSection'
import ExcellenceSection from '@/components/home/ExcellenceSection'
import DashboardPreview from '@/components/home/DashboardPreview'
import FinalCTA from '@/components/home/FinalCTA'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Stats />
      <HowItWorks />
      <Features />
      <PerformanceSection />
      <ExcellenceSection />
      <Modules />
      <DashboardPreview />
      <FinalCTA />
      <Footer />
    </main>
  )
}

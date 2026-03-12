import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

interface LegalPageLayoutProps {
  title: string;
  updateDate: string;
  children: React.ReactNode;
}

const LegalPageLayout = ({ title, updateDate, children }: LegalPageLayoutProps) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="pt-32 pb-24">
        {/* Header Section */}
        <div className="bg-primary py-16 mb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight">
              {title}
            </h1>
            <p className="text-accent font-bold tracking-widest uppercase text-sm">
              Last Updated: {updateDate}
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-primary/5 border border-slate-100 prose prose-slate max-w-none">
            {children}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LegalPageLayout;

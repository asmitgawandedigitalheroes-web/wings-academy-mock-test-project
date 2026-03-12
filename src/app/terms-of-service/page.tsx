import React from 'react';
import LegalPageLayout from '@/components/layout/LegalPageLayout';

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout title="Terms of Service" updateDate="March 12, 2026">
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">1. Agreement to Terms</h2>
          <p className="text-slate-600 leading-relaxed">
            By accessing or using Waves Academy (the "Platform"), you agree to be bound by these Terms of Service and all applicable laws and regulations in the <strong>United Arab Emirates</strong>. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">2. Use License</h2>
          <p className="text-slate-600 mb-4">
            Permission is granted to temporarily access the materials (information or software) on Wings Academy for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license, you may not:
          </p>
          <ul className="list-disc pl-6 text-slate-600 space-y-2">
            <li>Modify or copy the materials.</li>
            <li>Use the materials for any commercial purpose or public display.</li>
            <li>Attempt to decompile or reverse engineer any software contained on the platform.</li>
            <li>Remove any copyright or other proprietary notations from the materials.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">3. Account Responsibility</h2>
          <p className="text-slate-600 leading-relaxed">
            You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account. We reserve the right to refuse service, terminate accounts, or cancel orders at our sole discretion, especially in cases of suspected unauthorized sharing of account access.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">4. Payments and Refunds</h2>
          <p className="text-slate-600 leading-relaxed">
            All prices are listed in AED (United Arab Emirates Dirham) unless stated otherwise. Payments are non-refundable once the digital content has been accessed, in accordance with UAE consumer protection regulations for digital goods.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">5. Governing Law</h2>
          <p className="text-slate-600 leading-relaxed">
            These terms and conditions are governed by and construed in accordance with the laws of the <strong>United Arab Emirates</strong>, specifically the laws of the Emirate of Dubai. You irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">6. Modifications</h2>
          <p className="text-slate-600 leading-relaxed">
            Wings Academy may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then-current version of these Terms of Service.
          </p>
        </section>
      </div>
    </LegalPageLayout>
  );
}

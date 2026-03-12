import React from 'react';
import LegalPageLayout from '@/components/layout/LegalPageLayout';

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" updateDate="March 12, 2026">
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">1. Introduction</h2>
          <p className="text-slate-600 leading-relaxed">
            Wings Academy ("we," "our," or "us") is committed to protecting your privacy and personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our platform, in accordance with the <strong>UAE Federal Decree-Law No. 45 of 2021 on Personal Data Protection (PDPL)</strong> and other applicable regulations.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">2. Data We Collect</h2>
          <p className="text-slate-600 mb-4">We collect information that you provide directly to us, including:</p>
          <ul className="list-disc pl-6 text-slate-600 space-y-2">
            <li>Account Information: Name, email address, password, and professional credentials.</li>
            <li>Payment Information: Transaction details (processed via secure third-party providers).</li>
            <li>Usage Data: Exam attempts, scores, progress analytics, and interaction with platform features.</li>
            <li>Technical Data: IP address, browser type, and device information.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">3. How We Use Your Data</h2>
          <p className="text-slate-600 mb-4">Your data is processed for the following purposes:</p>
          <ul className="list-disc pl-6 text-slate-600 space-y-2">
            <li>To provide and maintain our mock test services.</li>
            <li>To track your academic progress and provide performance analytics.</li>
            <li>To process payments and prevent fraudulent transactions.</li>
            <li>To communicate updates, security alerts, and support messages.</li>
            <li>To comply with regulatory requirements in the United Arab Emirates.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">4. Data Storage and Security</h2>
          <p className="text-slate-600 leading-relaxed">
            We implement robust technical and organizational measures to protect your personal data. In alignment with UAE PDPL, your data is stored securely, and we ensure that any cross-border data transfers comply with the standards set by the UAE Data Office.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">5. Your Rights</h2>
          <p className="text-slate-600 mb-4">Under UAE law, you have the right to:</p>
          <ul className="list-disc pl-6 text-slate-600 space-y-2">
            <li>Access your personal data held by us.</li>
            <li>Request the correction or deletion of your data.</li>
            <li>Withdraw your consent for data processing at any time.</li>
            <li>File a complaint with the UAE Data Office if you believe your rights have been violated.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">6. Contact Us</h2>
          <p className="text-slate-600 leading-relaxed">
            If you have any questions about this Privacy Policy or our data practices, please contact us at <strong>privacy@wingsacademy.ae</strong>.
          </p>
        </section>
      </div>
    </LegalPageLayout>
  );
}

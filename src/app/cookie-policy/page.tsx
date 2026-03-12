import React from 'react';
import LegalPageLayout from '@/components/layout/LegalPageLayout';

export default function CookiePolicyPage() {
  return (
    <LegalPageLayout title="Cookie Policy" updateDate="March 12, 2026">
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">1. What Are Cookies</h2>
          <p className="text-slate-600 leading-relaxed">
            Cookies are small text files that are stored on your device when you visit a website. They are widely used to make websites work more efficiently and provide information to the owners of the site.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">2. How We Use Cookies</h2>
          <p className="text-slate-600 mb-4">Wings Academy uses cookies for the following purposes:</p>
          <ul className="list-disc pl-6 text-slate-600 space-y-2">
            <li><strong>Essential Cookies:</strong> Necessary for the platform to function, such as maintaining your login session.</li>
            <li><strong>Performance Cookies:</strong> Help us understand how visitors interact with the platform (e.g., via Google Analytics), allowing us to improve the user experience.</li>
            <li><strong>Functional Cookies:</strong> Remember your preferences and settings to provide a more personalized experience.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">3. Third-Party Cookies</h2>
          <p className="text-slate-600 leading-relaxed">
            Some cookies are placed by third-party services that appear on our pages, such as payment processors or analytics providers. We do not control these cookies; please refer to the respective third-party's privacy policy.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">4. Managing Cookies</h2>
          <p className="text-slate-600 leading-relaxed">
            Most web browsers allow you to control cookies through their settings. You can choose to block or delete cookies, but please note that this may affect the functionality of our platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">5. UAE Regulations</h2>
          <p className="text-slate-600 leading-relaxed">
            Our use of cookies complies with UAE regulations regarding electronic communications and data protection. By continuing to use our platform, you consent to our use of cookies as described in this policy.
          </p>
        </section>
      </div>
    </LegalPageLayout>
  );
}

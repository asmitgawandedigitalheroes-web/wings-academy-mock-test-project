import React from 'react';
import LegalPageLayout from '@/components/layout/LegalPageLayout';

export default function DisclaimerPage() {
  return (
    <LegalPageLayout title="Legal Disclaimer" updateDate="March 12, 2026">
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">1. Educational Purposes Only</h2>
          <p className="text-slate-600 leading-relaxed">
            The content provided on Wings Academy, including mock tests, study materials, and performance analytics, is for <strong>educational and preparation purposes only</strong>. While we strive for the highest accuracy, these tests are simulations and do not guarantee success in official certification exams.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">2. Not Affiliated with Regulatory Bodies</h2>
          <p className="text-slate-600 leading-relaxed">
            Wings Academy is an independent educational platform. We are <strong>not affiliated with, endorsed by, or partnered with</strong> any official aviation regulatory bodies such as EASA (European Union Aviation Safety Agency), DGCA (Directorate General of Civil Aviation, India), or GCAA (General Civil Aviation Authority, UAE).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">3. Accuracy of Information</h2>
          <p className="text-slate-600 leading-relaxed">
            Aviation regulations and exam syllabi are subject to frequent changes. While we make every effort to update our database, Wings Academy does not warrant that the information on this platform is always current, complete, or accurate. Users should always cross-reference study materials with the latest official publications from their respective regulatory authorities.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">4. Limitation of Liability</h2>
          <p className="text-slate-600 leading-relaxed">
            In no event shall Wings Academy or its affiliates be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the platform, even if notified orally or in writing of the possibility of such damage.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-primary mb-4">5. Professional Advice</h2>
          <p className="text-slate-600 leading-relaxed">
            The information provided on this platform does not constitute professional aeronautical engineering or legal advice. Users are encouraged to seek professional guidance for their specific certification and career requirements.
          </p>
        </section>
      </div>
    </LegalPageLayout>
  );
}

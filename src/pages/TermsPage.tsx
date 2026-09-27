import { FileText } from 'lucide-react';

export function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <FileText className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Terms & Conditions</h1>
      </div>

      <div className="space-y-6 text-sm text-gray-700">
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h2>
          <p>
            By using Find Me, you agree to these terms. Find Me is a community platform to help reconnect
            lost, missing, or unidentified people with their families. It is not a substitute for emergency services.
          </p>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="font-semibold text-gray-900 mb-2">2. User Responsibilities</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Provide accurate and truthful information when reporting cases.</li>
            <li>Do not submit unnecessary private information about individuals.</li>
            <li>Do not use the platform for harassment, scams, or malicious purposes.</li>
            <li>Respect the privacy and dignity of all individuals described in cases.</li>
            <li>Do not attempt to identify exact locations of cases from approximate data.</li>
          </ul>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="font-semibold text-gray-900 mb-2">3. Moderation</h2>
          <p>
            All cases are reviewed by moderators before becoming public. Find Me reserves the right to reject,
            hide, or remove any case that violates these terms or poses a safety risk.
          </p>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="font-semibold text-gray-900 mb-2">4. No Facial Recognition</h2>
          <p>
            Find Me does not use facial recognition technology. Potential matches are generated using basic
            rule-based comparison (distance, age, gender, description, clothing, time). Human confirmation
            is always required before any match is accepted.
          </p>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="font-semibold text-gray-900 mb-2">5. Limitation of Liability</h2>
          <p>
            Find Me is provided "as is" without warranties. We are not responsible for outcomes resulting from
            information shared on the platform. In emergencies, always contact local emergency or police services directly.
          </p>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="font-semibold text-gray-900 mb-2">6. Reporting Abuse</h2>
          <p>
            Every case has a Report button. If you encounter a fake case, wrong person, harassment, privacy concern,
            inappropriate image, or scam, please report it. Our team reviews all reports promptly.
          </p>
        </section>
      </div>
    </div>
  );
}

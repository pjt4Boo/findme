import { HelpCircle, Shield, AlertTriangle, MessageCircle, Flag, Heart } from 'lucide-react';
import { EMERGENCY_NOTICE } from '@/lib/constants';

export function HelpPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <HelpCircle className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Help & Safety</h1>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <h2 className="font-semibold text-amber-900">Emergency</h2>
          </div>
          <p className="text-sm text-amber-800">{EMERGENCY_NOTICE}</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="h-4 w-4 text-gray-500" />
            <h2 className="font-semibold text-gray-900">How Find Me Works</h2>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
            <li>A helper reports a found person with a photo and approximate location.</li>
            <li>A moderator reviews the case and approves it if appropriate.</li>
            <li>The case becomes active and discoverable in nearby searches.</li>
            <li>Someone searching for a missing person finds a potential match.</li>
            <li>They contact the helper through a secure in-app conversation.</li>
            <li>Both parties verify and confirm the match.</li>
            <li>The case is marked as reunited and closed.</li>
          </ol>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Privacy & Safety</h2>
          </div>
          <ul className="space-y-1.5 text-sm text-gray-700">
            <li>Exact locations are never shared publicly — only approximate areas.</li>
            <li>Phone numbers and emails are never shared between users.</li>
            <li>All communication happens through secure in-app chat.</li>
            <li>Photos are reviewed by moderators before going public.</li>
            <li>Child cases receive extra protection and stricter moderation.</li>
            <li>Find Me does not use facial recognition.</li>
          </ul>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="h-4 w-4 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Contacting Helpers</h2>
          </div>
          <p className="text-sm text-gray-700">
            When you find a relevant case, click "Contact Helper" to start a secure in-app conversation.
            Your personal contact information is never shared. The helper will respond through the app.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-2">
            <Flag className="h-4 w-4 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Reporting Problems</h2>
          </div>
          <p className="text-sm text-gray-700">
            Every case has a Report button. Use it to flag fake cases, wrong persons, harassment, privacy concerns,
            inappropriate images, or scams. Our moderation team reviews all reports.
          </p>
        </div>
      </div>
    </div>
  );
}

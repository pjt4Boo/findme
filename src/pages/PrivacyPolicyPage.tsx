import { Shield, Eye, Lock, Heart, AlertTriangle } from 'lucide-react';
import { EMERGENCY_NOTICE } from '@/lib/constants';

export function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
      </div>

      <div className="space-y-6 text-sm text-gray-700">
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="h-4 w-4 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Location Privacy</h2>
          </div>
          <p>
            Find Me never exposes exact latitude/longitude coordinates to normal users. When you submit a case,
            we store the exact coordinates securely on the backend for proximity matching, but only display
            approximate location information publicly (e.g., "Near Salem New Bus Stand" or "Approximately 2.4 km away").
          </p>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="h-4 w-4 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Contact Privacy</h2>
          </div>
          <p>
            Your phone number and email address are never shared with other users. All communication between
            helpers and families happens through secure in-app conversations. You control when and how you respond.
          </p>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="h-4 w-4 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Child Safety</h2>
          </div>
          <p>
            Cases involving children receive stricter moderation. We minimize publicly displayed information,
            never show exact locations, never display school or address information, and require additional
            review before publication. Facial recognition is never used.
          </p>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-gray-500" />
            <h2 className="font-semibold text-gray-900">Photo Privacy</h2>
          </div>
          <p>
            Uploaded photos are stored securely. We attempt to strip EXIF metadata from images. Photos are only
            visible on active cases and are removed from public discovery when a case is closed or removed.
          </p>
        </section>

        <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <h2 className="font-semibold text-amber-900">Emergency Notice</h2>
          </div>
          <p className="text-amber-800">{EMERGENCY_NOTICE}</p>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="font-semibold text-gray-900 mb-2">Data Retention</h2>
          <p>
            When a case is reunited and closed, it is removed from normal public discovery. Photos and location
            information are not kept publicly visible indefinitely. You may request deletion of your data at any time.
          </p>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="font-semibold text-gray-900 mb-2">This is NOT a Tracking App</h2>
          <p>
            Find Me is a community-assisted platform to help reconnect people. It does not track individuals,
            does not require the found person to have a phone or account, and does not use facial recognition.
          </p>
        </section>
      </div>
    </div>
  );
}

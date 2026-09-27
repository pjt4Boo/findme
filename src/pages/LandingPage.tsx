import { useNavigate } from 'react-router-dom';
import { Heart, MapPin, Users, Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { EMERGENCY_NOTICE } from '@/lib/constants';

export function LandingPage() {
  const { t } = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-200">
            <Heart className="h-9 w-9 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
            {t('landing.heroTitle')}
          </h1>
          <p className="mt-4 text-lg text-gray-600">{t('landing.heroSubtitle')}</p>

          {/* Emergency notice */}
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-sm text-amber-800">{EMERGENCY_NOTICE}</p>
          </div>
        </div>
      </section>

      {/* Primary actions */}
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            onClick={() => navigate('/report-found')}
            className="group rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition-all hover:shadow-md hover:border-blue-300"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600 group-hover:bg-teal-100 transition-colors">
              <Users className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{t('landing.foundSomeone')}</h2>
            <p className="mt-1 text-sm text-gray-500">
              Report a person you have found so families can locate them.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-600 group-hover:gap-2 transition-all">
              Get started <ArrowRight className="h-4 w-4" />
            </span>
          </button>

          <button
            onClick={() => navigate('/report-missing')}
            className="group rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition-all hover:shadow-md hover:border-blue-300"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600 group-hover:bg-orange-100 transition-colors">
              <Heart className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{t('landing.lookingForSomeone')}</h2>
            <p className="mt-1 text-sm text-gray-500">
              Report a missing person and find nearby matches.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-600 group-hover:gap-2 transition-all">
              Get started <ArrowRight className="h-4 w-4" />
            </span>
          </button>
        </div>

        <button
          onClick={() => navigate('/nearby')}
          className="mt-4 w-full rounded-2xl bg-blue-600 p-5 text-center shadow-sm transition-all hover:bg-blue-700 hover:shadow-md"
        >
          <div className="flex items-center justify-center gap-2">
            <MapPin className="h-5 w-5 text-white" />
            <span className="text-base font-semibold text-white">{t('landing.searchNearby')}</span>
          </div>
          <p className="mt-1 text-sm text-blue-100">Browse active cases near your location</p>
        </button>
      </section>

      {/* Trust indicators */}
      <section className="bg-white border-t border-gray-100">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <Shield className="h-5 w-5 text-gray-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Privacy-First</h3>
              <p className="mt-1 text-xs text-gray-500">
                Exact locations are never shared. Communication stays in-app.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <Users className="h-5 w-5 text-gray-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Community-Driven</h3>
              <p className="mt-1 text-xs text-gray-500">
                Helpers and families work together with moderation.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <Heart className="h-5 w-5 text-gray-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Safe & Secure</h3>
              <p className="mt-1 text-xs text-gray-500">
                Every case is reviewed before going public.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

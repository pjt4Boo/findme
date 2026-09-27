import { useState, useEffect } from 'react';
import { User, Mail, Globe, Save, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingState } from '@/components/States';
import { supabase } from '@/lib/supabase';
import type { Language, RadiusOption } from '@/types';
import { RADIUS_OPTIONS } from '@/lib/constants';

export function ProfilePage() {
  const { user, profile, refreshProfile, setLanguage, t } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredRadius, setPreferredRadius] = useState<RadiusOption>(10);
  const [preferredLanguage, setPreferredLanguage] = useState<Language>('en');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? '');
      setPhone(profile.phone ?? '');
      setPreferredRadius(profile.default_radius_km);
      setPreferredLanguage(profile.preferred_language);
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        phone: phone || null,
        default_radius_km: preferredRadius,
        preferred_language: preferredLanguage,
      })
      .eq('id', user!.id);

    setSaving(false);
    if (!error) {
      setSaved(true);
      setLanguage(preferredLanguage);
      await refreshProfile();
      setTimeout(() => setSaved(false), 2000);
    }
  };

  if (!profile) return <LoadingState />;

  return (
    <div className="mx-auto max-w-md px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('nav.profile')}</h1>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <User className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{profile.full_name || 'User'}</p>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Mail className="h-3 w-3" /> {profile.email}
            </p>
            <span className="mt-1 inline-block rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
              {profile.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.fullName')}</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="Not shared publicly"
            />
            <p className="mt-1 text-xs text-gray-400">Your phone number is never shared with other users.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Search Radius</label>
            <div className="flex flex-wrap gap-2">
              {RADIUS_OPTIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setPreferredRadius(r)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    preferredRadius === r ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {r} km
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Globe className="inline h-4 w-4 mr-1" /> Language
            </label>
            <div className="flex gap-2">
              {([
                { value: 'en', label: 'English' },
                { value: 'ta', label: 'தமிழ்' },
                { value: 'hi', label: 'हिन्दी' },
              ] as const).map((lang) => (
                <button
                  key={lang.value}
                  type="button"
                  onClick={() => setPreferredLanguage(lang.value)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    preferredLanguage === lang.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving...' : saved ? 'Saved!' : t('common.save')}
          </button>
        </form>
      </div>
    </div>
  );
}

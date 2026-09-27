import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { PhotoUploader } from '@/components/PhotoUploader';
import { LocationPicker } from '@/components/LocationPicker';
import { LoadingState } from '@/components/States';
import { createCase } from '@/services/caseService';
import { foundCaseSchema } from '@/lib/validation';
import { GENDER_LABELS, CONSENT_TEXT } from '@/lib/constants';
import type { Gender } from '@/types';

export function ReportFoundPage() {
  const { t } = useAuth();
  const navigate = useNavigate();
  const [photo, setPhoto] = useState<File | null>(null);
  const [ageMin, setAgeMin] = useState('');
  const [ageMax, setAgeMax] = useState('');
  const [gender, setGender] = useState<Gender>('UNKNOWN');
  const [clothing, setClothing] = useState('');
  const [description, setDescription] = useState('');
  const [foundAt, setFoundAt] = useState('');
  const [isChild, setIsChild] = useState(false);
  const [consent, setConsent] = useState(false);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locationLabel, setLocationLabel] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const data = {
      approxAgeMin: Number(ageMin) || 0,
      approxAgeMax: Number(ageMax) || 0,
      gender,
      clothing,
      description,
      locationLabel,
      latitude: lat ?? 0,
      longitude: lng ?? 0,
      foundAt,
      isChild,
      consent,
    };

    const result = foundCaseSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path[0]?.toString();
        if (path && !fieldErrors[path]) fieldErrors[path] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    const { error } = await createCase(
      {
        case_type: 'FOUND',
        person_name: null,
        age_min: Number(ageMin) || null,
        age_max: Number(ageMax) || null,
        gender,
        clothing: clothing || null,
        description,
        location_visibility: 'APPROXIMATE_PUBLIC',
        location_label: locationLabel,
        found_at: new Date(foundAt).toISOString(),
        last_seen_at: null,
        is_child: isChild,
        police_reference: null,
        additional_info: null,
      },
      {
        latitude: lat!,
        longitude: lng!,
        location_type: 'FOUND_LOCATION',
      },
      consent,
      photo,
    );
    setSubmitting(false);

    if (error) {
      setErrors({ submit: error });
      return;
    }

    setSuccess(true);
    setTimeout(() => navigate('/my-cases'), 2000);
  };

  if (success) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
        <h2 className="mt-4 text-xl font-semibold text-gray-900">Case Submitted</h2>
        <p className="mt-2 text-sm text-gray-500">
          Your case has been submitted for review. A moderator will review it before it becomes public.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> {t('common.back')}
      </button>

      <h1 className="text-2xl font-bold text-gray-900">{t('case.reportFound')}</h1>
      <p className="mt-1 text-sm text-gray-500">Report a person you have found. All cases are reviewed before going public.</p>

      {isChild && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-800">
            <strong>Child Safety:</strong> Additional review is required for cases involving children. Minimal information will be displayed publicly.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <PhotoUploader onPhotoSelected={setPhoto} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Approx. Min Age</label>
            <input
              type="number"
              value={ageMin}
              onChange={(e) => setAgeMin(e.target.value)}
              min={0}
              max={150}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="0"
            />
            {errors.approxAgeMin && <p className="mt-1 text-xs text-red-600">{errors.approxAgeMin}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Approx. Max Age</label>
            <input
              type="number"
              value={ageMax}
              onChange={(e) => setAgeMax(e.target.value)}
              min={0}
              max={150}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              placeholder="0"
            />
            {errors.approxAgeMax && <p className="mt-1 text-xs text-red-600">{errors.approxAgeMax}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('case.gender')}</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as Gender)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          >
            {Object.entries(GENDER_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('case.clothing')}</label>
          <input
            type="text"
            value={clothing}
            onChange={(e) => setClothing(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            placeholder="e.g., Blue shirt and white pants"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('case.description')} *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            placeholder="Describe the person's appearance, condition, and any notable details..."
          />
          {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
        </div>

        <LocationPicker
          onLocationSelected={(la, ln, label) => {
            setLat(la);
            setLng(ln);
            setLocationLabel(label);
          }}
        />
        {errors.locationLabel && <p className="text-xs text-red-600">{errors.locationLabel}</p>}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('case.foundAt')} *</label>
          <input
            type="datetime-local"
            value={foundAt}
            onChange={(e) => setFoundAt(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
          {errors.foundAt && <p className="mt-1 text-xs text-red-600">{errors.foundAt}</p>}
        </div>

        <div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isChild}
              onChange={(e) => setIsChild(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600"
            />
            <span className="text-sm text-gray-700">This person appears to be a child (under 18)</span>
          </label>
        </div>

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600"
            />
            <span className="text-sm text-gray-700">{CONSENT_TEXT}</span>
          </label>
          {errors.consent && <p className="mt-1 text-xs text-red-600">{errors.consent}</p>}
        </div>

        {errors.submit && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
            <AlertCircle className="h-4 w-4" /> {errors.submit}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {t('case.cancel')}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : t('case.submit')}
          </button>
        </div>
      </form>

      {submitting && <LoadingState message="Submitting your case..." />}
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Crosshair } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { CaseCard } from '@/components/CaseCard';
import { RadiusSelector } from '@/components/RadiusSelector';
import { LoadingState, EmptyState, ErrorState } from '@/components/States';
import { findNearbyCases } from '@/services/caseService';
import { DEFAULT_RADIUS } from '@/lib/constants';
import type { NearbyCaseResult, RadiusOption, CaseType } from '@/types';

export function NearbyCasesPage() {
  const { t } = useAuth();
  const navigate = useNavigate();
  const [cases, setCases] = useState<NearbyCaseResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [radius, setRadius] = useState<RadiusOption>(DEFAULT_RADIUS);
  const [caseType, setCaseType] = useState<CaseType | 'ALL'>('ALL');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);

  const getLocation = useCallback(() => {
    setLocating(true);
    if (!navigator.geolocation) {
      // Default to Salem, Tamil Nadu
      setLat(11.6643);
      setLng(78.1460);
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setLocating(false);
      },
      () => {
        setLat(11.6643);
        setLng(78.1460);
        setLocating(false);
      },
      { timeout: 10000 },
    );
  }, []);

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  useEffect(() => {
    if (lat === null || lng === null) return;
    setLoading(true);
    setError(false);
    findNearbyCases(lat, lng, radius, caseType === 'ALL' ? undefined : caseType)
      .then((data) => {
        setCases(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [lat, lng, radius, caseType]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900">{t('case.nearbyCases')}</h1>
      <p className="mt-1 text-sm text-gray-500">Browse active cases near your location.</p>

      {/* Location & filters */}
      <div className="mt-4 space-y-4 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <button
            onClick={getLocation}
            disabled={locating}
            className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            <Crosshair className="h-4 w-4" />
            {locating ? 'Locating...' : 'Use my location'}
          </button>
          {lat && lng && (
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin className="h-3 w-3" />
              Location set
            </span>
          )}
        </div>

        <RadiusSelector value={radius} onChange={setRadius} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Case Type</label>
          <div className="flex gap-2">
            {(['ALL', 'FOUND', 'MISSING'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setCaseType(type)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  caseType === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type === 'ALL' ? 'All' : type === 'FOUND' ? 'Found' : 'Missing'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mt-6">
        {loading ? (
          <LoadingState message={t('case.loadingCases')} />
        ) : error ? (
          <ErrorState onRetry={getLocation} />
        ) : cases.length === 0 ? (
          <EmptyState
            title={t('case.noCasesFound')}
            description="Try expanding your search radius or changing the case type filter."
            action={
              <button
                onClick={() => navigate('/')}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Back to Home
              </button>
            }
          />
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">{cases.length} case{cases.length !== 1 ? 's' : ''} found</p>
            {cases.map((c) => (
              <CaseCard key={c.id} caseData={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

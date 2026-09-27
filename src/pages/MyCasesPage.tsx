import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { CaseStatusBadge } from '@/components/CaseStatusBadge';
import { LoadingState, EmptyState } from '@/components/States';
import { getMyCases, getPhotoUrl } from '@/services/caseService';
import { GENDER_LABELS } from '@/lib/constants';
import type { Case, CasePhoto } from '@/types';
import { supabase } from '@/lib/supabase';

export function MyCasesPage() {
  const { t } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [photoMap, setPhotoMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyCases().then(async (data) => {
      setCases(data);
      setLoading(false);
      // Fetch primary photos
      const photoPromises = data.map(async (c) => {
        const { data: photos } = await supabase
          .from('case_photos')
          .select('*')
          .eq('case_id', c.id)
          .eq('is_primary', true)
          .is('deleted_at', null)
          .limit(1);
        if (photos && photos.length > 0) {
          const photo = photos[0] as CasePhoto;
          const url = await getPhotoUrl(photo.storage_key);
          if (url) setPhotoMap((prev) => ({ ...prev, [c.id]: url }));
        }
      });
      await Promise.all(photoPromises);
    });
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">{t('nav.myCases')}</h1>
        <div className="flex gap-2">
          <Link
            to="/report-found"
            className="flex items-center gap-1 rounded-lg bg-teal-50 px-3 py-2 text-sm font-medium text-teal-700 hover:bg-teal-100"
          >
            <Plus className="h-4 w-4" /> Found
          </Link>
          <Link
            to="/report-missing"
            className="flex items-center gap-1 rounded-lg bg-orange-50 px-3 py-2 text-sm font-medium text-orange-700 hover:bg-orange-100"
          >
            <Plus className="h-4 w-4" /> Missing
          </Link>
        </div>
      </div>

      {loading ? (
        <LoadingState />
      ) : cases.length === 0 ? (
        <EmptyState
          title="You haven't created any cases yet"
          description="Report a found person or a missing person to get started."
          action={
            <Link to="/" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              Back to Home
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {cases.map((c) => (
            <Link
              key={c.id}
              to={`/cases/${c.id}`}
              className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  {photoMap[c.id] ? (
                    <img src={photoMap[c.id]} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <FileText className="h-6 w-6 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`rounded px-1.5 py-0.5 text-xs font-semibold ${
                      c.case_type === 'FOUND' ? 'bg-teal-50 text-teal-700' : 'bg-orange-50 text-orange-700'
                    }`}>
                      {c.case_type === 'FOUND' ? 'Found' : 'Missing'}
                    </span>
                    <CaseStatusBadge status={c.status} />
                  </div>
                  <p className="mt-1 text-sm font-medium text-gray-900 truncate">
                    {c.person_name || 'Unidentified person'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {c.gender ? GENDER_LABELS[c.gender] : 'Unknown'} · {new Date(c.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

import { Link } from 'react-router-dom';
import { MapPin, User } from 'lucide-react';
import type { NearbyCaseResult } from '@/types';
import { CaseStatusBadge } from '@/components/CaseStatusBadge';
import { formatDistance, formatAgeRange, getPhotoUrl } from '@/services/caseService';
import { GENDER_LABELS } from '@/lib/constants';
import { useEffect, useState } from 'react';

interface Props {
  caseData: NearbyCaseResult;
}

export function CaseCard({ caseData }: Props) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (caseData.primary_photo_key) {
      getPhotoUrl(caseData.primary_photo_key).then(setPhotoUrl);
    }
  }, [caseData.primary_photo_key]);

  const typeLabel = caseData.case_type === 'FOUND' ? 'Found' : 'Missing';
  const typeColor = caseData.case_type === 'FOUND' ? 'bg-teal-50 text-teal-700' : 'bg-orange-50 text-orange-700';

  return (
    <Link
      to={`/cases/${caseData.id}`}
      className="block rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-blue-200"
    >
      <div className="flex gap-4">
        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
          {photoUrl ? (
            <img src={photoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <User className="h-8 w-8 text-gray-300" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${typeColor}`}>
              {typeLabel}
            </span>
            <CaseStatusBadge status={caseData.status} />
          </div>
          <div className="mt-1.5 space-y-0.5">
            <p className="text-sm font-medium text-gray-900 truncate">
              {caseData.person_name || 'Unidentified person'}
            </p>
            <p className="text-sm text-gray-600">
              {caseData.gender ? GENDER_LABELS[caseData.gender] : 'Unknown gender'}
              {' · '}
              {formatAgeRange(caseData.age_min, caseData.age_max)}
            </p>
            {caseData.clothing && (
              <p className="text-sm text-gray-600 truncate">{caseData.clothing}</p>
            )}
          </div>
          <div className="mt-1.5 flex items-center gap-3 text-xs text-gray-500">
            {caseData.location_label && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {caseData.location_label}
              </span>
            )}
            <span className="font-medium text-blue-600">{formatDistance(caseData.distance_km)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

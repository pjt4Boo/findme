import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Check, X, Link2, MapPin, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingState, EmptyState } from '@/components/States';
import { getCaseById, getCasePhotos, getPhotoUrl, formatDistance, formatAgeRange } from '@/services/caseService';
import { getPotentialMatches, confirmMatch, rejectMatch, logAudit } from '@/services/api';
import type { Case, CaseMatch } from '@/types';

export function MatchesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useAuth();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [matches, setMatches] = useState<CaseMatch[]>([]);
  const [relatedCases, setRelatedCases] = useState<Record<string, Case>>({});
  const [photoMap, setPhotoMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([getCaseById(id), getPotentialMatches(id)])
      .then(async ([c, m]) => {
        setCaseData(c);
        setMatches(m);
        // Fetch related cases
        const relatedIds = new Set<string>();
        m.forEach((match) => {
          if (match.found_case_id !== id) relatedIds.add(match.found_case_id);
          if (match.missing_case_id !== id) relatedIds.add(match.missing_case_id);
        });
        const caseMap: Record<string, Case> = {};
        for (const rid of relatedIds) {
          const rc = await getCaseById(rid);
          if (rc) caseMap[rid] = rc;
        }
        setRelatedCases(caseMap);
        // Fetch photos
        for (const cid of [id, ...relatedIds]) {
          const photos = await getCasePhotos(cid);
          if (photos.length > 0) {
            const url = await getPhotoUrl(photos[0].storage_key);
            if (url) setPhotoMap((prev) => ({ ...prev, [cid]: url }));
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleConfirm = async (matchId: string) => {
    setActionLoading(matchId);
    await confirmMatch(matchId);
    await logAudit('MATCH_CONFIRMED', 'case_match', matchId);
    setActionLoading(null);
    setMatches((prev) => prev.map((m) => (m.id === matchId ? { ...m, status: 'CONFIRMED' } : m)));
  };

  const handleReject = async (matchId: string) => {
    setActionLoading(matchId);
    await rejectMatch(matchId);
    await logAudit('MATCH_REJECTED', 'case_match', matchId);
    setActionLoading(null);
    setMatches((prev) => prev.map((m) => (m.id === matchId ? { ...m, status: 'REJECTED' } : m)));
  };

  if (loading) return <LoadingState />;
  if (!caseData) return <EmptyState title="Case not found" />;

  const potentialMatches = matches.filter((m) => m.status === 'POTENTIAL');
  const resolvedMatches = matches.filter((m) => m.status !== 'POTENTIAL');

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> {t('common.back')}
      </button>

      <h1 className="text-2xl font-bold text-gray-900">{t('case.potentialMatches')}</h1>
      <p className="mt-1 text-sm text-gray-500">
        Review potential matches for your case. Human confirmation is always required.
      </p>

      {potentialMatches.length === 0 && resolvedMatches.length === 0 && (
        <EmptyState
          title="No potential matches yet"
          description="When someone reports a similar case nearby, it will appear here for your review."
        />
      )}

      {/* Potential matches */}
      {potentialMatches.length > 0 && (
        <div className="mt-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Pending Review ({potentialMatches.length})</h2>
          {potentialMatches.map((match) => {
            const otherCaseId = match.found_case_id === id ? match.missing_case_id : match.found_case_id;
            const otherCase = relatedCases[otherCaseId];
            if (!otherCase) return null;

            return (
              <div key={match.id} className="rounded-xl border border-blue-200 bg-blue-50/30 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Link2 className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-700">{t('case.potentialMatch')}</span>
                  <span className="text-xs text-gray-500">Score: {match.overall_score}/100</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* My case */}
                  <div className="rounded-lg border border-gray-200 bg-white p-3">
                    <div className="h-24 w-full rounded-md overflow-hidden bg-gray-100 mb-2">
                      {photoMap[caseData.id] ? (
                        <img src={photoMap[caseData.id]} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center"><User className="h-6 w-6 text-gray-300" /></div>
                      )}
                    </div>
                    <p className="text-xs font-medium text-gray-900 truncate">{caseData.person_name || 'Unidentified'}</p>
                    <p className="text-xs text-gray-500">{formatAgeRange(caseData.age_min, caseData.age_max)}</p>
                  </div>

                  {/* Other case */}
                  <Link to={`/cases/${otherCaseId}`} className="rounded-lg border border-gray-200 bg-white p-3 hover:shadow-sm transition-shadow">
                    <div className="h-24 w-full rounded-md overflow-hidden bg-gray-100 mb-2">
                      {photoMap[otherCaseId] ? (
                        <img src={photoMap[otherCaseId]} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center"><User className="h-6 w-6 text-gray-300" /></div>
                      )}
                    </div>
                    <p className="text-xs font-medium text-gray-900 truncate">{otherCase.person_name || 'Unidentified'}</p>
                    <p className="text-xs text-gray-500">{formatAgeRange(otherCase.age_min, otherCase.age_max)}</p>
                  </Link>
                </div>

                {/* Match details */}
                <div className="mt-3 space-y-1 text-xs text-gray-600">
                  {match.distance_km != null && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3" /> {formatDistance(match.distance_km)}
                    </div>
                  )}
                  {match.gender_match != null && (
                    <div>Gender match: {match.gender_match ? 'Yes' : 'No'}</div>
                  )}
                  {match.age_similarity_score != null && (
                    <div>Age similarity: {match.age_similarity_score}/100</div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleConfirm(match.id)}
                    disabled={actionLoading === match.id}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-green-600 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" /> {t('case.confirmMatch')}
                  </button>
                  <button
                    onClick={() => handleReject(match.id)}
                    disabled={actionLoading === match.id}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <X className="h-4 w-4" /> {t('case.notAMatch')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Resolved matches */}
      {resolvedMatches.length > 0 && (
        <div className="mt-6 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Reviewed ({resolvedMatches.length})</h2>
          {resolvedMatches.map((match) => (
            <div key={match.id} className="rounded-lg border border-gray-200 bg-white p-3 flex items-center gap-3">
              <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                match.status === 'CONFIRMED' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {match.status === 'CONFIRMED' ? 'Confirmed' : 'Rejected'}
              </span>
              <span className="text-xs text-gray-500">Score: {match.overall_score}/100</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

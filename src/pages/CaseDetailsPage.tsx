import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, User, Flag, MessageCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { CaseStatusBadge } from '@/components/CaseStatusBadge';
import { ReportModal } from '@/components/ReportModal';
import { ConfirmModal } from '@/components/ConfirmModal';
import { LoadingState, ErrorState } from '@/components/States';
import { getCaseById, getCasePhotos, getPhotoUrl, formatAgeRange } from '@/services/caseService';
import { startConversation, logAudit } from '@/services/api';
import { GENDER_LABELS, EMERGENCY_NOTICE } from '@/lib/constants';
import type { Case, CasePhoto } from '@/types';

export function CaseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, user } = useAuth();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [photos, setPhotos] = useState<CasePhoto[]>([]);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([getCaseById(id), getCasePhotos(id)])
      .then(([c, p]) => {
        setCaseData(c);
        setPhotos(p);
        setLoading(false);
        if (!c) setError(true);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    photos.forEach((p) => {
      if (!photoUrls[p.storage_key]) {
        getPhotoUrl(p.storage_key).then((url) => {
          if (url) setPhotoUrls((prev) => ({ ...prev, [p.storage_key]: url }));
        });
      }
    });
  }, [photos, photoUrls]);

  const handleContact = async () => {
    if (!user || !caseData) {
      navigate('/login');
      return;
    }
    setContactError(null);
    const { conversation, error } = await startConversation(caseData.id, caseData.created_by);
    if (error) {
      setContactError(error);
      return;
    }
    if (conversation) {
      await logAudit('USER_CREATED_CASE', 'conversation', conversation.id);
      navigate(`/chat/${conversation.id}`);
    }
  };

  if (loading) return <LoadingState />;
  if (error || !caseData) return <ErrorState onRetry={() => navigate('/nearby')} />;

  const isOwner = user?.id === caseData.created_by;
  const canContact = user && !isOwner && caseData.status === 'ACTIVE';
  const typeLabel = caseData.case_type === 'FOUND' ? 'Found Person' : 'Missing Person';
  const typeColor = caseData.case_type === 'FOUND' ? 'bg-teal-50 text-teal-700' : 'bg-orange-50 text-orange-700';

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <button onClick={() => navigate(-1)} className="mb-4 flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" /> {t('common.back')}
      </button>

      {/* Header */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <span className={`rounded-md px-2.5 py-1 text-sm font-semibold ${typeColor}`}>{typeLabel}</span>
        <CaseStatusBadge status={caseData.status} />
        {caseData.is_child && (
          <span className="rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 border border-amber-200">
            Child — Extra Protection
          </span>
        )}
      </div>

      {/* Photos */}
      {photos.length > 0 && (
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((p) => (
            <div key={p.id} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              {photoUrls[p.storage_key] ? (
                <img src={photoUrls[p.storage_key]} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <User className="h-8 w-8 text-gray-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Details */}
      <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
        {caseData.person_name && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{caseData.person_name}</h2>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">{t('case.age')}</span>
            <p className="font-medium text-gray-900">{formatAgeRange(caseData.age_min, caseData.age_max)}</p>
          </div>
          <div>
            <span className="text-gray-500">{t('case.gender')}</span>
            <p className="font-medium text-gray-900">{caseData.gender ? GENDER_LABELS[caseData.gender] : 'Unknown'}</p>
          </div>
          {caseData.clothing && (
            <div className="col-span-2">
              <span className="text-gray-500">{t('case.clothing')}</span>
              <p className="font-medium text-gray-900">{caseData.clothing}</p>
            </div>
          )}
          {caseData.location_label && (
            <div className="col-span-2">
              <span className="text-gray-500">{t('case.location')}</span>
              <p className="flex items-center gap-1 font-medium text-gray-900">
                <MapPin className="h-4 w-4 text-gray-400" />
                {caseData.location_label}
              </p>
              <p className="mt-0.5 text-xs text-gray-400">Exact location is not shared for privacy.</p>
            </div>
          )}
          {caseData.found_at && (
            <div>
              <span className="text-gray-500">{t('case.foundAt')}</span>
              <p className="flex items-center gap-1 font-medium text-gray-900">
                <Clock className="h-4 w-4 text-gray-400" />
                {new Date(caseData.found_at).toLocaleString()}
              </p>
            </div>
          )}
          {caseData.last_seen_at && (
            <div>
              <span className="text-gray-500">{t('case.lastSeen')}</span>
              <p className="flex items-center gap-1 font-medium text-gray-900">
                <Clock className="h-4 w-4 text-gray-400" />
                {new Date(caseData.last_seen_at).toLocaleString()}
              </p>
            </div>
          )}
          {caseData.police_reference && (
            <div className="col-span-2">
              <span className="text-gray-500">Police Reference</span>
              <p className="font-medium text-gray-900">{caseData.police_reference}</p>
            </div>
          )}
        </div>

        {caseData.description && (
          <div>
            <span className="text-sm text-gray-500">{t('case.description')}</span>
            <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{caseData.description}</p>
          </div>
        )}

        {caseData.additional_info && (
          <div>
            <span className="text-sm text-gray-500">{t('case.additionalInfo')}</span>
            <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{caseData.additional_info}</p>
          </div>
        )}
      </div>

      {/* Emergency notice */}
      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="text-sm text-amber-800">{EMERGENCY_NOTICE}</p>
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        {canContact && (
          <button
            onClick={() => setContactOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            {t('case.contactHelper')}
          </button>
        )}
        {user && !isOwner && (
          <button
            onClick={() => setReportOpen(true)}
            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Flag className="h-4 w-4" />
            {t('case.report')}
          </button>
        )}
        {isOwner && (
          <Link
            to={`/cases/${caseData.id}/matches`}
            className="flex items-center justify-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
          >
            {t('case.potentialMatches')}
          </Link>
        )}
      </div>

      {!user && (
        <p className="mt-4 text-center text-sm text-gray-500">
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">Sign in</Link> to contact the helper or report this case.
        </p>
      )}

      <ReportModal caseId={caseData.id} open={reportOpen} onClose={() => setReportOpen(false)} />
      <ConfirmModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        onConfirm={handleContact}
        title="Contact Helper"
        message="A secure in-app conversation will be created. Your phone number and email will not be shared. Do you want to proceed?"
        confirmLabel="Start Conversation"
      />
      {contactError && (
        <div className="mt-2 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" /> {contactError}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminLayout } from '@/layouts/AdminLayout';
import { CaseStatusBadge } from '@/components/CaseStatusBadge';
import { LoadingState, EmptyState } from '@/components/States';
import { getAllCasesAdmin, getPendingCases, logAudit } from '@/services/api';
import { updateCaseStatus } from '@/services/caseService';
import { GENDER_LABELS } from '@/lib/constants';
import type { Case, CaseStatus } from '@/types';

export function AdminCasesPage() {
  const { t } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'ALL'>('ALL');

  useEffect(() => {
    getAllCasesAdmin().then((data) => {
      setCases(data);
      setLoading(false);
    });
  }, []);

  const filtered = cases.filter((c) => {
    const matchesSearch = !search ||
      c.person_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('admin.cases')}</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or description..."
            className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as CaseStatus | 'ALL')}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING_REVIEW">Pending Review</option>
          <option value="ACTIVE">Active</option>
          <option value="MATCHED">Matched</option>
          <option value="VERIFICATION">Verification</option>
          <option value="REUNITED">Reunited</option>
          <option value="CLOSED">Closed</option>
          <option value="REJECTED">Rejected</option>
          <option value="REMOVED">Removed</option>
        </select>
      </div>

      {loading ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <EmptyState title="No cases found" />
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <Link
              key={c.id}
              to={`/cases/${c.id}`}
              className="block rounded-lg border border-gray-200 bg-white p-3 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`rounded px-1.5 py-0.5 text-xs font-semibold ${
                    c.case_type === 'FOUND' ? 'bg-teal-50 text-teal-700' : 'bg-orange-50 text-orange-700'
                  }`}>
                    {c.case_type === 'FOUND' ? 'Found' : 'Missing'}
                  </span>
                  <CaseStatusBadge status={c.status} />
                  <span className="text-sm font-medium text-gray-900">
                    {c.person_name || 'Unidentified'}
                  </span>
                </div>
                <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString()}</span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {c.gender ? GENDER_LABELS[c.gender] : 'Unknown'} · {c.location_label || 'No location'}
              </p>
            </Link>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

export function AdminPendingPage() {
  const { t } = useAuth();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = () => {
    getPendingCases().then((data) => {
      setCases(data);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (caseId: string, action: 'approve' | 'reject') => {
    setActionLoading(caseId);
    const status = action === 'approve' ? 'ACTIVE' : 'REJECTED';
    await updateCaseStatus(caseId, status);
    await logAudit(action === 'approve' ? 'CASE_APPROVED' : 'CASE_REJECTED', 'case', caseId);
    setActionLoading(null);
    load();
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('admin.pendingReview')}</h1>
      {loading ? (
        <LoadingState />
      ) : cases.length === 0 ? (
        <EmptyState title="No cases pending review" description="All submitted cases have been reviewed." />
      ) : (
        <div className="space-y-3">
          {cases.map((c) => (
            <div key={c.id} className="rounded-xl border border-amber-200 bg-amber-50/30 p-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`rounded px-1.5 py-0.5 text-xs font-semibold ${
                    c.case_type === 'FOUND' ? 'bg-teal-50 text-teal-700' : 'bg-orange-50 text-orange-700'
                  }`}>
                    {c.case_type === 'FOUND' ? 'Found' : 'Missing'}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{c.person_name || 'Unidentified'}</span>
                  {c.is_child && (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-700">Child</span>
                  )}
                </div>
                <Link to={`/cases/${c.id}`} className="text-xs text-blue-600 hover:text-blue-700">View details →</Link>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{c.description}</p>
              <p className="mt-1 text-xs text-gray-400">
                {c.location_label} · {new Date(c.created_at).toLocaleString()}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleAction(c.id, 'approve')}
                  disabled={actionLoading === c.id}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {t('admin.approve')}
                </button>
                <button
                  onClick={() => handleAction(c.id, 'reject')}
                  disabled={actionLoading === c.id}
                  className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {t('admin.reject')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

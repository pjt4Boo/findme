import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flag, Check, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminLayout } from '@/layouts/AdminLayout';
import { LoadingState, EmptyState } from '@/components/States';
import { getReports, resolveReport, logAudit } from '@/services/api';
import { REPORT_REASONS } from '@/lib/constants';
import type { Report } from '@/types';

export function AdminReportsPage() {
  const { t } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    getReports().then((data) => {
      setReports(data);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const handleResolve = async (id: string, status: 'RESOLVED' | 'DISMISSED') => {
    await resolveReport(id, status);
    await logAudit(status === 'RESOLVED' ? 'CASE_REMOVED' : 'CASE_HIDDEN', 'report', id);
    load();
  };

  const reasonLabel = (reason: string) => REPORT_REASONS.find((r) => r.value === reason)?.label ?? reason;

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('admin.reports')}</h1>
      {loading ? (
        <LoadingState />
      ) : reports.length === 0 ? (
        <EmptyState title="No reports" description="No abuse reports have been submitted." />
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className={`rounded-xl border p-4 ${
              r.status === 'PENDING' ? 'border-red-200 bg-red-50/30' : 'border-gray-200 bg-white'
            }`}>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-semibold text-gray-900">{reasonLabel(r.reason)}</span>
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                    r.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                    r.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                    r.status === 'DISMISSED' ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {r.status}
                  </span>
                </div>
                <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleString()}</span>
              </div>
              {r.description && <p className="text-sm text-gray-600">{r.description}</p>}
              {r.case_id && (
                <Link to={`/cases/${r.case_id}`} className="mt-2 inline-block text-xs text-blue-600 hover:text-blue-700">
                  View case →
                </Link>
              )}
              {r.status === 'PENDING' && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleResolve(r.id, 'RESOLVED')}
                    className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
                  >
                    <Check className="h-3.5 w-3.5" /> Resolve
                  </button>
                  <button
                    onClick={() => handleResolve(r.id, 'DISMISSED')}
                    className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <X className="h-3.5 w-3.5" /> Dismiss
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

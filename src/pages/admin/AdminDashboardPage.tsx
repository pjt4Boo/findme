import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Flag, CheckCircle2, AlertCircle, UserCheck, UserX } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminLayout } from '@/layouts/AdminLayout';
import { LoadingState, ErrorState } from '@/components/States';
import { getAdminStats } from '@/services/api';
import type { AdminStats } from '@/types';

export function AdminDashboardPage() {
  const { t } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getAdminStats()
      .then((data) => { setStats(data); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const cards = [
    { label: t('admin.activeCases'), value: stats?.active_cases ?? 0, icon: FileText, color: 'bg-emerald-50 text-emerald-600', link: '/admin/cases' },
    { label: t('admin.pendingReviewCount'), value: stats?.pending_review ?? 0, icon: AlertCircle, color: 'bg-amber-50 text-amber-600', link: '/admin/pending' },
    { label: t('admin.reportedCases'), value: stats?.reported_cases ?? 0, icon: Flag, color: 'bg-red-50 text-red-600', link: '/admin/reports' },
    { label: t('admin.reunitedCases'), value: stats?.reunited_cases ?? 0, icon: CheckCircle2, color: 'bg-green-50 text-green-600', link: '/admin/cases' },
    { label: t('admin.activeUsers'), value: stats?.active_users ?? 0, icon: UserCheck, color: 'bg-blue-50 text-blue-600', link: '/admin/users' },
    { label: t('admin.suspendedUsers'), value: stats?.suspended_users ?? 0, icon: UserX, color: 'bg-stone-50 text-stone-600', link: '/admin/users' },
  ];

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('admin.dashboard')}</h1>
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState onRetry={() => window.location.reload()} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <Link
              key={card.label}
              to={card.link}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-all"
            >
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="mt-1 text-sm text-gray-500">{card.label}</p>
            </Link>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

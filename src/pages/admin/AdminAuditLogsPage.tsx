import { useState, useEffect } from 'react';
import { ScrollText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminLayout } from '@/layouts/AdminLayout';
import { LoadingState, EmptyState } from '@/components/States';
import { getAuditLogs } from '@/services/api';
import type { AuditLog } from '@/types';

export function AdminAuditLogsPage() {
  const { t } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAuditLogs().then((data) => {
      setLogs(data);
      setLoading(false);
    });
  }, []);

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('admin.auditLogs')}</h1>
      {loading ? (
        <LoadingState />
      ) : logs.length === 0 ? (
        <EmptyState title="No audit logs" />
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100">
                <ScrollText className="h-4 w-4 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{log.action}</p>
                {log.entity_type && (
                  <p className="text-xs text-gray-500">
                    {log.entity_type}
                    {log.entity_id && `: ${log.entity_id.slice(0, 8)}...`}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(log.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingState, EmptyState } from '@/components/States';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '@/services/api';
import type { Notification } from '@/types';

const NOTIF_ICONS: Record<string, string> = {
  NEARBY_FOUND: 'bg-teal-50 text-teal-600',
  POTENTIAL_MATCH: 'bg-blue-50 text-blue-600',
  CASE_UPDATE: 'bg-gray-50 text-gray-600',
  CHAT_MESSAGE: 'bg-cyan-50 text-cyan-600',
  CASE_CLOSED: 'bg-green-50 text-green-600',
  ADMIN_MESSAGE: 'bg-amber-50 text-amber-600',
};

export function NotificationsPage() {
  const { t } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    getNotifications().then((data) => {
      setNotifications(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    load();
  };

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id);
    load();
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">{t('nav.notifications')}</h1>
        {notifications.some((n) => !n.is_read) && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <CheckCheck className="h-4 w-4" />
            {t('notif.markAllRead')}
          </button>
        )}
      </div>

      {loading ? (
        <LoadingState />
      ) : notifications.length === 0 ? (
        <EmptyState title={t('notif.noNotifications')} />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => handleMarkRead(n.id)}
              className={`w-full text-left rounded-xl border p-4 transition-all ${
                n.is_read
                  ? 'border-gray-200 bg-white'
                  : 'border-blue-200 bg-blue-50/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${NOTIF_ICONS[n.type] ?? 'bg-gray-50 text-gray-600'}`}>
                  <Bell className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{n.title}</p>
                  {n.body && <p className="mt-0.5 text-sm text-gray-600">{n.body}</p>}
                  <p className="mt-1 text-xs text-gray-400">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>
                {!n.is_read && (
                  <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                )}
              </div>
              {n.data && typeof n.data === 'object' && 'case_id' in n.data && (
                <Link
                  to={`/cases/${n.data.case_id as string}`}
                  className="mt-2 inline-block text-xs font-medium text-blue-600 hover:text-blue-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  View case →
                </Link>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

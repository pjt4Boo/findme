import { useState, useEffect } from 'react';
import { Search, UserCheck, UserX, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminLayout } from '@/layouts/AdminLayout';
import { LoadingState, EmptyState } from '@/components/States';
import { getAllUsers, suspendUser, restoreUser, logAudit } from '@/services/api';
import type { Profile } from '@/types';

export function AdminUsersPage() {
  const { t } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = () => {
    getAllUsers().then((data) => {
      setUsers(data);
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const handleSuspend = async (userId: string) => {
    setActionLoading(userId);
    await suspendUser(userId);
    await logAudit('USER_SUSPENDED', 'profile', userId);
    setActionLoading(null);
    load();
  };

  const handleRestore = async (userId: string) => {
    setActionLoading(userId);
    await restoreUser(userId);
    await logAudit('USER_RESTORED', 'profile', userId);
    setActionLoading(null);
    load();
  };

  const filtered = users.filter((u) =>
    !search ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('admin.users')}</h1>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users by name or email..."
          className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
        />
      </div>

      {loading ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <EmptyState title="No users found" />
      ) : (
        <div className="space-y-2">
          {filtered.map((u) => (
            <div key={u.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
                  <Shield className="h-5 w-5 text-gray-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{u.full_name || 'Unnamed'}</p>
                  <p className="text-xs text-gray-500 truncate">{u.email}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">{u.role}</span>
                    <span className={`rounded px-1.5 py-0.5 text-xs ${
                      u.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {u.status}
                    </span>
                  </div>
                </div>
              </div>
              {u.role !== 'SUPER_ADMIN' && (
                <button
                  onClick={() => u.status === 'ACTIVE' ? handleSuspend(u.id) : handleRestore(u.id)}
                  disabled={actionLoading === u.id}
                  className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium disabled:opacity-50 ${
                    u.status === 'ACTIVE'
                      ? 'border border-red-300 text-red-600 hover:bg-red-50'
                      : 'border border-green-300 text-green-600 hover:bg-green-50'
                  }`}
                >
                  {u.status === 'ACTIVE' ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                  {u.status === 'ACTIVE' ? t('admin.suspend') : t('admin.restore')}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

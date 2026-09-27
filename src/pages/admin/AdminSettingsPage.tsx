import { useAuth } from '@/contexts/AuthContext';
import { AdminLayout } from '@/layouts/AdminLayout';
import { Settings } from 'lucide-react';

export function AdminSettingsPage() {
  const { t } = useAuth();
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('admin.settings')}</h1>
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
        <Settings className="mx-auto h-10 w-10 text-gray-300" />
        <p className="mt-3 text-sm text-gray-500">Platform settings will be available here in a future update.</p>
      </div>
    </AdminLayout>
  );
}

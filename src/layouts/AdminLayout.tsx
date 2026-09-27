import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Flag, Users, ScrollText, Settings, Heart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { ReactNode } from 'react';

export function AdminLayout({ children }: { children: ReactNode }) {
  const { t } = useAuth();

  const navItems = [
    { to: '/admin', label: t('admin.dashboard'), icon: LayoutDashboard, end: true },
    { to: '/admin/cases', label: t('admin.cases'), icon: FileText },
    { to: '/admin/pending', label: t('admin.pendingReview'), icon: FileText },
    { to: '/admin/reports', label: t('admin.reports'), icon: Flag },
    { to: '/admin/users', label: t('admin.users'), icon: Users },
    { to: '/admin/audit', label: t('admin.auditLogs'), icon: ScrollText },
    { to: '/admin/settings', label: t('admin.settings'), icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-56 flex-shrink-0">
            <div className="rounded-xl bg-white border border-gray-200 p-3 lg:sticky lg:top-6">
              <div className="flex items-center gap-2 px-2 py-2 mb-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
                  <Heart className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-gray-900">Admin Panel</span>
              </div>
              <nav className="flex lg:flex-col gap-1 overflow-x-auto">
                {navItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                        isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                      }`
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}

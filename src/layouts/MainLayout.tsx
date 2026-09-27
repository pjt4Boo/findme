import { NavLink, useNavigate } from 'react-router-dom';
import { Home, FileText, Bell, User, Shield, LogOut, Menu, X, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUnreadCount, subscribeToNotifications } from '@/services/api';
import type { UserRole } from '@/types';

const ADMIN_ROLES: UserRole[] = ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'];

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, signOut, t } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    getUnreadCount().then(setUnreadCount);
    const unsub = subscribeToNotifications(() => {
      getUnreadCount().then(setUnreadCount);
    });
    return unsub;
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navItems = [
    { to: '/', label: t('nav.home'), icon: Home, show: true },
    { to: '/my-cases', label: t('nav.myCases'), icon: FileText, show: !!user },
    { to: '/notifications', label: t('nav.notifications'), icon: Bell, show: !!user, badge: unreadCount },
    { to: '/profile', label: t('nav.profile'), icon: User, show: !!user },
    { to: '/admin', label: t('nav.admin'), icon: Shield, show: !!profile && ADMIN_ROLES.includes(profile.role) },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <NavLink to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">Find Me</span>
            </NavLink>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.filter((item) => item.show).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {item.badge ? (
                  <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                ) : null}
              </NavLink>
            ))}
            {user ? (
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                {t('nav.logout')}
              </button>
            ) : (
              <>
                <NavLink
                  to="/login"
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  {t('nav.login')}
                </NavLink>
                <NavLink
                  to="/register"
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  {t('nav.register')}
                </NavLink>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-gray-100 px-4 py-3 space-y-1">
            {navItems.filter((item) => item.show).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {item.badge ? (
                  <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white">
                    {item.badge}
                  </span>
                ) : null}
              </NavLink>
            ))}
            {user ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleSignOut();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                <LogOut className="h-4 w-4" />
                {t('nav.logout')}
              </button>
            ) : (
              <div className="flex gap-2 pt-2">
                <NavLink
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-center text-sm font-medium text-gray-700"
                >
                  {t('nav.login')}
                </NavLink>
                <NavLink
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 rounded-lg bg-blue-600 px-3 py-2.5 text-center text-sm font-medium text-white"
                >
                  {t('nav.register')}
                </NavLink>
              </div>
            )}
          </nav>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Find Me</span>
              <span className="text-sm text-gray-400">— Reconnecting families</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <NavLink to="/privacy" className="hover:text-gray-700 transition-colors">{t('nav.privacyPolicy')}</NavLink>
              <NavLink to="/terms" className="hover:text-gray-700 transition-colors">{t('nav.terms')}</NavLink>
              <NavLink to="/help" className="hover:text-gray-700 transition-colors">{t('nav.help')}</NavLink>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

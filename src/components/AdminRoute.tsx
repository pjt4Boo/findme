import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingState } from '@/components/States';
import type { UserRole } from '@/types';

export function AdminRoute({ children, roles }: { children: React.ReactNode; roles: UserRole[] }) {
  const { profile, loading } = useAuth();

  if (loading) return <LoadingState />;
  if (!profile) return <Navigate to="/login" replace />;
  if (!roles.includes(profile.role)) return <Navigate to="/forbidden" replace />;
  return <>{children}</>;
}

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { MainLayout } from '@/layouts/MainLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminRoute } from '@/components/AdminRoute';
import type { UserRole } from '@/types';

// Pages
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { NearbyCasesPage } from '@/pages/NearbyCasesPage';
import { CaseDetailsPage } from '@/pages/CaseDetailsPage';
import { MatchesPage } from '@/pages/MatchesPage';
import { MyCasesPage } from '@/pages/MyCasesPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { ChatPage } from '@/pages/ChatPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { ReportFoundPage } from '@/pages/ReportFoundPage';
import { ReportMissingPage } from '@/pages/ReportMissingPage';
import { PrivacyPolicyPage } from '@/pages/PrivacyPolicyPage';
import { TermsPage } from '@/pages/TermsPage';
import { HelpPage } from '@/pages/HelpPage';
import { NotFoundPage, UnauthorizedPage, ForbiddenPage } from '@/pages/ErrorPages';

// Admin pages
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminCasesPage, AdminPendingPage } from '@/pages/admin/AdminCasesPage';
import { AdminReportsPage } from '@/pages/admin/AdminReportsPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { AdminAuditLogsPage } from '@/pages/admin/AdminAuditLogsPage';
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage';

const ADMIN_ROLES: UserRole[] = ['MODERATOR', 'ADMIN', 'SUPER_ADMIN'];

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth routes (no layout) */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Main routes with layout */}
          <Route path="/" element={<MainLayout><LandingPage /></MainLayout>} />
          <Route path="/nearby" element={<MainLayout><NearbyCasesPage /></MainLayout>} />
          <Route path="/cases/:id" element={<MainLayout><CaseDetailsPage /></MainLayout>} />
          <Route path="/privacy" element={<MainLayout><PrivacyPolicyPage /></MainLayout>} />
          <Route path="/terms" element={<MainLayout><TermsPage /></MainLayout>} />
          <Route path="/help" element={<MainLayout><HelpPage /></MainLayout>} />

          {/* Protected routes */}
          <Route path="/report-found" element={
            <ProtectedRoute><MainLayout><ReportFoundPage /></MainLayout></ProtectedRoute>
          } />
          <Route path="/report-missing" element={
            <ProtectedRoute><MainLayout><ReportMissingPage /></MainLayout></ProtectedRoute>
          } />
          <Route path="/my-cases" element={
            <ProtectedRoute><MainLayout><MyCasesPage /></MainLayout></ProtectedRoute>
          } />
          <Route path="/cases/:id/matches" element={
            <ProtectedRoute><MainLayout><MatchesPage /></MainLayout></ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute><MainLayout><NotificationsPage /></MainLayout></ProtectedRoute>
          } />
          <Route path="/chat/:id" element={
            <ProtectedRoute><MainLayout><ChatPage /></MainLayout></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><MainLayout><ProfilePage /></MainLayout></ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin" element={
            <AdminRoute roles={ADMIN_ROLES}><AdminDashboardPage /></AdminRoute>
          } />
          <Route path="/admin/cases" element={
            <AdminRoute roles={ADMIN_ROLES}><AdminCasesPage /></AdminRoute>
          } />
          <Route path="/admin/pending" element={
            <AdminRoute roles={ADMIN_ROLES}><AdminPendingPage /></AdminRoute>
          } />
          <Route path="/admin/reports" element={
            <AdminRoute roles={ADMIN_ROLES}><AdminReportsPage /></AdminRoute>
          } />
          <Route path="/admin/users" element={
            <AdminRoute roles={ADMIN_ROLES}><AdminUsersPage /></AdminRoute>
          } />
          <Route path="/admin/audit" element={
            <AdminRoute roles={ADMIN_ROLES}><AdminAuditLogsPage /></AdminRoute>
          } />
          <Route path="/admin/settings" element={
            <AdminRoute roles={ADMIN_ROLES}><AdminSettingsPage /></AdminRoute>
          } />

          {/* Error routes */}
          <Route path="/unauthorized" element={<MainLayout><UnauthorizedPage /></MainLayout>} />
          <Route path="/forbidden" element={<MainLayout><ForbiddenPage /></MainLayout>} />
          <Route path="*" element={<MainLayout><NotFoundPage /></MainLayout>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

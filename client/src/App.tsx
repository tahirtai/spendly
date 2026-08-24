import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { SplashScreen } from './components/SplashScreen';
import { useAuthStore } from './store/useAuthStore';

// Modules
import { LandingView } from './modules/landing/LandingView';
import { LoginView } from './modules/auth/LoginView';
import { RegisterView } from './modules/auth/RegisterView';
import { DashboardView } from './modules/dashboard/DashboardView';
import { TiffinView } from './modules/tiffin/TiffinView';
import { ExpensesView } from './modules/expenses/ExpensesView';
import { PaymentsView } from './modules/payments/PaymentsView';
import { HistoryView } from './modules/history/HistoryView';
import { ReportsView } from './modules/reports/ReportsView';
import { AdminView } from './modules/admin/AdminView';
import { ProfileView } from './modules/profile/ProfileView';

// Root Route Wrapper — redirects authenticated users to their dashboard/admin home,
// while showing LandingView for unauthenticated users after session initialization completes.
const RootRoute: React.FC = () => {
  const { isAuthenticated, user, isInitializing } = useAuthStore();

  if (isInitializing) return null;

  if (isAuthenticated && user) {
    const target = (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') ? '/admin' : '/dashboard';
    return <Navigate to={target} replace />;
  }

  return <LandingView />;
};

// Protected Route Wrapper — wraps content in the full mobile app shell
const ProtectedLayout: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, user, isInitializing } = useAuthStore();

  // Wait for session restoration before making any routing decisions.
  // The SplashScreen is rendered on top of everything during this period,
  // so the user sees no flash of an empty screen or a premature /login redirect.
  if (isInitializing) return null;

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <AppShell>{children}</AppShell>;
};

export const App: React.FC = () => {
  const checkSession = useAuthStore((s) => s.checkSession);

  // Restore the existing Supabase session once on application startup.
  // checkSession() reads from the Supabase client's localStorage entry,
  // refreshes the access token if needed, and sets isInitializing:false.
  useEffect(() => {
    checkSession();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <SplashScreen />
      <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<RootRoute />} />
        <Route path="/login" element={<LoginView />} />
        <Route path="/register" element={<RegisterView />} />

        {/* Student & Member Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedLayout>
              <DashboardView />
            </ProtectedLayout>
          }
        />
        <Route
          path="/tiffin"
          element={
            <ProtectedLayout>
              <TiffinView />
            </ProtectedLayout>
          }
        />
        <Route
          path="/expenses"
          element={
            <ProtectedLayout>
              <ExpensesView />
            </ProtectedLayout>
          }
        />
        <Route
          path="/payments"
          element={
            <ProtectedLayout>
              <PaymentsView />
            </ProtectedLayout>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedLayout>
              <HistoryView />
            </ProtectedLayout>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedLayout>
              <ReportsView />
            </ProtectedLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedLayout>
              <ProfileView />
            </ProtectedLayout>
          }
        />

        {/* Admin & Super Admin Protected Route */}
        <Route
          path="/admin"
          element={
            <ProtectedLayout allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
              <AdminView />
            </ProtectedLayout>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
    </>
  );
};

export default App;

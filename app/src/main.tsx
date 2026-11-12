import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate, Outlet, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App';
import DocsPage from './routes/docs/DocsPage';
import SignInPage from './pages/SignInPage';
import PendingVerificationPage from './pages/PendingVerificationPage';
import { ReservedPortalPage } from './pages/ReservedPortalPage';
import StyleguidePage from './pages/StyleguidePage';
import {
  ButtonsClassifiedPage,
  BadgesClassifiedPage,
  FormsClassifiedPage,
  CardsClassifiedPage,
  TablesClassifiedPage,
  NavigationClassifiedPage,
  ModalsClassifiedPage,
  ColorsTypographyClassifiedPage,
  ChatsAuthClassifiedPage,
} from './pages/ClassifiedComponentPages';
import { FacultyStudentsPage } from './pages/faculty/FacultyStudentsPage';
import { FacultyDashboardPage } from './pages/faculty/FacultyDashboardPage';
import { FacultyChatPage } from './pages/faculty/FacultyChatPage';
import { AdminApprovalQueuePage } from './pages/admin/AdminApprovalQueuePage';
import { AdminTaxonomyPage } from './pages/admin/AdminTaxonomyPage';
import { AdminAuditLogPage } from './pages/admin/AdminAuditLogPage';
import { ThemeProvider } from './context/ThemeContext';
import { SessionProvider } from './context/SessionContext';
import { useSession } from './context/SessionContext';

function GuardLoading() {
  return <main className="contract-auth-page" aria-busy="true"><p>Checking your account…</p></main>;
}

function RequireAuth() {
  const { session, profile, mockRole, loading, error } = useSession();
  const location = useLocation();

  if (loading) return <GuardLoading />;
  if (!session && !(mockRole && profile)) {
    const redirect = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={`/signin?redirect=${encodeURIComponent(redirect)}`} replace />;
  }
  if (profile?.status === 'pending') {
    return <Navigate to="/pending-verification" replace />;
  }
  if (error && !profile) {
    return <main className="contract-auth-page"><p role="alert">Unable to load your account: {error.message}</p></main>;
  }

  return <Outlet />;
}

function RequireRole({ role }: { role: 'faculty' | 'admin' }) {
  const { profile } = useSession();

  if (!profile) return <Navigate to="/pending-verification" replace />;
  if (profile.role !== role) {
    return <Navigate to={profile.role === 'admin' ? '/admin/dashboard' : '/faculty/dashboard'} replace />;
  }

  return <Outlet />;
}

// Ensure the browser does not restore previous scroll position on refresh
if (typeof window !== 'undefined') {
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }
  if (window.location.hash) {
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }
  window.scrollTo(0, 0);

  window.addEventListener('beforeunload', () => {
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    window.scrollTo(0, 0);
  });
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    const t1 = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 0);

    const t2 = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 50);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [pathname]);

  return null;
}

function RootLayout() {
  const { mockRole, setMockRole } = useSession();
  return (
    <>
      <ScrollToTop />
      <Outlet />
      {mockRole !== null && (
        <label style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 1000, display: 'grid', gap: 4, padding: 10, background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 8 }}>
          <span style={{ fontSize: 12 }}>Mock role</span>
          <select aria-label="Mock role" value={mockRole} onChange={(event) => setMockRole(event.target.value as 'active' | 'pending' | 'admin')}>
            <option value="active">Active Faculty</option>
            <option value="pending">Pending Faculty</option>
            <option value="admin">Admin</option>
          </select>
        </label>
      )}
    </>
  );
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes for page data caching across route revisits
      gcTime: 1000 * 60 * 30, // Keep in memory for 30 minutes across route changes
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    },
  },
});

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <App /> },
      { path: '/docs', element: <DocsPage /> },
      { path: '/signin', element: <SignInPage /> },
      { path: '/login', element: <SignInPage /> },
      { path: '/pending-verification', element: <PendingVerificationPage /> },
      { path: '/styleguide', element: <StyleguidePage /> },
      { path: '/design-system', element: <Navigate to="/styleguide" replace /> },
      // Faculty Portal Routes
      {
        path: '/faculty',
        element: <RequireAuth />,
        children: [{
          element: <RequireRole role="faculty" />,
          children: [
            { index: true, element: <Navigate to="/faculty/dashboard" replace /> },
            { path: 'dashboard', element: <FacultyDashboardPage /> },
            { path: 'students', element: <FacultyStudentsPage /> },
            {
              path: 'students/:id',
              element: (
                <ReservedPortalPage
                  role="faculty"
                  navKey="students"
                  title="Student Profile"
                  breadcrumb="Faculty Portal / Student Profile"
                />
              ),
            },
            { path: 'chat', element: <FacultyChatPage /> },
            { path: 'departments', element: <AdminTaxonomyPage mode="departments" /> },
            { path: 'programs', element: <AdminTaxonomyPage mode="programs" /> },
            { path: 'applications', element: <AdminApprovalQueuePage /> },
          ],
        }],
      },
      // Admin Portal Routes
      {
        path: '/admin',
        element: <RequireAuth />,
        children: [{
          element: <RequireRole role="admin" />,
          children: [
            { index: true, element: <Navigate to="/admin/dashboard" replace /> },
            { path: 'dashboard', element: <AdminApprovalQueuePage /> },
            { path: 'applications', element: <AdminApprovalQueuePage /> },
            { path: 'students', element: <FacultyStudentsPage /> },
            { path: 'departments', element: <AdminTaxonomyPage mode="departments" /> },
            { path: 'programs', element: <AdminTaxonomyPage mode="programs" /> },
            { path: 'audit-log', element: <AdminAuditLogPage /> },
            {
              path: 'faculty',
              element: (
                <ReservedPortalPage
                  role="admin"
                  navKey="faculty"
                  title="Faculty Management"
                  breadcrumb="Admin Portal / Faculty Management"
                />
              ),
            },
          ],
        }],
      },
      // Classified Component Visualization Pages
      { path: '/components', element: <Navigate to="/components/buttons" replace /> },
      { path: '/components/buttons', element: <ButtonsClassifiedPage /> },
      { path: '/components/badges', element: <BadgesClassifiedPage /> },
      { path: '/components/forms', element: <FormsClassifiedPage /> },
      { path: '/components/cards', element: <CardsClassifiedPage /> },
      { path: '/components/tables', element: <TablesClassifiedPage /> },
      { path: '/components/navigation', element: <NavigationClassifiedPage /> },
      { path: '/components/modals', element: <ModalsClassifiedPage /> },
      { path: '/components/colors-typography', element: <ColorsTypographyClassifiedPage /> },
      { path: '/components/chats-auth', element: <ChatsAuthClassifiedPage /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <ThemeProvider>
          <RouterProvider router={router} />
        </ThemeProvider>
      </SessionProvider>
    </QueryClientProvider>
  </StrictMode>
);

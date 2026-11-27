import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate, Outlet, matchPath, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import './pages/auth/signin.css';
import './pages/auth/backgrounds/grid.css';
import './pages/auth/backgrounds/pixel.css';
import './pages/auth/info.css';
import './pages/auth/pending-verification.css';
import './pages/auth/signup-terms.css';
import DocsPage from './routes/docs/DocsPage';
import SignInPage from './pages/auth/SignInPage';
import SignUpPage from './pages/auth/SignUpPage';
import PendingVerificationPage from './pages/auth/PendingVerificationPage';
import AboutPage from './pages/auth/AboutPage';
import TermsPage from './pages/auth/TermsPage';
import PrivacyPolicyPage from './pages/auth/PrivacyPolicyPage';
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
import { FacultyStudentDetailPage } from './pages/faculty/FacultyStudentDetailPage';
import { FacultyDashboardPage } from './pages/faculty/FacultyDashboardPage';
import { FacultyChatPage } from './pages/faculty/FacultyChatPage';
import { AdminApprovalQueuePage } from './pages/admin/AdminApprovalQueuePage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminTaxonomyManagementPage } from './pages/admin/AdminTaxonomyManagementPage';
import { FacultyApplicationsPage } from './pages/faculty/FacultyApplicationsPage';
import { FacultyTaxonomyPage } from './pages/faculty/FacultyTaxonomyPage';
import { AdminFacultyPage } from './pages/admin/AdminFacultyPage';
import { AdminStudentsPage } from './pages/admin/AdminStudentsPage';
import { AdminAuditLogPage } from './pages/admin/AdminAuditLogPage';
import { ThemeProvider } from './context/ThemeContext';
import { SessionProvider } from './context/SessionContext';
import { useSession } from './context/SessionContext';
import { ChatProvider } from './context/ChatContext';
import { isLocalMockAuth } from './lib/supabase';

function GuardLoading() {
  return <main className="contract-auth-page" aria-busy="true"><p>Checking your account…</p></main>;
}

export function RequireAuth() {
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

export function RequireRole({ role }: { role: 'faculty' | 'admin' }) {
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
  window.scrollTo(0, 0);

  window.addEventListener('beforeunload', () => {
    window.scrollTo(0, 0);
  });
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
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
  const location = useLocation();
  const showMockRole = !['/', '/signin', '/login', '/signup'].includes(location.pathname);
  // Keep the mock-role control above the bottom-right version label.
  const isAdminFaculty = Boolean(matchPath('/admin/faculty', location.pathname));
  const mockRoleBottom = isAdminFaculty ? 'var(--faculty-mock-role-bottom, 56px)' : 56;
  return (
    <>
      <ScrollToTop />
      <Outlet />
      {mockRole !== null && showMockRole && (
        <label className={isAdminFaculty ? 'admin-faculty-mock-role' : undefined} style={{ position: 'fixed', right: 24, bottom: mockRoleBottom, zIndex: 1000, display: 'grid', gap: 4, padding: 10, background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 8 }}>
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
      { path: '/', element: <SignInPage /> },
      { path: '/docs', element: <DocsPage /> },
      { path: '/signin', element: <SignInPage /> },
      { path: '/login', element: <SignInPage /> },
      { path: '/signup', element: <SignUpPage /> },
      { path: '/pending-verification', element: <PendingVerificationPage /> },
      { path: '/about', element: <AboutPage /> },
      { path: '/terms', element: <TermsPage /> },
      { path: '/privacy-policy', element: <PrivacyPolicyPage /> },
      { path: '/privacy', element: <Navigate to="/privacy-policy" replace /> },
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
              element: <FacultyStudentDetailPage />,
            },
            {
              path: 'students/:id/new-review',
              element: <FacultyStudentDetailPage />,
            },
            { path: 'chat', element: <FacultyChatPage /> },
            { path: 'departments', element: <FacultyTaxonomyPage mode="departments" /> },
            { path: 'programs', element: <FacultyTaxonomyPage mode="programs" /> },
            { path: 'applications', element: <FacultyApplicationsPage /> },
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
            { path: 'dashboard', element: <AdminDashboardPage /> },
            { path: 'applications', element: <AdminApprovalQueuePage /> },
            { path: 'students', element: <AdminStudentsPage /> },
            { path: 'departments', element: <AdminTaxonomyManagementPage mode="departments" /> },
            { path: 'programs', element: <AdminTaxonomyManagementPage mode="programs" /> },
            { path: 'audit-log', element: <AdminAuditLogPage /> },
            { path: 'faculty', element: <AdminFacultyPage /> },
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

async function startApp() {
  const root = document.getElementById('root')!;
  if (import.meta.env.DEV && isLocalMockAuth &&
      ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname)) {
    try {
      const { waitForLocalMocks } = await import('./mocks/browser');
      await waitForLocalMocks();
    } catch (error) {
      console.error('Unable to start local API mocks.', error);
      root.textContent = 'Unable to start local API mocks. Check service worker permissions and reload.';
      return;
    }
  }

  createRoot(root).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <ThemeProvider>
            <ChatProvider>
              <RouterProvider router={router} />
            </ChatProvider>
          </ThemeProvider>
        </SessionProvider>
      </QueryClientProvider>
    </StrictMode>
  );
}

void startApp();

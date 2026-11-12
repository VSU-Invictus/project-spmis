import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate, Outlet, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App';
import DocsPage from './routes/docs/DocsPage';
import SignInPage from './pages/SignInPage';
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
  return (
    <>
      <ScrollToTop />
      <Outlet />
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
      { path: '/styleguide', element: <StyleguidePage /> },
      { path: '/design-system', element: <Navigate to="/styleguide" replace /> },
      // Faculty Portal Routes
      { path: '/faculty', element: <Navigate to="/faculty/dashboard" replace /> },
      { path: '/faculty/dashboard', element: <FacultyDashboardPage /> },
      { path: '/faculty/students', element: <FacultyStudentsPage /> },
      { path: '/faculty/chat', element: <FacultyChatPage /> },
      { path: '/faculty/departments', element: <AdminTaxonomyPage mode="departments" /> },
      { path: '/faculty/programs', element: <AdminTaxonomyPage mode="programs" /> },
      { path: '/faculty/applications', element: <AdminApprovalQueuePage /> },
      // Admin Portal Routes
      { path: '/admin', element: <Navigate to="/admin/dashboard" replace /> },
      { path: '/admin/dashboard', element: <AdminApprovalQueuePage /> },
      { path: '/admin/applications', element: <AdminApprovalQueuePage /> },
      { path: '/admin/students', element: <FacultyStudentsPage /> },
      { path: '/admin/departments', element: <AdminTaxonomyPage mode="departments" /> },
      { path: '/admin/programs', element: <AdminTaxonomyPage mode="programs" /> },
      { path: '/admin/audit-log', element: <AdminAuditLogPage /> },
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

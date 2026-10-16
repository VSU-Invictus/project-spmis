import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App';
import StyleguidePage from './pages/StyleguidePage';
import {
  AdminDashboardPage,
  AdminApplicationViewPage,
  AdminEntityPage,
  FacultyPortalPage,
} from './pages/AdminPortalPages';
import { ThemeProvider } from './context/ThemeContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/styleguide', element: <StyleguidePage /> },
  { path: '/design-system', element: <Navigate to="/styleguide" replace /> },
  // Admin Portal & Application Queue Views (Issues #110, #111, #112)
  { path: '/admin', element: <Navigate to="/admin/dashboard" replace /> },
  { path: '/admin/dashboard', element: <AdminDashboardPage /> },
  { path: '/admin/students', element: <AdminEntityPage section="students" /> },
  { path: '/admin/departments', element: <AdminEntityPage section="departments" /> },
  { path: '/admin/programs', element: <AdminEntityPage section="programs" /> },
  { path: '/admin/faculty', element: <AdminEntityPage section="faculty" /> },
  { path: '/admin/audit-log', element: <AdminEntityPage section="audit-log" /> },
  { path: '/admin/student-applications', element: <AdminApplicationViewPage type="student" /> },
  { path: '/admin/department-applications', element: <AdminApplicationViewPage type="department" /> },
  { path: '/admin/program-applications', element: <AdminApplicationViewPage type="program" /> },
  { path: '/admin/faculty-applications', element: <AdminApplicationViewPage type="faculty" /> },
  // Faculty Portal Views (Issue #111)
  { path: '/faculty', element: <Navigate to="/faculty/dashboard" replace /> },
  { path: '/faculty/dashboard', element: <FacultyPortalPage section="dashboard" /> },
  { path: '/faculty/students', element: <FacultyPortalPage section="students" /> },
  { path: '/faculty/chat', element: <FacultyPortalPage section="chat" /> },
  { path: '/faculty/programs', element: <FacultyPortalPage section="programs" /> },
  { path: '/faculty/departments', element: <FacultyPortalPage section="departments" /> },
  { path: '/faculty/applications', element: <FacultyPortalPage section="applications" /> },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);

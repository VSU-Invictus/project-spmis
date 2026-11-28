// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { delay, http, HttpResponse } from 'msw';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import { SessionContext, type SessionContextValue } from '../../context/SessionContext';
import { ThemeProvider } from '../../context/ThemeContext';
import { waitForAuditLogMock } from '../../mocks/browser';
import { server } from '../../mocks/server';
import { AdminAuditLogPage } from './AdminAuditLogPage';
import { AdminDashboardPage } from './AdminDashboardPage';

const adminSession: SessionContextValue = {
  session: null,
  profile: {
    id: 'b6f6d2fb-1536-4d80-8599-337eaa8ec3ab',
    role: 'admin',
    status: 'active',
    email: 'admin@example.edu',
    full_name: 'SPMIS Administrator',
    department_id: '5c52a935-befa-4e5f-8bc9-ef4ea9bf5ccb',
    created_at: '2026-10-26T00:00:00Z',
    updated_at: '2026-10-26T00:00:00Z',
  },
  role: 'admin',
  status: 'active',
  mockRole: null,
  loading: false,
  error: null,
  setMockRole: vi.fn(),
  syncProfile: vi.fn(),
  refreshProfile: async () => null, signOut: vi.fn().mockResolvedValue(undefined),
};

vi.mock('../../mocks/browser', () => ({ waitForAuditLogMock: vi.fn() }));

afterEach(() => {
  cleanup();
  vi.mocked(waitForAuditLogMock).mockReset();
});

function renderDashboard() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <SessionContext.Provider value={adminSession}>
        <ThemeProvider>
          <MemoryRouter initialEntries={['/admin/dashboard']}>
            <Routes>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/audit-log" element={<AdminAuditLogPage />} />
            </Routes>
          </MemoryRouter>
        </ThemeProvider>
      </SessionContext.Provider>
    </QueryClientProvider>,
  );
  return within(screen.getByRole('complementary', { name: 'System Activity Log' }));
}

it('uses the total from the existing audit fixture and preserves the full-log link', async () => {
  const activity = renderDashboard();
  expect(await activity.findByText('Showing 1 of 1 log')).toBeInTheDocument();
  const link = activity.getByRole('link', { name: /View All Logs/ });
  expect(link).toHaveAttribute('href', '/admin/audit-log');
  fireEvent.click(link);
  expect(await screen.findByRole('heading', { name: 'System Audit Trail' })).toBeInTheDocument();
  expect(await screen.findByRole('cell', { name: 'review.created' })).toBeInTheDocument();
});

it('keeps the Dashboard interactive while the audit worker is starting', async () => {
  let release!: () => void;
  vi.mocked(waitForAuditLogMock).mockReturnValue(new Promise<void>(resolve => { release = resolve; }));

  const activity = renderDashboard();
  expect(activity.getByRole('status')).toHaveTextContent('Loading audit events');
  expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: /Requires review/ })).toHaveLength(4);
  expect(await screen.findByRole('table', { name: 'Pending approval applications' })).toBeInTheDocument();
  expect(screen.getByText('System Version 0.1.0')).toBeInTheDocument();

  const initialTheme = document.documentElement.dataset.theme;
  const toggle = screen.getByRole('button', { name: 'Toggle theme' });
  fireEvent.click(toggle);
  expect(document.documentElement.dataset.theme).not.toBe(initialTheme);
  fireEvent.click(toggle);
  expect(document.documentElement.dataset.theme).toBe(initialTheme);

  release();
  expect(await activity.findByText('Showing 1 of 1 log')).toBeInTheDocument();
});

it.each([
  [0, '*/0', 'Showing 0 of 0 logs'],
  [1, '0-0/1', 'Showing 1 of 1 log'],
  [1, '0-0/9', 'Showing 1 of 9 logs'],
  [3, '0-2/9', 'Showing 3 of 9 logs'],
  [1, null, 'Showing 1 log'],
  [1, '0-0/*', 'Showing 1 log'],
  [1, '0-19/73', 'Showing 1 log'],
  [3, '0-2/2', 'Showing 3 logs'],
])('shows the count for %i audit entries with Content-Range %s', async (rows, range, label) => {
  const auditRequest = vi.fn();
  server.use(http.get('*/rest/v1/audit_log_entries', async ({ request }) => {
    auditRequest(new URL(request.url).searchParams.get('limit'), request.headers.get('Prefer'));
    await delay(20);
    return HttpResponse.json(Array.from({ length: rows }, (_, id) => ({
      id: String(id),
      created_at: '2026-10-26T00:00:00Z',
      action: 'review.created',
      actor_role: 'faculty',
      entity_type: 'review',
    })), { headers: range ? { 'Content-Range': range } : {} });
  }));

  const activity = renderDashboard();
  expect(activity.getByRole('status')).toBeInTheDocument();
  expect(activity.queryByText(/^Showing/)).toBeNull();
  expect(await activity.findByText(label)).toBeInTheDocument();
  expect(activity.queryAllByRole('article')).toHaveLength(rows);
  if (rows === 0) expect(activity.getByText(/No recent audit events/)).toBeInTheDocument();
  expect(auditRequest).toHaveBeenCalledExactlyOnceWith('3', 'count=exact');
});

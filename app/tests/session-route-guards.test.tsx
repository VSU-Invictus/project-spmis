// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import {
  SessionContext,
  type SessionContextValue,
} from '../src/context/SessionContext';

vi.mock('react-dom/client', () => ({
  createRoot: () => ({
    render: vi.fn(),
  }),
}));

let RequireAuth: typeof import('../src/main').RequireAuth;
let RequireRole: typeof import('../src/main').RequireRole;

beforeAll(async () => {
  Object.defineProperty(window, 'scrollTo', {
    value: vi.fn(),
    writable: true,
  });

  const main = await import('../src/main');
  RequireAuth = main.RequireAuth;
  RequireRole = main.RequireRole;
});

afterEach(() => {
  cleanup();
});

const facultyProfile = {
  id: 'e48adc9e-1b79-4b92-9848-aa12b25d63d7',
  email: 'alex.reyes@example.edu',
  full_name: 'Alex Reyes',
  department_id: '5c52a935-befa-4e5f-8bc9-ef4ea9bf5ccb',
  role: 'faculty' as const,
  status: 'active' as const,
  created_at: '2026-10-26T00:00:00Z',
  updated_at: '2026-10-26T00:00:00Z',
};

const unauthenticatedSession: SessionContextValue = {
  session: null,
  profile: null,
  role: null,
  status: null,
  loading: false,
  error: null,
  mockRole: null,
  setMockRole: () => undefined,
  syncProfile: () => undefined,
};

describe('route protection guards', () => {
  it('redirects unauthenticated users to /signin', async () => {
    render(
      <SessionContext.Provider value={unauthenticatedSession}>
        <MemoryRouter initialEntries={['/faculty/dashboard']}>
          <Routes>
            <Route element={<RequireAuth />}>
              <Route
                path="/faculty/dashboard"
                element={<p>Protected faculty page</p>}
              />
            </Route>

            <Route path="/signin" element={<p>Sign in page</p>} />
          </Routes>
        </MemoryRouter>
      </SessionContext.Provider>,
    );

    expect(await screen.findByText('Sign in page')).toBeInTheDocument();
    expect(
      screen.queryByText('Protected faculty page'),
    ).not.toBeInTheDocument();
  });

  it('redirects pending faculty to /pending-verification', async () => {
    const pendingSession: SessionContextValue = {
      ...unauthenticatedSession,
      profile: {
        ...facultyProfile,
        status: 'pending',
      },
      role: 'faculty',
      status: 'pending',
      mockRole: 'pending',
    };

    render(
      <SessionContext.Provider value={pendingSession}>
        <MemoryRouter initialEntries={['/faculty/dashboard']}>
          <Routes>
            <Route element={<RequireAuth />}>
              <Route
                path="/faculty/dashboard"
                element={<p>Protected faculty page</p>}
              />
            </Route>

            <Route
              path="/pending-verification"
              element={<p>Pending verification page</p>}
            />
          </Routes>
        </MemoryRouter>
      </SessionContext.Provider>,
    );

    expect(
      await screen.findByText('Pending verification page'),
    ).toBeInTheDocument();

    expect(
      screen.queryByText('Protected faculty page'),
    ).not.toBeInTheDocument();
  });

  it('blocks active faculty from admin routes', async () => {
    const activeFacultySession: SessionContextValue = {
      ...unauthenticatedSession,
      profile: facultyProfile,
      role: 'faculty',
      status: 'active',
      mockRole: 'active',
    };

    render(
      <SessionContext.Provider value={activeFacultySession}>
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <Routes>
            <Route element={<RequireRole role="admin" />}>
              <Route
                path="/admin/dashboard"
                element={<p>Admin dashboard</p>}
              />
            </Route>

            <Route
              path="/faculty/dashboard"
              element={<p>Faculty dashboard</p>}
            />
          </Routes>
        </MemoryRouter>
      </SessionContext.Provider>,
    );

    expect(
      await screen.findByText('Faculty dashboard'),
    ).toBeInTheDocument();

    expect(
      screen.queryByText('Admin dashboard'),
    ).not.toBeInTheDocument();
  });
});
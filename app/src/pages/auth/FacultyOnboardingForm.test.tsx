// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { useState, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import type { Session } from '@supabase/supabase-js';
import PendingVerificationPage from './PendingVerificationPage';
import { SessionContext, type FacultyProfile, type SessionContextValue } from '../../context/SessionContext';
import { __resetMocks } from '../../mocks/handlers';
import { server } from '../../mocks/server';

const CS_DEPARTMENT_ID = '5c52a935-befa-4e5f-8bc9-ef4ea9bf5ccb';
const session = { access_token: 'token', user: { id: 'u1', user_metadata: { full_name: 'Google Applicant' } } } as unknown as Session;

afterEach(() => cleanup());
beforeEach(() => __resetMocks());

function Harness({ initialProfile = null, children }: { initialProfile?: FacultyProfile | null; children: ReactNode }) {
  const [profile, setProfile] = useState<FacultyProfile | null>(initialProfile);
  const value: SessionContextValue = {
    session, profile, role: profile?.role ?? null, status: profile?.status ?? null, loading: false, error: null,
    mockRole: null, setMockRole: () => undefined, syncProfile: setProfile,
    refreshProfile: async () => profile, signOut: async () => undefined,
  };
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

function renderPage(initialProfile: FacultyProfile | null = null) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <Harness initialProfile={initialProfile}>
        <MemoryRouter initialEntries={['/pending-verification']}><PendingVerificationPage /></MemoryRouter>
      </Harness>
    </QueryClientProvider>,
  );
}

describe('Google OAuth faculty onboarding', () => {
  it('submits the registration and transitions to the pending verification screen', async () => {
    const user = userEvent.setup();
    let body: unknown;
    server.events.on('request:start', async ({ request }) => {
      if (request.method === 'POST' && request.url.includes('/functions/v1/faculty-onboarding')) body = await request.clone().json();
    });
    renderPage();
    expect(screen.getByRole('heading', { name: 'Complete Faculty Registration' })).toBeInTheDocument();
    expect(screen.getByLabelText('Full Name')).toHaveValue('Google Applicant');
    await screen.findByRole('option', { name: 'Computer Science' });
    await user.selectOptions(screen.getByLabelText('Department'), CS_DEPARTMENT_ID);
    await user.click(screen.getByRole('button', { name: 'Submit Registration' }));
    expect(await screen.findByRole('heading', { name: 'Account Pending Verification' })).toBeInTheDocument();
    expect(body).toEqual({ full_name: 'Google Applicant', department_id: CS_DEPARTMENT_ID });
    server.events.removeAllListeners();
  });

  it('keeps showing pending verification for an existing pending profile', () => {
    renderPage({
      id: 'p1', email: 'a@example.test', full_name: 'A', department_id: CS_DEPARTMENT_ID, role: 'faculty',
      status: 'pending', created_at: '2026-11-27T00:00:00Z', updated_at: '2026-11-27T00:00:00Z',
    });
    expect(screen.getByRole('heading', { name: 'Account Pending Verification' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Submit Registration' })).not.toBeInTheDocument();
  });

  it('shows a client-side validation error for a blank name', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByRole('option', { name: 'Computer Science' });
    await user.clear(screen.getByLabelText('Full Name'));
    await user.click(screen.getByRole('button', { name: 'Submit Registration' }));
    expect(await screen.findByText('Enter your full name.')).toBeInTheDocument();
  });

  it.each([
    [409, 'CONFLICT', /already exists for this account/i],
    [422, 'VALIDATION_ERROR', /The faculty name or department is invalid/i],
  ])('shows the %s server error inline and preserves input', async (status, code, message) => {
    server.use(http.post('*/functions/v1/faculty-onboarding', () => HttpResponse.json(
      { code, message: 'The faculty name or department is invalid.', details: null, hint: null }, { status })));
    const user = userEvent.setup();
    renderPage();
    await screen.findByRole('option', { name: 'Computer Science' });
    await user.selectOptions(screen.getByLabelText('Department'), CS_DEPARTMENT_ID);
    await user.click(screen.getByRole('button', { name: 'Submit Registration' }));
    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(screen.getByLabelText('Full Name')).toHaveValue('Google Applicant');
  });
});

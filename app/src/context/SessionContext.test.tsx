// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

type AuthCallback = (event: AuthChangeEvent, session: Session | null) => void;

const mockState = vi.hoisted(() => ({
  authCallback: null as AuthCallback | null,
  signOut: vi.fn(async () => ({ error: null })),
  unsubscribe: vi.fn(),
  getOwnProfile: vi.fn(),
}));

vi.mock('../lib/supabase', () => ({
  isLocalMockAuth: false,
  supabase: {
    auth: {
      onAuthStateChange: (cb: AuthCallback) => {
        mockState.authCallback = cb;
        return { data: { subscription: { unsubscribe: mockState.unsubscribe } } };
      },
      signOut: mockState.signOut,
    },
  },
}));

vi.mock('../lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../lib/api')>();
  return {
    ...actual,
    apiClient: {
      GET: vi.fn(() => Promise.resolve({ data: mockState.getOwnProfile(), error: undefined })),
    },
    request: vi.fn(async (promise: Promise<{ data: unknown }>) => (await promise).data),
  };
});

import { SessionProvider, useSession, type FacultyProfile } from './SessionContext';

const makeProfile = (id: string, name: string): FacultyProfile => ({
  id,
  email: `${id}@example.edu`,
  full_name: name,
  department_id: '5c52a935-befa-4e5f-8bc9-ef4ea9bf5ccb',
  role: 'faculty',
  status: 'active',
  created_at: '2026-10-26T00:00:00Z',
  updated_at: '2026-10-26T00:00:00Z',
});

const makeSession = (userId: string, token = 'tok-1'): Session =>
  ({ access_token: token, user: { id: userId } }) as unknown as Session;

function DraftFormProbe() {
  const { loading, profile, signOut } = useSession();
  const [draft, setDraft] = useState('');

  if (loading) return <div data-testid="loading">Loading…</div>;
  return (
    <div>
      <span data-testid="profile-name">{profile?.full_name ?? 'none'}</span>
      <input
        aria-label="Review draft"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
      />
      <button type="button" onClick={() => void signOut()}>
        Sign out
      </button>
    </div>
  );
}

beforeEach(() => {
  mockState.authCallback = null;
  mockState.signOut.mockClear();
  mockState.unsubscribe.mockClear();
  mockState.getOwnProfile.mockReset();
});

afterEach(() => {
  cleanup();
});

describe('SessionContext cache clearing and silent token refresh (#247)', () => {
  it('clears React Query cache on signOut() and when authenticated user.id changes', async () => {
    const queryClient = new QueryClient();
    const clearSpy = vi.spyOn(queryClient, 'clear');
    mockState.getOwnProfile.mockReturnValue(makeProfile('user-a', 'Alice Faculty'));

    render(
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <DraftFormProbe />
        </SessionProvider>
      </QueryClientProvider>,
    );

    await act(async () => {
      mockState.authCallback?.('INITIAL_SESSION', makeSession('user-a', 'tok-a'));
    });

    expect(await screen.findByTestId('profile-name')).toHaveTextContent('Alice Faculty');
    expect(clearSpy).not.toHaveBeenCalled();

    // Switching to a different user must clear cached queries.
    mockState.getOwnProfile.mockReturnValue(makeProfile('user-b', 'Bob Faculty'));
    await act(async () => {
      mockState.authCallback?.('SIGNED_IN', makeSession('user-b', 'tok-b'));
    });

    expect(await screen.findByTestId('profile-name')).toHaveTextContent('Bob Faculty');
    expect(clearSpy).toHaveBeenCalledTimes(1);

    // Explicit signOut() must also clear cached queries.
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Sign out' }));

    await waitFor(() => {
      expect(clearSpy).toHaveBeenCalledTimes(2);
    });
    expect(mockState.signOut).toHaveBeenCalledTimes(1);
  });

  it('does not flip loading to true or unmount child forms on TOKEN_REFRESHED or same-user SIGNED_IN', async () => {
    const queryClient = new QueryClient();
    const clearSpy = vi.spyOn(queryClient, 'clear');
    mockState.getOwnProfile.mockReturnValue(makeProfile('user-a', 'Alice Faculty'));

    render(
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <DraftFormProbe />
        </SessionProvider>
      </QueryClientProvider>,
    );

    await act(async () => {
      mockState.authCallback?.('INITIAL_SESSION', makeSession('user-a', 'tok-1'));
    });

    const input = await screen.findByLabelText('Review draft');
    const user = userEvent.setup();
    await user.type(input, 'Unsaved student review draft');
    expect(input).toHaveValue('Unsaved student review draft');

    // Simulate TOKEN_REFRESHED for the same user.
    mockState.getOwnProfile.mockReturnValue(makeProfile('user-a', 'Alice Updated'));
    await act(async () => {
      mockState.authCallback?.('TOKEN_REFRESHED', makeSession('user-a', 'tok-2'));
    });

    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Review draft')).toHaveValue('Unsaved student review draft');
    expect(await screen.findByTestId('profile-name')).toHaveTextContent('Alice Updated');
    expect(clearSpy).not.toHaveBeenCalled();

    // Simulate same-user SIGNED_IN (e.g., tab refocus).
    await act(async () => {
      mockState.authCallback?.('SIGNED_IN', makeSession('user-a', 'tok-3'));
    });

    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Review draft')).toHaveValue('Unsaved student review draft');
    expect(clearSpy).not.toHaveBeenCalled();
  });
});

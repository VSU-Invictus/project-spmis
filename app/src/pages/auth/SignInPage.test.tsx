// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

type AuthCallback = (event: AuthChangeEvent, session: Session | null) => void;

const mockAuth = vi.hoisted(() => ({
  callback: null as AuthCallback | null,
  getSession: vi.fn(async () => ({ data: { session: null as Session | null } })),
  signInWithPassword: vi.fn(async () => ({ data: { session: { access_token: 'tok' } }, error: null })),
  resetPasswordForEmail: vi.fn(async () => ({ data: {}, error: null })),
  updateUser: vi.fn(async () => ({ data: { user: { id: 'u1' } }, error: null })),
  signOut: vi.fn(async () => ({ error: null })),
  unsubscribe: vi.fn(),
}));

vi.mock('../../lib/supabase', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../lib/supabase')>();
  return {
    ...actual,
    supabase: {
      auth: {
        getSession: mockAuth.getSession,
        onAuthStateChange: (cb: AuthCallback) => {
          mockAuth.callback = cb;
          return { data: { subscription: { unsubscribe: mockAuth.unsubscribe } } };
        },
        signInWithPassword: mockAuth.signInWithPassword,
        resetPasswordForEmail: mockAuth.resetPasswordForEmail,
        updateUser: mockAuth.updateUser,
        signOut: mockAuth.signOut,
      },
    },
  };
});

import SignInPage from './SignInPage';
import { authStorage, setAuthPersistence } from '../../lib/supabase';

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  mockAuth.callback = null;
  mockAuth.getSession.mockReset();
  mockAuth.getSession.mockResolvedValue({ data: { session: null } });
  mockAuth.signInWithPassword.mockClear();
  mockAuth.resetPasswordForEmail.mockClear();
  mockAuth.updateUser.mockClear();
  mockAuth.signOut.mockClear();
});

afterEach(() => {
  cleanup();
});

function renderSignIn(initialEntry = '/signin') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/pending-verification" element={<div data-testid="redirected-pending">Pending</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('SignInPage password recovery and session-only persistence (#248)', () => {
  it('routes authStorage to sessionStorage when "Keep me signed in on this device" is unchecked', async () => {
    const user = userEvent.setup();
    renderSignIn();

    const checkbox = screen.getByRole('checkbox', { name: /Keep me signed in on this device/i });
    expect(checkbox).toBeChecked();

    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();

    await user.type(screen.getByLabelText('Email'), 'faculty@vsu.edu.ph');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Sign In to Account' }));

    await waitFor(() => {
      expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({
        email: 'faculty@vsu.edu.ph',
        password: 'password123',
      });
    });

    // When remember is false, authStorage must write to sessionStorage and not localStorage.
    authStorage.setItem('sb-test-auth-token', 'session-token-value');
    expect(window.sessionStorage.getItem('sb-test-auth-token')).toBe('session-token-value');
    expect(window.localStorage.getItem('sb-test-auth-token')).toBeNull();
    expect(authStorage.getItem('sb-test-auth-token')).toBe('session-token-value');

    // When remember is true, authStorage must write to localStorage.
    setAuthPersistence(true);
    authStorage.setItem('sb-test-auth-token', 'persistent-token-value');
    expect(window.localStorage.getItem('sb-test-auth-token')).toBe('persistent-token-value');
    expect(window.sessionStorage.getItem('sb-test-auth-token')).toBeNull();
  });

  it('sends password reset link to /signin and renders Set New Password form on PASSWORD_RECOVERY', async () => {
    const user = userEvent.setup();
    renderSignIn('/signin');

    await user.type(screen.getByLabelText('Email'), 'faculty@vsu.edu.ph');
    await user.click(screen.getByRole('button', { name: 'Forgot password?' }));

    await waitFor(() => {
      expect(mockAuth.resetPasswordForEmail).toHaveBeenCalledWith(
        'faculty@vsu.edu.ph',
        expect.objectContaining({ redirectTo: expect.stringMatching(/\/signin$/) }),
      );
    });

    // Simulate Supabase firing PASSWORD_RECOVERY with a temporary recovery session.
    await act(async () => {
      mockAuth.callback?.('PASSWORD_RECOVERY', { access_token: 'recovery-tok' } as unknown as Session);
    });

    // Should stay on SignInPage and display Set New Password form instead of redirecting.
    expect(screen.queryByTestId('redirected-pending')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Set New Password' })).toBeInTheDocument();

    await user.type(screen.getByLabelText('New Password'), 'newSecurePass123');
    await user.type(screen.getByLabelText('Confirm New Password'), 'newSecurePass123');
    await user.click(screen.getByRole('button', { name: 'Update Password' }));

    await waitFor(() => {
      expect(mockAuth.updateUser).toHaveBeenCalledWith({ password: 'newSecurePass123' });
    });
    expect(mockAuth.signOut).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole('heading', { name: 'Sign In' })).toBeInTheDocument();
    expect(screen.getByText(/Your password has been updated/i)).toBeInTheDocument();
  });

  it('does not trap users on Set New Password when manually visiting /signin?mode=reset without a recovery session', async () => {
    renderSignIn('/signin?mode=reset');

    expect(await screen.findByRole('heading', { name: 'Sign In' })).toBeInTheDocument();
    expect(
      await screen.findByText(/Password reset requires a valid recovery link from your email/i),
    ).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Set New Password' })).not.toBeInTheDocument();
  });
});

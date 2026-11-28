import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isLocalMockAuth = (() => {
  if (!import.meta.env.DEV || import.meta.env.VITE_USE_MOCK_AUTH !== 'true') return false;
  try {
    const url = new URL(supabaseUrl ?? 'http://localhost:4010');
    return url.protocol === 'http:' &&
      (url.hostname === 'localhost' || url.hostname === '127.0.0.1') &&
      url.port === '4010';
  } catch {
    return false;
  }
})();

const SESSION_ONLY_STORAGE_KEY = 'spmis-auth-session-only';

function isSessionOnlyAuth(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(SESSION_ONLY_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function setAuthPersistence(remember: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (remember) {
      window.sessionStorage.removeItem(SESSION_ONLY_STORAGE_KEY);
    } else {
      window.sessionStorage.setItem(SESSION_ONLY_STORAGE_KEY, '1');
    }
  } catch {
    // Ignore storage errors in restricted environments.
  }
}

export const authStorage = {
  getItem(key: string): string | null {
    if (typeof window === 'undefined') return null;
    try {
      const sessionValue = window.sessionStorage.getItem(key);
      if (sessionValue !== null) return sessionValue;
      if (isSessionOnlyAuth()) return null;
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    try {
      if (isSessionOnlyAuth()) {
        window.sessionStorage.setItem(key, value);
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, value);
        window.sessionStorage.removeItem(key);
      }
    } catch {
      // Ignore storage errors in restricted environments.
    }
  },
  removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.removeItem(key);
      window.localStorage.removeItem(key);
    } catch {
      // Ignore storage errors in restricted environments.
    }
  },
};

const initialUrlHasRecovery =
  typeof window !== 'undefined' &&
  (window.location.hash.includes('type=recovery') ||
    new URLSearchParams(window.location.search).get('type') === 'recovery');

let passwordRecoveryPending = initialUrlHasRecovery;

export function isPasswordRecoverySession(accessToken?: string | null): boolean {
  if (passwordRecoveryPending) return true;
  if (!accessToken) return false;
  try {
    const parts = accessToken.split('.');
    if (parts.length < 2) return false;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64)) as { amr?: Array<string | { method?: string }> };
    if (!Array.isArray(payload.amr)) return false;
    return payload.amr.some((entry) =>
      typeof entry === 'string' ? entry === 'recovery' : entry?.method === 'recovery',
    );
  } catch {
    return false;
  }
}

export function clearPasswordRecoveryPending(): void {
  passwordRecoveryPending = false;
}

export const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, {
        auth: { flowType: 'pkce', storage: authStorage },
      })
    : null;

if (supabase) {
  supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') {
      passwordRecoveryPending = true;
    } else if (event === 'SIGNED_OUT') {
      passwordRecoveryPending = false;
    }
  });
}

export async function startGoogleOAuth(redirectTo: string): Promise<string | null> {
  if (!supabase) return 'Authentication is not configured.';
  if (isLocalMockAuth) {
    return 'Google OAuth is unavailable in local mock mode.';
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: { prompt: 'select_account' },
      skipBrowserRedirect: true,
    },
  });
  if (error) return error.message;

  const authorizationUrl = new URL(data.url);
  if (
    authorizationUrl.protocol === 'http:' &&
    (authorizationUrl.hostname === 'localhost' || authorizationUrl.hostname === '127.0.0.1') &&
    authorizationUrl.port === '4010'
  ) {
    return 'Google OAuth is unavailable in local mock mode.';
  }

  window.location.assign(authorizationUrl.href);
  return null;
}

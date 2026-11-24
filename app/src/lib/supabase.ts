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

export const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, { auth: { flowType: 'pkce' } })
    : null;

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

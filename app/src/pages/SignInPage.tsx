import { useEffect, useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function SignInPage() {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string>();
  const redirectPath = searchParams.get('redirect') || '/';
  const [hasSession, setHasSession] = useState<boolean>();

  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data }) => setHasSession(Boolean(data.session)));
  }, []);

  if (hasSession) return <Navigate to={redirectPath} replace />;

  async function signInWithGoogle() {
    if (!supabase) {
      setError('Supabase authentication is not configured.');
      return;
    }

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}${redirectPath}`,
      },
    });
    if (authError) setError(authError.message);
  }

  return (
    <main>
      <h1>Sign in</h1>
      <p>Sign in to access the API documentation.</p>
      <button type="button" onClick={() => void signInWithGoogle()}>
        Continue with Google
      </button>
      {error && <p role="alert">{error}</p>}
    </main>
  );
}

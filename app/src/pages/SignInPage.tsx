import { useEffect, useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button, Card, CardContent, TypographyHeading, TypographyText } from '../components/ui';

export default function SignInPage() {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string>();
  const requestedRedirect = searchParams.get('redirect');
  const redirectPath = requestedRedirect?.startsWith('/') &&
    !requestedRedirect.startsWith('//') &&
    !requestedRedirect.includes('\\')
    ? requestedRedirect
    : '/';
  const [hasSession, setHasSession] = useState<boolean>();

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) setError(sessionError.message);
      setHasSession(Boolean(data.session));
    }).catch(() => {
      if (active) setError('Unable to check your session. Please try again.');
    });
    return () => { active = false; };
  }, []);

  if (hasSession) return <Navigate to={redirectPath} replace />;

  async function signInWithGoogle() {
    if (!supabase) {
      setError('Supabase authentication is not configured.');
      return;
    }

    setError(undefined);
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${redirectPath}`,
        },
      });
      if (authError) setError(authError.message);
    } catch {
      setError('Unable to sign in. Please try again.');
    }
  }

  return (
    <main className="contract-auth-page">
      <Card className="contract-auth-card">
        <CardContent>
          <TypographyHeading level={1}>Sign in</TypographyHeading>
          <TypographyText variant="muted">Sign in to access the SPMIS portal.</TypographyText>
          <Button onClick={() => void signInWithGoogle()}>Continue with Google</Button>
          {error && <TypographyText as="p" role="alert">{error}</TypographyText>}
        </CardContent>
      </Card>
    </main>
  );
}

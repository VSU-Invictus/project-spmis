import { useEffect, useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button, Card, CardContent, TypographyHeading, TypographyText } from '../components/ui';

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
    <main className="contract-auth-page">
      <Card className="contract-auth-card">
        <CardContent>
          <TypographyHeading level={1}>Sign in</TypographyHeading>
          <TypographyText variant="muted">Sign in to access the API documentation.</TypographyText>
          <Button onClick={() => void signInWithGoogle()}>Continue with Google</Button>
          {error && <TypographyText as="p" role="alert">{error}</TypographyText>}
        </CardContent>
      </Card>
    </main>
  );
}

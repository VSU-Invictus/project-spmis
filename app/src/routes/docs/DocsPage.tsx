import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, TypographyHeading, TypographyText } from '../../components/ui';

function ConfigurationError() {
  return (
    <main className="contract-auth-page">
      <Card className="contract-auth-card">
        <CardContent>
          <TypographyHeading level={1}>Documentation unavailable</TypographyHeading>
          <TypographyText variant="muted">Supabase authentication is not configured for this deployment.</TypographyText>
        </CardContent>
      </Card>
    </main>
  );
}

export default function DocsPage() {
  const [sessionState, setSessionState] = useState<
    'loading' | 'authenticated' | 'anonymous' | 'unconfigured'
  >(import.meta.env.DEV ? 'authenticated' : 'loading');

  useEffect(() => {
    if (import.meta.env.DEV || !supabase) {
      if (!import.meta.env.DEV) setSessionState('unconfigured');
      return;
    }

    let active = true;

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      setSessionState(error || !data.session ? 'anonymous' : 'authenticated');
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setSessionState(session ? 'authenticated' : 'anonymous');
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  if (sessionState === 'unconfigured') return <ConfigurationError />;
  if (sessionState === 'loading') return <main className="contract-auth-page" aria-busy="true"><TypographyText>Checking session...</TypographyText></main>;
  if (sessionState === 'anonymous') {
    return <Navigate to="/signin?redirect=%2Fdocs" replace />;
  }

  return (
    <iframe
      src="/docs/index.html"
      title="SPMIS API documentation"
      className="contract-docs-frame"
    />
  );
}

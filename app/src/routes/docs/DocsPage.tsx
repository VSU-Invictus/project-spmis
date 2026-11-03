import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

function ConfigurationError() {
  return (
    <main>
      <h1>Documentation unavailable</h1>
      <p>Supabase authentication is not configured for this deployment.</p>
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
  if (sessionState === 'loading') return <main aria-busy="true">Checking session...</main>;
  if (sessionState === 'anonymous') {
    return <Navigate to="/signin?redirect=%2Fdocs" replace />;
  }

  return (
    <iframe
      src="/docs/index.html"
      title="SPMIS API documentation"
      style={{
        width: '100%',
        minHeight: '100vh',
        border: 0,
        display: 'block',
      }}
    />
  );
}

import { Navigate, useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, TypographyHeading, TypographyText } from '../components/ui';
import { useSession } from '../context/SessionContext';
import { supabase } from '../lib/supabase';

export default function PendingVerificationPage() {
  const { session, profile, mockRole, loading } = useSession();
  const navigate = useNavigate();

  if (loading) {
    return <main className="contract-auth-page" aria-busy="true"><TypographyText>Checking your account…</TypographyText></main>;
  }

  if (!session && !(mockRole && profile)) {
    return <Navigate to="/signin?redirect=%2Fpending-verification" replace />;
  }

  if (profile?.status === 'active') {
    return <Navigate to={profile.role === 'admin' ? '/admin/dashboard' : '/faculty/dashboard'} replace />;
  }

  async function signOut() {
    if (supabase) await supabase.auth.signOut();
    navigate('/signin', { replace: true });
  }

  return (
    <main className="contract-auth-page">
      <Card className="contract-auth-card">
        <CardContent>
          <TypographyHeading level={1}>Account verification pending</TypographyHeading>
          <TypographyText variant="muted">
            {profile
              ? `Your faculty account for ${profile.email} is awaiting administrator verification.`
              : 'Your account is signed in, but a faculty profile has not been provisioned yet. Please contact an administrator.'}
          </TypographyText>
          <Button onClick={() => void signOut()}>Sign out</Button>
        </CardContent>
      </Card>
    </main>
  );
}

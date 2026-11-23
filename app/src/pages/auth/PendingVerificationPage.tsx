import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { FooterNav } from '../../components/navigation/FooterNav';
import { useSession } from '../../context/SessionContext';
import { supabase } from '../../lib/supabase';

export default function PendingVerificationPage() {
  const { session, profile, mockRole, loading } = useSession();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const signupPending = searchParams.get('source') === 'signup';
  const emailCooldown = searchParams.get('emailCooldown') === '1';

  if (loading) {
    return <main className="verification-page auth-bg-pixel" aria-busy="true"><p>Checking your account…</p></main>;
  }

  if (!session && !(mockRole && profile) && !signupPending) {
    return <Navigate to="/signin?redirect=%2Fpending-verification" replace />;
  }

  if (profile?.status === 'active') {
    return <Navigate to={profile.role === 'admin' ? '/admin/dashboard' : '/faculty/dashboard'} replace />;
  }

  async function backToSignIn() {
    if (supabase) await supabase.auth.signOut();
    navigate('/signin', { replace: true, viewTransition: true });
  }

  return (
    <main className="verification-page auth-bg-pixel">
      <section className="verification-wrapper" aria-labelledby="verification-title">
        <svg className="icon-clock" viewBox="0 0 64 64" fill="none" aria-hidden="true">
          <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2.5" />
          <path d="M32 16V32L42 38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        <h1 id="verification-title" className="verification-title">Account Pending Verification</h1>
        <p className="verification-desc-main">
          {profile
            ? `Your faculty account${profile.email ? ` (${profile.email})` : ''} has been successfully submitted and is awaiting approval from the system administrator.`
            : signupPending
              ? 'Your sign-up request has been received. Verify your email address to continue with account review.'
              : 'Your account has been submitted and is awaiting approval from the system administrator.'}
        </p>
        <p className="verification-desc-sub">
          {emailCooldown
            ? 'A verification email was recently requested. Check your inbox and spam folder; wait for the email cooldown to end before trying again.'
            : 'Check your email and verify your account by clicking the “Verify Email” link.'}
        </p>
        <button className="verification-back-button" type="button" onClick={() => void backToSignIn()}>
          Back to Sign In
        </button>
      </section>

      <FooterNav className="verification-footer" />
    </main>
  );
}

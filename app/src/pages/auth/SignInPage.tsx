import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { startGoogleOAuth, supabase } from '../../lib/supabase';
import logo from '../../../../mockup/assets/icons/SPMIS.png';

const googleIcon = <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>;

export default function SignInPage() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const requestedRedirect = searchParams.get('redirect');
  const isSafeRedirect = Boolean(
    requestedRedirect?.startsWith('/') &&
    !requestedRedirect.startsWith('//') &&
    !requestedRedirect.includes('\\') &&
    requestedRedirect !== '/' &&
    !/^\/(signin|login|signup)(\/|\?|$)/.test(requestedRedirect),
  );
  const redirectPath = isSafeRedirect ? requestedRedirect! : '/pending-verification';
  const [hasSession, setHasSession] = useState<boolean>();

  useEffect(() => {
    if (!supabase) { setHasSession(false); return; }
    let active = true;
    void supabase.auth.getSession().then(({ data }) => { if (active) setHasSession(Boolean(data.session)); });
    return () => { active = false; };
  }, []);

  if (hasSession) return <Navigate to={redirectPath} replace />;

  async function signInWithGoogle() {
    setError(''); setBusy(true);
    try {
      const authError = await startGoogleOAuth(`${window.location.origin}${redirectPath}`);
      if (authError) setError(authError);
    } catch { setError('Unable to sign in. Please try again.'); }
    finally { setBusy(false); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setNotice('');
    if (!supabase) { setError('Authentication is not configured.'); return; }
    if (!email.trim() || !password) { setError('Enter your email and password to continue.'); return; }
    setBusy(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (authError) setError(authError.message);
    } catch { setError('Unable to sign in. Please try again.'); }
    finally { setBusy(false); }
  }

  async function resetPassword() {
    if (!email.trim()) { setError('Enter your email address first, then choose Forgot password.'); return; }
    if (!supabase) { setError('Authentication is not configured.'); return; }
    setError(''); setNotice(''); setBusy(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/signin` });
      if (resetError) setError(resetError.message);
      else setNotice('If an account exists for this email, a password reset link is on its way.');
    } catch { setError('Unable to send a reset link. Please try again.'); }
    finally { setBusy(false); }
  }

  return (
    <main className="signin-page auth-bg-grid">
      <div className="signin-layout">
        <section className="signin-brand" aria-label="About SPMIS">
          <img className="signin-logo" src={logo} alt="SPMIS — Student Profiling Management Information System" />
          <div className="signin-brand-copy">
            <h1>Track every<br/><span>student journey.</span></h1>
            <p>From enrollment to graduation — review, approve, and manage academic records in one calm, focused workspace.</p>
            <ul><li>Centralized student profiles</li><li>Faculty review &amp; approvals</li><li>Real-time progress tracking</li></ul>
          </div>
          <div className="signin-brand-footer"><span>© 2026 SPMIS Project</span><span>v1.0</span></div>
        </section>

        <section className="signin-card" aria-labelledby="signin-title">
          <div className="signin-card-body">
            <h2 id="signin-title">Sign In</h2>
            <p className="signin-subtitle">Welcome back. Enter your credentials to continue.</p>
            <button className="signin-google" type="button" onClick={() => void signInWithGoogle()} disabled={busy}>{googleIcon}<span>Continue with Google</span></button>
            <div className="signin-divider"><span>or continue with email</span></div>
            <form onSubmit={(event) => void submit(event)}>
              <label className="signin-label" htmlFor="signin-email">Email</label>
              <input id="signin-email" className="signin-input" type="email" autoComplete="email" placeholder="faculty@vsu.edu.ph" value={email} onChange={(event) => setEmail(event.target.value)} required />
              <div className="signin-password-label"><label className="signin-label" htmlFor="signin-password">Password</label><button type="button" className="signin-forgot" onClick={() => void resetPassword()} disabled={busy}>Forgot password?</button></div>
              <div className="signin-password-wrap"><input id="signin-password" className="signin-input" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required/><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff/> : <Eye/>}</button></div>
              <label className="signin-remember"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)}/><span>Keep me signed in on this device</span></label>
              {error && <p className="signin-feedback" role="alert">{error}</p>}{notice && <p className="signin-feedback signin-notice" role="status">{notice}</p>}
              <button className="signin-submit" type="submit" disabled={busy}>{busy ? 'Please wait…' : 'Sign In to Account'}</button>
            </form>
          </div>
          <div className="signin-signup"><Link to="/signup">New here? Sign Up <span aria-hidden="true">→</span></Link></div>
        </section>
      </div>
      <footer className="signin-legal"><Link to="/styleguide">About</Link><span>·</span><a href="/terms" onClick={(event) => event.preventDefault()}>Terms</a><span>·</span><a href="/privacy" onClick={(event) => event.preventDefault()}>Privacy Policy</a></footer>
    </main>
  );
}

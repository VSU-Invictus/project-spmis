import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { startGoogleOAuth, supabase } from '../../lib/supabase';
import logo from '../../../../mockup/assets/icons/SPMIS.png';

const googleIcon = <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c-2.08-1.92-3.28-4.74-3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>;

export default function SignUpPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [hasSession, setHasSession] = useState<boolean>();

  useEffect(() => {
    if (!supabase) { setHasSession(false); return; }
    let active = true;
    void supabase.auth.getSession().then(({ data }) => { if (active) setHasSession(Boolean(data.session)); });
    return () => { active = false; };
  }, []);

  if (hasSession) return <Navigate to="/pending-verification" replace />;

  async function signUpWithGoogle() {
    setError(''); setBusy(true);
    try {
      const authError = await startGoogleOAuth(`${window.location.origin}/pending-verification?source=signup`);
      if (authError) setError(authError);
    } catch { setError('Unable to continue with Google. Please try again.'); }
    finally { setBusy(false); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setNotice('');
    if (!supabase) { setError('Authentication is not configured.'); return; }
    if (password.length < 8) { setError('Use a password with at least 8 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }

    setBusy(true);
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: `${window.location.origin}/pending-verification` },
      });
      if (authError) setError(authError.message);
      else if (data.session) navigate('/pending-verification', { replace: true });
      else setNotice('Account created. Check your email for a confirmation link to finish signing up.');
    } catch { setError('Unable to create your account. Please try again.'); }
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

        <section className="signin-card signup-card" aria-labelledby="signup-title">
          <div className="signin-card-body">
            <h2 id="signup-title">Create Account</h2>
            <p className="signin-subtitle">Join SPMIS to manage your academic journey.</p>
            <button className="signin-google" type="button" onClick={() => void signUpWithGoogle()} disabled={busy}>{googleIcon}<span>Continue with Google</span></button>
            <div className="signin-divider"><span>or continue with email</span></div>
            <form onSubmit={(event) => void submit(event)}>
              <label className="signin-label" htmlFor="signup-email">Email</label>
              <input id="signup-email" className="signin-input" type="email" autoComplete="email" placeholder="you@vsu.edu.ph" value={email} onChange={(event) => setEmail(event.target.value)} required />
              <label className="signin-label" htmlFor="signup-password">Password</label>
              <div className="signin-password-wrap"><input id="signup-password" className="signin-input" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Create a password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required/><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff/> : <Eye/>}</button></div>
              <label className="signin-label" htmlFor="signup-confirm-password">Confirm Password</label>
              <div className="signin-password-wrap"><input id="signup-confirm-password" className="signin-input" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Re-enter your password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required/><button type="button" aria-label={showConfirmPassword ? 'Hide password' : 'Show password'} aria-pressed={showConfirmPassword} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <EyeOff/> : <Eye/>}</button></div>
              {error && <p className="signin-feedback" role="alert">{error}</p>}{notice && <p className="signin-feedback signin-notice" role="status">{notice}</p>}
              <button className="signin-submit" type="submit" disabled={busy}>{busy ? 'Creating account…' : 'Create Account'}</button>
            </form>
          </div>
          <div className="signin-signup"><Link to="/signin">Already have an account? Sign In <span aria-hidden="true">→</span></Link></div>
        </section>
      </div>
      <footer className="signin-legal"><Link to="/about">About</Link><span>·</span><Link to="/terms">Terms</Link><span>·</span><Link to="/privacy-policy">Privacy Policy</Link></footer>
    </main>
  );
}

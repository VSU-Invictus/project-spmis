import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import {
  clearPasswordRecoveryPending,
  isPasswordRecoverySession,
  setAuthPersistence,
  startGoogleOAuth,
  supabase,
} from '../../lib/supabase';
import { FooterNav } from '../../components/navigation/FooterNav';
import logo from '../../../../mockup/assets/icons/SPMIS.png';
import lightLogo from './assets/SPMIS_LM.png';

const googleIcon = <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>;

export default function SignInPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [isRecoveryMode, setIsRecoveryMode] = useState(() => isPasswordRecoverySession());
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; newPassword?: string; confirmPassword?: string }>({});
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
    const requestedResetMode = searchParams.get('mode') === 'reset';
    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      const activeSession = data.session;
      const recovery = isPasswordRecoverySession(activeSession?.access_token) || (requestedResetMode && Boolean(activeSession));
      if (recovery) {
        setIsRecoveryMode(true);
      } else if (requestedResetMode && !activeSession) {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete('mode');
        setSearchParams(nextParams, { replace: true });
        setError('Password reset requires a valid recovery link from your email. Enter your email and click "Forgot password?" to request one.');
      }
      setHasSession(Boolean(activeSession));
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return;
      if (event === 'PASSWORD_RECOVERY' || isPasswordRecoverySession(nextSession?.access_token)) {
        setIsRecoveryMode(true);
        setError('');
        setNotice('');
      }
      setHasSession(Boolean(nextSession));
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [searchParams, setSearchParams]);

  if (hasSession && !isRecoveryMode) return <Navigate to={redirectPath} replace />;

  function clearFieldError(field: 'email' | 'password' | 'newPassword' | 'confirmPassword') {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function signInWithGoogle() {
    setError(''); setBusy(true);
    try {
      setAuthPersistence(remember);
      const authError = await startGoogleOAuth(`${window.location.origin}${redirectPath}`);
      if (authError) setError(authError);
    } catch { setError('Unable to sign in. Please try again.'); }
    finally { setBusy(false); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setNotice('');
    const nextErrors: typeof fieldErrors = {};
    if (!email.trim()) nextErrors.email = 'Please fill in this field.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) nextErrors.email = 'Please enter a valid email.';
    if (!password) nextErrors.password = 'Please fill in this field.';
    setFieldErrors(nextErrors);
    const firstInvalidField = Object.keys(nextErrors)[0];
    if (firstInvalidField) {
      document.getElementById(`signin-${firstInvalidField}`)?.focus();
      return;
    }
    if (!supabase) { setError('Authentication is not configured.'); return; }
    setBusy(true);
    try {
      setAuthPersistence(remember);
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (authError) setError(authError.message);
      else if (data.session) setHasSession(true);
    } catch { setError('Unable to sign in. Please try again.'); }
    finally { setBusy(false); }
  }

  async function resetPassword() {
    if (!email.trim()) {
      setFieldErrors((current) => ({ ...current, email: 'Please fill in this field.' }));
      document.getElementById('signin-email')?.focus();
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFieldErrors((current) => ({ ...current, email: 'Please enter a valid email.' }));
      document.getElementById('signin-email')?.focus();
      return;
    }
    if (!supabase) { setError('Authentication is not configured.'); return; }
    setError(''); setNotice(''); setBusy(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/signin` });
      if (resetError) setError(resetError.message);
      else setNotice(`If an account exists for ${email.trim()}, a password reset link has been sent to that email inbox. Open the link from your email to set a new password.`);
    } catch { setError('Unable to send a reset link. Please try again.'); }
    finally { setBusy(false); }
  }

  async function cancelRecoveryMode() {
    clearPasswordRecoveryPending();
    setIsRecoveryMode(false);
    setNewPassword('');
    setConfirmPassword('');
    setFieldErrors({});
    setError('');
    if (supabase && hasSession) {
      await supabase.auth.signOut();
      setHasSession(false);
    }
    if (searchParams.has('mode')) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('mode');
      setSearchParams(nextParams, { replace: true });
    }
  }

  async function submitNewPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setNotice('');
    const nextErrors: typeof fieldErrors = {};
    if (!newPassword) nextErrors.newPassword = 'Please fill in this field.';
    else if (newPassword.length < 8) nextErrors.newPassword = 'Use at least 8 characters.';
    if (!confirmPassword) nextErrors.confirmPassword = 'Please fill in this field.';
    else if (newPassword !== confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.';
    setFieldErrors(nextErrors);
    if (nextErrors.newPassword) {
      document.getElementById('signin-new-password')?.focus();
      return;
    }
    if (nextErrors.confirmPassword) {
      document.getElementById('signin-confirm-password')?.focus();
      return;
    }
    if (!supabase) { setError('Authentication is not configured.'); return; }
    setBusy(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
      if (updateError) {
        setError(
          /auth session missing/i.test(updateError.message)
            ? 'Your password reset session is missing or has expired. Return to Sign In and request a new reset link.'
            : updateError.message,
        );
        return;
      }
      clearPasswordRecoveryPending();
      await supabase.auth.signOut();
      setNewPassword('');
      setConfirmPassword('');
      setIsRecoveryMode(false);
      setHasSession(false);
      if (searchParams.has('mode')) {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete('mode');
        setSearchParams(nextParams, { replace: true });
      }
      setNotice('Your password has been updated. Sign in with your new password.');
    } catch {
      setError('Unable to update your password. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="signin-page auth-bg-grid">
      <div className="signin-layout">
        <section className="signin-brand" aria-label="About SPMIS">
          <img className="signin-logo" src={logo} alt="SPMIS — Student Profiling Management Information System" />
          <img className="signin-logo signin-logo-light" src={lightLogo} alt="SPMIS - Student Profiling Management Information System" />
          <div className="signin-brand-copy">
            <h1>Track every<br/><span>student journey.</span></h1>
            <p>From enrollment to graduation — review, approve, and manage academic records in one calm, focused workspace.</p>
            <ul><li>Centralized student profiles</li><li>Faculty review &amp; approvals</li><li>Real-time progress tracking</li></ul>
          </div>
          <div className="signin-brand-footer"><span>© 2026 SPMIS Project</span><span>v1.0</span></div>
        </section>

        <section className="signin-card" aria-labelledby="signin-title">
          {isRecoveryMode ? (
            <div className="signin-card-body">
              <h2 id="signin-title">Set New Password</h2>
              <p className="signin-subtitle">Enter a new password for your account.</p>
              <form noValidate onSubmit={(event) => void submitNewPassword(event)}>
                <label className="signin-label" htmlFor="signin-new-password">New Password</label>
                <div className={`signin-password-wrap signin-field${fieldErrors.newPassword ? ' has-error' : ''}`}>
                  <input id="signin-new-password" className="signin-input" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Create a new password" value={newPassword} onChange={(event) => { setNewPassword(event.target.value); clearFieldError('newPassword'); }} minLength={8} required aria-invalid={Boolean(fieldErrors.newPassword)} aria-describedby={fieldErrors.newPassword ? 'signin-new-password-error' : undefined} />
                  <button className="signin-password-toggle" type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff/> : <Eye/>}</button>
                  {fieldErrors.newPassword && <span id="signin-new-password-error" className="signin-field-error" role="alert"><span className="signin-field-error-icon" aria-hidden="true">!</span>{fieldErrors.newPassword}</span>}
                </div>
                <label className="signin-label" htmlFor="signin-confirm-password">Confirm New Password</label>
                <div className={`signin-password-wrap signin-field${fieldErrors.confirmPassword ? ' has-error' : ''}`}>
                  <input id="signin-confirm-password" className="signin-input" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Re-enter your new password" value={confirmPassword} onChange={(event) => { setConfirmPassword(event.target.value); clearFieldError('confirmPassword'); }} required aria-invalid={Boolean(fieldErrors.confirmPassword)} aria-describedby={fieldErrors.confirmPassword ? 'signin-confirm-password-error' : undefined} />
                  <button className="signin-password-toggle" type="button" aria-label={showConfirmPassword ? 'Hide password' : 'Show password'} aria-pressed={showConfirmPassword} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <EyeOff/> : <Eye/>}</button>
                  {fieldErrors.confirmPassword && <span id="signin-confirm-password-error" className="signin-field-error" role="alert"><span className="signin-field-error-icon" aria-hidden="true">!</span>{fieldErrors.confirmPassword}</span>}
                </div>
                {error && <p className="signin-feedback" role="alert">{error}</p>}
                {notice && <p className="signin-feedback signin-notice" role="status">{notice}</p>}
                <button className="signin-submit" type="submit" disabled={busy}>{busy ? 'Updating password…' : 'Update Password'}</button>
                <button className="signin-google" style={{ marginTop: 10 }} type="button" disabled={busy} onClick={() => void cancelRecoveryMode()}>Back to Sign In</button>
              </form>
            </div>
          ) : (
            <div className="signin-card-body">
              <h2 id="signin-title">Sign In</h2>
              <p className="signin-subtitle">Welcome back. Enter your credentials to continue.</p>
              <button className="signin-google" type="button" onClick={() => void signInWithGoogle()} disabled={busy}>{googleIcon}<span>Continue with Google</span></button>
              <div className="signin-divider"><span>or continue with email</span></div>
              <form noValidate onSubmit={(event) => void submit(event)}>
                <label className="signin-label" htmlFor="signin-email">Email</label>
                <div className={`signin-field${fieldErrors.email ? ' has-error' : ''}`}>
                  <input id="signin-email" className="signin-input" type="email" autoComplete="email" placeholder="faculty@vsu.edu.ph" value={email} onChange={(event) => { setEmail(event.target.value); clearFieldError('email'); }} required aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? 'signin-email-error' : undefined} />
                  {fieldErrors.email && <span id="signin-email-error" className="signin-field-error" role="alert"><span className="signin-field-error-icon" aria-hidden="true">!</span>{fieldErrors.email}</span>}
                </div>
                <div className="signin-password-label"><label className="signin-label" htmlFor="signin-password">Password</label><button type="button" className="signin-forgot" onClick={() => void resetPassword()} disabled={busy}>Forgot password?</button></div>
                <div className={`signin-password-wrap signin-field${fieldErrors.password ? ' has-error' : ''}`}><input id="signin-password" className="signin-input" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(event) => { setPassword(event.target.value); clearFieldError('password'); }} required aria-invalid={Boolean(fieldErrors.password)} aria-describedby={fieldErrors.password ? 'signin-password-error' : undefined}/><button className="signin-password-toggle" type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff/> : <Eye/>}</button>{fieldErrors.password && <span id="signin-password-error" className="signin-field-error" role="alert"><span className="signin-field-error-icon" aria-hidden="true">!</span>{fieldErrors.password}</span>}</div>
                <label className="signin-remember"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)}/><span>Keep me signed in on this device</span></label>
                {error && <p className="signin-feedback" role="alert">{error}</p>}{notice && <p className="signin-feedback signin-notice" role="status">{notice}</p>}
                <button className="signin-submit" type="submit" disabled={busy}>{busy ? 'Please wait…' : 'Sign In to Account'}</button>
              </form>
            </div>
          )}
          <div className="signin-signup"><Link to="/signup" viewTransition>New here? Sign Up <span aria-hidden="true">→</span></Link></div>
        </section>
      </div>
      <FooterNav className="signin-legal" />
    </main>
  );
}

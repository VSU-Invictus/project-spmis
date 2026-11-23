import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { startGoogleOAuth, supabase } from '../../lib/supabase';
import { FooterNav } from '../../components/navigation/FooterNav';
import { termsSections } from './TermsPage';
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
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [hasSession, setHasSession] = useState<boolean>();
  const [termsOpen, setTermsOpen] = useState(false);
  const [termsRead, setTermsRead] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [signupMethod, setSignupMethod] = useState<'email' | 'google' | null>(null);
  const termsScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!supabase) { setHasSession(false); return; }
    let active = true;
    void supabase.auth.getSession().then(({ data }) => { if (active) setHasSession(Boolean(data.session)); });
    return () => { active = false; };
  }, []);

  function checkTermsScroll() {
    const element = termsScrollRef.current;
    if (!element) return;
    const atBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 16;
    if (atBottom) setTermsRead(true);
  }

  function openTerms(method: 'email' | 'google') {
    setSignupMethod(method);
    setTermsRead(false);
    setTermsAccepted(false);
    setTermsOpen(true);
  }

  useEffect(() => {
    if (!termsOpen) return;
    const frame = window.requestAnimationFrame(checkTermsScroll);
    return () => window.cancelAnimationFrame(frame);
  }, [termsOpen]);

  if (hasSession) return <Navigate to="/pending-verification" replace />;

  function clearFieldError(field: 'email' | 'password' | 'confirmPassword') {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function signUpWithGoogle() {
    setError('');
    openTerms('google');
  }

  async function continueSignupAfterTerms() {
    if (!termsRead || !termsAccepted || !signupMethod) return;
    const method = signupMethod;
    setTermsOpen(false);
    setSignupMethod(null);
    setError('');
    setNotice('');
    setBusy(true);
    try {
      if (method === 'google') {
        const authError = await startGoogleOAuth(`${window.location.origin}/pending-verification?source=signup`);
        if (authError) setError(authError);
        return;
      }

      if (!supabase) { setError('Authentication is not configured.'); return; }
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { emailRedirectTo: `${window.location.origin}/pending-verification` },
      });
      if (authError && /(security purposes|after \d+ seconds|rate limit|too many requests)/i.test(authError.message)) {
        navigate('/pending-verification?source=signup&emailCooldown=1', { replace: true, viewTransition: true });
      } else if (authError) setError(authError.message);
      else if (data.session) navigate('/pending-verification', { replace: true, viewTransition: true });
      else if (data.user) navigate('/pending-verification?source=signup', { replace: true, viewTransition: true });
      else setNotice('Check your email for a confirmation link to finish signing up.');
    } catch {
      setError(method === 'google' ? 'Unable to continue with Google. Please try again.' : 'Unable to create your account. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setNotice('');
    const nextErrors: typeof fieldErrors = {};
    if (!email.trim()) nextErrors.email = 'Please fill in this field.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) nextErrors.email = 'Please enter a valid email.';
    if (!password) nextErrors.password = 'Please fill in this field.';
    else if (password.length < 8) nextErrors.password = 'Use at least 8 characters.';
    if (!confirmPassword) nextErrors.confirmPassword = 'Please fill in this field.';
    else if (password !== confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.';
    setFieldErrors(nextErrors);
    const firstInvalidField = Object.keys(nextErrors)[0];
    if (firstInvalidField) {
      document.getElementById(`signup-${firstInvalidField === 'confirmPassword' ? 'confirm-password' : firstInvalidField}`)?.focus();
      return;
    }
    openTerms('email');
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
            <button className="signin-google" type="button" onClick={signUpWithGoogle} disabled={busy}>{googleIcon}<span>Continue with Google</span></button>
            <div className="signin-divider"><span>or continue with email</span></div>
            <form noValidate onSubmit={(event) => void submit(event)}>
              <label className="signin-label" htmlFor="signup-email">Email</label>
              <div className={`signin-field${fieldErrors.email ? ' has-error' : ''}`}><input id="signup-email" className="signin-input" type="email" autoComplete="email" placeholder="you@vsu.edu.ph" value={email} onChange={(event) => { setEmail(event.target.value); clearFieldError('email'); }} required aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? 'signup-email-error' : undefined}/>{fieldErrors.email && <span id="signup-email-error" className="signin-field-error" role="alert"><span className="signin-field-error-icon" aria-hidden="true">!</span>{fieldErrors.email}</span>}</div>
              <label className="signin-label" htmlFor="signup-password">Password</label>
              <div className={`signin-password-wrap signin-field${fieldErrors.password ? ' has-error' : ''}`}><input id="signup-password" className="signin-input" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Create a password" value={password} onChange={(event) => { setPassword(event.target.value); clearFieldError('password'); }} minLength={8} required aria-invalid={Boolean(fieldErrors.password)} aria-describedby={fieldErrors.password ? 'signup-password-error' : undefined}/><button className="signin-password-toggle" type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff/> : <Eye/>}</button>{fieldErrors.password && <span id="signup-password-error" className="signin-field-error" role="alert"><span className="signin-field-error-icon" aria-hidden="true">!</span>{fieldErrors.password}</span>}</div>
              <label className="signin-label" htmlFor="signup-confirm-password">Confirm Password</label>
              <div className={`signin-password-wrap signin-field${fieldErrors.confirmPassword ? ' has-error' : ''}`}><input id="signup-confirm-password" className="signin-input" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Re-enter your password" value={confirmPassword} onChange={(event) => { setConfirmPassword(event.target.value); clearFieldError('confirmPassword'); }} required aria-invalid={Boolean(fieldErrors.confirmPassword)} aria-describedby={fieldErrors.confirmPassword ? 'signup-confirm-password-error' : undefined}/><button className="signin-password-toggle" type="button" aria-label={showConfirmPassword ? 'Hide password' : 'Show password'} aria-pressed={showConfirmPassword} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <EyeOff/> : <Eye/>}</button>{fieldErrors.confirmPassword && <span id="signup-confirm-password-error" className="signin-field-error" role="alert"><span className="signin-field-error-icon" aria-hidden="true">!</span>{fieldErrors.confirmPassword}</span>}</div>
              {error && <p className="signin-feedback" role="alert">{error}</p>}{notice && <p className="signin-feedback signin-notice" role="status">{notice}</p>}
              <button className="signin-submit" type="submit" disabled={busy}>{busy ? 'Creating account…' : 'Create Account'}</button>
            </form>
          </div>
          <div className="signin-signup"><Link to="/signin" viewTransition>Already have an account? Sign In <span aria-hidden="true">→</span></Link></div>
        </section>
      </div>
      <FooterNav className="signin-legal" />
      {termsOpen && (
        <div className="signup-terms-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) { setTermsOpen(false); setSignupMethod(null); } }}>
          <section className="signup-terms-dialog" role="dialog" aria-modal="true" aria-labelledby="signup-terms-title">
            <img className="signup-terms-logo" src={logo} alt="SPMIS" />
            <h2 id="signup-terms-title">Terms &amp; Conditions</h2>
            <p className="signup-terms-intro">Please read and accept the terms to continue to SPMIS.</p>
            <div className="signup-terms-scroll" ref={termsScrollRef} onScroll={checkTermsScroll}>
              <p><strong>SPMIS TERMS &amp; CONDITIONS</strong></p>
              <p>Please read the following terms carefully. You must accept these terms before your SPMIS account can be activated.</p>
              {termsSections.map((section) => (
                <section key={section.title}>
                  <h3>{section.title}</h3>
                  <p>{section.text}</p>
                </section>
              ))}
            </div>
            <p className={`signup-terms-hint${termsRead ? ' is-read' : ''}`} aria-live="polite">
              {termsRead ? 'You may now check the box to agree.' : 'Please scroll to the bottom of the terms to agree.'}
            </p>
            <label className={`signup-terms-agreement${!termsRead ? ' is-locked' : ''}`}>
              <input type="checkbox" checked={termsAccepted} disabled={!termsRead} onChange={(event) => setTermsAccepted(event.target.checked)} />
              <span>I have read and agree to the SPMIS Terms &amp; Conditions.</span>
            </label>
            <div className="signup-terms-actions">
              <button className="signup-terms-back" type="button" onClick={() => { setTermsOpen(false); setSignupMethod(null); }}>Back</button>
              <button className="signup-terms-continue" type="button" disabled={!termsRead || !termsAccepted || busy} onClick={() => void continueSignupAfterTerms()}>
                {busy ? 'Please wait…' : 'Agree & Continue'}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

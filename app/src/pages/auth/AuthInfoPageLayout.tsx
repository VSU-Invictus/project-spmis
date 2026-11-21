import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../../../mockup/assets/icons/SPMIS.png';

export default function AuthInfoPageLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="auth-info-page auth-bg-pixel">
      <div className="auth-info-container">
        <header className="auth-info-header">
          <h1>{title}</h1>
          <Link className="auth-info-logo" to="/signin" aria-label="Back to sign in">
            <img src={logo} alt="SPMIS" />
          </Link>
        </header>
        <article className="auth-info-content">{children}</article>
        <nav className="footer-nav auth-info-footer" aria-label="Footer navigation">
          <Link to="/about">About</Link><span className="dot" aria-hidden="true">•</span>
          <Link to="/terms">Terms</Link><span className="dot" aria-hidden="true">•</span>
          <Link to="/privacy-policy">Privacy Policy</Link>
        </nav>
      </div>
    </main>
  );
}

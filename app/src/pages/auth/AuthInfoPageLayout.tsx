import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { FooterNav } from '../../components/navigation/FooterNav';
import logo from '../../../../mockup/assets/icons/SPMIS.png';

export default function AuthInfoPageLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="auth-info-page auth-bg-pixel">
      <div className="auth-info-container">
        <header className="auth-info-header">
          <h1>{title}</h1>
          <Link className="auth-info-logo" to="/signin" viewTransition aria-label="Back to sign in">
            <img src={logo} alt="SPMIS" />
          </Link>
        </header>
        <article className="auth-info-content">{children}</article>
        <FooterNav className="auth-info-footer" />
      </div>
    </main>
  );
}

import { Link } from 'react-router-dom';
import { Button } from './components/ui';
import spmisLogo from '../../mockup/assets/icons/SPMIS.png';

export default function App() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--background)',
        color: 'var(--foreground)',
        fontFamily: 'var(--font-sans)',
        padding: '24px',
      }}
    >
      <div
        style={{
          maxWidth: '460px',
          width: '100%',
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl, 16px)',
          padding: '36px 32px',
          boxShadow: 'var(--shadow-md)',
          textAlign: 'center',
        }}
      >
        <img
          src={spmisLogo}
          alt="SPMIS Logo"
          style={{
            height: '48px',
            width: 'auto',
            maxWidth: '100%',
            objectFit: 'contain',
            display: 'inline-block',
            marginBottom: '18px',
          }}
        />


        <p
          style={{
            margin: '0 0 28px',
            fontSize: '14px',
            color: 'var(--color-text-muted)',
            lineHeight: 1.5,
          }}
        >
          Standard Portal Management Information System. Choose a destination below to inspect the living component architecture.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Link to="/styleguide" style={{ textDecoration: 'none' }}>
            <Button
              variant="primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              Open Living Styleguide
            </Button>
          </Link>

          <Link to="/design-system" style={{ textDecoration: 'none' }}>
            <Button
              variant="secondary"
              style={{
                width: '100%',
                justifyContent: 'center',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              Open Design System
            </Button>
          </Link>
        </div>

        <div
          style={{
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border)',
            fontSize: '12px',
            color: 'var(--color-text-dim)',
          }}
        >
          Visayas State University
        </div>
      </div>
    </div>
  );
}

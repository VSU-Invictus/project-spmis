import { Link } from 'react-router-dom';
import { Button, Card } from './components/ui';
import { COMPONENT_CATEGORIES } from './pages/ClassifiedComponentPages';
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
      <Card
        style={{
          maxWidth: '580px',
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
            margin: '0 0 24px',
            fontSize: '14px',
            color: 'var(--color-text-muted)',
            lineHeight: 1.5,
          }}
        >
          Standard Portal Management Information System. Choose the complete styleguide or inspect classified component pages below.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '22px' }}>
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
              Open Living Styleguide (All Sections)
            </Button>
          </Link>
        </div>

        <div
          style={{
            textAlign: 'left',
            borderTop: '1px solid var(--border)',
            paddingTop: '18px',
          }}
        >
          <span
            style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--muted-foreground)',
              marginBottom: '10px',
              textAlign: 'center',
            }}
          >
            Classified Component Pages
          </span>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
              gap: '8px',
            }}
          >
            {COMPONENT_CATEGORIES.map((cat) => (
              <Link key={cat.slug} to={`/components/${cat.slug}`} style={{ textDecoration: 'none' }}>
                <Button
                  variant="outline"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    fontSize: '12px',
                    padding: '8px 10px',
                  }}
                >
                  {cat.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        <div
          style={{
            marginTop: '24px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border)',
            fontSize: '12px',
            color: 'var(--color-text-dim)',
          }}
        >
          Visayas State University
        </div>
      </Card>
    </div>
  );
}

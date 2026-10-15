import { Link } from 'react-router-dom';
import { Button, Badge, Card, CardHeader, CardTitle, CardDescription, CardContent } from './components/ui';
import { useTheme } from './context/ThemeContext';
import spmisLogo from '../../mockup/assets/icons/SPMIS.png';

function App() {
  const { toggleTheme, isDark } = useTheme();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        backgroundColor: 'var(--background)',
        color: 'var(--foreground)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div style={{ maxWidth: '800px', width: '100%', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <img src={spmisLogo} alt="SPMIS Logo" style={{ width: '48px', height: '48px', borderRadius: '8px' }} />
          <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 800, color: 'var(--color-primary-base)' }}>
            SPMIS React Platform
          </h1>
        </div>

        <p style={{ fontSize: '16px', color: 'var(--color-text-muted)', marginBottom: '32px' }}>
          Standard Portal Management Information System &amp; Design Architecture
        </p>

        <Card style={{ textAlign: 'left', marginBottom: '24px' }}>
          <CardHeader>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <CardTitle>Design System &amp; Living Style Guide</CardTitle>
              <Badge variant="success" dot>Active</Badge>
            </div>
            <CardDescription>
              Explore Claude+ design tokens, modular UI primitives, interactive components, and queue modals.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <Link to="/styleguide">
                <Button variant="primary">
                  Open Living Style Guide (/styleguide)
                </Button>
              </Link>
              <Button variant="secondary" onClick={toggleTheme}>
                {isDark ? '🌙 Switch to Light Mode' : '☀️ Switch to Dark Mode'}
              </Button>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground)', marginBottom: '8px' }}>
                Direct Approval Queue Modals (URL Driven):
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <Link to="/styleguide?queue=department">
                  <Badge variant="outline">Department Queue (?queue=department)</Badge>
                </Link>
                <Link to="/styleguide?queue=program">
                  <Badge variant="outline">Program Queue (?queue=program)</Badge>
                </Link>
                <Link to="/styleguide?queue=student">
                  <Badge variant="outline">Student Queue (?queue=student)</Badge>
                </Link>
                <Link to="/styleguide?queue=faculty">
                  <Badge variant="outline">Faculty Queue (?queue=faculty)</Badge>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div style={{ fontSize: '12px', color: 'var(--color-text-dim)' }}>
          Powered by React 19, Vite, TypeScript, React Router 7, TanStack Query, and Claude+ OKLCH tokens.
        </div>
      </div>
    </div>
  );
}

export default App;

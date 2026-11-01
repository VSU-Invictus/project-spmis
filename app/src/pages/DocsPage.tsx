import { Link } from 'react-router-dom';

function ProductionAccessGate() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '24px',
        background: 'var(--background)',
        color: 'var(--foreground)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <section
        aria-labelledby="docs-access-title"
        style={{
          maxWidth: '560px',
          textAlign: 'center',
          padding: '32px',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl, 16px)',
          background: 'var(--card)',
        }}
      >
        <h1 id="docs-access-title">Sign-in required</h1>
        <p>
          API documentation is restricted to authenticated users in production.
          Connect this route to the application&apos;s authentication provider before
          enabling production access.
        </p>
        <Link to="/">Return to the home page</Link>
      </section>
    </main>
  );
}

export default function DocsPage() {
  if (!import.meta.env.DEV) {
    return <ProductionAccessGate />;
  }

  return (
    <iframe
      src="/docs/index.html"
      title="SPMIS API documentation"
      style={{
        width: '100%',
        minHeight: '100vh',
        border: 0,
        display: 'block',
      }}
    />
  );
}

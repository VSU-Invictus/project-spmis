import { isLocalMockAuth } from '../lib/supabase';

let auditMockReady: Promise<void> | undefined;

async function startAuditLogMock() {
  const [{ setupWorker }, { auditLogHandler }] = await Promise.all([
    import('msw/browser'),
    import('./handlers'),
  ]);
  const origin = new URL(import.meta.env.VITE_SUPABASE_URL ?? 'http://localhost:4010').origin;
  // Scope the browser mock to the local audit API. Other requests still use Prism.
  await setupWorker(auditLogHandler(origin)).start({ onUnhandledRequest: 'bypass' });
}

export function waitForAuditLogMock(): Promise<void> | undefined {
  if (!import.meta.env.DEV || !isLocalMockAuth || !('serviceWorker' in navigator) ||
      !['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname)) return;

  if (!auditMockReady) {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<void>(resolve => {
      timer = setTimeout(resolve, 2000);
    });
    auditMockReady = Promise.race([
      startAuditLogMock().catch(error => {
        console.warn('Local audit log mock could not start. Using the configured mock API.', error);
      }),
      timeout,
    ]).finally(() => clearTimeout(timer));
  }
  return auditMockReady;
}

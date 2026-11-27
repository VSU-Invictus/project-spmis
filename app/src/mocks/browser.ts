import { isLocalMockAuth } from '../lib/supabase';

let localMocksReady: Promise<void> | undefined;

const approvalQueuePath = '/rest/v1/approval_queue_items';
const approvalDecisionPath = '/functions/v1/approvals';
const rosterPaths = new Set([
  '/rest/v1/rpc/search_students',
  '/rest/v1/rpc/get_student_by_id',
  '/rest/v1/student_profiles',
  '/rest/v1/faculty_profiles',
  approvalQueuePath,
  approvalDecisionPath,
]);
const reviewExactPaths = new Set([
  '/rest/v1/review_details',
  '/rest/v1/review_revisions',
  '/rest/v1/rpc/suggest_review_tags',
  '/rest/v1/programs',
  '/functions/v1/reviews',
]);

export function isReviewMockPath(pathname: string): boolean {
  return reviewExactPaths.has(pathname) || pathname.startsWith('/functions/v1/reviews/');
}

export function isReviewMockRequest(request: Request, apiOrigin: string): boolean {
  const url = new URL(request.url);
  if (url.origin !== apiOrigin) return false;
  return isReviewMockPath(url.pathname);
}

export async function isRosterMockRequest(request: Request, apiOrigin: string): Promise<boolean> {
  const url = new URL(request.url);
  if (url.origin !== apiOrigin || !rosterPaths.has(url.pathname)) return false;

  if (url.pathname === approvalQueuePath) {
    if (request.method === 'GET') {
      return url.searchParams.get('type') === 'eq.student_registration';
    }
    if (request.method === 'POST') {
      const body = await request.clone().json().catch(() => null);
      return body?.type === 'student_registration';
    }
    return false;
  }

  if (url.pathname === approvalDecisionPath) {
    if (request.method !== 'POST') return false;
    const { isStudentRegistrationDecision } = await import('./handlers');
    return isStudentRegistrationDecision(await request.clone().json().catch(() => null));
  }

  return true;
}

export async function rosterMockHandlers(apiOrigin: string) {
  const [{ http, passthrough }, { handlers }] = await Promise.all([
    import('msw'),
    import('./handlers'),
  ]);
  return [
    // Existing test handlers match any host. Bypass everything outside the local roster scope.
    http.all(async ({ request }) => !(await isRosterMockRequest(request, apiOrigin)), () => passthrough()),
    ...handlers.filter(({ info }) => typeof info.path === 'string' && rosterPaths.has(info.path.slice(1))),
  ];
}

export async function reviewMockHandlers(apiOrigin: string) {
  const [{ http, passthrough }, { handlers }] = await Promise.all([
    import('msw'),
    import('./handlers'),
  ]);
  return [
    http.all(({ request }) => !isReviewMockRequest(request, apiOrigin), () => passthrough()),
    ...handlers.filter(({ info }) => typeof info.path === 'string' && isReviewMockPath(info.path.slice(1))),
  ];
}

export async function localMockHandlers(apiOrigin: string) {
  const [{ http, passthrough }, { auditLogHandler, handlers }] = await Promise.all([
    import('msw'),
    import('./handlers'),
  ]);
  const rosterMatched = handlers.filter(
    ({ info }) => typeof info.path === 'string' && rosterPaths.has(info.path.slice(1)),
  );
  const reviewMatched = handlers.filter(
    ({ info }) => typeof info.path === 'string' && isReviewMockPath(info.path.slice(1)),
  );
  return [
    auditLogHandler(apiOrigin),
    http.all(
      async ({ request }) =>
        !(await isRosterMockRequest(request, apiOrigin)) && !isReviewMockRequest(request, apiOrigin),
      () => passthrough(),
    ),
    ...rosterMatched,
    ...reviewMatched,
  ];
}

async function startLocalMocks() {
  const origin = new URL(import.meta.env.VITE_SUPABASE_URL ?? 'http://localhost:4010').origin;
  const [{ setupWorker }, handlers] = await Promise.all([
    import('msw/browser'),
    localMockHandlers(origin),
  ]);
  await setupWorker(...handlers)
    .start({ onUnhandledRequest: 'bypass' });
}

export function waitForLocalMocks(): Promise<void> | undefined {
  if (!import.meta.env.DEV || !isLocalMockAuth || typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      !['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname)) return;

  if (!localMocksReady) {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<void>(resolve => {
      timer = setTimeout(resolve, 2000);
    });
    localMocksReady = Promise.race([
      startLocalMocks().catch(error => {
        console.warn('Local API mocks could not start. Using the configured mock API.', error);
      }),
      timeout,
    ]).finally(() => clearTimeout(timer));
  }
  return localMocksReady;
}

export const waitForAuditLogMock = waitForLocalMocks;

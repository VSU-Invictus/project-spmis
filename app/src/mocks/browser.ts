import { http, passthrough } from 'msw';
import { handlers, isStudentRegistrationDecision } from './handlers';

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
    return isStudentRegistrationDecision(await request.clone().json().catch(() => null));
  }

  return true;
}

export function rosterMockHandlers(apiOrigin: string) {
  return [
    // Existing test handlers match any host. Bypass everything outside the local roster scope.
    http.all(async ({ request }) => !(await isRosterMockRequest(request, apiOrigin)), () => passthrough()),
    ...handlers.filter(({ info }) => typeof info.path === 'string' && rosterPaths.has(info.path.slice(1))),
  ];
}

export async function startRosterMocks() {
  const { setupWorker } = await import('msw/browser');
  const origin = new URL(import.meta.env.VITE_SUPABASE_URL ?? 'http://localhost:4010').origin;
  const worker = setupWorker(...rosterMockHandlers(origin));
  await worker.start({ onUnhandledRequest: 'bypass' });
}

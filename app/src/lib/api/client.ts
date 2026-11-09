import createClient from 'openapi-fetch';
import type { paths } from '../../../../contract/generated/schema';
export { request } from './request';

const defaultBaseUrl = 'http://localhost:4010';
const baseUrl = import.meta.env.VITE_SUPABASE_URL ?? (import.meta.env.DEV ? defaultBaseUrl : undefined);

export const DEFAULT_MOCK_DEV_TOKEN = 'mock-dev-token';
export const DEFAULT_MOCK_ANON_KEY = 'mock-anon-key';

let accessToken: string | undefined = import.meta.env.DEV ? DEFAULT_MOCK_DEV_TOKEN : undefined;
let projectApiKey: string | undefined =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  (import.meta.env.DEV ? DEFAULT_MOCK_ANON_KEY : undefined);

export const apiClient = createClient<paths>({
  baseUrl,
  // Resolve fetch at request time so MSW's Node interceptor is used in Vitest.
  fetch: (request) => globalThis.fetch(request),
});

apiClient.use({
  onRequest({ request }) {
    if (accessToken) request.headers.set('Authorization', `Bearer ${accessToken}`);
    if (projectApiKey) request.headers.set('apikey', projectApiKey);
    return request;
  },
});

export function configureApiAuth(auth: {
  accessToken?: string;
  projectApiKey?: string;
}): void {
  accessToken = auth.accessToken;
  if (auth.projectApiKey !== undefined) projectApiKey = auth.projectApiKey;
}

export function getApiAuth(): { accessToken?: string; projectApiKey?: string } {
  return { accessToken, projectApiKey };
}

export function resetApiAuth(): void {
  accessToken = undefined;
  projectApiKey = undefined;
}

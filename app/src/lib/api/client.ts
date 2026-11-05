import createClient from 'openapi-fetch';
import type { paths } from '../../../../contract/generated/schema';
export { request } from './request';

const defaultBaseUrl = 'http://localhost:4010';
const baseUrl = import.meta.env.VITE_SUPABASE_URL ?? (import.meta.env.DEV ? defaultBaseUrl : undefined);

let accessToken: string | undefined;
let projectApiKey: string | undefined =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY;

export const apiClient = createClient<paths>({
  baseUrl,
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

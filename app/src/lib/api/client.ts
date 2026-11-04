import createClient from 'openapi-fetch';
import type { paths } from '../../../../contract/generated/schema';
import { throwApiError } from './errors';

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

type ApiResult<T> =
  | { data: T; error?: never; response: Response }
  | { data?: never; error: unknown; response: Response };

export async function request<T>(result: Promise<ApiResult<T>>): Promise<T> {
  try {
    const response = await result;
    if ('error' in response) {
      throwApiError(response.error, response.response.status);
    }
    return response.data;
  } catch (error) {
    if (error instanceof Error && error.name === 'ApiRequestError') throw error;
    throwApiError(error);
  }
}

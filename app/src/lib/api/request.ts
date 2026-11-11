import { ApiRequestError, throwApiError } from './errors';

type ApiResult<T> =
  | { data: T; error?: never; response: Response }
  | { data?: never; error: unknown; response: Response };

export async function request<T>(result: Promise<ApiResult<T>>): Promise<T> {
  try {
    const response = await result;
    if (!response.response.ok || response.error !== undefined) {
      throwApiError(response.error, response.response.status);
    }
    // Successful bodyless operations (for example DELETE 204) return undefined.
    return response.data as T;
  } catch (error) {
    if (error instanceof ApiRequestError) throw error;
    throwApiError(error);
  }
}

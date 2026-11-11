export interface ApiErrorShape {
  code: string;
  message: string;
  details: string | null;
  hint: string | null;
  status?: number;
}

export class ApiRequestError extends Error {
  readonly code: string;
  readonly details: string | null;
  readonly hint: string | null;
  readonly status?: number;

  constructor(error: ApiErrorShape) {
    super(error.message);
    this.name = 'ApiRequestError';
    this.code = error.code;
    this.details = error.details;
    this.hint = error.hint;
    this.status = error.status;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function nullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

export function normalizeApiError(error: unknown, status?: number): ApiErrorShape {
  const payload = isRecord(error) && isRecord(error.error) ? error.error : error;

  if (isRecord(payload)) {
    return {
      code: nullableString(payload.code) ?? `HTTP_${status ?? 'UNKNOWN'}`,
      message: nullableString(payload.message) ?? 'The API request failed.',
      details: nullableString(payload.details),
      hint: nullableString(payload.hint),
      status,
    };
  }

  if (error instanceof Error) {
    return {
      code: `HTTP_${status ?? 'UNKNOWN'}`,
      message: error.message,
      details: null,
      hint: null,
      status,
    };
  }

  return {
    code: `HTTP_${status ?? 'UNKNOWN'}`,
    message: typeof error === 'string' ? error : 'The API request failed.',
    details: null,
    hint: null,
    status,
  };
}

export function throwApiError(error: unknown, status?: number): never {
  throw new ApiRequestError(normalizeApiError(error, status));
}

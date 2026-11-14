export class FunctionError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details: string | null = null,
    readonly hint: string | null = null,
  ) {
    super(message);
    this.name = 'FunctionError';
  }
}

export function errorResponse(error: unknown): Response {
  if (error instanceof FunctionError) {
    return jsonResponse({
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    }, error.status);
  }

  console.error(error);
  return jsonResponse({
    code: 'INTERNAL_ERROR',
    message: 'The request could not be completed.',
    details: null,
    hint: null,
  }, 500);
}

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json',
      'access-control-allow-origin': '*',
      'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
    },
  });
}

export function handleOptions(): Response {
  return new Response('ok', {
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
      'access-control-allow-methods': 'POST, PATCH, OPTIONS',
    },
  });
}

export function requireMethod(request: Request, method: string): void {
  if (request.method !== method) {
    throw new FunctionError(405, 'METHOD_NOT_ALLOWED', 'The HTTP method is not supported.');
  }
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error();
    return body as Record<string, unknown>;
  } catch {
    throw new FunctionError(422, 'INVALID_REQUEST', 'The request body must be a JSON object.');
  }
}

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function mapDatabaseError(error: { code?: string; message?: string } | null): never {
  const code = error?.code;
  if (code === '42501') throw new FunctionError(403, 'FORBIDDEN', error?.message ?? 'Forbidden.');
  if (code === 'P0002') throw new FunctionError(404, 'NOT_FOUND', error?.message ?? 'The resource was not found.');
  if (code === '55000') throw new FunctionError(409, 'CONFLICT', error?.message ?? 'The requested state transition is invalid.');
  if (code === '23514' || code === '22023') {
    throw new FunctionError(422, 'VALIDATION_ERROR', error?.message ?? 'The request is invalid.');
  }
  throw new FunctionError(500, 'DATABASE_ERROR', 'The database operation failed.', error?.message ?? null);
}

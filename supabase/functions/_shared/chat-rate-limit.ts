import { FunctionError } from './errors.ts';

type DatabaseError = { code?: string; message?: string };
type RateLimitResult = { data: unknown; error: DatabaseError | null };
type ConsumeRateLimit = (actorId: string) => PromiseLike<RateLimitResult>;

export async function enforceChatRateLimit(actorId: string, consume: ConsumeRateLimit): Promise<void> {
  const { data, error } = await consume(actorId);
  if (error?.code === '42501') {
    throw new FunctionError(403, 'FORBIDDEN', 'An active faculty profile is required.');
  }
  if (error) {
    throw new FunctionError(500, 'DATABASE_ERROR', 'The rate limit could not be checked.');
  }
  if (data !== true) {
    throw new FunctionError(429, 'RATE_LIMITED', 'The AI Chat Assistant is temporarily unavailable.', null, 'Try again later.');
  }
}

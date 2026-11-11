import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './server';
import { __resetMocks } from './handlers';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  __resetMocks();
});
afterAll(() => server.close());

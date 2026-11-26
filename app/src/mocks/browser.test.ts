// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

const { start } = vi.hoisted(() => ({ start: vi.fn() }));
vi.mock('msw/browser', () => ({ setupWorker: () => ({ start }) }));
vi.mock('../lib/supabase', () => ({ isLocalMockAuth: true }));

beforeEach(() => {
  vi.resetModules();
  vi.useFakeTimers();
  Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: {} });
});

afterEach(() => {
  Reflect.deleteProperty(navigator, 'serviceWorker');
  vi.restoreAllMocks();
  vi.useRealTimers();
  start.mockReset();
});

it('shares one startup attempt and releases audit requests when the worker stalls', async () => {
  start.mockImplementation(() => new Promise(() => {}));
  const { waitForAuditLogMock } = await import('./browser');
  const readiness = waitForAuditLogMock();
  expect(readiness).toBeDefined();
  expect(waitForAuditLogMock()).toBe(readiness);
  await vi.dynamicImportSettled();
  expect(start).toHaveBeenCalledTimes(1);
  await vi.advanceTimersByTimeAsync(2000);
  await expect(readiness).resolves.toBeUndefined();
});

it('releases audit requests when startup rejects', async () => {
  start.mockRejectedValue(new Error('registration failed'));
  const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const { waitForAuditLogMock } = await import('./browser');
  await expect(waitForAuditLogMock()).resolves.toBeUndefined();
  expect(warning).toHaveBeenCalledTimes(1);
});

it('releases audit requests as soon as a healthy worker starts', async () => {
  start.mockResolvedValue(undefined);
  const { waitForAuditLogMock } = await import('./browser');
  await expect(waitForAuditLogMock()).resolves.toBeUndefined();
  expect(start).toHaveBeenCalledWith({ onUnhandledRequest: 'bypass' });
  expect(vi.getTimerCount()).toBe(0);
});

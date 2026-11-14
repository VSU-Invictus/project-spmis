// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider, QueryObserver, useQuery } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { ApiRequestError } from '../lib/api';
import { queryKeys } from './queryKeys';
import { useDecideApplications } from './useDecideApplications';

const clients: QueryClient[] = [];
afterEach(() => { cleanup(); clients.forEach(client => client.clear()); clients.length = 0; });
function setup() {
  const client = new QueryClient({ defaultOptions: { queries: {
    retry: false, staleTime: 300000, refetchOnMount: false,
  }, mutations: { retry: false } } });
  clients.push(client);
  const wrapper = ({ children }: { children: ReactNode }) =>
    <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  return { client, wrapper };
}
const body = { decision: 'approve' as const, application_ids: ['11111111-1111-4111-8111-111111111111'] };

it('refreshes active and inactive filtered caches before awaiting the caller callback', async () => {
  const { client, wrapper } = setup();
  let version = 'before';
  const keys = [queryKeys.departments, queryKeys.programs, queryKeys.searchStudents,
    queryKeys.facultyProfiles, queryKeys.approvalQueueItems, queryKeys.auditLogs]
    .flatMap(key => [key(), key({ status: 'eq.pending' }), key({ offset: 20 })]);
  await Promise.all(keys.map(queryKey => client.fetchQuery({ queryKey, queryFn: async () => version })));
  client.setQueryData(queryKeys.tags(), ['unchanged']);
  const observer = new QueryObserver(client, { queryKey: keys[0], queryFn: async () => version });
  const unsubscribe = observer.subscribe(() => {});
  server.use(http.post('*/functions/v1/approvals', () => {
    version = 'after';
    return HttpResponse.json([]);
  }));
  let release!: () => void;
  const callbackGate = new Promise<void>(resolve => { release = resolve; });
  const onSuccess = vi.fn(async (..._args: unknown[]) => {
    keys.forEach(key => expect(client.getQueryData(key)).toBe('after'));
    await callbackGate;
  });
  const onMutate = vi.fn(() => 'caller-context');
  const { result } = renderHook(() => useDecideApplications({ onSuccess, onMutate }), { wrapper });
  let settled = false;
  let mutation!: Promise<unknown>;
  await act(async () => {
    mutation = result.current.mutateAsync(body).then(value => { settled = true; return value; });
    await vi.waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
  });
  expect(settled).toBe(false);
  expect(onSuccess.mock.calls[0]).toEqual([[], body, 'caller-context', expect.objectContaining({ client })]);
  await act(async () => { release(); await mutation; });
  expect(settled).toBe(true);
  expect(client.getQueryData(queryKeys.tags())).toEqual(['unchanged']);
  const revisited = renderHook(() => {
    return useQuery({ queryKey: keys[1], queryFn: async () => version }).data;
  }, { wrapper });
  expect(revisited.result.current).toBe('after');
  unsubscribe();
});

it('preserves API failures without refreshing caches or calling success', async () => {
  const { client, wrapper } = setup();
  const queryFn = vi.fn(async () => ['original']);
  await client.fetchQuery({ queryKey: queryKeys.auditLogs(), queryFn });
  server.use(http.post('*/functions/v1/approvals', () => HttpResponse.json({
    code: 'INVALID_STATE', message: 'Already decided.', details: null, hint: 'Refresh the queue.',
  }, { status: 409 })));
  const onSuccess = vi.fn();
  const onError = vi.fn();
  const { result } = renderHook(() => useDecideApplications({ onSuccess, onError }), { wrapper });
  await act(async () => {
    await expect(result.current.mutateAsync(body)).rejects.toMatchObject({
      status: 409, code: 'INVALID_STATE', hint: 'Refresh the queue.',
    });
  });
  expect(onError.mock.calls[0][0]).toBeInstanceOf(ApiRequestError);
  expect(onSuccess).not.toHaveBeenCalled();
  expect(queryFn).toHaveBeenCalledOnce();
  expect(client.getQueryState(queryKeys.auditLogs())?.isInvalidated).toBe(false);
});


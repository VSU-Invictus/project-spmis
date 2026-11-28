// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { __resetMocks } from '../mocks/handlers';
import { ApiRequestError } from '../lib/api';
import { queryKeys } from './queryKeys';
import { useDeleteStudent } from './useDeleteStudent';
import { useDeleteFaculty } from './useDeleteFaculty';

const clients: QueryClient[] = [];

beforeEach(() => {
  __resetMocks();
});

afterEach(() => {
  cleanup();
  clients.forEach((client) => client.clear());
  clients.length = 0;
});

function setup() {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 300000, refetchOnMount: false },
      mutations: { retry: false },
    },
  });
  clients.push(client);
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, wrapper };
}

describe('Admin CRUD mutation hooks (v1.1.0)', () => {
  it('useDeleteStudent invalidates searchStudents, auditLogs, and exact studentById on verified deletion', async () => {
    const { client, wrapper } = setup();
    const targetId = '27b5cc8d-1679-4e44-9e42-7b4cac5ae119';
    const otherId = '45b54332-e470-4c21-a839-7428c4f6bf42';
    let version = 'before';
    let deleted = false;

    const invalidatedKeys = [
      queryKeys.searchStudents(),
      queryKeys.searchStudents({ query: 'Juan' }),
      queryKeys.auditLogs(),
      queryKeys.studentById(targetId),
    ];
    await Promise.all([
      ...invalidatedKeys.map((queryKey) => client.fetchQuery({ queryKey, queryFn: async () => version })),
      client.fetchQuery({ queryKey: queryKeys.studentById(otherId), queryFn: async () => 'other-student' }),
    ]);

    server.use(
      http.get('*/rest/v1/rpc/get_student_by_id', ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get('p_student_id') === targetId && !deleted) {
          return HttpResponse.json({
            id: targetId,
            student_id_number: '27-1-12346',
            first_name: 'Juan',
            middle_name: null,
            last_name: 'Dela Cruz',
            program_id: '8ef76d5f-e6b2-49aa-a627-171dee1b8b65',
            registration_source: 'faculty_applied',
            created_at: '2026-10-26T00:00:00.000Z',
            updated_at: '2026-10-26T00:00:00.000Z',
          });
        }
        return HttpResponse.json(null);
      }),
      http.delete('*/rest/v1/student_profiles', ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get('id')).toBe(`eq.${targetId}`);
        deleted = true;
        version = 'after';
        return new HttpResponse(null, { status: 204 });
      }),
    );

    const { result } = renderHook(() => useDeleteStudent(), { wrapper });
    await act(async () => {
      await result.current.mutateAsync(targetId);
    });

    invalidatedKeys.forEach((key) => {
      expect(client.getQueryData(key)).toBe('after');
    });
    expect(client.getQueryData(queryKeys.studentById(otherId))).toBe('other-student');
  });

  it('useDeleteStudent rejects without invalidating caches when 204 leaves the record intact (RLS no-op)', async () => {
    const { client, wrapper } = setup();
    const targetId = '27b5cc8d-1679-4e44-9e42-7b4cac5ae119';
    const queryFn = vi.fn(async () => ['original']);
    await client.fetchQuery({ queryKey: queryKeys.searchStudents(), queryFn });

    server.use(
      http.delete('*/rest/v1/student_profiles', () => new HttpResponse(null, { status: 204 })),
    );

    const { result } = renderHook(() => useDeleteStudent(), { wrapper });
    await act(async () => {
      await expect(result.current.mutateAsync(targetId)).rejects.toThrow(/could not be removed/i);
    });

    expect(queryFn).toHaveBeenCalledOnce();
    expect(client.getQueryState(queryKeys.searchStudents())?.isInvalidated).toBe(false);
  });

  it('useDeleteStudent rejects when target student is missing before delete', async () => {
    const { client, wrapper } = setup();
    const missingId = '00000000-0000-4000-8000-000000000099';
    const queryFn = vi.fn(async () => ['original']);
    await client.fetchQuery({ queryKey: queryKeys.searchStudents(), queryFn });

    const { result } = renderHook(() => useDeleteStudent(), { wrapper });
    await act(async () => {
      await expect(result.current.mutateAsync(missingId)).rejects.toThrow(/not found/i);
    });

    expect(client.getQueryState(queryKeys.searchStudents())?.isInvalidated).toBe(false);
  });

  it('useDeleteStudent preserves 409 ApiRequestError without invalidating caches', async () => {
    const { client, wrapper } = setup();
    const targetId = '45b54332-e470-4c21-a839-7428c4f6bf42';
    const queryFn = vi.fn(async () => ['original']);
    await client.fetchQuery({ queryKey: queryKeys.searchStudents(), queryFn });

    const { result } = renderHook(() => useDeleteStudent(), { wrapper });
    await act(async () => {
      await expect(result.current.mutateAsync(targetId)).rejects.toMatchObject({
        status: 409,
        code: '23503',
      });
    });

    expect(queryFn).toHaveBeenCalledOnce();
    expect(client.getQueryState(queryKeys.searchStudents())?.isInvalidated).toBe(false);
  });

  it('useDeleteFaculty invalidates affected query families on verified deletion and preserves 409 errors', async () => {
    const { client, wrapper } = setup();
    const removableId = '98b5fca9-0d8c-4c0a-a10a-7aa10b9bb3a1';
    const referencedId = 'e48adc9e-1b79-4b92-9848-aa12b25d63d7';
    let version = 'before';
    let deleted = false;

    const invalidatedKeys = [
      queryKeys.facultyProfiles(),
      queryKeys.auditLogs(),
      queryKeys.searchStudents(),
      queryKeys.studentReviews(),
    ];
    await Promise.all(
      invalidatedKeys.map((queryKey) => client.fetchQuery({ queryKey, queryFn: async () => version })),
    );

    const { result } = renderHook(() => useDeleteFaculty(), { wrapper });

    await act(async () => {
      await expect(result.current.mutateAsync(referencedId)).rejects.toBeInstanceOf(ApiRequestError);
    });
    expect(client.getQueryState(queryKeys.facultyProfiles())?.isInvalidated).toBe(false);

    server.use(
      http.get('*/rest/v1/faculty_profiles', ({ request }) => {
        const url = new URL(request.url);
        if (url.searchParams.get('id') === `eq.${removableId}` && !deleted) {
          return HttpResponse.json([
            {
              id: removableId,
              email: 'pending.faculty@example.edu',
              full_name: 'Pending Faculty',
              department_id: '5c52a935-befa-4e5f-8bc9-ef4ea9bf5ccb',
              role: 'faculty',
              status: 'pending',
              created_at: '2026-10-26T00:00:00.000Z',
              updated_at: '2026-10-26T00:00:00.000Z',
            },
          ]);
        }
        return HttpResponse.json([]);
      }),
      http.delete('*/rest/v1/faculty_profiles', () => {
        deleted = true;
        version = 'after';
        return new HttpResponse(null, { status: 204 });
      }),
    );

    await act(async () => {
      await result.current.mutateAsync(removableId);
    });

    invalidatedKeys.forEach((key) => {
      expect(client.getQueryData(key)).toBe('after');
    });
  });

  it('useDeleteFaculty rejects without invalidating caches when 204 leaves the record intact (RLS no-op)', async () => {
    const { client, wrapper } = setup();
    const targetId = '98b5fca9-0d8c-4c0a-a10a-7aa10b9bb3a1';
    const queryFn = vi.fn(async () => ['original']);
    await client.fetchQuery({ queryKey: queryKeys.facultyProfiles(), queryFn });

    server.use(
      http.delete('*/rest/v1/faculty_profiles', () => new HttpResponse(null, { status: 204 })),
    );

    const { result } = renderHook(() => useDeleteFaculty(), { wrapper });
    await act(async () => {
      await expect(result.current.mutateAsync(targetId)).rejects.toThrow(/could not be removed/i);
    });

    expect(queryFn).toHaveBeenCalledOnce();
    expect(client.getQueryState(queryKeys.facultyProfiles())?.isInvalidated).toBe(false);
  });
});

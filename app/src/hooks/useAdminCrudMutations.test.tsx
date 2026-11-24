// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { ApiRequestError } from '../lib/api';
import { queryKeys } from './queryKeys';
import { useDeleteStudent } from './useDeleteStudent';
import { useCreateFacultyByAdmin } from './useCreateFacultyByAdmin';
import { useDeleteFaculty } from './useDeleteFaculty';

const clients: QueryClient[] = [];

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
  it('useDeleteStudent invalidates searchStudents, auditLogs, and exact studentById on success', async () => {
    const { client, wrapper } = setup();
    const targetId = '27b5cc8d-1679-4e44-9e42-7b4cac5ae119';
    const otherId = '45b54332-e470-4c21-a839-7428c4f6bf42';
    let version = 'before';

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
      http.delete('*/rest/v1/student_profiles', ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get('id')).toBe(`eq.${targetId}`);
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

  it('useCreateFacultyByAdmin posts with Prefer header and invalidates affected query families', async () => {
    const { client, wrapper } = setup();
    let version = 'before';
    const invalidatedKeys = [
      queryKeys.facultyProfiles(),
      queryKeys.auditLogs(),
      queryKeys.searchStudents(),
      queryKeys.studentReviews(),
    ];
    await Promise.all(
      invalidatedKeys.map((queryKey) => client.fetchQuery({ queryKey, queryFn: async () => version })),
    );
    client.setQueryData(queryKeys.tags(), ['unchanged']);

    let preferHeader: string | null = null;
    server.use(
      http.post('*/rest/v1/faculty_profiles', async ({ request }) => {
        preferHeader = request.headers.get('Prefer');
        version = 'after';
        return HttpResponse.json(
          [
            {
              id: '11111111-1111-4111-8111-111111111111',
              email: 'new.faculty@example.edu',
              full_name: 'Dr. New Faculty',
              department_id: '5c52a935-befa-4e5f-8bc9-ef4ea9bf5ccb',
              role: 'faculty',
              status: 'active',
              created_at: '2026-11-24T00:00:00.000Z',
              updated_at: '2026-11-24T00:00:00.000Z',
            },
          ],
          { status: 201 },
        );
      }),
    );

    const { result } = renderHook(() => useCreateFacultyByAdmin(), { wrapper });
    await act(async () => {
      const created = await result.current.mutateAsync({
        email: 'new.faculty@example.edu',
        full_name: 'Dr. New Faculty',
        department_id: '5c52a935-befa-4e5f-8bc9-ef4ea9bf5ccb',
        role: 'faculty',
        status: 'active',
      });
      expect(created).toHaveLength(1);
    });

    expect(preferHeader).toBe('return=representation');
    invalidatedKeys.forEach((key) => {
      expect(client.getQueryData(key)).toBe('after');
    });
    expect(client.getQueryData(queryKeys.tags())).toEqual(['unchanged']);
  });

  it('useDeleteFaculty invalidates affected query families and preserves 409 errors', async () => {
    const { client, wrapper } = setup();
    const removableId = '98b5fca9-0d8c-4c0a-a10a-7aa10b9bb3a1';
    const referencedId = 'e48adc9e-1b79-4b92-9848-aa12b25d63d7';
    let version = 'before';

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
      http.delete('*/rest/v1/faculty_profiles', () => {
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
});

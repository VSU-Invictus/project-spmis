import { useQuery } from '@tanstack/react-query';
import { apiClient, request } from '../lib/api';
import type { ApprovalQueueItem } from './useApprovalQueueItems';
import type { FacultyListItem } from './useFacultyList';
import { queryKeys } from './queryKeys';

export function useAdminQueueBrowse(type: ApprovalQueueItem['type'], profileId: string) {
  return useQuery({
    queryKey: [...queryKeys.approvalQueueItems({ type: `eq.${type}`, status: 'eq.pending' }), 'admin-browse', profileId],
    queryFn: async () => {
      const items: ApprovalQueueItem[] = [];
      for (let offset = 0; ; offset += 100) {
        const page = await request(apiClient.GET('/rest/v1/approval_queue_items', {
          params: { query: { type: `eq.${type}`, status: 'eq.pending', limit: 100, offset, order: 'created_at.asc,id.asc' } },
        }));
        items.push(...(page ?? []).filter(item => item.type === type && item.status === 'pending'));
        if (!page || page.length < 100) return items;
      }
    },
  });
}

/** Complete attribution/role lookup for queue payloads containing only profile IDs. */
export function useQueueFacultyReferences(profileId: string) {
  return useQuery({
    queryKey: [...queryKeys.facultyProfiles(), 'queue-references', profileId],
    queryFn: async () => {
      const faculty: FacultyListItem[] = [];
      for (let offset = 0; ; offset += 100) {
        const page = await request(apiClient.GET('/rest/v1/faculty_profiles', {
          params: { query: { limit: 100, offset, order: 'created_at.asc,id.asc' } },
        }));
        faculty.push(...(page ?? []));
        if (!page || page.length < 100) return faculty;
      }
    },
  });
}

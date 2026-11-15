import type { QueueType } from '../queue-modal/queues';

/** Mock-only fixtures. Zero real data (ai-context.md §4). */
export interface QueueColumn {
  key: string;
  label: string;
  colClass?: string;
  align?: 'left' | 'center' | 'right';
}

export interface QueueRow {
  id: string;
  status: 'Pending' | 'Active' | 'Approved' | 'Rejected';
  source?: 'Faculty Applied' | 'Admin Direct';
  cells: Record<string, string>;
}

export const QUEUE_COLUMNS: Record<QueueType, QueueColumn[]> = {
  student: [
    { key: 'studentId', label: 'Student ID', colClass: 'col-id' },
    { key: 'name', label: 'Name', colClass: 'col-name' },
    { key: 'program', label: 'Program', colClass: 'col-program' },
    { key: 'date', label: 'Applied Date', colClass: 'col-date' }
  ],
  department: [
    { key: 'department', label: 'Department', colClass: 'col-program' },
    { key: 'proposedBy', label: 'Proposed by', colClass: 'col-proposed' },
    { key: 'type', label: 'Request Type', colClass: 'col-type', align: 'center' },
    { key: 'date', label: 'Submission Date', colClass: 'col-date' }
  ],
  program: [
    { key: 'program', label: 'Program', colClass: 'col-program' },
    { key: 'proposedBy', label: 'Proposed by', colClass: 'col-proposed' },
    { key: 'type', label: 'Request Type', colClass: 'col-type', align: 'center' },
    { key: 'date', label: 'Submission Date', colClass: 'col-date' }
  ],
  faculty: [
    { key: 'name', label: 'Name', colClass: 'col-name' },
    { key: 'email', label: 'Email Address', colClass: 'col-email' },
    { key: 'department', label: 'Department', colClass: 'col-dept' },
    { key: 'role', label: 'Role', colClass: 'col-role', align: 'center' },
    { key: 'status', label: 'Status', colClass: 'col-status', align: 'center' },
    { key: 'date', label: 'Registered Date', colClass: 'col-date' }
  ]
};


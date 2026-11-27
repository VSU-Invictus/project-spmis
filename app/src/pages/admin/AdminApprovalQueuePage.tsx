import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import { AppShell } from '../../components/navigation/AppShell';
import { ApplicationQueue } from '../../components/application-queue/ApplicationQueue';
import { Button } from '../../components/ui';
import type { QueueType } from '../../components/queue-modal/queues';
import { useSession } from '../../context/SessionContext';
import { queryKeys } from '../../hooks/queryKeys';

const QUEUE_TABS: { key: QueueType; label: string }[] = [
  { key: 'faculty', label: 'Faculty Accounts' },
  { key: 'student', label: 'Student Registrations' },
  { key: 'program', label: 'Programs' },
  { key: 'department', label: 'Departments' },
];

/** Standalone approval workspace. Decisions are handled by ApplicationQueue. */
export function AdminApprovalQueuePage() {
  const { role, loading } = useSession();
  const { pathname } = useLocation();
  if (loading) return null;
  if (role !== 'admin' || !pathname.startsWith('/admin/')) return <Navigate to="/" replace />;
  return <ApprovalQueueWorkspace />;
}

function ApprovalQueueWorkspace() {
  const [queueType, setQueueType] = useState<QueueType>('faculty');
  const queryClient = useQueryClient();
  const queryKey = [queryKeys.approvalQueueItems()[0]];
  const fetching = useIsFetching({ queryKey });
  return (
    <AppShell role="admin" activeNavKey="dashboard" breadcrumb="Admin Portal / Approval Queue">
      <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 className="ui-page-title" style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 6px 0' }}>
              Pending Approval Queue
            </h1>
            <p className="ui-page-subtitle" style={{ margin: 0, color: 'var(--muted-foreground, #64748b)', fontSize: '14px' }}>
              Review faculty accounts, student registrations, and program/department proposals.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="secondary" disabled={fetching > 0}
              onClick={() => void queryClient.refetchQueries({ queryKey, type: 'active' })}>
              Refresh Queue
            </Button>
          </div>
        </div>
        <div className="admin-queue-filters" role="group" aria-label="Application queues" style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '8px', flexWrap: 'wrap' }}>
          {QUEUE_TABS.map(tab => (
            <Button key={tab.key} variant={queueType === tab.key ? 'primary' : 'ghost'} size="sm"
              aria-pressed={queueType === tab.key} onClick={() => setQueueType(tab.key)}>
              {tab.label}
            </Button>
          ))}
        </div>
        <ApplicationQueue key={queueType} type={queueType} />
      </div>
    </AppShell>
  );
}

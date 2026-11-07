import { AppShell } from '../../components/navigation/AppShell';
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableRowSkeleton,
  EmptyState,
  Badge,
  Button,
} from '../../components/ui';
import { useAuditLogs } from '../../hooks/useAuditLogs';

export function AdminAuditLogPage() {
  const { data: auditLogs, isPending, isError, error, refetch } = useAuditLogs({
    order: 'created_at.desc,id.asc',
  });

  return (
    <AppShell
      role="admin"
      activeNavKey="audit-log"
      breadcrumb="Admin Portal / System Audit Logs"
    >
      <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 className="ui-page-title" style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 6px 0' }}>
              System Audit Trail
            </h1>
            <p className="ui-page-subtitle" style={{ margin: 0, color: 'var(--muted-foreground, #64748b)', fontSize: '14px' }}>
              Read-only immutable log of system events and metadata-only changes per SPMIS §9/§10.
            </p>
          </div>
          <Button variant="secondary" onClick={() => refetch()}>
            Refresh Audit Logs
          </Button>
        </div>

        {isError && (
          <div
            role="alert"
            style={{
              padding: '12px 16px',
              backgroundColor: 'var(--destructive-subtle, #fee2e2)',
              border: '1px solid var(--destructive, #ef4444)',
              borderRadius: 'var(--radius-md, 8px)',
              color: 'var(--destructive, #b91c1c)',
              fontSize: '14px',
            }}
          >
            <strong>Prism Mock Error:</strong> {error?.message}
          </div>
        )}

        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: '180px' }}>Timestamp (UTC)</TableHead>
                <TableHead style={{ width: '120px' }}>Actor Role</TableHead>
                <TableHead style={{ width: '180px' }}>Action</TableHead>
                <TableHead style={{ width: '140px' }}>Entity Type</TableHead>
                <TableHead>Event Metadata</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPending && (
                <>
                  <TableRowSkeleton columns={5} />
                  <TableRowSkeleton columns={5} />
                  <TableRowSkeleton columns={5} />
                </>
              )}

              {!isPending && (!auditLogs || auditLogs.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} style={{ padding: '36px 0', textAlign: 'center' }}>
                    <EmptyState
                      title="No audit entries found"
                      description="System activity and moderation events will be recorded here."
                    />
                  </TableCell>
                </TableRow>
              )}

              {!isPending &&
                auditLogs?.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell style={{ fontSize: '13px', fontFamily: 'var(--font-mono, monospace)' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {log.actor_role}
                      </Badge>
                    </TableCell>
                    <TableCell style={{ fontWeight: 600 }}>
                      {log.action}
                    </TableCell>
                    <TableCell>
                      <Badge variant="neutral">
                        {log.entity_type}
                      </Badge>
                    </TableCell>
                    <TableCell style={{ fontSize: '12px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--muted-foreground)' }}>
                      {log.metadata ? JSON.stringify(log.metadata) : '—'}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </AppShell>
  );
}


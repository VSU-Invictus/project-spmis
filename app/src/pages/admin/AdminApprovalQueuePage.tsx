import { useState } from 'react';
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
  Checkbox,
  Modal,
  Label,
  Input,
} from '../../components/ui';
import { useApprovalQueueItems, type ApprovalQueueItem } from '../../hooks/useApprovalQueueItems';
import { useDecideApplications } from '../../hooks/useDecideApplications';

export function AdminApprovalQueuePage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const {
    data: items,
    isPending,
    isError,
    error,
    refetch,
  } = useApprovalQueueItems({
    status: 'eq.pending',
    order: 'created_at.desc,id.asc',
  });

  const decideMutation = useDecideApplications({
    onSuccess: () => {
      setSelectedIds([]);
      setRejectModalOpen(false);
      setRejectReason('');
    },
  });

  const filteredItems = items?.filter((item) => {
    if (typeFilter === 'all') return true;
    return item.type === typeFilter;
  });

  const toggleSelectAll = () => {
    if (!filteredItems) return;
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((item) => item.id));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkApprove = () => {
    if (selectedIds.length === 0) return;
    decideMutation.mutate({
      decision: 'approve',
      application_ids: selectedIds,
    });
  };

  const handleBulkReject = () => {
    if (selectedIds.length === 0 || !rejectReason.trim()) return;
    decideMutation.mutate({
      decision: 'reject',
      application_ids: selectedIds,
      reason: rejectReason.trim(),
    });
  };

  const getItemTitle = (item: ApprovalQueueItem) => {
    const id = item.id;
    const payload = item.payload as Record<string, unknown>;
    if (item.type === 'faculty_account') {
      return `${payload.full_name || 'Faculty Member'} (${payload.email || 'Email'})`;
    }
    if (item.type === 'student_registration') {
      return `${payload.first_name || ''} ${payload.last_name || ''} [${payload.student_id_number || 'ID'}]`;
    }
    if (item.type === 'program_proposal') {
      return `Program: ${payload.name || payload.code || 'Proposed Program'}`;
    }
    if (item.type === 'department_proposal') {
      return `Department: ${payload.name || payload.code || 'Proposed Department'}`;
    }
    return id;
  };

  return (
    <AppShell
      role="admin"
      activeNavKey="dashboard"
      breadcrumb="Admin Portal / Approval Queue"
    >
      <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 className="ui-page-title" style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 6px 0' }}>
              Pending Approval Queue
            </h1>
            <p className="ui-page-subtitle" style={{ margin: 0, color: 'var(--muted-foreground, #64748b)', fontSize: '14px' }}>
              Review and act on faculty accounts, student registrations, and program/department proposals from Prism mock.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="secondary" onClick={() => refetch()}>
              Refresh Queue
            </Button>
            <Button
              variant="primary"
              disabled={selectedIds.length === 0 || decideMutation.isPending}
              onClick={handleBulkApprove}
            >
              Approve Selected ({selectedIds.length})
            </Button>
            <Button
              variant="destructive"
              disabled={selectedIds.length === 0 || decideMutation.isPending}
              onClick={() => setRejectModalOpen(true)}
            >
              Reject Selected ({selectedIds.length})
            </Button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', paddingBottom: '8px', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'All Types' },
            { key: 'faculty_account', label: 'Faculty Accounts' },
            { key: 'student_registration', label: 'Student Registrations' },
            { key: 'program_proposal', label: 'Programs' },
            { key: 'department_proposal', label: 'Departments' },
          ].map((tab) => (
            <Button
              key={tab.key}
              variant={typeFilter === tab.key ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setTypeFilter(tab.key)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Global Error Banner */}
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

        {/* Queue Table */}
        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: '48px' }}>
                  <Checkbox
                    checked={Boolean(
                      filteredItems &&
                      filteredItems.length > 0 &&
                      selectedIds.length === filteredItems.length
                    )}
                    onChange={toggleSelectAll}
                    aria-label="Select all applications"
                  />
                </TableHead>
                <TableHead style={{ width: '180px' }}>Application Type</TableHead>
                <TableHead>Subject Details</TableHead>
                <TableHead style={{ width: '120px' }}>Status</TableHead>
                <TableHead style={{ width: '160px' }}>Submitted</TableHead>
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

              {!isPending && (!filteredItems || filteredItems.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} style={{ padding: '36px 0', textAlign: 'center' }}>
                    <EmptyState
                      title="No pending applications"
                      description="All queue requests have been processed or none match the selected filter."
                    />
                  </TableCell>
                </TableRow>
              )}

              {!isPending &&
                filteredItems?.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <TableRow key={item.id} style={{ backgroundColor: isSelected ? 'var(--muted-subtle, #f8fafc)' : undefined }}>
                      <TableCell>
                        <Checkbox
                          checked={isSelected}
                          onChange={() => toggleSelectItem(item.id)}
                          aria-label={`Select item ${item.id}`}
                        />
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {item.type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell style={{ fontWeight: 600 }}>
                        {getItemTitle(item)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="warning">
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
                        {new Date(item.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* Reject Reason Dialog */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Selected Applications"
        description={`Provide a mandatory reason for rejecting ${selectedIds.length} application(s).`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <Label htmlFor="reject-reason-input">Rejection Reason</Label>
            <Input
              id="reject-reason-input"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Incomplete credentials, or duplicate submission"
              required
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <Button variant="secondary" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!rejectReason.trim() || decideMutation.isPending}
              onClick={handleBulkReject}
            >
              {decideMutation.isPending ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { QUEUE_TITLES, type QueueType } from '../queue-modal/queues';
import { QUEUE_COLUMNS, type QueueRow } from './queueBrowse';
import { useLocation } from 'react-router-dom';
import { useSession } from '../../context/SessionContext';
import { useAdminQueueBrowse, useQueueFacultyReferences } from '../../hooks/useAdminQueueBrowse';
import { useDepartmentOptions } from '../../hooks/useDepartments';
import { useApprovedProgramOptions } from '../../hooks/usePrograms';
import { ApiRequestError } from '../../lib/api';
import { Alert, RejectionRow, Toast } from '../ui';
import { useDecideApplications } from '../../hooks/useDecideApplications';
import { approvalDecisionSchema } from '../../lib/validation/approvalDecision';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Checkbox } from '../ui/Checkbox';
import { EmptyState } from '../ui/EmptyState';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { TypographyHeading } from '../ui/Typography';
import { TablePaginationFooter } from '../ui/DataTable';

export interface ApplicationQueueProps {
  type: QueueType;
  isModal?: boolean;
}

const applicationTypes = { student: 'student_registration', faculty: 'faculty_account', department: 'department_proposal', program: 'program_proposal' } as const;

const isActionable = (row: QueueRow) => row.status === 'Pending' && row.source !== 'Admin Direct';

function renderCellContent(colKey: string, val: string) {
  if (colKey === 'type') {
    if (val === 'Edit Existing' || val === 'Edit') {
      return <Badge requestType="Edit Existing">Edit Existing</Badge>;
    }
    return <Badge requestType="Addition">Addition</Badge>;
  }
  if (colKey === 'date') return val.slice(0, 10);
  if (colKey === 'role') {
    if (val !== 'Admin' && val !== 'Faculty') return val;
    if (val === 'Admin') {
      return <Badge variant="destructive">Admin</Badge>;
    }
    return <Badge variant="info">Faculty</Badge>;
  }
  if (colKey === 'status') {
    if (val === 'Pending') {
      return (
        <Badge
          variant="warning"
          icon={
            <svg className="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          }
        >
          Pending
        </Badge>
      );
    }
    if (val === 'Active' || val === 'Approved') {
      return (
        <Badge
          variant="success"
          icon={
            <svg className="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          }
        >
          Active
        </Badge>
      );
    }
  }
  return val;
}

function getSearchMeta(type: QueueType) {
  switch (type) {
    case 'department':
      return {
        label: 'Search by department proposals',
        placeholder: 'Search by department proposals...'
      };
    case 'program':
      return {
        label: 'Search by program proposals',
        placeholder: 'Search by program proposals...'
      };
    case 'faculty':
      return {
        label: 'Search by faculty name or keyword',
        placeholder: 'Search by faculty name or keyword...'
      };
    case 'student':
      return {
        label: 'Search by student name or keyword',
        placeholder: 'Search by student name or keyword...'
      };
  }
}

const TYPE_FILTER_CONFIG: Partial<Record<QueueType, { label: string; options: string[] }>> = {
  department: {
    label: 'Filter by request type',
    options: ['Type: All', 'Addition', 'Edit Existing']
  },
  program: {
    label: 'Filter by request type',
    options: ['Type: All', 'Addition', 'Edit Existing']
  },
  faculty: {
    label: 'Filter by account role',
    options: ['Type: All', 'Faculty', 'Admin']
  }
};

export function ApplicationQueue(props: ApplicationQueueProps) {
  const { role, loading, profile } = useSession();
  const { pathname } = useLocation();
  if (loading || role !== 'admin' || !profile || !pathname.startsWith('/admin/')) return null;
  return <QueueBrowse key={`${profile.id}:${props.type}`} {...props} profileId={profile.id} />;
}

function QueueBrowse({ type, isModal = false, profileId }: ApplicationQueueProps & { profileId: string }) {
  const columns = QUEUE_COLUMNS[type];
  const searchMeta = getSearchMeta(type);
  const typeFilterConfig = TYPE_FILTER_CONFIG[type];
  const applications = useAdminQueueBrowse(applicationTypes[type], profileId);
  const faculty = useQueueFacultyReferences(profileId);
  const departments = useDepartmentOptions();
  const programs = useApprovedProgramOptions();
  const rows = useMemo<QueueRow[]>(() => (applications.data ?? []).map(item => {
    const person = faculty.data?.find(entry => entry.id === item.submitted_by);
    const date = item.created_at;
    let cells: Record<string, string>;
    switch (item.type) {
      case 'student_registration': cells = {
        studentId: item.payload.student_id_number,
        name: [item.payload.first_name, item.payload.middle_name, item.payload.last_name].filter(Boolean).join(' '),
        program: programs.data?.find(entry => entry.id === item.payload.program_id)?.name ?? (programs.isPending ? 'Loading program…' : 'Program unavailable'), date,
      }; break;
      case 'faculty_account': cells = {
        name: item.payload.full_name, email: item.payload.email,
        department: item.payload.proposed_department_name ?? departments.data?.find(entry => entry.id === item.payload.department_id)?.name ?? (departments.isPending ? 'Loading department…' : 'Department unavailable'),
        role: person ? (person.role === 'admin' ? 'Admin' : 'Faculty') : faculty.isPending ? 'Loading role…' : 'Role unavailable', status: 'Pending', date,
      }; break;
      default: cells = {
        [item.type === 'program_proposal' ? 'program' : 'department']: item.payload.name,
        proposedBy: person?.full_name ?? (faculty.isPending ? 'Loading submitter…' : 'Submitter unavailable'),
        type: ('program_id' in item.payload && item.payload.program_id) || ('department_id' in item.payload && item.payload.department_id) ? 'Edit Existing' : 'Addition', date,
      };
    }
    return { id: item.id, status: 'Pending', cells };
  }), [applications.data, faculty.data, departments.data, programs.data, faculty.isPending, departments.isPending, programs.isPending]);
  const referenceError = faculty.error ?? departments.error ?? programs.error;
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('Type: All');
  const [sortOrder, setSortOrder] = useState<'Oldest' | 'Newest'>('Oldest');
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const decision = useDecideApplications();
  const submitting = useRef(false);
  const rejectTrigger = useRef<HTMLButtonElement>(null);
  const [rejectionIds, setRejectionIds] = useState<string[] | null>(null);
  const [rejectionAnchor, setRejectionAnchor] = useState<string | null>(null);
  const [decisionError, setDecisionError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const pending = decision.isPending;
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);
  // Filtering & Sorting
  const filteredRows = useMemo(() => {
    let result = rows;
    if (typeFilter && typeFilter !== 'Type: All') {
      if (type === 'faculty') {
        result = result.filter((row) => row.cells.role === typeFilter);
      } else if (type === 'department' || type === 'program') {
        result = result.filter((row) => row.cells.type === typeFilter);
      }
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((row) =>
        Object.values(row.cells).some((val) => val.toLowerCase().includes(q))
      );
    }
    const sorted = [...result].sort((a, b) => {
      const dateA = a.cells.date || '';
      const dateB = b.cells.date || '';
      return sortOrder === 'Oldest'
        ? dateA.localeCompare(dateB) || a.id.localeCompare(b.id)
        : dateB.localeCompare(dateA) || a.id.localeCompare(b.id);
    });
    return sorted;
  }, [rows, search, sortOrder, typeFilter, type]);

  // Pagination calculation
  const totalEntries = filteredRows.length;
  const pageSize = totalEntries < 10 ? 5 : totalEntries < 20 ? Math.min(rowsPerPage, 10) : rowsPerPage;
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedRows = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredRows.slice(startIndex, startIndex + pageSize);
  }, [filteredRows, safeCurrentPage, pageSize]);

  const actionableVisibleRows = useMemo(
    () => paginatedRows.filter(isActionable),
    [paginatedRows]
  );

  const allVisibleChecked =
    actionableVisibleRows.length > 0 &&
    actionableVisibleRows.every((r) => selected.has(r.id));
  const someVisibleChecked =
    actionableVisibleRows.some((r) => selected.has(r.id)) && !allVisibleChecked;

  // Drop stale/hidden selections after filters or remote data change.
  useEffect(() => {
    if (submitting.current) return;
    const visibleIds = new Set(filteredRows.map(row => row.id));
    setSelected(previous => {
      const next = new Set([...previous].filter(id => visibleIds.has(id)));
      return next.size === previous.size ? previous : next;
    });
    if (rejectionAnchor && !visibleIds.has(rejectionAnchor)) {
      setRejectionIds(null);
      setRejectionAnchor(null);
    }
  }, [filteredRows, pending, rejectionAnchor]);

  const toggleRow = (row: QueueRow) => {
    if (submitting.current || rejectionIds || !isActionable(row)) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(row.id)) next.delete(row.id);
      else next.add(row.id);
      return next;
    });
  };

  const toggleAllVisible = () => {
    if (submitting.current || rejectionIds) return;
    if (allVisibleChecked) {
      setSelected((prev) => {
        const next = new Set(prev);
        actionableVisibleRows.forEach((r) => next.delete(r.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        actionableVisibleRows.forEach((r) => next.add(r.id));
        return next;
      });
    }
  };

  const decide = async (action: 'approve' | 'reject', ids: string[], reason?: string) => {
    if (submitting.current) return;
    setDecisionError(null);
    setToast(null);
    const parsed = approvalDecisionSchema.safeParse(action === 'approve'
      ? { decision: action, application_ids: ids }
      : { decision: action, application_ids: ids, reason });
    if (!parsed.success) { setDecisionError(parsed.error.issues[0].message); return; }
    const current = new Set((applications.data ?? []).filter(item => item.status === 'pending').map(item => item.id));
    if (applications.isError || ids.some(id => !current.has(id))) {
      setDecisionError('Some selected applications are no longer available. Refresh the queue before deciding.');
      return;
    }
    submitting.current = true;
    try {
      const result = await decision.mutateAsync(parsed.data);
      const expected = action === 'approve' ? 'approved' : 'rejected';
      if (!ids.every(id => result.some(item => item.id === id && item.status === expected))) {
        throw new Error('The server did not confirm every requested decision. Refresh the queue before trying again.');
      }
      setSelected(new Set());
      setRejectionIds(null);
      setToast(`${ids.length} Application${ids.length === 1 ? '' : 's'} ${action === 'approve' ? 'Approved' : 'Rejected'}`);
    } catch (error) {
      setDecisionError(error instanceof ApiRequestError
        ? [error.message, error.hint].filter(Boolean).join(' ')
        : error instanceof Error ? error.message : 'Unable to decide applications.');
    } finally { submitting.current = false; }
  };
  const closeRejection = () => {
    if (submitting.current) return;
    setRejectionIds(null); setDecisionError(null); rejectTrigger.current?.focus();
  };

  return (
    <div className={`queue-container queue-${type} queue-embedded-workspace ${isModal ? 'is-modal' : ''}`}>
      <main className="section-container">
        {decisionError && !rejectionIds && <Alert variant="warning" title="Decision could not be confirmed" description={decisionError} />}
        {decisionError && <Button variant="outline" disabled={pending} onClick={() => void applications.refetch()}>Refresh queue</Button>}
        {applications.isPending && <p role="status">Loading applications…</p>}
        {applications.isError && <><Alert variant="warning" title={applications.error.message} description={applications.error instanceof ApiRequestError ? applications.error.hint ?? '' : ''} />
          <Button variant="outline" onClick={() => void applications.refetch()}>Retry applications</Button></>}
        {referenceError && <><Alert variant="warning" title="Some reference details are unavailable" description={referenceError.message} />
          <Button variant="outline" onClick={() => { void faculty.refetch(); void departments.refetch(); void programs.refetch(); }}>Retry details</Button></>}
        {/* Top Title */}
        <header className="header-container">
          <div className="heading-wrapper">
            <TypographyHeading level={2} className="heading-title">
              {QUEUE_TITLES[type]}
            </TypographyHeading>
          </div>
        </header>

        {/* Search & Filters Row */}
        <div className="controls-container">
          <div className="search-wrapper">
            <svg className="search-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.33" />
              <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.33" strokeLinecap="round" />
            </svg>
            <Input
              aria-label={searchMeta.label}
              type="text"
              className="search-input"
              placeholder={searchMeta.placeholder}
              disabled={pending || Boolean(rejectionIds)}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="controls-actions">
            {/* Filter by Type / Role */}
            {typeFilterConfig && (
              <div className="dropdown-container type">
                <Select
                  aria-label={typeFilterConfig.label}
                  className="dropdown-select"
                  disabled={pending || Boolean(rejectionIds)}
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  {typeFilterConfig.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </Select>
                <svg className="dropdown-chevron" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path
                    d="M3.5 5.25L7 8.75L10.5 5.25"
                    stroke="currentColor"
                    strokeWidth="1.17"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}

            {/* Sort Dropdown */}
            <div className="dropdown-container sort">
              <Select
                aria-label="Sort by submission date"
                className="dropdown-select"
                disabled={pending || Boolean(rejectionIds)}
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'Oldest' | 'Newest')}
              >
                <option value="Oldest">Oldest</option>
                <option value="Newest">Newest</option>
              </Select>
              <svg className="dropdown-chevron" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M3.5 5.25L7 8.75L10.5 5.25"
                  stroke="currentColor"
                  strokeWidth="1.17"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="table-margin-container">
          <div className="table-container ui-table-wrap">
            <div className="table-scroll">
              {/* Table Header */}
              <div className="table-header-row" role="row">
                <div className="th-cell checkbox-cell" role="columnheader">
                  <Checkbox
                    isSelectAll
                    aria-label="Select all rows"
                    checked={allVisibleChecked}
                    indeterminate={someVisibleChecked}
                    disabled={pending || Boolean(rejectionIds) || applications.isPending || applications.isError || !actionableVisibleRows.length}
                    onChange={toggleAllVisible}
                  />
                </div>
                {columns.map((col) => (
                  <div
                    key={col.key}
                    className={`th-cell ${col.colClass || ''}`}
                    role="columnheader"
                  >
                    {col.label}
                  </div>
                ))}
              </div>

              {/* Table Body */}
              <div className="table-body" role="rowgroup">
                {!applications.isPending && !applications.isError && paginatedRows.map((row) => {
                  const enabled = isActionable(row);
                  const checked = selected.has(row.id);
                  return (
                    <Fragment key={row.id}>
                      <div
                        className={`table-row ${checked ? 'checked' : ''}`}
                        role="row"
                        onClick={(e) => {
                          if ((e.target as HTMLElement).closest('button, a, input, textarea, label')) return;
                          toggleRow(row);
                        }}
                      >
                        <div className="td-cell checkbox-cell" role="cell">
                          <Checkbox
                            isRowCheckbox
                            aria-label={`Select application: ${row.cells.name || row.cells.program || row.cells.department || row.id}`}
                            checked={checked}
                            disabled={pending || Boolean(rejectionIds) || !enabled}
                            onChange={() => toggleRow(row)}
                          />
                        </div>
                        {columns.map((col) => (
                          <div
                            key={col.key}
                            className={`td-cell ${col.colClass || ''}`}
                            role="cell"
                          >
                            {renderCellContent(col.key, row.cells[col.key] || '')}
                          </div>
                        ))}
                      </div>

                      {rejectionIds && rejectionAnchor === row.id && <RejectionRow asTableRow={false} bulkCount={rejectionIds.length}
                        pending={pending} error={decisionError} onCancel={closeRejection}
                        onConfirm={reason => void decide('reject', rejectionIds, reason)} />}
                    </Fragment>
                  );
                })}

              </div>
            </div>

            {/* Empty State */}
            {!applications.isPending && !applications.isError && filteredRows.length === 0 && (
              <EmptyState
                title={`No pending ${type} applications`}
                description={`${type.charAt(0).toUpperCase() + type.slice(1)} applications awaiting review will appear here.`}
              />
            )}
          </div>

          {/* Pagination Action Bar */}
          <TablePaginationFooter
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            totalEntries={totalEntries}
            pageSize={pageSize}
            onPageChange={(page) => { if (!pending && !rejectionIds) setCurrentPage(page); }}
            onPageSizeChange={(size) => {
              if (pending || rejectionIds) return;
              setRowsPerPage(size);
              setCurrentPage(1);
            }}
            selectionText={selected.size > 0 ? `${selected.size} selected` : ''}
            bulkActions={
              <>
                <Button
                  variant="approve"
                  hasSelection={selected.size > 0}
                  disabled={pending || Boolean(rejectionIds) || !selected.size || applications.isError}
                  onClick={() => void decide('approve', [...selected])}
                >
                  Approve
                </Button>
                <Button
                  variant="reject"
                  hasSelection={selected.size > 0}
                  ref={rejectTrigger}
                  disabled={pending || Boolean(rejectionIds) || !selected.size || applications.isError}
                  onClick={() => {
                    const anchor = paginatedRows.find(row => selected.has(row.id));
                    if (!anchor) { setDecisionError('Select an application on this page.'); return; }
                    setDecisionError(null); setToast(null); setRejectionAnchor(anchor.id); setRejectionIds([...selected]);
                  }}
                >
                  Reject
                </Button>
              </>
            }
          />
        </div>
      </main>
      <Toast message={toast} />
    </div>
  );
}

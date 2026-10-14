import { Fragment, useEffect, useId, useMemo, useRef, useState } from 'react';
import { QUEUE_TITLES, type QueueType } from '../queue-modal/queues';
import { QUEUE_COLUMNS, QUEUE_FIXTURES, type QueueRow } from '../../data/queueFixtures';

export interface ApplicationQueueProps {
  type: QueueType;
  isModal?: boolean;
}

type Rejection = { kind: 'row'; rowId: string } | { kind: 'bulk' } | null;

const isActionable = (row: QueueRow) => row.status === 'Pending' && row.source !== 'Admin Direct';

function renderCellContent(colKey: string, val: string) {
  if (colKey === 'type') {
    if (val === 'Edit Existing' || val === 'Edit') {
      return <span className="ui-badge ui-badge--info">Edit Existing</span>;
    }
    return <span className="ui-badge ui-badge--success">Addition</span>;
  }
  if (colKey === 'role') {
    if (val === 'Admin') {
      return <span className="ui-badge ui-badge--destructive">Admin</span>;
    }
    return <span className="ui-badge ui-badge--info">Faculty</span>;
  }
  if (colKey === 'status') {
    if (val === 'Pending') {
      return (
        <span className="ui-badge ui-badge--warning">
          <svg className="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          Pending
        </span>
      );
    }
    if (val === 'Active' || val === 'Approved') {
      return (
        <span className="ui-badge ui-badge--success">
          <svg className="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Active
        </span>
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

export function ApplicationQueue({ type, isModal = false }: ApplicationQueueProps) {
  const columns = QUEUE_COLUMNS[type];
  const searchMeta = getSearchMeta(type);
  const typeFilterConfig = TYPE_FILTER_CONFIG[type];
  const [rows, setRows] = useState<QueueRow[]>(() => QUEUE_FIXTURES[type]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('Type: All');
  const [sortOrder, setSortOrder] = useState<'Oldest' | 'Newest'>('Oldest');
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [rejection, setRejection] = useState<Rejection>(null);
  const [toast, setToast] = useState<string | null>(null);
  const bulkRejectRef = useRef<HTMLButtonElement>(null);

  // Reset when queue type changes
  useEffect(() => {
    setRows(QUEUE_FIXTURES[type]);
    setSelected(new Set());
    setRejection(null);
    setSearch('');
    setTypeFilter('Type: All');
    setCurrentPage(1);
  }, [type]);

  // Toast timer
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
      const q = search.toLowerCase();
      result = result.filter((row) =>
        Object.values(row.cells).some((val) => val.toLowerCase().includes(q))
      );
    }
    const sorted = [...result].sort((a, b) => {
      const dateA = a.cells.date || '';
      const dateB = b.cells.date || '';
      return sortOrder === 'Oldest'
        ? dateA.localeCompare(dateB)
        : dateB.localeCompare(dateA);
    });
    return sorted;
  }, [rows, search, sortOrder, typeFilter, type]);

  // Pagination calculation
  const totalEntries = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / rowsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedRows = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * rowsPerPage;
    return filteredRows.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredRows, safeCurrentPage, rowsPerPage]);

  const actionableVisibleRows = useMemo(
    () => paginatedRows.filter(isActionable),
    [paginatedRows]
  );

  const allVisibleChecked =
    actionableVisibleRows.length > 0 &&
    actionableVisibleRows.every((r) => selected.has(r.id));
  const someVisibleChecked =
    actionableVisibleRows.some((r) => selected.has(r.id)) && !allVisibleChecked;

  const headerRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (headerRef.current) {
      headerRef.current.indeterminate = someVisibleChecked;
    }
  }, [someVisibleChecked]);

  const removeRows = (ids: string[]) => {
    const drop = new Set(ids);
    setRows((prev) => prev.filter((r) => !drop.has(r.id)));
    setSelected((prev) => new Set([...prev].filter((id) => !drop.has(id))));
    setRejection(null);
  };

  const toggleRow = (row: QueueRow) => {
    if (!isActionable(row)) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(row.id)) next.delete(row.id);
      else next.add(row.id);
      return next;
    });
    if (rejection?.kind === 'bulk') setRejection(null);
  };

  const toggleAllVisible = () => {
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
    if (rejection?.kind === 'bulk') setRejection(null);
  };

  const plural = (n: number) => `${n} Application${n === 1 ? '' : 's'}`;

  const bulkApprove = () => {
    if (!selected.size) {
      setToast('Please select at least one application');
      return;
    }
    const count = selected.size;
    removeRows([...selected]);
    setToast(`${plural(count)} Approved`);
  };

  const bulkReject = () => {
    if (!selected.size) {
      setToast('Please select at least one application');
      return;
    }
    setRejection({ kind: 'bulk' });
  };

  const confirmReject = (ids: string[]) => {
    removeRows(ids);
    setToast(`${plural(ids.length)} Rejected`);
  };

  const closeRejection = () => {
    setRejection(null);
    bulkRejectRef.current?.focus();
  };

  return (
    <div className={`queue-container queue-${type} queue-embedded-workspace ${isModal ? 'is-modal' : ''}`}>
      <main className="section-container">
        {/* Top Title */}
        <header className="header-container">
          <div className="heading-wrapper">
            <h2 className="heading-title">{QUEUE_TITLES[type]}</h2>
          </div>
        </header>

        {/* Search & Filters Row */}
        <div className="controls-container">
          <div className="search-wrapper">
            <svg className="search-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="6.5" cy="6.5" r="5" stroke="#8A837A" strokeWidth="1.33" />
              <path d="M10.5 10.5L14 14" stroke="#8A837A" strokeWidth="1.33" strokeLinecap="round" />
            </svg>
            <input
              aria-label={searchMeta.label}
              type="text"
              className="search-input"
              placeholder={searchMeta.placeholder}
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
                <select
                  aria-label={typeFilterConfig.label}
                  className="dropdown-select"
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
                </select>
                <svg className="dropdown-chevron" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path
                    d="M3.5 5.25L7 8.75L10.5 5.25"
                    stroke="#6C655D"
                    strokeWidth="1.17"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}

            {/* Sort Dropdown */}
            <div className="dropdown-container sort">
              <select
                aria-label="Sort by submission date"
                className="dropdown-select"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'Oldest' | 'Newest')}
              >
                <option value="Oldest">Oldest</option>
                <option value="Newest">Newest</option>
              </select>
              <svg className="dropdown-chevron" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M3.5 5.25L7 8.75L10.5 5.25"
                  stroke="#6C655D"
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
                <input
                  ref={headerRef}
                  type="checkbox"
                  aria-label="Select all rows"
                  className="custom-checkbox select-all-checkbox"
                  checked={allVisibleChecked}
                  disabled={!actionableVisibleRows.length}
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
              {paginatedRows.map((row) => {
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
                        <input
                          type="checkbox"
                          aria-label={`Select application: ${row.cells.name || row.cells.program || row.cells.department || row.id}`}
                          className="custom-checkbox row-checkbox"
                          checked={checked}
                          disabled={!enabled}
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

                    {rejection?.kind === 'row' && rejection.rowId === row.id && (
                      <InlineRejectionRow
                        onCancel={closeRejection}
                        onConfirm={(reason) => {
                          console.log(`Rejected ${row.id} with reason:`, reason);
                          confirmReject([row.id]);
                        }}
                      />
                    )}
                  </Fragment>
                );
              })}

              {rejection?.kind === 'bulk' && (
                <InlineRejectionRow
                  bulkCount={selected.size}
                  onCancel={closeRejection}
                  onConfirm={(reason) => {
                    console.log(`Bulk rejected ${selected.size} applications with reason:`, reason);
                    confirmReject([...selected]);
                  }}
                />
              )}
            </div>
          </div>

          {/* Empty State */}
          {filteredRows.length === 0 && (
            <div className="ui-empty-state" role="status" aria-live="polite">
              <h2 className="ui-empty-state__title" data-empty-title>
                No pending {type} applications
              </h2>
              <p className="ui-empty-state__description" data-empty-description>
                {type.charAt(0).toUpperCase() + type.slice(1)} applications awaiting review will appear here.
              </p>
            </div>
          )}
        </div>

        {/* Pagination Action Bar */}
        <div className="ui-table-pagination is-0272b5f">
          <div className="pagination-actions-group bottom-bar-container">
            <div className="action-btn-group">
              <button
                className={`pill-btn approve ${selected.size ? 'has-selection' : ''}`}
                type="button"
                onClick={bulkApprove}
              >
                Approve
              </button>
              <button
                ref={bulkRejectRef}
                className={`pill-btn reject ${selected.size ? 'has-selection' : ''}`}
                type="button"
                onClick={bulkReject}
              >
                Reject
              </button>
            </div>
            <span className="pagination-selection-status is-7fbae58" role="status">
              {selected.size > 0 ? `${selected.size} selected` : ''}
            </span>
          </div>

          <div className="pagination-controls-group is-31de0eb">
            <div className="pagination-rows-per-page is-b57eafe">
              <span>Rows per page</span>
              <div className="pagination-select-wrapper is-e0dd7f8">
                <select
                  className="ui-select-pill is-daab64f"
                  aria-label="Rows per page"
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
                <svg
                  className="pagination-select-chevron is-4b97db6"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>

            <span className="pagination-page-info is-12b4142" role="status">
              Page {safeCurrentPage} of {totalPages} · {totalEntries} entries
            </span>

            <div className="ui-table-pagination-nav is-49e15c7">
              <button
                type="button"
                className="ui-btn ui-btn-outline is-b38e363"
                disabled={safeCurrentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <button
                type="button"
                className="ui-btn ui-btn-outline is-b38e363"
                disabled={safeCurrentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

      {/* Toast Notification */}
      <div id="toast" className={`toast ${toast ? 'show' : ''}`} role="status" aria-live="polite">
        {toast}
      </div>
    </div>
  );
}

interface InlineRejectionRowProps {
  bulkCount?: number;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}

function InlineRejectionRow({ bulkCount, onCancel, onConfirm }: InlineRejectionRowProps) {
  const [reason, setReason] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const reasonId = useId();

  useEffect(() => {
    textareaRef.current?.focus();
    textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, []);

  const handleSubmit = () => {
    const el = textareaRef.current;
    if (!reason.trim()) {
      el?.setCustomValidity('Enter a reason for rejection.');
      el?.reportValidity();
      return;
    }
    onConfirm(reason.trim());
  };

  return (
    <div
      className="ui-queue-rejection-row is-expanded"
      role="row"
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          onCancel();
        }
      }}
    >
      <div className="ui-queue-rejection-cell" role="cell">
        <label htmlFor={reasonId}>Reason for rejection</label>
        {bulkCount && bulkCount > 1 ? (
          <p className="ui-queue-bulk-message">
            The same reason applies to all {bulkCount} selected applications.
          </p>
        ) : null}
        <textarea
          id={reasonId}
          ref={textareaRef}
          placeholder="Enter reason here..."
          required
          aria-required="true"
          value={reason}
          onChange={(e) => {
            e.target.setCustomValidity('');
            setReason(e.target.value);
          }}
        />
        <div className="ui-queue-rejection-actions">
          <button
            type="button"
            className="ui-btn ui-btn-outline ui-queue-cancel"
            onClick={onCancel}
          >
            Close
          </button>
          <button
            type="button"
            className="ui-btn ui-btn-destructive ui-queue-confirm-reject"
            onClick={handleSubmit}
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

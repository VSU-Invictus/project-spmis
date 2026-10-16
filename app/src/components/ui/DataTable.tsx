import React, { Fragment, useEffect, useId, useMemo, useState } from 'react';
import { Button } from './Button';
import { Checkbox } from './Checkbox';
import { EmptyState } from './EmptyState';
import { RejectionRow } from './RejectionRow';

export interface DataTableColumn<T> {
  key: string;
  label: React.ReactNode;
  colClass?: string;
  headerClass?: string;
  render?: (row: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowId: (row: T) => string;
  selectable?: boolean;
  isRowSelectable?: (row: T) => boolean;
  selectedIds?: string[] | Set<string>;
  defaultSelectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  showSelectAllButton?: boolean;
  selectionStatusFormat?: 'rows' | 'compact';
  bulkActions?: React.ReactNode;
  entityName?: string;
  defaultPageSize?: number;
  dynamicPageSizeOptions?: boolean;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  layoutMode?: 'table' | 'flex';
  activeRejectionRowId?: string | null;
  bulkRejectionOpen?: boolean;
  onCancelRejection?: () => void;
  onConfirmRejection?: (reason: string, targetIds: string[]) => void;
  className?: string;
  ariaLabel?: string;
}

export function DataTable<T>({
  columns,
  data,
  getRowId,
  selectable = false,
  isRowSelectable,
  selectedIds: controlledSelectedIds,
  defaultSelectedIds = [],
  onSelectionChange,
  showSelectAllButton = false,
  selectionStatusFormat = 'rows',
  bulkActions,
  entityName = 'entries',
  defaultPageSize = 5,
  dynamicPageSizeOptions = false,
  isLoading = false,
  emptyTitle = 'No pending applications',
  emptyDescription = 'Items awaiting review or matching your filters will appear here.',
  layoutMode = 'table',
  activeRejectionRowId = null,
  bulkRejectionOpen = false,
  onCancelRejection,
  onConfirmRejection,
  className = '',
  ariaLabel = 'Data table',
}: DataTableProps<T>) {
  const rowsPerPageSelectId = useId();
  const [uncontrolledSelected, setUncontrolledSelected] = useState<Set<string>>(
    () => new Set(defaultSelectedIds)
  );
  const [pageSize, setPageSize] = useState<number>(defaultPageSize);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const selectedSet = useMemo(() => {
    if (controlledSelectedIds !== undefined) {
      return controlledSelectedIds instanceof Set
        ? controlledSelectedIds
        : new Set(controlledSelectedIds);
    }
    return uncontrolledSelected;
  }, [controlledSelectedIds, uncontrolledSelected]);

  const updateSelection = (nextSet: Set<string>) => {
    if (controlledSelectedIds === undefined) {
      setUncontrolledSelected(nextSet);
    }
    onSelectionChange?.(Array.from(nextSet));
  };

  const totalMatches = data.length;

  // Dynamic Rows Per Page rules ported from mockup/assets/js/admin-table.js
  const allowedPageSizes = useMemo(() => {
    if (!dynamicPageSizeOptions) return [5, 10, 20];
    if (totalMatches >= 20) return [5, 10, 20];
    if (totalMatches >= 10) return [5, 10];
    return [5];
  }, [dynamicPageSizeOptions, totalMatches]);

  const effectivePageSize = allowedPageSizes.includes(pageSize)
    ? pageSize
    : allowedPageSizes[0];

  const totalPages = Math.max(1, Math.ceil(totalMatches / effectivePageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const visibleRows = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * effectivePageSize;
    return data.slice(startIndex, startIndex + effectivePageSize);
  }, [data, safeCurrentPage, effectivePageSize]);

  const checkRowSelectable = (row: T) =>
    isRowSelectable ? isRowSelectable(row) : true;

  const selectableVisibleRows = useMemo(
    () => (selectable ? visibleRows.filter(checkRowSelectable) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectable, visibleRows, isRowSelectable]
  );

  const checkedVisibleCount = useMemo(
    () => selectableVisibleRows.filter((r) => selectedSet.has(getRowId(r))).length,
    [selectableVisibleRows, selectedSet, getRowId]
  );

  const allVisibleChecked =
    selectableVisibleRows.length > 0 &&
    checkedVisibleCount === selectableVisibleRows.length;
  const someVisibleChecked =
    checkedVisibleCount > 0 && !allVisibleChecked;

  const toggleRow = (row: T) => {
    if (!selectable || !checkRowSelectable(row)) return;
    const id = getRowId(row);
    const next = new Set(selectedSet);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    updateSelection(next);
  };

  const toggleAllVisible = () => {
    if (!selectable) return;
    const next = new Set(selectedSet);
    if (allVisibleChecked) {
      selectableVisibleRows.forEach((r) => next.delete(getRowId(r)));
    } else {
      selectableVisibleRows.forEach((r) => next.add(getRowId(r)));
    }
    updateSelection(next);
  };

  const totalColCount = columns.length + (selectable ? 1 : 0);

  const selectionText = useMemo(() => {
    if (!selectable) return '';
    if (selectionStatusFormat === 'compact') {
      return selectedSet.size > 0 ? `${selectedSet.size} selected` : '';
    }
    return checkedVisibleCount > 0
      ? `${checkedVisibleCount} of ${selectableVisibleRows.length} row(s) selected.`
      : '';
  }, [selectable, selectionStatusFormat, selectedSet.size, checkedVisibleCount, selectableVisibleRows.length]);

  const renderCellValue = (row: T, col: DataTableColumn<T>, idx: number) => {
    if (col.render) return col.render(row, idx);
    const record = row as Record<string, unknown>;
    const val = record[col.key];
    return val !== undefined && val !== null ? String(val) : '';
  };

  return (
    <div className={`table-margin-container ${className}`.trim()}>
      <div className="table-container ui-table-wrap">
        <div className="table-scroll">
          {layoutMode === 'table' ? (
            <table className="ui-table" aria-label={ariaLabel}>
              <thead>
                <tr>
                  {selectable && (
                    <th className="checkbox-cell" scope="col">
                      <Checkbox
                        isSelectAll
                        aria-label="Select all rows"
                        checked={allVisibleChecked}
                        indeterminate={someVisibleChecked}
                        disabled={selectableVisibleRows.length === 0 || isLoading}
                        onChange={toggleAllVisible}
                      />
                    </th>
                  )}
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      scope="col"
                      className={col.headerClass || col.colClass || undefined}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? [0, 1, 2].map((skeletonIdx) => (
                      <tr key={`skeleton-${skeletonIdx}`} className="skeleton-row">
                        <td colSpan={totalColCount}>
                          <div className="skeleton" />
                        </td>
                      </tr>
                    ))
                  : visibleRows.map((row, rowIdx) => {
                      const rowId = getRowId(row);
                      const isChecked = selectedSet.has(rowId);
                      const canSelect = selectable && checkRowSelectable(row);
                      return (
                        <Fragment key={rowId}>
                          <tr
                            className={isChecked ? 'checked' : undefined}
                            style={canSelect ? { cursor: 'pointer' } : undefined}
                            onClick={(e) => {
                              if (!canSelect) return;
                              const target = e.target as HTMLElement;
                              if (target.closest('button, a, input, select, textarea, label')) return;
                              toggleRow(row);
                            }}
                          >
                            {selectable && (
                              <td className="checkbox-cell">
                                <Checkbox
                                  isRowCheckbox
                                  aria-label={`Select row ${rowId}`}
                                  checked={isChecked}
                                  disabled={!canSelect}
                                  onChange={() => toggleRow(row)}
                                />
                              </td>
                            )}
                            {columns.map((col) => (
                              <td key={col.key} className={col.colClass || undefined}>
                                {renderCellValue(row, col, rowIdx)}
                              </td>
                            ))}
                          </tr>
                          {activeRejectionRowId === rowId && onCancelRejection && onConfirmRejection && (
                            <RejectionRow
                              asTableRow
                              colSpan={totalColCount}
                              onCancel={onCancelRejection}
                              onConfirm={(reason) => onConfirmRejection(reason, [rowId])}
                            />
                          )}
                        </Fragment>
                      );
                    })}
                {!isLoading && bulkRejectionOpen && onCancelRejection && onConfirmRejection && (
                  <RejectionRow
                    asTableRow
                    colSpan={totalColCount}
                    bulkCount={selectedSet.size}
                    onCancel={onCancelRejection}
                    onConfirm={(reason) => onConfirmRejection(reason, Array.from(selectedSet))}
                  />
                )}
              </tbody>
            </table>
          ) : (
            <>
              <div className="table-header-row" role="row">
                {selectable && (
                  <div className="th-cell checkbox-cell" role="columnheader">
                    <Checkbox
                      isSelectAll
                      aria-label="Select all rows"
                      checked={allVisibleChecked}
                      indeterminate={someVisibleChecked}
                      disabled={selectableVisibleRows.length === 0 || isLoading}
                      onChange={toggleAllVisible}
                    />
                  </div>
                )}
                {columns.map((col) => (
                  <div
                    key={col.key}
                    className={`th-cell ${col.headerClass || col.colClass || ''}`.trim()}
                    role="columnheader"
                  >
                    {col.label}
                  </div>
                ))}
              </div>

              <div className="table-body" role="rowgroup">
                {isLoading
                  ? [0, 1, 2].map((skeletonIdx) => (
                      <div key={`skeleton-${skeletonIdx}`} className="table-row skeleton-row" role="row">
                        <div
                          className="td-cell"
                          role="cell"
                          style={{ width: '100%', flex: '1 1 100%', display: 'flex', flexDirection: 'column', gap: '8px', border: 'none' }}
                        >
                          <div className="skeleton" />
                        </div>
                      </div>
                    ))
                  : visibleRows.map((row, rowIdx) => {
                      const rowId = getRowId(row);
                      const isChecked = selectedSet.has(rowId);
                      const canSelect = selectable && checkRowSelectable(row);
                      return (
                        <Fragment key={rowId}>
                          <div
                            className={`table-row table-fade-in ${isChecked ? 'checked' : ''}`.trim()}
                            role="row"
                            style={canSelect ? { cursor: 'pointer' } : undefined}
                            onClick={(e) => {
                              if (!canSelect) return;
                              const target = e.target as HTMLElement;
                              if (target.closest('button, a, input, select, textarea, label')) return;
                              toggleRow(row);
                            }}
                          >
                            {selectable && (
                              <div className="td-cell checkbox-cell" role="cell">
                                <Checkbox
                                  isRowCheckbox
                                  aria-label={`Select row ${rowId}`}
                                  checked={isChecked}
                                  disabled={!canSelect}
                                  onChange={() => toggleRow(row)}
                                />
                              </div>
                            )}
                            {columns.map((col) => (
                              <div
                                key={col.key}
                                className={`td-cell ${col.colClass || ''}`.trim()}
                                role="cell"
                              >
                                {renderCellValue(row, col, rowIdx)}
                              </div>
                            ))}
                          </div>
                          {activeRejectionRowId === rowId && onCancelRejection && onConfirmRejection && (
                            <RejectionRow
                              asTableRow={false}
                              colSpan={totalColCount}
                              onCancel={onCancelRejection}
                              onConfirm={(reason) => onConfirmRejection(reason, [rowId])}
                            />
                          )}
                        </Fragment>
                      );
                    })}
                {!isLoading && bulkRejectionOpen && onCancelRejection && onConfirmRejection && (
                  <RejectionRow
                    asTableRow={false}
                    colSpan={totalColCount}
                    bulkCount={selectedSet.size}
                    onCancel={onCancelRejection}
                    onConfirm={(reason) => onConfirmRejection(reason, Array.from(selectedSet))}
                  />
                )}
              </div>
            </>
          )}
        </div>

        {!isLoading && totalMatches === 0 && (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        )}
      </div>

      {/* Pagination & Bulk Actions Footer */}
      <div className="ui-table-pagination is-0272b5f">
        <div className="pagination-actions-group bottom-bar-container">
          {(showSelectAllButton || bulkActions) && (
            <div className="action-btn-group">
              {showSelectAllButton && selectable && (
                <Button
                  variant="select-all"
                  hasSelection={allVisibleChecked}
                  onClick={toggleAllVisible}
                  disabled={selectableVisibleRows.length === 0 || isLoading}
                >
                  Select All
                </Button>
              )}
              {bulkActions}
            </div>
          )}
          <span className="pagination-selection-status is-7fbae58" role="status">
            {selectionText}
          </span>
        </div>

        <div className="pagination-controls-group is-31de0eb">
          <div className="pagination-rows-per-page is-b57eafe">
            <label htmlFor={rowsPerPageSelectId}>Rows per page</label>
            <div className="pagination-select-wrapper is-e0dd7f8">
              <select
                id={rowsPerPageSelectId}
                className="ui-select-pill is-daab64f"
                aria-label="Rows per page"
                value={effectivePageSize}
                disabled={dynamicPageSizeOptions && totalMatches <= 5}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                {allowedPageSizes.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
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
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>

          <span className="pagination-page-info is-12b4142" role="status">
            {isLoading
              ? `Loading ${entityName}…`
              : totalMatches > 0
              ? `Page ${safeCurrentPage} of ${totalPages} · ${totalMatches} ${entityName}`
              : `0 ${entityName}`}
          </span>

          <div className="ui-table-pagination-nav is-49e15c7">
            <Button
              variant="outline"
              className="is-b38e363"
              disabled={isLoading || safeCurrentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              className="is-b38e363"
              disabled={isLoading || safeCurrentPage >= totalPages || totalMatches === 0}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


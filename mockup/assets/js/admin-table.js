/**
 * Universal Portal Table Controller (SPMIS Admin & Faculty Portals)
 * Replicates the robust table behavior of the Design System and Faculty Portal:
 * - Immediate skeleton shimmer animation on initial page load / filter / page switch
 * - Dynamic pagination: "Rows per page" (5, 10, 20), "Page X of Y · N entries"
 * - Dynamic Previous / Next pagination button states (disabled when at boundary)
 * - Real-time live filtering and search with debounced skeleton feedback
 * - Select-all checkbox & live selection counter ("X of Y row(s) selected")
 * - Row hover and selection highlighting
 * - MutationObserver to automatically re-slice when records are added/edited/removed via modals
 * - Self-initializes on DOMContentLoaded for all portal tables
 */

(function () {
  'use strict';

  window.initAdminTable = function (config = {}) {
    let container = config.container;
    if (typeof container === 'string') container = document.querySelector(container);

    let tableBody = config.tableBody;
    if (typeof tableBody === 'string') tableBody = document.querySelector(tableBody);
    if (!tableBody && container) {
      tableBody = container.querySelector('tbody, .table-body, table') || container;
    }
    if (!tableBody) {
      tableBody = document.querySelector('#tableBody, .table-container tbody, .table-container .table-body, .ui-table tbody, .ui-table-wrap tbody, .ui-table-wrap .table-body, table tbody');
    }
    if (!tableBody) return null;

    if (!container) {
      container = tableBody.closest('.table-container, .ui-table-wrap, .table-margin-container, .section-container') || tableBody.parentElement;
    }

    const isTable = tableBody.tagName.toLowerCase() === 'tbody' || tableBody.tagName.toLowerCase() === 'table';
    const thead = container.querySelector('thead, .table-header-row');
    const colCount = thead ? (thead.querySelectorAll('th, .th-cell').length || 6) : (config.colCount || 6);

    const searchInput = config.searchInput 
      ? (typeof config.searchInput === 'string' ? document.querySelector(config.searchInput) : config.searchInput)
      : document.querySelector('#searchInput, #search, #entity-search, #application-search, .search-input');

    const paginationEl = config.pagination
      ? (typeof config.pagination === 'string' ? document.querySelector(config.pagination) : config.pagination)
      : (container.parentElement ? container.parentElement.querySelector('.ui-table-pagination') : null) || document.querySelector('.ui-table-pagination');

    const rowsPerPageSelect = config.rowsPerPage
      ? (typeof config.rowsPerPage === 'string' ? document.querySelector(config.rowsPerPage) : config.rowsPerPage)
      : (paginationEl ? paginationEl.querySelector('.ui-select-pill, select') : document.querySelector('.ui-table-pagination select, #rows-per-page'));

    const rowsPerPageGroup = rowsPerPageSelect
      ? rowsPerPageSelect.closest('.pagination-rows-per-page, .is-b57eafe')
      : null;

    const pageInfo = config.pageInfo
      ? (typeof config.pageInfo === 'string' ? document.querySelector(config.pageInfo) : config.pageInfo)
      : (paginationEl ? paginationEl.querySelector('.pagination-page-info, #page-label, [role="status"]:not(.pagination-selection-status):not(.is-7fbae58)') : null);

    const prevBtn = config.prevBtn
      ? (typeof config.prevBtn === 'string' ? document.querySelector(config.prevBtn) : config.prevBtn)
      : (paginationEl ? paginationEl.querySelector('.ui-table-pagination-nav button:first-of-type, #previous') : null);

    const nextBtn = config.nextBtn
      ? (typeof config.nextBtn === 'string' ? document.querySelector(config.nextBtn) : config.nextBtn)
      : (paginationEl ? paginationEl.querySelector('.ui-table-pagination-nav button:last-of-type, #next') : null);

    const selectAllCb = config.selectAllCheckbox
      ? (typeof config.selectAllCheckbox === 'string' ? document.querySelector(config.selectAllCheckbox) : config.selectAllCheckbox)
      : document.querySelector('thead input[type="checkbox"], .table-header-row input[type="checkbox"], .select-all-checkbox');

    const selectAllBtn = document.querySelector('.pill-btn.select-all, button.select-all');

    const selectionCountEl = config.selectionCount
      ? (typeof config.selectionCount === 'string' ? document.querySelector(config.selectionCount) : config.selectionCount)
      : (paginationEl ? paginationEl.querySelector('.pagination-selection-status, .is-7fbae58') : document.querySelector('#selection-count'));

    const emptyState = config.emptyState
      ? (typeof config.emptyState === 'string' ? document.querySelector(config.emptyState) : config.emptyState)
      : container.querySelector('.ui-empty-state, #emptyState, .empty-state');
    const emptyTitle = emptyState && emptyState.querySelector('[data-empty-title]');
    const emptyDescription = emptyState && emptyState.querySelector('[data-empty-description]');
    const defaultEmptyTitle = emptyTitle ? emptyTitle.textContent : '';
    const defaultEmptyDescription = emptyDescription ? emptyDescription.textContent : '';

    const filterElements = config.filterElements
      ? config.filterElements.map(el => typeof el === 'string' ? document.querySelector(el) : el).filter(Boolean)
      : Array.from(document.querySelectorAll('.controls-actions select:not(.ui-select-pill), .controls-container select:not(.ui-select-pill), .filters select:not(.ui-select-pill), .dropdown-select:not(.ui-select-pill)'))
          .filter(sel => !sel.closest('.modal-overlay, .modal-card, dialog, form:not(.filter-form)'));

    const entityName = config.entityName || 'entries';
    let currentPage = 1;
    let pageSize = rowsPerPageSelect ? parseInt(rowsPerPageSelect.value, 10) || 5 : 5;
    let filterTimer = null;
    let isInitialLoad = true;

    function getRows() {
      const rows = Array.from(tableBody.querySelectorAll('tr, .table-row')).filter(
        r => !r.classList.contains('skeleton-row') && r.parentElement === tableBody
      );
      rows.forEach(r => {
        if (r.querySelector('input[type="checkbox"]')) {
          r.style.cursor = 'pointer';
        }
      });
      return rows;
    }

    function getVisibleRowCheckboxes() {
      return Array.from(tableBody.querySelectorAll('tr:not([style*="display: none"]):not([style*="display:none"]):not(.skeleton-row) input[type="checkbox"], .table-row:not([style*="display: none"]):not([style*="display:none"]):not(.skeleton-row) input[type="checkbox"]'));
    }

    function updateCheckboxes() {
      const visibleRowCheckboxes = getVisibleRowCheckboxes();
      const total = visibleRowCheckboxes.length;
      const checked = visibleRowCheckboxes.filter(cb => cb.checked).length;

      if (selectAllCb) {
        if (checked === 0 || total === 0) {
          selectAllCb.checked = false;
          selectAllCb.indeterminate = false;
        } else if (checked === total) {
          selectAllCb.checked = true;
          selectAllCb.indeterminate = false;
        } else {
          selectAllCb.checked = false;
          selectAllCb.indeterminate = true;
        }
      }

      if (selectionCountEl) {
        selectionCountEl.textContent = checked > 0 ? `${checked} of ${total} row(s) selected.` : '';
      }
    }

    if (selectAllCb) {
      selectAllCb.addEventListener('change', (e) => {
        const visibleRowCheckboxes = getVisibleRowCheckboxes();
        visibleRowCheckboxes.forEach(cb => {
          cb.checked = e.target.checked;
          const row = cb.closest('tr, .table-row');
          if (row) {
            if (e.target.checked) row.classList.add('checked');
            else row.classList.remove('checked');
          }
        });
        updateCheckboxes();
      });
    }

    if (selectAllBtn) {
      selectAllBtn.addEventListener('click', () => {
        const visibleRowCheckboxes = getVisibleRowCheckboxes();
        const allChecked = visibleRowCheckboxes.length > 0 && visibleRowCheckboxes.every(cb => cb.checked);
        visibleRowCheckboxes.forEach(cb => {
          cb.checked = !allChecked;
          const row = cb.closest('tr, .table-row');
          if (row) {
            if (!allChecked) row.classList.add('checked');
            else row.classList.remove('checked');
          }
        });
        updateCheckboxes();
      });
    }

    tableBody.addEventListener('change', (e) => {
      if (e.target && (e.target.classList.contains('row-checkbox') || e.target.type === 'checkbox')) {
        const row = e.target.closest('tr, .table-row');
        if (row) {
          if (e.target.checked) row.classList.add('checked');
          else row.classList.remove('checked');
        }
        updateCheckboxes();
      }
    });

    tableBody.addEventListener('click', (e) => {
      const row = e.target.closest('tr, .table-row');
      if (!row || row.classList.contains('skeleton-row')) return;
      if (e.target.tagName === 'INPUT' || e.target.closest('button, a, select, textarea, label')) return;
      const cb = row.querySelector('.row-checkbox, input[type="checkbox"]');
      if (cb) {
        cb.checked = !cb.checked;
        if (cb.checked) row.classList.add('checked');
        else row.classList.remove('checked');
        updateCheckboxes();
      }
    });

    let lastTotalPages = 1;

    function renderRows() {
      const allRows = getRows();
      const query = searchInput ? (searchInput.value || '').trim().toLowerCase() : '';

      const activeFilters = filterElements.map(sel => ({
        id: (sel.id || '').toLowerCase(),
        val: (sel.value || '').toLowerCase()
      }));

      const matchedRows = allRows.filter(row => {
        let matchesSearch = true;
        if (query) {
          if (config.searchFields) {
            matchesSearch = config.searchFields(row, query);
          } else {
            const rowText = (row.textContent || '').toLowerCase();
            const dataText = Object.values(row.dataset || {}).join(' ').toLowerCase();
            matchesSearch = rowText.includes(query) || dataText.includes(query);
          }
        }

        let matchesFilter = true;
        if (config.filterMatches) {
          matchesFilter = config.filterMatches(row);
        } else {
          for (const { val } of activeFilters) {
            if (!val || val === 'all' || val === '' || val.includes('all') || val === 'oldest' || val === 'newest') continue;
            let found = false;
            for (const v of Object.values(row.dataset || {})) {
              if (v.toLowerCase() === val || v.toLowerCase().includes(val)) {
                found = true;
                break;
              }
            }
            if (!found) {
              if (!row.textContent.toLowerCase().includes(val)) {
                matchesFilter = false;
                break;
              }
            }
          }
        }

        return matchesSearch && matchesFilter;
      });

      const totalMatches = matchedRows.length;

      // Dynamic Rows Per Page rules:
      // - If entries <= 5: no rows per page dropdown (hidden)
      // - If 5 < entries <= 10: only option 5
      // - If 10 < entries <= 20: options 5 and 10
      // - If entries > 20: options 5, 10, and 20
      if (rowsPerPageSelect) {
        if (totalMatches <= 5) {
          if (rowsPerPageGroup) rowsPerPageGroup.style.display = 'none';
          pageSize = 5;
        } else {
          if (rowsPerPageGroup) rowsPerPageGroup.style.display = '';
          let allowedSizes = [];
          if (totalMatches > 5 && totalMatches <= 10) {
            allowedSizes = [5];
          } else if (totalMatches > 10 && totalMatches <= 20) {
            allowedSizes = [5, 10];
          } else {
            allowedSizes = [5, 10, 20];
          }

          const currentVal = parseInt(rowsPerPageSelect.value, 10) || 5;
          rowsPerPageSelect.innerHTML = allowedSizes
            .map(opt => `<option value="${opt}">${opt}</option>`)
            .join('');

          if (allowedSizes.includes(currentVal)) {
            rowsPerPageSelect.value = String(currentVal);
            pageSize = currentVal;
          } else {
            pageSize = allowedSizes[0];
            rowsPerPageSelect.value = String(pageSize);
          }
        }
      }

      const totalPages = Math.max(1, Math.ceil(totalMatches / pageSize));
      lastTotalPages = totalPages;
      if (currentPage > totalPages) currentPage = totalPages;
      if (currentPage < 1) currentPage = 1;

      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;

      allRows.forEach(row => {
        row.style.setProperty('display', 'none', 'important');
        row.hidden = true;
      });

      matchedRows.forEach((row, index) => {
        if (index >= startIndex && index < endIndex) {
          row.style.removeProperty('display');
          row.hidden = false;
          row.classList.add('table-fade-in');
        } else {
          row.style.setProperty('display', 'none', 'important');
          row.hidden = true;
        }
      });

      if (emptyState) {
        if (emptyTitle) emptyTitle.textContent = allRows.length ? 'No matching results' : defaultEmptyTitle;
        if (emptyDescription) emptyDescription.textContent = allRows.length
          ? 'Try another search or clear the filters.'
          : defaultEmptyDescription;
        emptyState.hidden = totalMatches !== 0;
      }

      if (pageInfo) {
        pageInfo.innerHTML = totalMatches > 0
          ? `Page ${currentPage} of ${totalPages} &middot; ${totalMatches} ${entityName}`
          : `0 ${entityName}`;
      }

      if (prevBtn) {
        prevBtn.disabled = currentPage <= 1;
      }
      if (nextBtn) {
        nextBtn.disabled = currentPage >= totalPages || totalMatches === 0;
      }

      updateCheckboxes();
    }

    function loadTableWithSkeleton(delay = 250) {
      clearTimeout(filterTimer);

      const rows = Array.from(tableBody.children);
      rows.forEach(r => {
        if (r.classList.contains('skeleton-row')) {
          r.remove();
        } else {
          r.style.setProperty('display', 'none', 'important');
          r.hidden = true;
        }
      });

      if (emptyState) emptyState.hidden = true;

      // Insert 3 skeleton shimmer rows matching table structure
      const frag = document.createDocumentFragment();
      for (let i = 0; i < 3; i++) {
        if (isTable) {
          const skelRow = document.createElement('tr');
          skelRow.className = 'skeleton-row';
          skelRow.innerHTML = `<td colspan="${colCount}"><div class="skeleton"></div></td>`;
          frag.appendChild(skelRow);
        } else {
          const skelRow = document.createElement('div');
          skelRow.className = 'table-row skeleton-row';
          skelRow.innerHTML = `<div class="td-cell" style="width: 100%; flex: 1 1 100%; display: flex; flex-direction: column; gap: 8px; border: none !important;"><div class="skeleton"></div></div>`;
          frag.appendChild(skelRow);
        }
      }
      tableBody.appendChild(frag);

      if (pageInfo) {
        pageInfo.textContent = `Loading ${entityName}…`;
      }

      if (prevBtn) prevBtn.disabled = true;
      if (nextBtn) nextBtn.disabled = true;

      filterTimer = setTimeout(() => {
        tableBody.querySelectorAll('.skeleton-row').forEach(sr => sr.remove());
        renderRows();
      }, delay);
    }

    // Search input listener with debounced skeleton
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        currentPage = 1;
        loadTableWithSkeleton(200);
      });
    }

    // Filter selects listener with debounced skeleton
    filterElements.forEach(el => {
      el.addEventListener('change', () => {
        currentPage = 1;
        loadTableWithSkeleton(220);
      });
    });

    const controlsArea = document.querySelector('.controls-container, .controls-actions, .filters');
    if (controlsArea) {
      controlsArea.addEventListener('change', (e) => {
        if (e.target && e.target.tagName === 'SELECT' && !e.target.classList.contains('ui-select-pill')) {
          currentPage = 1;
          loadTableWithSkeleton(220);
        }
      });
    }

    // Rows per page listener
    if (rowsPerPageSelect) {
      rowsPerPageSelect.addEventListener('change', () => {
        pageSize = parseInt(rowsPerPageSelect.value, 10) || 5;
        currentPage = 1;
        loadTableWithSkeleton(200);
      });
    }

    // Previous page button
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
          currentPage--;
          loadTableWithSkeleton(180);
        }
      });
    }

    // Next page button
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (currentPage < lastTotalPages) {
          currentPage++;
          loadTableWithSkeleton(180);
        }
      });
    }

    // MutationObserver to auto-update pagination when rows are added, edited, or removed
    let mutationTimer = null;
    const observer = new MutationObserver(mutations => {
      const hasStructuralChange = mutations.some(m => {
        const added = Array.from(m.addedNodes).some(n => n.nodeType === 1 && !n.classList.contains('skeleton-row'));
        const removed = Array.from(m.removedNodes).some(n => n.nodeType === 1 && !n.classList.contains('skeleton-row'));
        return added || removed;
      });
      if (hasStructuralChange) {
        clearTimeout(mutationTimer);
        mutationTimer = setTimeout(() => {
          renderRows();
        }, 50);
      }
    });
    observer.observe(tableBody, { childList: true });

    // Initial load with skeleton shimmer animation
    loadTableWithSkeleton(isInitialLoad ? 280 : 0);
    isInitialLoad = false;

    const controller = {
      reload: (delay = 200) => loadTableWithSkeleton(delay),
      render: renderRows,
      observer
    };

    if (container) container.__tableController = controller;
    if (tableBody) tableBody.__tableController = controller;
    window.adminTableController = controller;

    return controller;
  };

  // Auto-initialize any portal table with pagination when document is ready
  document.addEventListener('DOMContentLoaded', () => {
    const tableWraps = document.querySelectorAll('.table-container, .ui-table-wrap');
    tableWraps.forEach(tw => {
      if (!tw.dataset.tableControlled && !tw.closest('#roster-results, #entity-list, #application-list')) {
        tw.dataset.tableControlled = 'true';
        window.initAdminTable({ container: tw });
      }
    });
  });
})();

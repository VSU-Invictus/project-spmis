/**
 * Admin Table Controller (Shared for SPMIS Admin Portal)
 * Replicates the robust table behavior of page/faculty/student:
 * - Immediate skeleton shimmer animation on initial page load / navigation
 * - Status indicator "Loading [name]…" during loads
 * - Disabled Previous & Next buttons while loading
 * - Dynamic pagination: "Page X of Y · N entries"
 * - Dynamic Previous / Next pagination button states
 * - Selectable Rows per page (5, 10, etc.) with paging slice
 * - Filter & search with debounce and skeleton shimmer
 * - Empty state with "Clear filters" button
 * - Select-all checkbox & selection counter ("X of Y row(s) selected")
 */

window.initAdminTable = function (config) {
  const tableBody = typeof config.tableBody === 'string' ? document.querySelector(config.tableBody) : config.tableBody;
  if (!tableBody) return null;

  const table = tableBody.closest('table');
  const thead = table ? table.querySelector('thead') : null;
  const colCount = thead ? thead.querySelectorAll('th').length : (config.colCount || 6);

  const searchInput = config.searchInput ? document.querySelector(config.searchInput) : document.querySelector('#searchInput');
  const emptyState = config.emptyState ? document.querySelector(config.emptyState) : document.querySelector('#emptyState');
  const pageInfo = config.pageInfo ? document.querySelector(config.pageInfo) : document.querySelector('.ui-table-pagination-nav > span:not([style*="display: flex"]):not([style*="display:flex"])') || document.querySelector('#pageInfo');
  const rowsPerPageSelect = config.rowsPerPage ? document.querySelector(config.rowsPerPage) : document.querySelector('.ui-select-pill');
  const prevBtn = config.prevBtn ? document.querySelector(config.prevBtn) : document.querySelector('.ui-table-page-btn:first-of-type');
  const nextBtn = config.nextBtn ? document.querySelector(config.nextBtn) : document.querySelector('.ui-table-page-btn:last-of-type');

  const selectAllCb = typeof config.selectAllCheckbox === 'string' ? document.querySelector(config.selectAllCheckbox) : (config.selectAllCheckbox || document.querySelector('.select-all-checkbox'));
  const selectionCountEl = typeof config.selectionCount === 'string' ? document.querySelector(config.selectionCount) : (config.selectionCount || document.querySelector('#selection-count'));

  const entityName = config.entityName || 'entries';
  let currentPage = 1;
  let pageSize = rowsPerPageSelect ? parseInt(rowsPerPageSelect.value, 10) || 5 : 5;
  let filterTimer = null;

  // Ensure empty state has clear filters button
  if (emptyState && !emptyState.querySelector('.empty-state-btn')) {
    let clearBtn = document.createElement('button');
    clearBtn.type = 'button';
    clearBtn.className = 'empty-state-btn';
    clearBtn.textContent = 'Clear filters';
    clearBtn.addEventListener('click', clearFilters);
    emptyState.appendChild(clearBtn);
  }

  function getRows() {
    const rows = Array.from(tableBody.querySelectorAll('tr')).filter(tr => !tr.classList.contains('skeleton-row'));
    rows.forEach(r => {
      if (r.querySelector('input[type="checkbox"]')) r.style.cursor = 'pointer';
    });
    return rows;
  }

  function getVisibleRowCheckboxes() {
    return Array.from(tableBody.querySelectorAll('tr:not([style*="display: none"]):not([style*="display:none"]):not(.skeleton-row) input[type="checkbox"]'));
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
      selectionCountEl.textContent = `${checked} of ${total} row(s) selected.`;
    }
  }

  if (selectAllCb) {
    selectAllCb.addEventListener('change', (e) => {
      const visibleRowCheckboxes = getVisibleRowCheckboxes();
      visibleRowCheckboxes.forEach(cb => {
        cb.checked = e.target.checked;
        const row = cb.closest('tr');
        if (row) {
          if (e.target.checked) row.classList.add('checked');
          else row.classList.remove('checked');
        }
      });
      updateCheckboxes();
    });
  }

  tableBody.addEventListener('change', (e) => {
    if (e.target && (e.target.classList.contains('row-checkbox') || e.target.type === 'checkbox')) {
      const row = e.target.closest('tr');
      if (row) {
        if (e.target.checked) row.classList.add('checked');
        else row.classList.remove('checked');
      }
      updateCheckboxes();
    }
  });

  tableBody.addEventListener('click', (e) => {
    const tr = e.target.closest('tr');
    if (!tr || tr.classList.contains('skeleton-row')) return;
    if (e.target.tagName === 'INPUT' || e.target.closest('button, a, select, textarea, label')) return;
    const cb = tr.querySelector('.row-checkbox, input[type="checkbox"]');
    if (cb) {
      cb.checked = !cb.checked;
      if (cb.checked) tr.classList.add('checked');
      else tr.classList.remove('checked');
      updateCheckboxes();
    }
  });

  function clearFilters() {
    if (searchInput) searchInput.value = '';
    if (config.filterElements) {
      config.filterElements.forEach(sel => {
        const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
        if (el) el.selectedIndex = 0;
      });
    }
    currentPage = 1;
    loadTableWithSkeleton(200);
  }

  function renderRows() {
    const allRows = getRows();
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';

    const matchedRows = allRows.filter(row => {
      let matchesSearch = true;
      if (query && config.searchFields) {
        matchesSearch = config.searchFields(row, query);
      } else if (query) {
        matchesSearch = row.textContent.toLowerCase().includes(query);
      }

      let matchesFilter = true;
      if (config.filterMatches) {
        matchesFilter = config.filterMatches(row);
      }

      return matchesSearch && matchesFilter;
    });

    const totalMatches = matchedRows.length;
    const totalPages = Math.max(1, Math.ceil(totalMatches / pageSize));
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    // Show/hide based on pagination slice
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    allRows.forEach(row => {
      row.style.display = 'none';
    });

    matchedRows.forEach((row, index) => {
      if (index >= startIndex && index < endIndex) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    });

    // Update empty state
    if (emptyState) {
      emptyState.style.display = totalMatches === 0 ? 'flex' : 'none';
    }

    // Update page label
    if (pageInfo) {
      pageInfo.innerHTML = totalMatches > 0
        ? `Page ${currentPage} of ${totalPages} &middot; ${totalMatches} ${entityName}`
        : `0 ${entityName}`;
    }

    // Update pagination button states
    if (prevBtn) {
      prevBtn.disabled = currentPage <= 1;
      prevBtn.style.color = prevBtn.disabled ? '#6C655D' : '#FFFFFF';
      prevBtn.style.cursor = prevBtn.disabled ? 'default' : 'pointer';
    }
    if (nextBtn) {
      nextBtn.disabled = currentPage >= totalPages || totalMatches === 0;
      nextBtn.style.color = nextBtn.disabled ? '#6C655D' : '#FFFFFF';
      nextBtn.style.cursor = nextBtn.disabled ? 'default' : 'pointer';
    }

    updateCheckboxes();
  }

  function loadTableWithSkeleton(delay = 250) {
    clearTimeout(filterTimer);

    // Hide all normal rows and existing skeleton
    const rows = Array.from(tableBody.children);
    rows.forEach(r => {
      if (r.classList.contains('skeleton-row')) {
        r.remove();
      } else {
        r.style.display = 'none';
      }
    });

    if (emptyState) emptyState.style.display = 'none';

    // Show 3 skeleton rows
    const skelRow = document.createElement('tr');
    skelRow.className = 'skeleton-row';
    skelRow.innerHTML = `<td colspan="${colCount}"><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div></td>`;
    tableBody.appendChild(skelRow);

    // Set page label to loading status
    if (pageInfo) {
      pageInfo.textContent = `Loading ${entityName}…`;
    }

    // Disable navigation buttons during load
    if (prevBtn) {
      prevBtn.disabled = true;
      prevBtn.style.color = '#6C655D';
      prevBtn.style.cursor = 'default';
    }
    if (nextBtn) {
      nextBtn.disabled = true;
      nextBtn.style.color = '#6C655D';
      nextBtn.style.cursor = 'default';
    }

    filterTimer = setTimeout(() => {
      const s = tableBody.querySelector('.skeleton-row');
      if (s) s.remove();
      renderRows();
    }, delay);
  }

  // Attach search input listener
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      currentPage = 1;
      loadTableWithSkeleton(200);
    });
  }

  // Attach filter element listeners
  if (config.filterElements) {
    config.filterElements.forEach(sel => {
      const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
      if (el) {
        el.addEventListener('change', () => {
          currentPage = 1;
          loadTableWithSkeleton(220);
        });
      }
    });
  }

  // Attach rowsPerPage listener
  if (rowsPerPageSelect) {
    rowsPerPageSelect.addEventListener('change', () => {
      pageSize = parseInt(rowsPerPageSelect.value, 10) || 5;
      currentPage = 1;
      loadTableWithSkeleton(220);
    });
  }

  // Attach pagination navigation
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        loadTableWithSkeleton(180);
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const allRows = getRows();
      const totalMatches = allRows.filter(row => {
        let mSearch = !searchInput || !searchInput.value.trim() || (config.searchFields ? config.searchFields(row, searchInput.value.trim().toLowerCase()) : true);
        let mFilter = !config.filterMatches || config.filterMatches(row);
        return mSearch && mFilter;
      }).length;
      const totalPages = Math.max(1, Math.ceil(totalMatches / pageSize));

      if (currentPage < totalPages) {
        currentPage++;
        loadTableWithSkeleton(180);
      }
    });
  }

  // Execute initial load with skeleton!
  loadTableWithSkeleton(280);

  return {
    reload: (delay = 200) => loadTableWithSkeleton(delay),
    filter: renderRows,
    clear: clearFilters
  };
};

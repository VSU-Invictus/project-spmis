(() => {
  'use strict';

  function initAuditLog() {
    const tableBody = document.getElementById('tableBody');
    const searchInput = document.getElementById('searchInput');
    const userFilter = document.getElementById('userFilter');
    const dateFilter = document.getElementById('dateFilter');
    const actionFilter = document.getElementById('actionFilter');
    const emptyState = document.getElementById('emptyState');

    if (!tableBody) return;

    function filterRows() {
      const controller = tableBody?.__tableController || window.adminTableController;
      if (controller) {
        controller.render();
        return;
      }
      const query = (searchInput?.value || '').trim().toLowerCase();
      const user = userFilter?.value || 'all';
      const date = dateFilter?.value || 'all';
      const action = actionFilter?.value || 'all';
      let visibleCount = 0;

      [...tableBody.querySelectorAll('tr, .table-row')].forEach((row) => {
        const searchData = (row.dataset.search || '').toLowerCase();
        const matchesText = !query || searchData.includes(query);
        const matchesUser = user === 'all' || row.dataset.user === user;
        const matchesDate = date === 'all' || row.dataset.date === date;
        const matchesAction = action === 'all' || row.dataset.action === action;

        const visible = matchesText && matchesUser && matchesDate && matchesAction;
        row.style.display = visible ? '' : 'none';
        if (visible) visibleCount++;
      });

      if (emptyState) {
        emptyState.style.display = visibleCount === 0 ? 'flex' : 'none';
      }
    }

    if (!window.adminTableController && !tableBody?.__tableController) {
      searchInput?.addEventListener('input', filterRows);
      userFilter?.addEventListener('change', filterRows);
      dateFilter?.addEventListener('change', filterRows);
      actionFilter?.addEventListener('change', filterRows);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuditLog);
  } else {
    initAuditLog();
  }
})();


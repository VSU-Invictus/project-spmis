/* Extracted from pages/admin/audit-log.html */
const userFilter = document.getElementById('userFilter');
const dateFilter = document.getElementById('dateFilter');
const actionFilter = document.getElementById('actionFilter');

const adminTable = window.initAdminTable({
  tableBody: '#tableBody',
  searchInput: '#searchInput',
  filterElements: ['#userFilter', '#dateFilter', '#actionFilter'],
  emptyState: '#emptyState',
  rowsPerPage: '.ui-select-pill',
  prevBtn: '.ui-table-page-btn:first-of-type',
  nextBtn: '.ui-table-page-btn:last-of-type',
  entityName: 'audit logs',
  searchFields: (row, query) => {
    const searchVal = row.dataset.search || row.textContent.toLowerCase();
    return searchVal.includes(query);
  },
  filterMatches: (row) => {
    const user = userFilter ? userFilter.value : 'all';
    const date = dateFilter ? dateFilter.value : 'all';
    const action = actionFilter ? actionFilter.value : 'all';

    const matchesUser = user === 'all' || row.dataset.user === user;
    const matchesDate = date === 'all' || row.dataset.date === date;
    const matchesAction = action === 'all' || row.dataset.action === action;

    return matchesUser && matchesDate && matchesAction;
  }
});

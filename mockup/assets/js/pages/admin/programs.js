(() => {
  'use strict';
  function initPrograms() {
    const tableBody = document.getElementById('tableBody');
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const emptyState = document.getElementById('emptyState');
    const entityModal = document.getElementById('entityModal');
    const removeModal = document.getElementById('removeModal');
    const entityForm = document.getElementById('entityForm');
    const entityName = document.getElementById('entityName');
    const entityModalTitle = document.getElementById('entityModalTitle');
    const toast = document.getElementById('toast');

    if (!tableBody) return;
    let mode = 'create';
    let selectedRow = null;

    function openModal(modal) { if (modal) modal.classList.add('show'); }
    function closeModal(modal) { if (modal) modal.classList.remove('show'); }
    function showToast(message) {
      if (!toast) return;
      toast.textContent = message;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2200);
    }

    function filterRows() {
      const controller = tableBody?.__tableController || window.adminTableController;
      if (controller) {
        controller.render();
        return;
      }
      const query = (searchInput?.value || '').trim().toLowerCase();
      const status = statusFilter?.value || 'all';
      let visibleCount = 0;
      [...tableBody.querySelectorAll('tr, .table-row')].forEach(row => {
        const visible = (row.dataset.name || '').includes(query) && (status === 'all' || row.dataset.status === status);
        row.style.display = visible ? '' : 'none';
        if (visible) visibleCount++;
      });
      if (emptyState) emptyState.style.display = visibleCount === 0 ? 'flex' : 'none';
    }

    document.getElementById('addButton')?.addEventListener('click', () => {
      mode = 'create';
      selectedRow = null;
      if (entityModalTitle) entityModalTitle.textContent = 'Create Program';
      if (entityName) entityName.value = '';
      openModal(entityModal);
    });

    tableBody.addEventListener('click', event => {
      const row = event.target.closest('tr, .table-row');
      if (!row) return;
      if (event.target.classList.contains('edit-btn')) {
        mode = 'edit';
        selectedRow = row;
        if (entityModalTitle) entityModalTitle.textContent = 'Edit Program';
        const nameCell = row.querySelector('.col-program') || row.children[0];
        if (entityName) entityName.value = nameCell?.textContent.trim() || '';
        openModal(entityModal);
      }
      if (event.target.classList.contains('remove-btn')) {
        selectedRow = row;
        openModal(removeModal);
      }
    });

    entityForm?.addEventListener('submit', event => {
      event.preventDefault();
      const value = entityName?.value.trim();
      if (!value) return;
      if (mode === 'edit' && selectedRow) {
        const nameCell = selectedRow.querySelector('.col-program') || selectedRow.children[0];
        if (nameCell) nameCell.textContent = value;
        selectedRow.dataset.name = value.toLowerCase();
        closeModal(entityModal);
        setTimeout(() => showToast('Program Updated Successfully'), 120);
      } else {
        const row = document.createElement('div');
        row.className = 'table-row';
        row.dataset.name = value.toLowerCase();
        row.dataset.status = 'approved';
        row.innerHTML = `<div class="td-cell col-program">${value}</div><div class="td-cell col-status text-center"><span class="ui-badge ui-badge--success"><svg class="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>Approved</span></div><div class="td-cell col-action text-right"><div class="action-group"><button class="pill-btn edit-btn" type="button">Edit</button> <button class="pill-btn remove-btn" type="button">Remove</button></div></div>`;
        tableBody.prepend(row);
        closeModal(entityModal);
        setTimeout(() => showToast('Program Created Successfully'), 120);
      }
      filterRows();
    });

    document.getElementById('confirmRemove')?.addEventListener('click', () => {
      if (!selectedRow) return;
      selectedRow.remove();
      selectedRow = null;
      closeModal(removeModal);
      setTimeout(() => showToast('Program Removed Successfully'), 120);
      filterRows();
    });

    document.getElementById('cancelRemove')?.addEventListener('click', () => closeModal(removeModal));
    document.getElementById('closeRemove')?.addEventListener('click', () => closeModal(removeModal));
    document.getElementById('closeEntity')?.addEventListener('click', () => closeModal(entityModal));
    document.getElementById('cancelEntity')?.addEventListener('click', () => closeModal(entityModal));
    if (!window.adminTableController && !tableBody?.__tableController) {
      searchInput?.addEventListener('input', filterRows);
      statusFilter?.addEventListener('change', filterRows);
    }

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') { closeModal(entityModal); closeModal(removeModal); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initPrograms);
  else initPrograms();
})();

(() => {
  'use strict';
  function initFaculty() {
    const tableBody = document.getElementById('tableBody');
    const searchInput = document.getElementById('searchInput');
    const departmentFilter = document.getElementById('departmentFilter');
    const emptyState = document.getElementById('emptyState');
    const facultyModal = document.getElementById('facultyModal');
    const removeModal = document.getElementById('removeModal');
    const facultyForm = document.getElementById('facultyForm');
    const facultyName = document.getElementById('facultyName');
    const facultyEmail = document.getElementById('facultyEmail');
    const facultyDepartment = document.getElementById('facultyDepartment');
    const facultyRole = document.getElementById('facultyRole');
    const facultyModalTitle = document.getElementById('facultyModalTitle');
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
    function roleBadge(role) {
      const isAdm = (role || '').toLowerCase() === 'admin';
      const variant = isAdm ? 'destructive' : 'info';
      const label = isAdm ? 'Admin' : 'Faculty';
      return '<span class="ui-badge ui-badge--' + variant + '">' + label + '</span>';
    }

    function filterRows() {
      const controller = tableBody?.__tableController || window.adminTableController;
      if (controller) {
        controller.render();
        return;
      }
      const query = (searchInput?.value || '').trim().toLowerCase();
      const department = departmentFilter?.value || 'all';
      let visibleCount = 0;
      [...tableBody.querySelectorAll('tr, .table-row')].forEach(row => {
        const matchesText = (row.dataset.name || '').includes(query) || (row.dataset.email || '').includes(query);
        const matchesDepartment = department === 'all' || row.dataset.department === department;
        const visible = matchesText && matchesDepartment;
        row.style.display = visible ? '' : 'none';
        if (visible) visibleCount++;
      });
      if (emptyState) emptyState.style.display = visibleCount === 0 ? 'flex' : 'none';
    }

    document.getElementById('addButton')?.addEventListener('click', () => {
      mode = 'create';
      selectedRow = null;
      if (facultyModalTitle) facultyModalTitle.textContent = 'Add Faculty';
      if (facultyName) facultyName.value = '';
      if (facultyEmail) facultyEmail.value = '';
      if (facultyDepartment) facultyDepartment.selectedIndex = 0;
      if (facultyRole) facultyRole.value = 'faculty';
      openModal(facultyModal);
    });

    tableBody.addEventListener('click', event => {
      const row = event.target.closest('tr, .table-row');
      if (!row) return;
      if (event.target.classList.contains('edit-btn')) {
        mode = 'edit';
        selectedRow = row;
        if (facultyModalTitle) facultyModalTitle.textContent = 'Edit Faculty';
        const nameCell = row.querySelector('.col-name') || row.children[0];
        const emailCell = row.querySelector('.col-email') || row.children[1];
        if (facultyName) facultyName.value = nameCell?.textContent.trim() || '';
        if (facultyEmail) facultyEmail.value = emailCell?.textContent.trim() || '';
        if (facultyDepartment) facultyDepartment.value = row.dataset.department || '';
        if (facultyRole) facultyRole.value = row.dataset.role || 'faculty';
        openModal(facultyModal);
      }
      if (event.target.classList.contains('remove-btn')) {
        selectedRow = row;
        openModal(removeModal);
      }
    });

    facultyForm?.addEventListener('submit', event => {
      event.preventDefault();
      const name = facultyName?.value.trim();
      const email = facultyEmail?.value.trim();
      const department = facultyDepartment?.value || '';
      const role = facultyRole?.value || 'faculty';
      if (!name || !email) return;

      if (mode === 'edit' && selectedRow) {
        selectedRow.dataset.name = name.toLowerCase();
        selectedRow.dataset.email = email.toLowerCase();
        selectedRow.dataset.department = department;
        selectedRow.dataset.role = role;
        const nameCell = selectedRow.querySelector('.col-name') || selectedRow.children[0];
        const emailCell = selectedRow.querySelector('.col-email') || selectedRow.children[1];
        const deptCell = selectedRow.querySelector('.col-dept') || selectedRow.children[2];
        const roleCell = selectedRow.querySelector('.col-role') || selectedRow.children[3];
        if (nameCell) nameCell.textContent = name;
        if (emailCell) emailCell.textContent = email;
        if (deptCell) deptCell.textContent = department;
        if (roleCell) roleCell.innerHTML = roleBadge(role);
        closeModal(facultyModal);
        setTimeout(() => showToast('Faculty Updated Successfully'), 120);
      } else {
        const row = document.createElement('div');
        row.className = 'table-row';
        row.dataset.name = name.toLowerCase();
        row.dataset.email = email.toLowerCase();
        row.dataset.department = department;
        row.dataset.role = role;
        row.innerHTML = `<div class="td-cell col-name">${name}</div><div class="td-cell col-email">${email}</div><div class="td-cell col-dept">${department}</div><div class="td-cell col-role text-center">${roleBadge(role)}</div><div class="td-cell col-action text-right"><div class="action-group"><button class="pill-btn edit-btn" type="button">Edit</button> <button class="pill-btn remove-btn" type="button">Remove</button></div></div>`;
        tableBody.prepend(row);
        closeModal(facultyModal);
        setTimeout(() => showToast('Faculty Added Successfully'), 120);
      }
      filterRows();
    });

    document.getElementById('confirmRemove')?.addEventListener('click', () => {
      if (!selectedRow) return;
      selectedRow.remove();
      selectedRow = null;
      closeModal(removeModal);
      setTimeout(() => showToast('Faculty Removed Successfully'), 120);
      filterRows();
    });

    document.getElementById('cancelRemove')?.addEventListener('click', () => closeModal(removeModal));
    document.getElementById('closeRemove')?.addEventListener('click', () => closeModal(removeModal));
    document.getElementById('closeFaculty')?.addEventListener('click', () => closeModal(facultyModal));
    document.getElementById('cancelFaculty')?.addEventListener('click', () => closeModal(facultyModal));
    if (!window.adminTableController && !tableBody?.__tableController) {
      searchInput?.addEventListener('input', filterRows);
      departmentFilter?.addEventListener('change', filterRows);
    }

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') { closeModal(facultyModal); closeModal(removeModal); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initFaculty);
  else initFaculty();
})();

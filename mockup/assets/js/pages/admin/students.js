(() => {
  'use strict';

  function initStudentsPage() {
    const tableBody = document.getElementById('tableBody');
    const searchInput = document.getElementById('searchInput');
    const programFilter = document.getElementById('programFilter');
    const emptyState = document.getElementById('emptyState');
    const studentModal = document.getElementById('studentModal');
    const removeModal = document.getElementById('removeModal');
    const studentForm = document.getElementById('studentForm');
    const studentId = document.getElementById('studentId');
    const studentFname = document.getElementById('studentFname');
    const studentMname = document.getElementById('studentMname');
    const studentLname = document.getElementById('studentLname');
    const studentProgram = document.getElementById('studentProgram');
    const studentModalTitle = document.getElementById('studentModalTitle');
    const toast = document.getElementById('toast');

    if (!tableBody) return;

    let mode = 'create';
    let selectedRow = null;

    function openModal(modal) {
      if (modal) modal.classList.add('show');
    }

    function closeModal(modal) {
      if (modal) modal.classList.remove('show');
    }

    function showToast(message) {
      if (!toast) return;
      toast.textContent = message;
      toast.classList.add('show');
      window.setTimeout(() => toast.classList.remove('show'), 2200);
    }

    function filterRows() {
      const controller = tableBody?.__tableController || window.adminTableController;
      if (controller) {
        controller.render();
        return;
      }
      const query = (searchInput?.value || '').trim().toLowerCase();
      const program = programFilter?.value || 'all';
      let visibleCount = 0;

      [...tableBody.children].forEach((row) => {
        if (!row.classList.contains('table-row')) return;
        const matchesText =
          !query ||
          (row.dataset.id || '').includes(query) ||
          (row.dataset.fname || '').includes(query) ||
          (row.dataset.mname || '').includes(query) ||
          (row.dataset.lname || '').includes(query);

        const matchesProgram =
          program === 'all' || row.dataset.program === program;

        const visible = matchesText && matchesProgram;
        row.style.display = visible ? '' : 'none';
        if (visible) visibleCount++;
      });

      if (emptyState) {
        emptyState.style.display = visibleCount === 0 ? 'flex' : 'none';
      }
    }

    // Add Student button
    document.getElementById('addButton')?.addEventListener('click', () => {
      mode = 'create';
      selectedRow = null;
      if (studentModalTitle) studentModalTitle.textContent = 'Create Student';
      if (studentId) studentId.value = '';
      if (studentFname) studentFname.value = '';
      if (studentMname) studentMname.value = '';
      if (studentLname) studentLname.value = '';
      if (studentProgram) studentProgram.selectedIndex = 0;
      openModal(studentModal);
    });

    // Edit / Remove via delegation
    tableBody.addEventListener('click', (event) => {
      const row = event.target.closest('.table-row');
      if (!row) return;

      if (event.target.classList.contains('edit')) {
        mode = 'edit';
        selectedRow = row;
        if (studentModalTitle) studentModalTitle.textContent = 'Edit Student';
        const cells = row.querySelectorAll('.td-cell');
        if (studentId) studentId.value = cells[0]?.textContent.trim() || '';
        if (studentFname) studentFname.value = cells[1]?.textContent.trim() || '';
        if (studentMname) studentMname.value = cells[2]?.textContent.trim() || '';
        if (studentLname) studentLname.value = cells[3]?.textContent.trim() || '';
        if (studentProgram) studentProgram.value = cells[4]?.textContent.trim() || '';
        openModal(studentModal);
      }

      if (event.target.classList.contains('remove')) {
        selectedRow = row;
        openModal(removeModal);
      }
    });

    // Submit student form
    studentForm?.addEventListener('submit', (event) => {
      event.preventDefault();

      const id = studentId?.value.trim() || '';
      const fname = studentFname?.value.trim() || '';
      const mname = studentMname?.value.trim() || '';
      const lname = studentLname?.value.trim() || '';
      const program = studentProgram?.value || '';

      if (!id || !fname || !lname) return;

      if (mode === 'edit' && selectedRow) {
        const cells = selectedRow.querySelectorAll('.td-cell');
        if (cells[0]) cells[0].textContent = id;
        if (cells[1]) cells[1].textContent = fname;
        if (cells[2]) cells[2].textContent = mname;
        if (cells[3]) cells[3].textContent = lname;
        if (cells[4]) cells[4].textContent = program;
        selectedRow.dataset.id = id.toLowerCase();
        selectedRow.dataset.fname = fname.toLowerCase();
        selectedRow.dataset.mname = mname.toLowerCase();
        selectedRow.dataset.lname = lname.toLowerCase();
        selectedRow.dataset.program = program;
        closeModal(studentModal);
        window.setTimeout(() => showToast('Student Updated Successfully'), 120);
      } else {
        const row = document.createElement('div');
        row.className = 'table-row';
        row.dataset.id = id.toLowerCase();
        row.dataset.fname = fname.toLowerCase();
        row.dataset.mname = mname.toLowerCase();
        row.dataset.lname = lname.toLowerCase();
        row.dataset.program = program;
        row.innerHTML = `
          <div class="td-cell col-id">${id}</div>
          <div class="td-cell col-fname">${fname}</div>
          <div class="td-cell col-mname">${mname}</div>
          <div class="td-cell col-lname">${lname}</div>
          <div class="td-cell col-program">${program}</div>
          <div class="td-cell col-action">
            <button class="pill-btn-sm edit" type="button">Edit</button>
            <button class="pill-btn-sm remove" type="button">Remove</button>
          </div>`;
        tableBody.prepend(row);
        closeModal(studentModal);
        window.setTimeout(() => showToast('Student Created Successfully'), 120);
      }

      filterRows();
    });

    // Confirm remove
    document.getElementById('confirmRemove')?.addEventListener('click', () => {
      if (!selectedRow) return;
      selectedRow.remove();
      selectedRow = null;
      closeModal(removeModal);
      window.setTimeout(() => showToast('Student Removed Successfully'), 120);
      filterRows();
    });

    // Close buttons
    document.getElementById('closeStudent')?.addEventListener('click', () => closeModal(studentModal));
    document.getElementById('cancelStudent')?.addEventListener('click', () => closeModal(studentModal));
    document.getElementById('closeRemove')?.addEventListener('click', () => closeModal(removeModal));
    if (!window.adminTableController && !tableBody?.__tableController) {
      searchInput?.addEventListener('input', filterRows);
      programFilter?.addEventListener('change', filterRows);
    }


    // Escape key to close
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closeModal(studentModal);
        closeModal(removeModal);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStudentsPage);
  } else {
    initStudentsPage();
  }
})();

/* Extracted from pages/admin/students.html */
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

let mode = 'create';
let selectedRow = null;

function openModal(modal) {
  if (modal) modal.classList.add('show');
}

function closeModal(modal) {
  if (modal) modal.classList.remove('show');
}

function showToast(message) {
  if (typeof showSuccessToast === 'function') {
    showSuccessToast(message);
    return;
  }
  const globalToast = document.getElementById('global-success-toast');
  const msgEl = document.getElementById('toast-message');
  if (globalToast && msgEl) {
    msgEl.textContent = message || 'Action successful!';
    globalToast.classList.add('show');
    setTimeout(() => globalToast.classList.remove('show'), 3000);
    return;
  }
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function filterRows() {
  const query = (searchInput.value || '').trim().toLowerCase();
  const program = programFilter ? programFilter.value : 'all';
  let visibleCount = 0;

  [...tableBody.rows].forEach(row => {
    const id = (row.dataset.id || row.children[0].textContent || '').toLowerCase();
    const fname = (row.dataset.fname || row.children[1].textContent || '').toLowerCase();
    const mname = (row.dataset.mname || row.children[2].textContent || '').toLowerCase();
    const lname = (row.dataset.lname || row.children[3].textContent || '').toLowerCase();
    const rowProgram = row.dataset.program || row.children[4].textContent.trim();

    const matchesText =
      id.includes(query) ||
      fname.includes(query) ||
      mname.includes(query) ||
      lname.includes(query);

    const matchesProgram =
      program === 'all' || rowProgram.toLowerCase() === program.toLowerCase();

    const visible = matchesText && matchesProgram;
    row.style.display = visible ? '' : 'none';
    if (visible) visibleCount++;
  });

  if (emptyState) emptyState.style.display = visibleCount === 0 ? 'flex' : 'none';
}

const addButton = document.getElementById('addButton');
if (addButton) {
  addButton.addEventListener('click', () => {
    mode = 'create';
    selectedRow = null;
    studentModalTitle.textContent = 'Create Student';
    studentId.value = '';
    studentFname.value = '';
    studentMname.value = '';
    studentLname.value = '';
    studentProgram.selectedIndex = 0;
    openModal(studentModal);
  });
}

tableBody.addEventListener('click', event => {
  const row = event.target.closest('tr');
  if (!row) return;

  if (event.target.classList.contains('edit-btn')) {
    mode = 'edit';
    selectedRow = row;
    studentModalTitle.textContent = 'Edit Student';
    studentId.value = row.children[0].textContent.trim();
    studentFname.value = row.children[1].textContent.trim();
    studentMname.value = row.children[2].textContent.trim();
    studentLname.value = row.children[3].textContent.trim();
    studentProgram.value = row.children[4].textContent.trim();
    openModal(studentModal);
  }

  if (event.target.classList.contains('remove-btn')) {
    selectedRow = row;
    openModal(removeModal);
  }
});

studentForm.addEventListener('submit', event => {
  event.preventDefault();

  const id = studentId.value.trim();
  const fname = studentFname.value.trim();
  const mname = studentMname.value.trim();
  const lname = studentLname.value.trim();
  const program = studentProgram.value;

  if (!id || !fname || !lname) return;

  if (mode === 'edit' && selectedRow) {
    selectedRow.children[0].textContent = id;
    selectedRow.children[1].textContent = fname;
    selectedRow.children[2].textContent = mname;
    selectedRow.children[3].textContent = lname;
    selectedRow.children[4].textContent = program;
    selectedRow.dataset.id = id.toLowerCase();
    selectedRow.dataset.fname = fname.toLowerCase();
    selectedRow.dataset.mname = mname.toLowerCase();
    selectedRow.dataset.lname = lname.toLowerCase();
    selectedRow.dataset.program = program;
    closeModal(studentModal);
    window.setTimeout(() => showToast('Student Updated Successfully'), 120);
  } else {
    const row = document.createElement('tr');
    row.dataset.id = id.toLowerCase();
    row.dataset.fname = fname.toLowerCase();
    row.dataset.mname = mname.toLowerCase();
    row.dataset.lname = lname.toLowerCase();
    row.dataset.program = program;
    row.innerHTML = `
      <td class="is-102b7f8">${id}</td>
      <td class="is-102b7f8">${fname}</td>
      <td class="is-102b7f8">${mname}</td>
      <td class="is-102b7f8">${lname}</td>
      <td class="is-102b7f8">${program}</td>
      <td class="is-102b7f8">
        <div class="action-group">
          <button class="pill-btn edit-btn" type="button">Edit</button>
          <button class="pill-btn remove-btn" type="button">Remove</button>
        </div>
      </td>`;
    tableBody.prepend(row);
    closeModal(studentModal);
    window.setTimeout(() => showToast('Student Created Successfully'), 120);
  }

  filterRows();
});

const confirmRemove = document.getElementById('confirmRemove');
if (confirmRemove) {
  confirmRemove.addEventListener('click', () => {
    if (!selectedRow) return;
    selectedRow.remove();
    selectedRow = null;
    closeModal(removeModal);
    window.setTimeout(() => showToast('Student Removed Successfully'), 120);
    filterRows();
  });
}

const cancelRemove = document.getElementById('cancelRemove');
if (cancelRemove) cancelRemove.addEventListener('click', () => closeModal(removeModal));

const closeStudent = document.getElementById('closeStudent');
if (closeStudent) closeStudent.addEventListener('click', () => closeModal(studentModal));
const closeRemove = document.getElementById('closeRemove');
if (closeRemove) closeRemove.addEventListener('click', () => closeModal(removeModal));

if (searchInput) searchInput.addEventListener('input', filterRows);
if (programFilter) programFilter.addEventListener('change', filterRows);

[studentModal, removeModal].forEach(modal => {
  if (!modal) return;
  modal.addEventListener('click', event => {
    if (event.target === modal) closeModal(modal);
  });
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeModal(studentModal);
    closeModal(removeModal);
  }
});

// Auto-wire forms and add buttons for the mockup
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('form').forEach(f => {
    if (f.id === 'acceptForm' || f.id === 'rejectForm' || f.id === 'studentForm' || f.closest('#acceptModal, #rejectModal, #studentModal, #removeModal')) return;
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      if (typeof showSuccessToast === 'function') {
        showSuccessToast('Successfully submitted!');
      }
    });
  });

  document.querySelectorAll('button').forEach(b => {
    if (b.closest('#acceptModal, #rejectModal, #studentModal, #removeModal') || b.classList.contains('edit-btn') || b.classList.contains('remove-btn') || b.id === 'addButton') return;
    if (b.textContent.toLowerCase().includes('approve') || b.textContent.toLowerCase().includes('submit') || b.textContent.toLowerCase().includes('propose')) {
      b.addEventListener('click', (e) => {
        if (b.type !== 'submit' && typeof showSuccessToast === 'function') {
          showSuccessToast('Action completed successfully!');
        }
      });
    }
  });
});

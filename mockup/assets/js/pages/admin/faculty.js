/* Extracted from pages/admin/faculty.html */
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

let mode = 'create';
let selectedRow = null;

function openModal(modal) {
  modal.classList.add('show');
}

function closeModal(modal) {
  modal.classList.remove('show');
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

function roleBadge(role) {
  const cls = role === 'admin' ? 'ui-badge--destructive' : 'ui-badge--info';
  return `<span class="ui-badge ${cls}">${role}</span>`;
}

function filterRows() {
  const query = (searchInput.value || '').trim().toLowerCase();
  const department = departmentFilter ? departmentFilter.value : 'all';
  let visibleCount = 0;

  [...tableBody.rows].forEach(row => {
    const name = (row.dataset.name || row.children[0].textContent || '').toLowerCase();
    const email = (row.dataset.email || row.children[1].textContent || '').toLowerCase();
    const dept = row.dataset.department || row.children[2].textContent.trim();

    const matchesText = name.includes(query) || email.includes(query);
    const matchesDepartment = department === 'all' || dept === department;

    const visible = matchesText && matchesDepartment;
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
    facultyModalTitle.textContent = 'Add Faculty';
    facultyName.value = '';
    facultyEmail.value = '';
    facultyDepartment.selectedIndex = 0;
    facultyRole.value = 'faculty';
    openModal(facultyModal);
  });
}

tableBody.addEventListener('click', event => {
  const row = event.target.closest('tr');
  if (!row) return;

  if (event.target.classList.contains('edit-btn')) {
    mode = 'edit';
    selectedRow = row;
    facultyModalTitle.textContent = 'Edit Faculty';
    facultyName.value = row.children[0].textContent.trim();
    facultyEmail.value = row.children[1].textContent.trim();
    facultyDepartment.value = row.dataset.department || row.children[2].textContent.trim();
    facultyRole.value = row.dataset.role || 'faculty';
    openModal(facultyModal);
  }

  if (event.target.classList.contains('remove-btn')) {
    selectedRow = row;
    openModal(removeModal);
  }
});

facultyForm.addEventListener('submit', event => {
  event.preventDefault();

  const name = facultyName.value.trim();
  const email = facultyEmail.value.trim();
  const department = facultyDepartment.value;
  const role = facultyRole.value;

  if (!name || !email) return;

  if (mode === 'edit' && selectedRow) {
    selectedRow.dataset.name = name.toLowerCase();
    selectedRow.dataset.email = email.toLowerCase();
    selectedRow.dataset.department = department;
    selectedRow.dataset.role = role;

    selectedRow.children[0].textContent = name;
    selectedRow.children[1].textContent = email;
    selectedRow.children[2].textContent = department;
    selectedRow.children[3].innerHTML = roleBadge(role);

    closeModal(facultyModal);
    window.setTimeout(() => showToast('Faculty Updated Successfully'), 120);
  } else {
    const row = document.createElement('tr');
    row.dataset.name = name.toLowerCase();
    row.dataset.email = email.toLowerCase();
    row.dataset.department = department;
    row.dataset.role = role;

    row.innerHTML = `
      <td class="is-102b7f8">${name}</td>
      <td class="is-102b7f8">${email}</td>
      <td class="is-102b7f8">${department}</td>
      <td class="is-102b7f8">${roleBadge(role)}</td>
      <td class="is-102b7f8">
        <div class="action-group">
          <button class="pill-btn edit-btn" type="button">Edit</button>
          <button class="pill-btn remove-btn" type="button">Remove</button>
        </div>
      </td>`;

    tableBody.prepend(row);
    closeModal(facultyModal);
    window.setTimeout(() => showToast('Faculty Added Successfully'), 120);
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
    window.setTimeout(() => showToast('Faculty Removed Successfully'), 120);
    filterRows();
  });
}

const cancelRemove = document.getElementById('cancelRemove');
if (cancelRemove) cancelRemove.addEventListener('click', () => closeModal(removeModal));

const closeFaculty = document.getElementById('closeFaculty');
if (closeFaculty) closeFaculty.addEventListener('click', () => closeModal(facultyModal));
const closeRemove = document.getElementById('closeRemove');
if (closeRemove) closeRemove.addEventListener('click', () => closeModal(removeModal));

if (searchInput) searchInput.addEventListener('input', filterRows);
if (departmentFilter) departmentFilter.addEventListener('change', filterRows);

[facultyModal, removeModal].forEach(modal => {
  if (!modal) return;
  modal.addEventListener('click', event => {
    if (event.target === modal) closeModal(modal);
  });
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeModal(facultyModal);
    closeModal(removeModal);
  }
});

// Auto-wire forms and add buttons for the mockup
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('form').forEach(f => {
    if (f.id === 'acceptForm' || f.id === 'rejectForm' || f.id === 'facultyForm' || f.closest('#acceptModal, #rejectModal, #facultyModal, #removeModal')) return;
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      if (typeof showSuccessToast === 'function') {
        showSuccessToast('Successfully submitted!');
      }
    });
  });

  document.querySelectorAll('button').forEach(b => {
    if (b.closest('#acceptModal, #rejectModal, #facultyModal, #removeModal') || b.classList.contains('edit-btn') || b.classList.contains('remove-btn') || b.id === 'addButton') return;
    if (b.textContent.toLowerCase().includes('approve') || b.textContent.toLowerCase().includes('submit') || b.textContent.toLowerCase().includes('propose')) {
      b.addEventListener('click', (e) => {
        if (b.type !== 'submit' && typeof showSuccessToast === 'function') {
          showSuccessToast('Action completed successfully!');
        }
      });
    }
  });
});

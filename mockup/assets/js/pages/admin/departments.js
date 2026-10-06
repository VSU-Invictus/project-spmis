/* Extracted from pages/admin/departments.html */
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

function filterRows() {
  const query = (searchInput.value || '').trim().toLowerCase();
  const status = statusFilter ? statusFilter.value : 'all';
  let visibleCount = 0;

  [...tableBody.rows].forEach(row => {
    const name = (row.dataset.name || row.children[0].textContent || '').toLowerCase();
    const rowStatus = row.dataset.status || 'approved';
    const visible =
      name.includes(query) &&
      (status === 'all' || rowStatus === status);

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
    entityModalTitle.textContent = 'Create Department';
    entityName.value = '';
    openModal(entityModal);
  });
}

tableBody.addEventListener('click', event => {
  const row = event.target.closest('tr');
  if (!row) return;

  if (event.target.classList.contains('edit-btn')) {
    mode = 'edit';
    selectedRow = row;
    entityModalTitle.textContent = 'Edit Department';
    entityName.value = row.children[0].textContent.trim();
    openModal(entityModal);
  }

  if (event.target.classList.contains('remove-btn')) {
    selectedRow = row;
    openModal(removeModal);
  }
});

entityForm.addEventListener('submit', event => {
  event.preventDefault();
  const value = entityName.value.trim();
  if (!value) return;

  if (mode === 'edit' && selectedRow) {
    selectedRow.children[0].textContent = value;
    selectedRow.dataset.name = value.toLowerCase();
    closeModal(entityModal);
    window.setTimeout(() => showToast('Department Updated Successfully'), 120);
  } else {
    const row = document.createElement('tr');
    row.dataset.name = value.toLowerCase();
    row.dataset.status = 'approved';
    row.innerHTML = `
      <td class="is-102b7f8">${value}</td>
      <td class="is-102b7f8"><span class="ui-badge ui-badge--success">Approved</span></td>
      <td class="is-102b7f8">
        <div class="action-group">
          <button class="pill-btn edit-btn" type="button">Edit</button>
          <button class="pill-btn remove-btn" type="button">Remove</button>
        </div>
      </td>`;
    tableBody.prepend(row);
    closeModal(entityModal);
    window.setTimeout(() => showToast('Department Created Successfully'), 120);
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
    window.setTimeout(() => showToast('Department Removed Successfully'), 120);
    filterRows();
  });
}

const cancelRemove = document.getElementById('cancelRemove');
if (cancelRemove) cancelRemove.addEventListener('click', () => closeModal(removeModal));

const closeEntity = document.getElementById('closeEntity');
if (closeEntity) closeEntity.addEventListener('click', () => closeModal(entityModal));
const closeRemove = document.getElementById('closeRemove');
if (closeRemove) closeRemove.addEventListener('click', () => closeModal(removeModal));

if (searchInput) searchInput.addEventListener('input', filterRows);
if (statusFilter) statusFilter.addEventListener('change', filterRows);

[entityModal, removeModal].forEach(modal => {
  if (!modal) return;
  modal.addEventListener('click', event => {
    if (event.target === modal) closeModal(modal);
  });
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeModal(entityModal);
    closeModal(removeModal);
  }
});

// Auto-wire forms and add buttons for the mockup
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('form').forEach(f => {
    if (f.id === 'acceptForm' || f.id === 'rejectForm' || f.id === 'entityForm' || f.closest('#acceptModal, #rejectModal, #entityModal, #removeModal')) return;
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      if (typeof showSuccessToast === 'function') {
        showSuccessToast('Successfully submitted!');
      }
    });
  });

  document.querySelectorAll('button').forEach(b => {
    if (b.closest('#acceptModal, #rejectModal, #entityModal, #removeModal') || b.classList.contains('edit-btn') || b.classList.contains('remove-btn') || b.id === 'addButton') return;
    if (b.textContent.toLowerCase().includes('approve') || b.textContent.toLowerCase().includes('submit') || b.textContent.toLowerCase().includes('propose')) {
      b.addEventListener('click', (e) => {
        if (b.type !== 'submit' && typeof showSuccessToast === 'function') {
          showSuccessToast('Action completed successfully!');
        }
      });
    }
  });
});

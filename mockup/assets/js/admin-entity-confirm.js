/* ==========================================================================
   ADMIN ENTITY CONFIRMATION DIALOG (admin-entity-confirm.js)
   Shared, dependency-free confirmation step for Admin Portal Add/Edit
   operations on Departments, Programs, and Faculty.

   Usage:
     window.AdminEntityConfirm.open({
       mode: 'create' | 'edit',
       entity: 'Department' | 'Program' | 'Faculty',
       record: 'Human readable record label',
       onConfirm: function () { ... }
     });

   The dialog reuses the established Remove modal interaction and the QA
   Reject Application modal design (Standard Card + .ui-alert banner).
   ========================================================================== */
(() => {
  'use strict';

  const MODAL_ID = 'entityConfirmModal';
  const TITLE_ID = 'entityConfirmTitle';
  const ALERT_TITLE_ID = 'entityConfirmAlertTitle';
  const ALERT_DESC_ID = 'entityConfirmAlertDesc';
  const RECORD_ID = 'entityConfirmRecord';
  const RECORD_LABEL_ID = 'entityConfirmRecordLabel';
  const CONFIRM_ID = 'entityConfirmSubmit';
  const CANCEL_ID = 'entityConfirmCancel';
  const CLOSE_ID = 'entityConfirmClose';

  let pendingConfirm = null;
  let lastFocused = null;

  function getModal() {
    return document.getElementById(MODAL_ID);
  }

  function openModal(modal) {
    if (modal) modal.classList.add('show');
  }

  function closeModal(modal) {
    if (modal) modal.classList.remove('show');
  }

  function close() {
    const modal = getModal();
    if (!modal) return;
    closeModal(modal);
    pendingConfirm = null;
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
    lastFocused = null;
  }

  function open(options) {
    const modal = getModal();
    if (!modal) return;

    const opts = options || {};
    const mode = opts.mode === 'edit' ? 'edit' : 'create';
    const entity = opts.entity || 'Record';
    const record = (opts.record || '').trim();
    const isEdit = mode === 'edit';
    const action = isEdit ? 'Edit' : 'Add';

    const title = document.getElementById(TITLE_ID);
    const alertTitle = document.getElementById(ALERT_TITLE_ID);
    const alertDesc = document.getElementById(ALERT_DESC_ID);
    const recordLabel = document.getElementById(RECORD_LABEL_ID);
    const recordValue = document.getElementById(RECORD_ID);
    const confirmBtn = document.getElementById(CONFIRM_ID);

    if (title) title.textContent = `Confirm ${action} ${entity}`;
    if (alertTitle) alertTitle.textContent = `Confirm ${action} ${entity}`;
    if (alertDesc) {
      alertDesc.textContent = isEdit
        ? `You are about to update this ${entity.toLowerCase()} record. Please review the details before confirming.`
        : `You are about to add a new ${entity.toLowerCase()} record. Please review the details before confirming.`;
    }
    if (recordLabel) recordLabel.textContent = `${entity} Name`;
    if (recordValue) recordValue.textContent = record || '—';
    if (confirmBtn) confirmBtn.textContent = `Confirm ${action}`;

    pendingConfirm = typeof opts.onConfirm === 'function' ? opts.onConfirm : null;
    lastFocused = document.activeElement;

    openModal(modal);
    if (confirmBtn) confirmBtn.focus();
  }

  function confirm() {
    const callback = pendingConfirm;
    const modal = getModal();
    closeModal(modal);
    pendingConfirm = null;
    lastFocused = null;
    if (typeof callback === 'function') callback();
  }

  function init() {
    const modal = getModal();
    if (!modal) return;

    document.getElementById(CONFIRM_ID)?.addEventListener('click', confirm);
    document.getElementById(CANCEL_ID)?.addEventListener('click', close);
    document.getElementById(CLOSE_ID)?.addEventListener('click', close);

    modal.addEventListener('click', (event) => {
      if (event.target === modal) close();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && modal.classList.contains('show')) {
        event.stopPropagation();
        close();
      }
    });
  }

  window.AdminEntityConfirm = { open, close };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

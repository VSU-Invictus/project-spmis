(() => {
  'use strict';

  const queueTypes = new Set(['faculty', 'student', 'program', 'department']);
  const pageToQueue = {
    'faculty-applications.html': 'faculty',
    'student-applications.html': 'student',
    'program-applications.html': 'program',
    'department-applications.html': 'department'
  };
  const queueToPage = {
    faculty: 'faculty-applications.html',
    student: 'student-applications.html',
    program: 'program-applications.html',
    department: 'department-applications.html'
  };
  const queueTitles = {
    faculty: 'Faculty Proposals',
    student: 'Student Proposals',
    program: 'Program Proposals',
    department: 'Department Proposals'
  };

  const pageQueue = pageToQueue[window.location.pathname.split('/').pop()] || null;
  const isEmbeddedQueue = (window.self !== window.top) || new URLSearchParams(window.location.search).has('embedded');

  if (isEmbeddedQueue && typeof document !== 'undefined') {
    document.documentElement?.classList.add('queue-embedded');
    if (document.body) document.body.classList.add('queue-embedded');
  }

  function selectedRows(root = document) {
    return [...root.querySelectorAll('.table-body .custom-checkbox:checked:not(:disabled)')]
      .map((checkbox) => checkbox.closest('.table-row'))
      .filter(Boolean);
  }

  function visibleRows() {
    return [...document.querySelectorAll('.table-body > .table-row:not(.skeleton-row)')]
      .filter((row) => !row.hidden && row.style.display !== 'none' && !row.querySelector('.custom-checkbox')?.disabled);
  }

  let toastTimer;

  function showToast(message) {
    const toast = document.querySelector('#toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('show'), 3000);
  }

  function removeQueueParameter() {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('queue');
      window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`);
    } catch (_) {}
  }

  function ensureModalShell() {
    let modal = document.querySelector('[data-queue-modal]');
    if (modal) {
      modal.querySelectorAll('.modal-header, .modal-actions, footer').forEach((el) => {
        const closeBtn = el.querySelector('.modal-close');
        const container = modal.querySelector('.modal-container');
        if (closeBtn && container && !container.contains(closeBtn)) {
          container.appendChild(closeBtn);
        }
        el.remove();
      });
      modal.querySelector('.modal-container')?.classList.add('queue-modal-container');
      return modal;
    }

    modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.dataset.queueModal = '';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('aria-label', 'Approval queue');
    modal.innerHTML = `
      <section class="modal-container queue-modal-container" role="document">
        <button type="button" class="modal-close modal-cancel ui-modal-close" data-queue-close aria-label="Close queue modal">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        <div class="queue-modal-body" data-queue-modal-body></div>
      </section>`;
    document.body.appendChild(modal);
    return modal;
  }

  function setQueueModalContent(modal, queue) {
    if (!modal || !queueTypes.has(queue)) return;

    const title = modal.querySelector('[data-queue-modal-title]');
    const body = modal.querySelector('[data-queue-modal-body]');
    if (title) title.textContent = queueTitles[queue] || 'Pending applications';
    if (!body) return;

    const page = queueToPage[queue];
    let frame = body.querySelector('iframe');
    if (!frame) {
      frame = document.createElement('iframe');
      frame.className = 'queue-modal-frame';
      frame.title = 'Approval queue';
      body.replaceChildren(frame);
    }

    const nextSrc = `${page}?embedded=1`;
    if (!frame.getAttribute('src')?.endsWith(nextSrc)) {
      frame.src = nextSrc;
    }
  }

  function closeQueueModal(modal, options = {}) {
    if (!modal) return;
    try {
      modal.querySelector('iframe')?.contentWindow?.postMessage('queue-modal-reset', '*');
    } catch (_) {}
    modal.classList.remove('active');
    modal.classList.remove('show');
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
    if (!options.preserveUrl) removeQueueParameter();
    const restoreTarget = modal.__restoreFocus;
    if (restoreTarget && typeof restoreTarget.focus === 'function') {
      try { restoreTarget.focus(); } catch (_) {}
    }
  }

  function openQueueModal(modal, trigger) {
    if (!modal) return;
    const queue = modal.dataset.queueType;
    if (queueTypes.has(queue)) setQueueModalContent(modal, queue);
    modal.__restoreFocus = trigger || document.activeElement;
    modal.style.display = 'flex';
    modal.classList.add('active');
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    const firstFocusable = modal.querySelector('[data-queue-close], .modal-close, button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) {
      try { firstFocusable.focus(); } catch (_) {}
    }
  }

  function installModalContract() {
    const triggers = document.querySelectorAll('[data-queue-open]');
    const params = new URLSearchParams(window.location.search);
    const requestedQueue = params.get('queue');
    if (!triggers.length && !queueTypes.has(requestedQueue)) return;

    const modal = ensureModalShell();
    const modalQueue = modal.dataset.queueType;

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', (event) => {
        event.preventDefault();
        const queue = trigger.dataset.queueOpen;
        if (!queueTypes.has(queue)) return;
        const url = new URL(window.location.href);
        url.searchParams.set('queue', queue);
        window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`);
        modal.dataset.queueType = queue;
        openQueueModal(modal, trigger);
      });
    });

    if (queueTypes.has(requestedQueue) && (!modalQueue || modalQueue === requestedQueue)) {
      modal.dataset.queueType = requestedQueue;
      openQueueModal(modal);
    }

    // Keep the capture listener scoped to this queue; other page dialogs have their own close buttons.
    document.addEventListener('click', (event) => {
      const closeBtn = event.target.closest('[data-queue-modal] [data-queue-close]');
      if (!closeBtn) return;
      event.preventDefault();
      event.stopPropagation();
      closeQueueModal(modal);
    }, true);

    window.addEventListener('popstate', () => {
      const queue = new URLSearchParams(window.location.search).get('queue');
      if (queueTypes.has(queue)) {
        modal.dataset.queueType = queue;
        openQueueModal(modal);
      }
      else closeQueueModal(modal, { preserveUrl: true });
    });

    window.addEventListener('message', (event) => {
      if (event.data === 'queue-modal-close' && event.source === modal.querySelector('iframe')?.contentWindow) {
        closeQueueModal(modal);
      }
    });

    modal.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeQueueModal(modal);
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = [...modal.querySelectorAll('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])')]
        .filter((element) => !element.hasAttribute('disabled'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  function addInlineRejection(row) {
    if (!row || row.nextElementSibling?.classList.contains('ui-queue-rejection-row')) {
      return row?.nextElementSibling;
    }
    const rejection = document.createElement('div');
    rejection.className = 'ui-queue-rejection-row';
    rejection.setAttribute('role', 'row');
    const reasonId = `queue-rejection-${Math.random().toString(36).slice(2)}`;
    rejection.innerHTML = `
      <div class="ui-queue-rejection-cell" role="cell">
        <label for="${reasonId}">Reason for rejection</label>
        <p class="ui-queue-bulk-message" hidden></p>
        <textarea id="${reasonId}" placeholder="Enter reason here..." aria-required="true" required></textarea>
        <div class="ui-queue-rejection-actions">
          <button type="button" class="ui-btn ui-btn-outline ui-queue-cancel">Close</button>
          <button type="button" class="ui-btn ui-btn-destructive ui-queue-confirm-reject">Reject</button>
        </div>
      </div>`;
    row.parentElement?.insertBefore(rejection, row.nextElementSibling);
    rejection.__queueRow = row;
    return rejection;
  }

  function installQueueRows() {
    document.getElementById('rejectModal')?.remove();
    const rows = [...document.querySelectorAll('.table-body > .table-row')];
    const selected = () => selectedRows().length;
    const bulkApprove = document.querySelector('.action-btn-group .pill-btn.approve, .action-btn-group .pill-btn.accept');
    const bulkReject = document.querySelector('.action-btn-group .pill-btn.reject');
    const headerCheckbox = document.querySelector('.table-header-row .custom-checkbox, .table-header-row .select-all-checkbox');
    const selectionStatus = document.querySelector('.pagination-selection-status');

    const updateBulkMessage = () => {
      const count = selected();
      if (selectionStatus) {
        if (count > 0) {
          selectionStatus.textContent = `${count} selected`;
        } else {
          selectionStatus.textContent = '';
        }
      }
    };
    const updateBulkButtons = () => {
      const hasSelection = selected() > 0;
      [bulkApprove, bulkReject].forEach((button) => {
        button?.classList.toggle('has-selection', hasSelection);
      });
    };
    const updateSelectAllBtn = () => {
      const checkboxes = visibleRows().map((row) => row.querySelector('.custom-checkbox')).filter(Boolean);
      const checkedCount = checkboxes.filter((cb) => cb.checked).length;
      const allChecked = checkboxes.length > 0 && checkedCount === checkboxes.length;
      if (headerCheckbox) {
        headerCheckbox.checked = allChecked;
        headerCheckbox.indeterminate = checkedCount > 0 && !allChecked;
      }
    };

    if (headerCheckbox) {
      headerCheckbox.addEventListener('change', () => {
        const checkboxes = visibleRows().map((row) => row.querySelector('.custom-checkbox')).filter(Boolean);
        checkboxes.forEach((cb) => {
          cb.checked = headerCheckbox.checked;
          const row = cb.closest('.table-row');
          if (row) row.classList.toggle('checked', cb.checked);
        });
        document.querySelector('.ui-queue-rejection-row[data-bulk-rejection]')?.remove();
        updateBulkButtons();
        updateBulkMessage();
        updateSelectAllBtn();
      });
    }

    document.addEventListener('ui-table-rendered', updateSelectAllBtn);
    document.addEventListener('ui-table-view-changing', () => {
      document.querySelectorAll('.ui-queue-rejection-row').forEach((panel) => panel.remove());
      rows.forEach((row) => {
        row.classList.remove('checked');
        const checkbox = row.querySelector('.custom-checkbox');
        if (checkbox) checkbox.checked = false;
      });
      updateBulkButtons();
      updateBulkMessage();
      updateSelectAllBtn();
    });

    rows.forEach((row) => {
      const checkbox = row.querySelector('.custom-checkbox');
      if (!checkbox) return;

      const status = row.querySelector('.col-status');
      const source = row.querySelector('.col-source');
      if ((status && !/pending/i.test(status.textContent)) || (source && /admin direct/i.test(source.textContent))) {
        checkbox.disabled = true;
      }

      const actionCell = row.querySelector('.col-actions');
      if (actionCell && !actionCell.querySelector('.ui-queue-row-actions')) {
        const actions = document.createElement('span');
        actions.className = 'ui-queue-row-actions';
        actions.innerHTML = '<button type="button" class="ui-btn ui-queue-approve">Approve</button><button type="button" class="ui-btn ui-btn-destructive ui-queue-reject">Reject</button>';
        actionCell.appendChild(actions);
      }

      row.querySelector('.ui-queue-approve')?.addEventListener('click', () => {
        if (checkbox.disabled) return;
        if (row.nextElementSibling?.classList.contains('ui-queue-rejection-row')) row.nextElementSibling.remove();
        row.remove();
        updateBulkButtons();
        updateBulkMessage();
        updateSelectAllBtn();
        showToast('Application Approved');
      });

      checkbox.addEventListener('change', () => {
        row.classList.toggle('checked', checkbox.checked);
        document.querySelector('.ui-queue-rejection-row[data-bulk-rejection]')?.remove();
        updateBulkButtons();
        updateBulkMessage();
        updateSelectAllBtn();
      });

      row.querySelector('.ui-queue-reject')?.addEventListener('click', () => {
        if (checkbox.disabled) return;
        const existing = row.nextElementSibling?.classList.contains('ui-queue-rejection-row')
          ? row.nextElementSibling
          : null;
        if (existing?.classList.contains('is-expanded')) {
          existing.querySelector('textarea')?.focus();
          return;
        }
        const rejection = addInlineRejection(row);
        if (!rejection) return;
        rejection.classList.add('is-expanded');
        rejection.querySelector('textarea')?.focus();
      });

      row.addEventListener('click', (event) => {
        if (event.target.tagName === 'INPUT' || event.target.closest('button, a, textarea, select, label')) return;
        if (checkbox.disabled) return;
        event.stopPropagation();
        checkbox.checked = !checkbox.checked;
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });

    updateBulkButtons();
    updateBulkMessage();
    updateSelectAllBtn();

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      const expanded = document.querySelector('.ui-queue-rejection-row.is-expanded');
      if (expanded) {
        event.preventDefault();
        expanded.remove();
        bulkReject?.focus();
        return;
      }
      if (isEmbeddedQueue && window.parent !== window) {
        event.preventDefault();
        try {
          window.parent.postMessage('queue-modal-close', '*');
        } catch (_) {}
      }
    });

    document.addEventListener('click', (event) => {
      const modalClose = event.target.closest('[data-queue-close], .ui-modal-close, .modal-close');
      if (modalClose) {
        if (isEmbeddedQueue && window.parent !== window) {
          event.preventDefault();
          event.stopPropagation();
          try {
            window.parent.postMessage('queue-modal-close', '*');
          } catch (_) {}
          return;
        }
      }
      const close = event.target.closest('.ui-queue-rejection-row .ui-queue-cancel');
      if (close) {
        event.preventDefault();
        event.stopPropagation();
        close.closest('.ui-queue-rejection-row')?.remove();
        bulkReject?.focus();
        return;
      }
      const confirm = event.target.closest('.ui-queue-confirm-reject');
      if (!confirm) return;
      const panel = confirm.closest('.ui-queue-rejection-row');
      const textarea = panel?.querySelector('textarea');
      if (!textarea?.value.trim()) {
        textarea?.setCustomValidity('Enter a reason for rejection.');
        textarea?.reportValidity();
        return;
      }
      textarea.setCustomValidity('');
      const row = panel.__queueRow || panel.previousElementSibling;
      const rows = panel.dataset.bulkRejection ? selectedRows() : (row ? [row] : []);
      if (!rows.length) return panel.remove();
      rows.forEach((selectedRow) => selectedRow.remove());
      panel.remove();
      updateBulkButtons();
      updateBulkMessage();
      updateSelectAllBtn();
      showToast(`${rows.length} Application${rows.length === 1 ? '' : 's'} Rejected`);
    }, true);

    document.addEventListener('input', (event) => {
      if (event.target.matches('.ui-queue-rejection-row textarea')) event.target.setCustomValidity('');
    });

    window.addEventListener('message', (event) => {
      if (event.data !== 'queue-modal-reset') return;
      document.querySelectorAll('.ui-queue-rejection-row').forEach((panel) => panel.remove());
      document.querySelectorAll('.table-body .table-row').forEach((row) => {
        row.classList.remove('checked');
        const checkbox = row.querySelector('.custom-checkbox');
        if (checkbox) checkbox.checked = false;
      });
      updateBulkButtons();
      updateBulkMessage();
      updateSelectAllBtn();
    });

    document.querySelectorAll('.action-btn-group .pill-btn.approve, .action-btn-group .pill-btn.accept, .pill-btn.accept').forEach((button) => {
      button.textContent = 'Approve';
      button.classList.remove('accept');
      button.classList.add('approve');
      button.addEventListener('click', () => {
        const rows = selectedRows();
        const count = rows.length;
        if (!count) return showToast('Please select at least one application');
        rows.forEach((row) => {
          row.remove();
        });
        document.querySelectorAll('.ui-queue-rejection-row').forEach((panel) => panel.remove());
        updateBulkButtons();
        updateBulkMessage();
        updateSelectAllBtn();
        showToast(`${count} Application${count === 1 ? '' : 's'} Approved`);
      });
    });

    document.querySelectorAll('.action-btn-group .pill-btn.reject').forEach((button) => {
      button.addEventListener('click', () => {
        const count = selected();
        if (!count) return showToast('Please select at least one application');
        const rows = selectedRows();
        const anchor = rows.find((row) => visibleRows().includes(row));
        if (!anchor) return showToast('Select an application on this page');
        const existingBulk = document.querySelector('.ui-queue-rejection-row[data-bulk-rejection]');
        const rejection = existingBulk || addInlineRejection(anchor);
        if (rejection) {
          if (rejection.classList.contains('is-expanded')) {
            rejection.querySelector('textarea')?.focus();
            return;
          }
          rejection.dataset.bulkRejection = 'true';
          rejection.__queueRow = anchor;
          rejection.style.order = '999999';
          rejection.parentElement.appendChild(rejection);
          const message = rejection.querySelector('.ui-queue-bulk-message');
          if (message) {
            message.hidden = count < 2;
            message.textContent = count > 1 ? `The same reason applies to all ${count} selected applications.` : '';
          }
          rejection.classList.add('is-expanded');
          rejection.querySelector('textarea')?.focus();
          rejection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    });
  }

  function initQueue() {
    if (isEmbeddedQueue) {
      if (document.documentElement) document.documentElement.classList.add('queue-embedded');
      if (document.body) document.body.classList.add('queue-embedded');
      try {
        document.querySelectorAll('.sidebar-frame, iframe#sidebar-frame, .admin-top-header, .top-header-bar, .admin-footer, .workspace-footer').forEach((el) => {
          el.style.display = 'none';
          el.remove();
        });
      } catch (_) {}
    }
    installModalContract();
    if (pageQueue) installQueueRows();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initQueue);
  } else {
    initQueue();
  }
})();

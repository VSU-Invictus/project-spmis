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
    return [...root.querySelectorAll('.table-body .custom-checkbox:checked')]
      .map((checkbox) => checkbox.closest('.table-row'))
      .filter(Boolean);
  }

  function showToast(message) {
    const toast = document.querySelector('#toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    window.setTimeout(() => toast.classList.remove('show'), 3000);
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

    modal.querySelectorAll('[data-queue-close], .modal-cancel, .modal-close').forEach((button) => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeQueueModal(modal);
      });
    });

    modal.addEventListener('click', (event) => {
      if (event.target === modal || event.target.closest('[data-queue-close], .modal-close')) {
        event.preventDefault();
        closeQueueModal(modal);
      }
    });

    // Global document capture listener to ensure close buttons work reliably regardless of event stopPropagation
    document.addEventListener('click', (event) => {
      const closeBtn = event.target.closest('[data-queue-close], .modal-close');
      if (closeBtn) {
        const targetModal = closeBtn.closest('[data-queue-modal], .modal-overlay') || modal;
        if (targetModal) {
          event.preventDefault();
          event.stopPropagation();
          closeQueueModal(targetModal);
        }
      }
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
      if (event.data === 'queue-modal-close') {
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

  function addInlineRejection(row, count) {
    if (!row || row.nextElementSibling?.classList.contains('queue-rejection-row')) {
      return row?.nextElementSibling;
    }
    const rejection = document.createElement('div');
    rejection.className = 'table-row queue-rejection-row';
    rejection.setAttribute('role', 'row');
    const reasonId = `queue-rejection-${Math.random().toString(36).slice(2)}`;
    rejection.innerHTML = `
      <div class="td-cell queue-rejection-cell" role="cell" colspan="5" aria-colspan="5">
        <label for="${reasonId}">Reason for rejection</label>
        <textarea id="${reasonId}" placeholder="Enter reason here..." required></textarea>
        <div class="queue-rejection-actions">
          <button type="button" class="pill-btn modal-cancel">Close</button>
          <button type="button" class="pill-btn queue-confirm-reject">Reject</button>
        </div>
      </div>`;
    row.parentElement?.insertBefore(rejection, row.nextElementSibling);
    rejection.__queueRow = row;
    rejection.querySelector('.modal-cancel')?.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      rejection.remove();
    });
    return rejection;
  }

  function installQueueRows() {
    document.getElementById('rejectModal')?.remove();
    const rows = [...document.querySelectorAll('.table-body .table-row')];
    const searchInput = document.querySelector('.search-input');
    const selected = () => selectedRows().length;
    const bulkApprove = document.querySelector('.action-btn-group .pill-btn.approve, .action-btn-group .pill-btn.accept');
    const bulkReject = document.querySelector('.action-btn-group .pill-btn.reject');
    const actionBar = document.querySelector('.bottom-bar-container .action-btn-group');
    const selectAllBtn = document.querySelector('.select-all');

    let bulkMessage = actionBar?.querySelector('.queue-bulk-rejection-message');
    if (actionBar && !bulkMessage) {
      bulkMessage = document.createElement('p');
      bulkMessage.className = 'queue-bulk-rejection-message';
      bulkMessage.hidden = true;
      actionBar.appendChild(bulkMessage);
    }
    const updateBulkMessage = () => {
      const count = selected();
      if (!bulkMessage) return;
      bulkMessage.hidden = count < 2;
      bulkMessage.textContent = count > 1
        ? `This reason will be sent to all ${count} submitters.`
        : '';
    };
    const updateBulkButtons = () => {
      const hasSelection = selected() > 0;
      [bulkApprove, bulkReject].forEach((button) => {
        button?.classList.toggle('has-selection', hasSelection);
      });
    };
    const updateSelectAllBtn = () => {
      if (!selectAllBtn) return;
      const checkboxes = [...document.querySelectorAll('.table-body .custom-checkbox')];
      const allChecked = checkboxes.length > 0 && checkboxes.every((cb) => cb.checked);
      selectAllBtn.textContent = allChecked ? 'Deselect All' : 'Select All';
    };

    if (selectAllBtn) {
      selectAllBtn.addEventListener('click', () => {
        const checkboxes = [...document.querySelectorAll('.table-body .custom-checkbox')];
        const allChecked = checkboxes.length > 0 && checkboxes.every((cb) => cb.checked);
        checkboxes.forEach((cb) => {
          cb.checked = !allChecked;
          const row = cb.closest('.table-row');
          if (row) row.classList.toggle('checked', cb.checked);
        });
        updateBulkButtons();
        updateBulkMessage();
        updateSelectAllBtn();
      });
    }

    searchInput?.addEventListener('input', () => {
      const query = searchInput.value.trim().toLowerCase();
      rows.forEach((row) => {
        const matches = !query || row.textContent.toLowerCase().includes(query);
        row.hidden = !matches;
        const rejection = row.nextElementSibling?.classList.contains('queue-rejection-row')
          ? row.nextElementSibling
          : null;
        if (rejection && !matches) rejection.hidden = true;
      });
    });

    rows.forEach((row) => {
      const checkbox = row.querySelector('.custom-checkbox');
      if (!checkbox) return;

      const actionCell = row.querySelector('.col-actions');
      if (actionCell && !actionCell.querySelector('.queue-row-actions')) {
        const actions = document.createElement('span');
        actions.className = 'queue-row-actions';
        actions.innerHTML = '<button type="button" class="pill-btn queue-approve">Approve</button><button type="button" class="pill-btn queue-reject">Reject</button>';
        actionCell.appendChild(actions);
      }

      row.querySelector('.queue-approve')?.addEventListener('click', () => {
        row.dataset.queueStatus = 'approved';
        const cb = row.querySelector('.custom-checkbox');
        if (cb && cb.checked) {
          cb.checked = false;
          row.classList.remove('checked');
          updateBulkButtons();
          updateBulkMessage();
          updateSelectAllBtn();
        }
        showToast('Application Approved');
      });

      checkbox.addEventListener('change', () => {
        row.classList.toggle('checked', checkbox.checked);
        updateBulkButtons();
        updateBulkMessage();
        updateSelectAllBtn();
      });

      row.querySelector('.queue-reject')?.addEventListener('click', () => {
        const count = selected() || 1;
        const existing = row.nextElementSibling?.classList.contains('queue-rejection-row')
          ? row.nextElementSibling
          : null;
        if (existing?.classList.contains('is-expanded')) {
          existing.querySelector('textarea')?.focus();
          return;
        }
        const rejection = addInlineRejection(row, count);
        if (!rejection) return;
        rejection.classList.add('is-expanded');
        rejection.querySelector('textarea')?.focus();
      });

      row.addEventListener('click', (event) => {
        if (event.target.closest('button, input, textarea, select')) return;
        checkbox.checked = !checkbox.checked;
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });

    updateBulkButtons();
    updateBulkMessage();
    updateSelectAllBtn();

    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      const expanded = document.querySelector('.queue-rejection-row.is-expanded');
      if (expanded) {
        event.preventDefault();
        expanded.classList.remove('is-expanded');
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
      const close = event.target.closest('.queue-rejection-row .modal-cancel');
      if (close) {
        event.preventDefault();
        event.stopPropagation();
        close.closest('.queue-rejection-row')?.remove();
        return;
      }
      const confirm = event.target.closest('.queue-confirm-reject');
      if (!confirm) return;
      const panel = confirm.closest('.queue-rejection-row');
      const textarea = panel?.querySelector('textarea');
      if (!textarea?.value.trim()) {
        textarea?.focus();
        return;
      }
      const row = panel.__queueRow || panel.previousElementSibling;
      const rows = panel.__queueRows || (row ? [row] : []);
      rows.forEach((selectedRow) => {
        selectedRow.dataset.queueStatus = 'rejected';
        const cb = selectedRow.querySelector('.custom-checkbox');
        if (cb) cb.checked = false;
        selectedRow.classList.remove('checked');
      });
      panel.remove();
      updateBulkButtons();
      updateBulkMessage();
      updateSelectAllBtn();
      showToast('Application Rejected');
    }, true);

    window.addEventListener('message', (event) => {
      if (event.data !== 'queue-modal-reset') return;
      document.querySelectorAll('.queue-rejection-row').forEach((panel) => panel.remove());
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
          row.dataset.queueStatus = 'approved';
          const cb = row.querySelector('.custom-checkbox');
          if (cb) cb.checked = false;
          row.classList.remove('checked');
        });
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
        const existingBulk = document.querySelector('.queue-rejection-row[data-bulk-rejection]');
        const rejection = existingBulk || addInlineRejection(rows[0], count);
        if (rejection) {
          if (rejection.classList.contains('is-expanded')) {
            rejection.querySelector('textarea')?.focus();
            return;
          }
          rejection.dataset.bulkRejection = 'true';
          rows[0].parentElement?.appendChild(rejection);
          rejection.__queueRows = rows;
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

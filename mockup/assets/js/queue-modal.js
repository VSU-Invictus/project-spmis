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
  const isEmbeddedQueue = new URLSearchParams(window.location.search).has('embedded');

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
    const url = new URL(window.location.href);
    url.searchParams.delete('queue');
    window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }

  function ensureModalShell() {
    let modal = document.querySelector('[data-queue-modal]');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.dataset.queueModal = '';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-hidden', 'true');
    modal.setAttribute('aria-labelledby', 'queue-modal-title');
    modal.innerHTML = `
      <section class="modal-container queue-modal-container" role="document">
        <header class="modal-header">
          <h2 id="queue-modal-title" class="modal-title" data-queue-modal-title>Pending applications</h2>
          <button type="button" class="modal-close modal-cancel" data-queue-close aria-label="Close queue modal">&times;</button>
        </header>
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
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    if (!options.preserveUrl) removeQueueParameter();
    const restoreTarget = modal.__restoreFocus;
    if (restoreTarget && typeof restoreTarget.focus === 'function') restoreTarget.focus();
  }

  function openQueueModal(modal, trigger) {
    if (!modal) return;
    const queue = modal.dataset.queueType;
    if (queueTypes.has(queue)) setQueueModalContent(modal, queue);
    modal.__restoreFocus = trigger || document.activeElement;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    const firstFocusable = modal.querySelector('button, [href], input, textarea, select, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) firstFocusable.focus();
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
      button.addEventListener('click', () => closeQueueModal(modal));
    });

    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeQueueModal(modal);
    });

    window.addEventListener('popstate', () => {
      const queue = new URLSearchParams(window.location.search).get('queue');
      if (queueTypes.has(queue)) {
        modal.dataset.queueType = queue;
        openQueueModal(modal);
      }
      else closeQueueModal(modal, { preserveUrl: true });
    });

    window.addEventListener('message', (event) => {
      if (event.source !== modal.querySelector('iframe')?.contentWindow) return;
      if (event.data === 'queue-modal-close') closeQueueModal(modal);
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
    rejection.innerHTML = `
      <div class="td-cell queue-rejection-cell" role="cell" colspan="5" aria-colspan="5">
        ${count > 1 ? `<p>This reason will be sent to all ${count} submitters.</p>` : ''}
        <label for="queue-rejection-${Math.random().toString(36).slice(2)}">Reason for rejection</label>
        <textarea placeholder="Enter reason here..." required></textarea>
        <div class="queue-rejection-actions">
          <button type="button" class="pill-btn modal-cancel">Close</button>
          <button type="button" class="pill-btn queue-confirm-reject">Reject</button>
        </div>
      </div>`;
    row.parentElement?.insertBefore(rejection, row.nextElementSibling);
    rejection.__queueRow = row;
    return rejection;
  }

  function installQueueRows() {
    document.getElementById('rejectModal')?.remove();
    const rows = [...document.querySelectorAll('.table-body .table-row')];
    const selected = () => selectedRows().length;
    const bulkApprove = document.querySelector('.action-btn-group .pill-btn.approve');
    const bulkReject = document.querySelector('.action-btn-group .pill-btn.reject');
    const updateBulkButtons = () => {
      const hasSelection = selected() > 0;
      [bulkApprove, bulkReject].forEach((button) => {
        button?.classList.toggle('has-selection', hasSelection);
      });
    };

    rows.forEach((row) => {
      const checkbox = row.querySelector('.custom-checkbox');
      if (!checkbox) return;

      row.querySelectorAll('.status-pending').forEach((badge) => badge.remove());

      const actionCell = row.querySelector('.col-actions') || row.lastElementChild;
      if (actionCell && !actionCell.querySelector('.queue-row-actions')) {
        const actions = document.createElement('span');
        actions.className = 'queue-row-actions';
        actions.innerHTML = '<button type="button" class="pill-btn queue-approve">Approve</button><button type="button" class="pill-btn queue-reject">Reject</button>';
        actionCell.appendChild(actions);
      }

      row.querySelector('.queue-approve')?.addEventListener('click', () => {
        row.dataset.queueStatus = 'approved';
        showToast('Application Approved');
      });

      checkbox.addEventListener('change', () => {
        row.classList.toggle('checked', checkbox.checked);
        updateBulkButtons();
      });

      row.querySelector('.queue-reject')?.addEventListener('click', () => {
        const count = selected() || 1;
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
        window.parent.postMessage('queue-modal-close', window.location.origin);
      }
    });

    document.addEventListener('click', (event) => {
      const close = event.target.closest('.queue-rejection-row .modal-cancel');
      if (close) close.closest('.queue-rejection-row')?.classList.remove('is-expanded');
      const confirm = event.target.closest('.queue-confirm-reject');
      if (!confirm) return;
      const panel = confirm.closest('.queue-rejection-row');
      const textarea = panel?.querySelector('textarea');
      if (!textarea?.value.trim()) {
        textarea?.focus();
        return;
      }
      const row = panel.__queueRow || panel.previousElementSibling;
      if (row) row.dataset.queueStatus = 'rejected';
      panel.classList.remove('is-expanded');
      showToast('Application Rejected');
    });

    document.querySelectorAll('.pill-btn.accept').forEach((button) => {
      button.textContent = 'Approve';
      button.classList.remove('accept');
      button.classList.add('approve');
      button.addEventListener('click', () => {
        const count = selected();
        if (!count) return showToast('Please select at least one application');
        showToast(`${count} Application${count === 1 ? '' : 's'} Approved`);
      });
    });

    document.querySelectorAll('.pill-btn.reject').forEach((button) => {
      button.addEventListener('click', () => {
        const count = selected();
        if (!count) return showToast('Please select at least one application');
        selectedRows().forEach((row) => {
          const rejection = addInlineRejection(row, count);
          rejection?.classList.add('is-expanded');
        });
        document.querySelector('.queue-rejection-row.is-expanded textarea')?.focus();
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (isEmbeddedQueue) document.body.classList.add('queue-embedded');
    installModalContract();
    if (pageQueue) installQueueRows();
  });
})();

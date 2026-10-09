/* Extracted from pages/design-system.html */
// Wire Interactive Style Guide Demos: Skeleton Loading, Modals & Toasts
document.addEventListener('DOMContentLoaded', () => {
  // 1. Skeleton Simulation Demo
  const skelBtn = document.getElementById('demo-simulate-skeleton-btn');
  const tableWrap = document.querySelector('.ui-table-wrap');
  const tbody = tableWrap ? tableWrap.querySelector('tbody') : null;

  if (skelBtn && tbody) {
    skelBtn.addEventListener('click', () => {
      skelBtn.disabled = true;
      const rows = Array.from(tbody.querySelectorAll('tr'));
      rows.forEach(r => r.style.display = 'none');

      // Insert skeleton shimmer rows
      const frag = document.createDocumentFragment();
      for (let i = 0; i < 4; i++) {
        const tr = document.createElement('tr');
        tr.className = 'skeleton-row';
        tr.innerHTML = '<td colspan="7"><div class="skeleton"></div></td>';
        frag.appendChild(tr);
      }
      tbody.appendChild(frag);

      setTimeout(() => {
        tbody.querySelectorAll('.skeleton-row').forEach(sr => sr.remove());
        rows.forEach((r, i) => {
          if (i < 5) r.style.display = '';
        });
        skelBtn.disabled = false;
      }, 320);
    });
  }

  // 2. Empty State Demo & Reset
  const emptyState = document.getElementById('demo-empty-state');
  const emptyStateBtn = document.getElementById('demo-empty-state-btn');
  if (emptyStateBtn && emptyState) {
    emptyStateBtn.addEventListener('click', () => {
      emptyState.style.display = 'none';
      if (tbody) {
        tbody.querySelectorAll('tr').forEach((r, i) => {
          if (i < 5) r.style.display = '';
        });
      }
    });
  }

  // 3. Modal Previews
  const rejectModal = document.getElementById('demoRejectModal');
  const openRejectBtn = document.getElementById('demo-open-reject-modal-btn');
  const closeRejectBtn = document.getElementById('demoCloseRejectModal');
  const rejectForm = document.getElementById('demoRejectForm');

  if (openRejectBtn && rejectModal) {
    openRejectBtn.addEventListener('click', () => rejectModal.classList.add('active'));
  }
  if (closeRejectBtn && rejectModal) {
    closeRejectBtn.addEventListener('click', () => rejectModal.classList.remove('active'));
  }
  if (rejectModal) {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && rejectModal.classList.contains('active')) {
        rejectModal.classList.remove('active');
      }
    });
  }
  if (rejectForm) {
    rejectForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const reasonInput = document.getElementById('demoRejectReason');
      if (!reasonInput || !reasonInput.value.trim()) {
        showDemoToast('Please provide a reason for rejection before confirming.');
        if (reasonInput) reasonInput.focus();
        return;
      }
      rejectModal.classList.remove('active');
      showDemoToast('Application proposal rejected successfully.');
    });
  }

  // 4. Logout Confirmation Dialog
  const logoutDialog = document.getElementById('demoLogoutDialog');
  const openLogoutBtn = document.getElementById('demo-open-logout-btn');
  if (openLogoutBtn && logoutDialog) {
    openLogoutBtn.addEventListener('click', () => {
      logoutDialog.showModal();
    });
  }

  // 5. Toast Demonstration
  const toastBtn = document.getElementById('demo-show-toast-btn');
  const toastEl = document.getElementById('demoToast');
  const toastMsgEl = document.getElementById('demoToastMessage');
  let toastTimer = null;

  function showDemoToast(msg) {
    if (!toastEl) return;
    if (toastMsgEl && msg) toastMsgEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 3000);
  }

  if (toastBtn) {
    toastBtn.addEventListener('click', () => {
      showDemoToast('Operation executed successfully! Record updated.');
    });
  }

  // 6. Interactive Sidebar Nav Switcher Demo
  const demoNav = document.getElementById('demo-sidebar-nav');
  if (demoNav) {
    const demoLinks = demoNav.querySelectorAll('a');
    demoLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        demoLinks.forEach(l => {
          l.className = 'nav-btn-inactive min-h-[40px] px-3.5 rounded-2xl flex items-center gap-[12px] text-[13px] font-semibold';
          l.style.textDecoration = 'none';
          l.style.background = 'transparent';
          l.style.color = '#98938D';
          l.style.boxShadow = 'none';
          l.removeAttribute('aria-current');
          const icon = l.querySelector('svg');
          if (icon) icon.style.color = '#98938D';
          const text = l.querySelector('span');
          if (text) text.style.color = '#98938D';
        });
        link.className = 'nav-btn-active min-h-[42px] px-3.5 rounded-[16px] flex items-center gap-[12px] text-[13px] font-bold';
        link.style.textDecoration = 'none';
        link.style.background = '#D97251';
        link.style.color = '#000000';
        link.style.boxShadow = '0 1px 3px rgba(0,0,0,0.2)';
        link.setAttribute('aria-current', 'page');
        const icon = link.querySelector('svg');
        if (icon) icon.style.color = '#000000';
        const text = link.querySelector('span');
        if (text) text.style.color = '#000000';
      });
    });
  }

  // Tag Overflow (+N) Popover Toggle Listener
  document.addEventListener('click', (e) => {
    const moreBtn = e.target.closest('.ui-tags-more');
    document.querySelectorAll('.ui-tags-more.is-open').forEach((el) => {
      if (el !== moreBtn) {
        el.classList.remove('is-open');
        el.setAttribute('aria-expanded', 'false');
      }
    });
    if (moreBtn) {
      e.stopPropagation();
      const isOpen = moreBtn.classList.toggle('is-open');
      moreBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.ui-tags-more.is-open').forEach((el) => {
        el.classList.remove('is-open');
        el.setAttribute('aria-expanded', 'false');
      });
    }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('ui-tags-more')) {
      e.preventDefault();
      const isOpen = e.target.classList.toggle('is-open');
      e.target.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }
  });
});

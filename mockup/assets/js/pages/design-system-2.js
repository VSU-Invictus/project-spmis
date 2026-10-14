/* Extracted from pages/design-system.html */
// Wire Interactive Style Guide Demos: Skeleton Loading, Modals & Toasts
document.addEventListener('DOMContentLoaded', () => {
  const textLoadingButton = document.getElementById('demo-simulate-text-loading-btn');
  const textLoadingLabel = document.getElementById('demo-text-loading-label');
  const textLoadingStatus = document.getElementById('demo-text-loading-status');
  const loadingTexts = document.querySelectorAll('#demo-text-loading-grid [data-text-loading-demo]');

  if (textLoadingButton && textLoadingLabel && textLoadingStatus && loadingTexts.length) {
    textLoadingButton.addEventListener('click', () => {
      if (textLoadingButton.disabled) return;
      textLoadingButton.disabled = true;
      textLoadingLabel.textContent = 'Loading texts…';
      textLoadingStatus.textContent = 'Loading typography examples…';

      const placeholders = Array.from(loadingTexts, text => {
        const style = getComputedStyle(text);
        const lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.4;
        const lineCount = Math.max(1, Math.round(text.getBoundingClientRect().height / lineHeight));
        const overlay = document.createElement('span');
        overlay.className = 'ui-text-loading-placeholder';
        overlay.setAttribute('aria-hidden', 'true');
        for (let line = 0; line < lineCount; line++) {
          const bar = document.createElement('span');
          bar.className = 'ui-skeleton ui-skeleton--text-line';
          overlay.appendChild(bar);
        }
        text.appendChild(overlay);
        text.classList.add('ui-text--loading');
        text.setAttribute('aria-busy', 'true');
        return { text, overlay };
      });

      setTimeout(() => {
        placeholders.forEach(({ text, overlay }) => {
          text.classList.remove('ui-text--loading');
          text.setAttribute('aria-busy', 'false');
          overlay.remove();
        });
        textLoadingButton.disabled = false;
        textLoadingLabel.textContent = 'Simulate Skeleton Loading (280ms)';
        textLoadingStatus.textContent = 'Typography examples loaded. You can preview again.';
      }, 280);
    });
  }

  // Card previews keep their content in place to avoid layout shifts.
  const cardLoadingButton = document.getElementById('demo-simulate-card-loading-btn');
  const cardLoadingLabel = document.getElementById('demo-card-loading-label');
  const cardLoadingStatus = document.getElementById('demo-card-loading-status');
  const loadingCards = document.querySelectorAll('#demo-card-loading-grid [data-card-loading-demo]');

  if (cardLoadingButton && cardLoadingLabel && cardLoadingStatus && loadingCards.length) {
    cardLoadingButton.addEventListener('click', () => {
      if (cardLoadingButton.disabled) return;
      cardLoadingButton.disabled = true;
      cardLoadingLabel.textContent = 'Loading cards…';
      cardLoadingStatus.textContent = 'Loading standard, KPI, and interactive cards…';
      loadingCards.forEach(card => {
        card.classList.add('ui-card--loading');
        card.setAttribute('aria-busy', 'true');
        card.inert = true;
      });

      setTimeout(() => {
        loadingCards.forEach(card => {
          card.classList.remove('ui-card--loading');
          card.setAttribute('aria-busy', 'false');
          card.inert = false;
        });
        cardLoadingButton.disabled = false;
        cardLoadingLabel.textContent = 'Simulate Skeleton Loading (280ms)';
        cardLoadingStatus.textContent = 'Card examples loaded. You can preview again.';
      }, 280);
    });
  }

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
      }, 280);
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

  // 3. Portal Modal Previews (Admin Entity, Admin Remove, Faculty Proposal)
  // 3A. Admin Entity Modal
  const adminModal = document.getElementById('demoAdminModal');
  const openAdminBtn = document.getElementById('demo-open-admin-modal-btn');
  const cancelAdminBtn = document.getElementById('cancelDemoAdminModal');
  const adminForm = document.getElementById('demoAdminForm');

  if (openAdminBtn && adminModal) {
    openAdminBtn.addEventListener('click', () => adminModal.classList.add('active'));
  }
  if (cancelAdminBtn && adminModal) {
    cancelAdminBtn.addEventListener('click', () => adminModal.classList.remove('active'));
  }
  if (adminModal) {
    adminModal.addEventListener('click', (e) => {
      if (e.target === adminModal) adminModal.classList.remove('active');
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && adminModal.classList.contains('active')) {
        adminModal.classList.remove('active');
      }
    });
  }
  if (adminForm) {
    adminForm.addEventListener('submit', (e) => {
      e.preventDefault();
      adminModal.classList.remove('active');
      showDemoToast('Department record saved successfully.');
    });
  }

  // 3B. Admin Destructive Remove Modal
  const removeModal = document.getElementById('demoRemoveModal');
  const openRemoveBtn = document.getElementById('demo-open-remove-modal-btn');
  const cancelRemoveBtn = document.getElementById('cancelDemoRemoveModal');
  const confirmRemoveBtn = document.getElementById('confirmDemoRemoveModal');

  if (openRemoveBtn && removeModal) {
    openRemoveBtn.addEventListener('click', () => removeModal.classList.add('active'));
  }
  if (cancelRemoveBtn && removeModal) {
    cancelRemoveBtn.addEventListener('click', () => removeModal.classList.remove('active'));
  }
  if (confirmRemoveBtn && removeModal) {
    confirmRemoveBtn.addEventListener('click', () => {
      removeModal.classList.remove('active');
      showDemoToast('Department record permanently removed.');
    });
  }
  if (removeModal) {
    removeModal.addEventListener('click', (e) => {
      if (e.target === removeModal) removeModal.classList.remove('active');
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && removeModal.classList.contains('active')) {
        removeModal.classList.remove('active');
      }
    });
  }

  // 3C. Faculty Proposal Modal (<dialog>)
  const facultyModal = document.getElementById('demoFacultyModal');
  const openFacultyBtn = document.getElementById('demo-open-faculty-modal-btn');
  const cancelFacultyBtn = document.getElementById('cancelDemoFacultyModal');
  const facultyForm = document.getElementById('demoFacultyForm');

  if (openFacultyBtn && facultyModal) {
    openFacultyBtn.addEventListener('click', () => {
      if (typeof facultyModal.showModal === 'function') {
        facultyModal.showModal();
      } else {
        facultyModal.setAttribute('open', '');
      }
    });
  }
  if (cancelFacultyBtn && facultyModal) {
    cancelFacultyBtn.addEventListener('click', () => {
      if (typeof facultyModal.close === 'function') {
        facultyModal.close();
      } else {
        facultyModal.removeAttribute('open');
      }
    });
  }
  if (facultyForm && facultyModal) {
    facultyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (typeof facultyModal.close === 'function') {
        facultyModal.close();
      } else {
        facultyModal.removeAttribute('open');
      }
      showDemoToast('Proposal submitted to administrator queue.');
    });
  }

  // 4. Logout Confirmation Dialog
  const logoutDialog = document.getElementById('demoLogoutDialog');
  const openLogoutBtns = document.querySelectorAll('#demo-open-logout-btn, [data-open-logout-demo]');
  if (logoutDialog && openLogoutBtns.length) {
    openLogoutBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        logoutDialog.showModal();
      });
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

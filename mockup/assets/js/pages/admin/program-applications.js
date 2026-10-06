/* Extracted from pages/admin/program-applications.html */
      // Search, Filter and Admin Table initialization
      const searchInput = document.getElementById('searchInput');
      const typeFilter = document.getElementById('typeFilter');
      const sortFilter = document.getElementById('sortFilter');

      const adminTable = window.initAdminTable({
        tableBody: '#tableBody',
        searchInput: '#searchInput',
        filterElements: ['#typeFilter', '#sortFilter'],
        emptyState: '#emptyState',
        rowsPerPage: '.ui-select-pill',
        prevBtn: '.ui-table-page-btn:first-of-type',
        nextBtn: '.ui-table-page-btn:last-of-type',
        selectAllCheckbox: '.select-all-checkbox',
        rowCheckbox: '.row-checkbox',
        selectionCount: '#selection-count',
        entityName: 'applications',
        searchFields: (row, query) => {
          return row.textContent.toLowerCase().includes(query);
        },
        filterMatches: (row) => {
          const type = typeFilter ? typeFilter.value.toLowerCase() : 'all';
          return type.includes('all') || row.textContent.toLowerCase().includes(type);
        }

      });

      // Toast and Modal Logic
      const toast = document.getElementById('toast');
      // Mark the currently selected rows as approved/rejected and clear the selection.
      function applyDecision(status) {
        const checked = document.querySelectorAll(".ui-table tbody input[type='checkbox']:checked");
        checked.forEach((cb) => {
          const row = cb.closest('tr');
          if (!row) return;
          const badge = [...row.querySelectorAll('.ui-badge')].find((b) => /^(pending|active|approved|rejected)$/i.test(b.textContent.trim()));
          if (badge) {
            badge.className = 'ui-badge ' + (status === 'approved' ? 'ui-badge--success' : 'ui-badge--destructive');
            badge.textContent = status;
          }
          row.dataset.queueStatus = status;
          cb.checked = false;
          row.classList.remove('checked');
        });
        const selectAll = document.querySelector('.select-all-checkbox');
        if (selectAll) { selectAll.checked = false; selectAll.indeterminate = false; }
        const counter = document.getElementById('selection-count');
        if (counter) counter.textContent = counter.textContent.replace(/^\d+/, '0');
        return checked.length;
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
const rejectModal = document.getElementById('rejectModal');
      const rejectForm = document.getElementById('rejectForm');
      const closeReject = document.getElementById('closeReject');
      const acceptModal = document.getElementById('acceptModal');
      const acceptForm = document.getElementById('acceptForm');
      const closeAccept = document.getElementById('closeAccept');
      const cancelAcceptBtn = document.getElementById('cancelAcceptBtn');
      const acceptSummary = document.getElementById('acceptSummary');

      function openModal(modal) {
        if (modal) {
          modal.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      }

      function closeModal(modal) {
        if (modal) {
          modal.classList.remove('active');
          document.body.style.overflow = '';
        }
      }

      if (closeReject) {
        closeReject.addEventListener('click', () => closeModal(rejectModal));
      }
      if (closeAccept) {
        closeAccept.addEventListener('click', () => closeModal(acceptModal));
      }
      if (cancelAcceptBtn) {
        cancelAcceptBtn.addEventListener('click', () => closeModal(acceptModal));
      }

      window.addEventListener('click', (e) => {
        if (e.target === rejectModal) closeModal(rejectModal);
        if (e.target === acceptModal) closeModal(acceptModal);
      });

      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
          closeModal(rejectModal);
          closeModal(acceptModal);
        }
      });

      let rejectReasons = {};
      let currentAppId = null;

      const rejectAppSelect = document.getElementById('rejectAppSelect');
      const rejectReason = document.getElementById('rejectReason');

      if (rejectReason) {
        // Auto-expand textarea on typing to cater long inputs
        rejectReason.addEventListener('input', () => {
          rejectReason.style.height = 'auto';
          rejectReason.style.height = Math.max(90, Math.min(260, rejectReason.scrollHeight)) + 'px';
        });
      }

      if (rejectAppSelect && rejectReason) {
        rejectAppSelect.addEventListener('change', (e) => {
          if (currentAppId) {
            rejectReasons[currentAppId] = rejectReason.value;
          }
          currentAppId = e.target.value;
          rejectReason.value = rejectReasons[currentAppId] || '';
          rejectReason.style.height = 'auto';
          rejectReason.style.height = Math.max(90, Math.min(260, rejectReason.scrollHeight)) + 'px';
        });
      }

      if (rejectForm) {
        rejectForm.addEventListener('submit', e => {
          e.preventDefault();
          if (currentAppId) {
            rejectReasons[currentAppId] = rejectReason.value;
          }

          const checked = document.querySelectorAll(".ui-table tbody input[type='checkbox']:checked");
          let allFilled = true;
          checked.forEach((cb) => {
            const id = cb.dataset.appId;
            if (!rejectReasons[id] || rejectReasons[id].trim() === '') {
              allFilled = false;
            }
          });

          if (!allFilled || (rejectReason && !rejectReason.value.trim())) {
            showToast('Please provide a reason for rejection before confirming.');
            if (rejectReason) rejectReason.focus();
            return;
          }

          closeModal(rejectModal);
          const n = applyDecision('rejected');
          window.setTimeout(() => showToast(n > 1 ? n + ' Applications Rejected' : 'Application Rejected Successfully'), 120);
        });
      }

      const acceptBtn = document.querySelector('.pill-btn.accept');
      const rejectBtn = document.querySelector('.pill-btn.reject');

      if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
          const checked = document.querySelectorAll(".ui-table tbody input[type='checkbox']:checked");
          if (checked.length > 0) {
            if (acceptSummary) {
              const names = Array.from(checked).map((cb, idx) => {
                const row = cb.closest('tr');
                const nameEl = row ? row.querySelectorAll('td')[1] : null;
                return nameEl ? nameEl.textContent.trim() : `Application #${idx + 1}`;
              });
              acceptSummary.innerHTML = `<strong>${checked.length} program(s):</strong> ${names.join(', ')}`;
            }
            openModal(acceptModal);
          } else {
            showToast('Please select at least one application');
          }
        });
      }

      if (acceptForm) {
        acceptForm.addEventListener('submit', e => {
          e.preventDefault();
          closeModal(acceptModal);
          const n = applyDecision('approved');
          window.setTimeout(() => showToast(n > 1 ? n + ' Applications Accepted' : 'Application Accepted Successfully'), 120);
        });
      }

      if (rejectBtn) {
        rejectBtn.addEventListener('click', () => {
          const checked = document.querySelectorAll(".ui-table tbody input[type='checkbox']:checked");
          if (checked.length > 0) {
            rejectReasons = {};
            if (rejectAppSelect) rejectAppSelect.innerHTML = '';
            
            checked.forEach((cb, index) => {
              const row = cb.closest('tr');
              const nameEl = row.querySelectorAll('td')[1];
              const name = nameEl ? nameEl.textContent.trim() : 'Application ' + (index + 1);
              const id = 'app_' + index;
              cb.dataset.appId = id;
              
              if (rejectAppSelect) {
                const option = document.createElement('option');
                option.value = id;
                option.textContent = name;
                rejectAppSelect.appendChild(option);
              }
            });

            if (rejectAppSelect) {
              currentAppId = rejectAppSelect.value;
            }
            if (rejectReason) {
              rejectReason.value = '';
              rejectReason.style.height = 'auto';
            }
            openModal(rejectModal);
          } else {
            showToast('Please select at least one application');
          }
        });
      }

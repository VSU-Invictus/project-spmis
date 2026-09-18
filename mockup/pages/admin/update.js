const fs = require('fs');
const path = require('path');

const htmlTarget = <form class="modal-form" id="rejectForm">
          <div>
            <label>Reason for rejection:</label>
            <textarea placeholder="Enter reason here..." required id="rejectReason"></textarea>
          </div>
          <button type="submit" class="modal-submit">Confirm Rejection</button>
        </form>;

const htmlReplacement = <form class="modal-form" id="rejectForm">
          <div>
            <label>Application:</label>
            <select id="rejectAppSelect" style="width: 100%; height: 40px; background: #FFFFFF; border: 1px solid #E4DED5; border-radius: 12px; font-family: 'Inter'; font-size: 14px; padding: 0 10px; outline: none;"></select>
          </div>
          <div>
            <label>Reason for rejection:</label>
            <textarea placeholder="Enter reason here..." id="rejectReason"></textarea>
          </div>
          <button type="submit" class="modal-submit">Confirm Rejection</button>
        </form>;

const jsTarget =       if (rejectForm) {
        rejectForm.addEventListener('submit', e => {
          e.preventDefault();
          closeModal(rejectModal);
          window.setTimeout(() => showToast('Application Rejected Successfully'), 120);
        });
      }

      const acceptBtn = document.querySelector('.pill-btn.accept');
      const rejectBtn = document.querySelector('.pill-btn.reject');

      if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
          const checked = document.querySelectorAll('.table-body .custom-checkbox:checked');
          if (checked.length > 0) {
            showToast('Application Accepted Successfully');
          } else {
            showToast('Please select at least one application');
          }
        });
      }

      if (rejectBtn) {
        rejectBtn.addEventListener('click', () => {
          const checked = document.querySelectorAll('.table-body .custom-checkbox:checked');
          if (checked.length > 0) {
            openModal(rejectModal);
            document.getElementById('rejectReason').value = '';
          } else {
            showToast('Please select at least one application');
          }
        });
      };

const jsReplacement =       let rejectReasons = {};
      let currentAppId = null;

      const rejectAppSelect = document.getElementById('rejectAppSelect');
      const rejectReason = document.getElementById('rejectReason');

      if (rejectAppSelect && rejectReason) {
        rejectAppSelect.addEventListener('change', (e) => {
          if (currentAppId) {
            rejectReasons[currentAppId] = rejectReason.value;
          }
          currentAppId = e.target.value;
          rejectReason.value = rejectReasons[currentAppId] || '';
        });
      }

      if (rejectForm) {
        rejectForm.addEventListener('submit', e => {
          e.preventDefault();
          if (currentAppId) {
            rejectReasons[currentAppId] = rejectReason.value;
          }

          const checked = document.querySelectorAll('.table-body .custom-checkbox:checked');
          let allFilled = true;
          checked.forEach((cb) => {
            const id = cb.dataset.appId;
            if (!rejectReasons[id] || rejectReasons[id].trim() === '') {
              allFilled = false;
            }
          });

          if (!allFilled) {
            showToast('Please provide a reason for all selected applications');
            return;
          }

          closeModal(rejectModal);
          window.setTimeout(() => showToast('Applications Rejected Successfully'), 120);
        });
      }

      const acceptBtn = document.querySelector('.pill-btn.accept');
      const rejectBtn = document.querySelector('.pill-btn.reject');

      if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
          const checked = document.querySelectorAll('.table-body .custom-checkbox:checked');
          if (checked.length > 0) {
            showToast('Application Accepted Successfully');
          } else {
            showToast('Please select at least one application');
          }
        });
      }

      if (rejectBtn) {
        rejectBtn.addEventListener('click', () => {
          const checked = document.querySelectorAll('.table-body .custom-checkbox:checked');
          if (checked.length > 0) {
            rejectReasons = {};
            if (rejectAppSelect) rejectAppSelect.innerHTML = '';
            
            checked.forEach((cb, index) => {
              const row = cb.closest('.table-row');
              const nameEl = row.querySelector('.col-name');
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
            }
            openModal(rejectModal);
          } else {
            showToast('Please select at least one application');
          }
        });
      };

const files = ['student-applications.html', 'faculty-applications.html', 'program-applications.html', 'department-applications.html'];

files.forEach(f => {
  const filePath = path.join(__dirname, f);
  let content = fs.readFileSync(filePath, 'utf8');
  
  content = content.replace(htmlTarget, htmlReplacement);
  content = content.replace(jsTarget, jsReplacement);
  
  fs.writeFileSync(filePath, content);
  console.log('Updated ' + f);
});

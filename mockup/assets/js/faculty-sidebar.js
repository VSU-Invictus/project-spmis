(() => {
  // Clear any legacy collapsed state so the sidebar is never collapsed
  try {
    sessionStorage.removeItem("faculty-sidebar-collapsed");
  } catch {}
  document.documentElement.classList.remove("sidebar-collapsed");

  function init() {
    let dialog = document.querySelector('.logout-dialog');
    if (!dialog) {
      dialog = document.createElement("dialog");
      dialog.className = "logout-dialog";
      dialog.setAttribute("aria-labelledby", "logout-title");
      dialog.innerHTML =
        '<form method="dialog"><h2 id="logout-title">Log out?</h2><p>Are you sure you want to end your faculty session?</p><div class="actions"><button type="submit" value="cancel" class="ui-btn ui-btn-outline">Cancel</button><button type="submit" value="confirm" class="ui-btn ui-btn-primary">Log out</button></div></form>';
      dialog.querySelector("form").addEventListener("submit", (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        dialog.returnValue = event.submitter?.value || "cancel";
        dialog.close();
      }, true);
      dialog.querySelector('button[value="confirm"]').addEventListener("click", (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        dialog.returnValue = "confirm";
        dialog.close();
      }, true);
      dialog.querySelector('button[value="cancel"]').addEventListener("click", (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        dialog.returnValue = "cancel";
        dialog.close();
      }, true);
      dialog.addEventListener("close", () => {
        if (dialog.returnValue !== "confirm") return;
        try {
          sessionStorage.removeItem("faculty-demo-v1");
          sessionStorage.removeItem("faculty-sidebar-collapsed");
        } catch {}

        const redirectToLogin = () => {
          location.href = "../auth/signin.html";
        };

        const toast = document.getElementById("global-success-toast");
        const toastMessage = document.getElementById("toast-message");

        if (typeof window.showSuccessToast === "function") {
          window.showSuccessToast("Logged out successfully");
        } else if (toast && toastMessage) {
          toastMessage.textContent = "Logged out successfully";
          toast.classList.add("show");
        }

        window.setTimeout(redirectToLogin, 700);
      });
      document.body.append(dialog);
    }

    const bindLogout = (root) => {
      if (!root) return;
      const btns = root.querySelectorAll('.sidebar-logout-btn, .logout-btn');
      btns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          dialog.showModal();
        });
      });
    };

    bindLogout(document);

    const frame = document.getElementById('sidebar-frame');
    if (frame) {
      const attachFrame = () => {
        try {
          const doc = frame.contentDocument || frame.contentWindow?.document;
          bindLogout(doc);
        } catch (_) {}
      };
      if (frame.contentDocument?.readyState === 'complete') {
        attachFrame();
      }
      frame.addEventListener('load', attachFrame);
    }

    syncActiveLink();
  }

  function syncActiveLink(fileName) {
    const frame = document.getElementById('sidebar-frame');
    if (!frame) return;

    const targetPage = fileName || (window.location && window.location.pathname ? window.location.pathname.split('/').pop() : '') || 'dashboard.html';

    function applyActive() {
      try {
        const doc = frame.contentDocument || frame.contentWindow?.document;
        if (!doc) return;
        const links = doc.querySelectorAll('#sidebar-nav a');
        const targetKey = targetPage.replace('.html', '').toLowerCase();

        links.forEach((link) => {
          const href = (link.getAttribute('href') || '').split('/').pop();
          const navKey = (link.dataset.navKey || '').toLowerCase();
          const isActive = href === targetPage || navKey === targetKey || 
            (navKey === 'students' && (targetKey === 'student-detail' || targetKey === 'register-student')) ||
            (navKey === 'applications' && targetKey === 'new-review');

          if (isActive) {
            link.classList.remove('nav-btn-inactive');
            link.classList.add('nav-btn-active');
            link.setAttribute('aria-current', 'page');
          } else {
            link.classList.remove('nav-btn-active');
            link.classList.add('nav-btn-inactive');
            link.removeAttribute('aria-current');
          }
        });
      } catch (_) {}
    }

    if (frame.contentDocument && frame.contentDocument.readyState === 'complete') {
      applyActive();
    }
    frame.addEventListener('load', applyActive);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();

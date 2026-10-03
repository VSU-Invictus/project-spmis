(() => {
  // Clear any legacy collapsed state so the sidebar is never collapsed
  try {
    sessionStorage.removeItem("faculty-sidebar-collapsed");
  } catch {}
  document.documentElement.classList.remove("sidebar-collapsed");

  function init() {
    // Setup logout dialog handler for any .sidebar-logout-btn or .logout-btn
    const logoutBtns = document.querySelectorAll('.sidebar-logout-btn, .logout-btn');
    if (!logoutBtns.length) return;

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

    logoutBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        dialog.showModal();
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();

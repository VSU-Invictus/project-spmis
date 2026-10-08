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
        '<form method="dialog"><h2 id="logout-title">Log out?</h2><p>Are you sure you want to end your faculty session?</p><div class="actions"><button type="submit" value="cancel" class="secondary">Cancel</button><button type="submit" value="confirm">Log out</button></div></form>';
      dialog.addEventListener("close", () => {
        if (dialog.returnValue !== "confirm") return;
        try {
          sessionStorage.removeItem("faculty-demo-v1");
          sessionStorage.removeItem("faculty-sidebar-collapsed");
        } catch {}
        location.href = "../auth/signin.html";
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

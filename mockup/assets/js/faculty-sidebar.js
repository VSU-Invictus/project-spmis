(() => {
  const storageKey = "faculty-sidebar-collapsed";
  let initiallyCollapsed = false;

  try {
    initiallyCollapsed = sessionStorage.getItem(storageKey) === "true";
  } catch {}
  document.documentElement.classList.toggle(
    "sidebar-collapsed",
    initiallyCollapsed,
  );

  function init() {
    const sidebar = document.querySelector("[data-faculty-sidebar]");
    if (!sidebar) return;
    if (initiallyCollapsed) sidebar.classList.add("sidebar-collapsed");
    void sidebar.offsetWidth;
    sidebar.classList.add("sidebar-ready");

    function addControls() {
      const nav = sidebar.querySelector(".nav");
      if (!nav) return;
      if (!nav.id) nav.id = "faculty-navigation";

      if (!sidebar.querySelector(".sidebar-toggle")) {
        const button = document.createElement("button");
        button.className = "sidebar-toggle";
        button.type = "button";
        button.innerHTML =
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 5h16M4 12h16M4 19h16"/></svg>';
        button.setAttribute("aria-controls", nav.id);

        function update() {
          const collapsed = sidebar.classList.contains("sidebar-collapsed");
          button.setAttribute("aria-expanded", String(!collapsed));
          button.setAttribute(
            "aria-label",
            collapsed ? "Expand sidebar" : "Collapse sidebar",
          );
        }

        button.addEventListener("click", () => {
          const collapsed = sidebar.classList.toggle("sidebar-collapsed");
          document.documentElement.classList.toggle(
            "sidebar-collapsed",
            collapsed,
          );
          try {
            sessionStorage.setItem(storageKey, String(collapsed));
          } catch {}
          update();
        });
        update();
        sidebar.prepend(button);
      }

      const profile = sidebar.querySelector(".profile-link");
      if (profile && !sidebar.querySelector(".logout-button")) {
        const area = document.createElement("div");
        area.className = "profile-area";
        profile.before(area);
        area.append(profile);

        const logout = document.createElement("button");
        logout.className = "logout-button";
        logout.type = "button";
        logout.setAttribute("aria-label", "Log out");
        logout.innerHTML =
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M10 17l5-5-5-5M15 12H3M15 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"/></svg>';
        const dialog = document.createElement("dialog");
        dialog.className = "logout-dialog";
        dialog.setAttribute("aria-labelledby", "logout-title");
        dialog.innerHTML =
          '<form method="dialog"><h2 id="logout-title">Log out?</h2><p>Are you sure you want to end your faculty session?</p><div class="actions"><button type="submit" value="cancel" class="secondary">Cancel</button><button type="submit" value="confirm">Log out</button></div></form>';
        dialog.addEventListener("close", () => {
          if (dialog.returnValue !== "confirm") return;
          try {
            sessionStorage.removeItem("faculty-demo-v1");
            sessionStorage.removeItem(storageKey);
          } catch {}
          location.href = "../auth/signup.html";
        });
        logout.addEventListener("click", () => dialog.showModal());
        area.append(logout);
        document.body.append(dialog);
      }
    }

    addControls();
    new MutationObserver(addControls).observe(sidebar, { childList: true });
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();

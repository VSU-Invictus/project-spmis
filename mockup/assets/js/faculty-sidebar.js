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

    function addToggle() {
      if (sidebar.querySelector(".sidebar-toggle")) return;
      const nav = sidebar.querySelector(".nav");
      if (!nav) return;
      if (!nav.id) nav.id = "faculty-navigation";

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

    addToggle();
    new MutationObserver(addToggle).observe(sidebar, { childList: true });
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();

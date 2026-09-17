(() => {
  const sidebar = document.querySelector("[data-faculty-sidebar]");
  if (!sidebar) return;

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
      sidebar.classList.toggle("sidebar-collapsed");
      update();
    });
    update();
    sidebar.prepend(button);
  }

  addToggle();
  new MutationObserver(addToggle).observe(sidebar, { childList: true });
})();

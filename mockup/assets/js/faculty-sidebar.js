(() => {
  const logoutScriptUrl = new URL("./logout-confirmation.js", document.currentScript.src).href;
  // Clear any legacy collapsed state so the sidebar is never collapsed
  try {
    sessionStorage.removeItem("faculty-sidebar-collapsed");
  } catch {}
  document.documentElement.classList.remove("sidebar-collapsed");

  function init() {
    const logoutScript = document.createElement("script");
    logoutScript.src = logoutScriptUrl;
    document.head.appendChild(logoutScript);
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

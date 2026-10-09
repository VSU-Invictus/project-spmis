(() => {
  'use strict';

  function syncActiveLink(fileName) {
    const frame = document.getElementById('sidebar-frame');
    if (!frame) return;

    const targetPage = fileName || window.location.pathname.split('/').pop() || 'dashboard.html';

    function applyActive() {
      try {
        const doc = frame.contentDocument || frame.contentWindow.document;
        if (!doc) return;
        const links = doc.querySelectorAll('#sidebar-nav a');

        links.forEach((link) => {
          const href = (link.getAttribute('href') || '').split('/').pop();
          const navKey = (link.dataset.navKey || '').toLowerCase();
          const targetKey = targetPage.replace('.html', '').toLowerCase();
          const isActive = href === targetPage || navKey === targetKey || (targetKey.startsWith(navKey) && navKey !== 'dashboard');

          link.classList.remove('nav-btn-active', 'font-bold', 'shadow-sm', 'nav-btn-inactive', 'font-semibold');
          if (isActive) {
            link.classList.add('nav-btn-active', 'font-bold', 'shadow-sm');
            link.setAttribute('aria-current', 'page');
          } else {
            link.classList.add('nav-btn-inactive', 'font-semibold');
            link.removeAttribute('aria-current');
          }

          const svg = link.querySelector('svg');
          if (svg) {
            svg.setAttribute('stroke', isActive ? '#000000' : 'currentColor');
          }
        });
      } catch (_) {}
    }

    if (frame.contentDocument?.readyState === 'complete') {
      applyActive();
    }
    frame.addEventListener('load', applyActive);
  }

  window.setSidebarActive = syncActiveLink;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => syncActiveLink());
  } else {
    syncActiveLink();
  }
})();

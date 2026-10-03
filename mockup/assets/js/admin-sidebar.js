(() => {
  window.setSidebarActive = () => {};

  function initSidebar() {
    let sidebar = document.querySelector('#sidebar-menu');
    const host = document.querySelector('[data-admin-sidebar]');

    if (!sidebar && host) {
      const parsed = new DOMParser().parseFromString(sidebarMarkup, 'text/html');
      const parsedSidebar = parsed.querySelector('#sidebar-menu');
      if (parsedSidebar) {
        parsedSidebar.className = `${host.className || 'sidebar-frame'} sidebar`;
        parsedSidebar.removeAttribute('style');
        host.replaceWith(parsedSidebar);
        sidebar = parsedSidebar;
      }
    }

    if (!sidebar) return;

    // Highlight active page link
    const currentPage = window.location.pathname.toLowerCase().split('/').pop() || 'dashboard.html';
    const links = sidebar.querySelectorAll('#sidebar-nav a');
    links.forEach((link) => {
      const linkPage = (link.getAttribute('href') || '').toLowerCase().split('/').pop();
      const isActive = linkPage === currentPage;
      link.className = isActive
        ? 'nav-btn-active min-h-[40px] h-[40px] px-3.5 rounded-2xl flex items-center gap-[12px] text-[13px] font-bold transition-all shadow-sm'
        : 'nav-btn-inactive min-h-[40px] h-[40px] px-3.5 rounded-2xl flex items-center gap-[12px] text-[13px] font-semibold transition-all';
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }

      // Prefetch on hover for instant smooth navigation
      link.addEventListener('mouseenter', () => {
        const href = link.getAttribute('href');
        if (href && !document.querySelector(`link[rel="prefetch"][href="${href}"]`)) {
          const prefetch = document.createElement('link');
          prefetch.rel = 'prefetch';
          prefetch.href = href;
          document.head.appendChild(prefetch);
        }
      }, { once: true });
    });

    // Logout Modal
    const logout = sidebar.querySelector('[aria-label="Log out"]');
    if (logout && !logout.dataset.bound) {
      logout.dataset.bound = 'true';
      logout.addEventListener('click', (event) => {
        event.preventDefault();
        let dialog = document.querySelector('.logout-dialog');
        if (!dialog) {
          dialog = document.createElement('dialog');
          dialog.className = 'logout-dialog';
          dialog.innerHTML = '<form method="dialog"><h2>Log out?</h2><p>Are you sure you want to end your admin session?</p><div class="actions"><button type="submit" value="cancel" class="ui-btn ui-btn-outline">Cancel</button><button type="submit" value="confirm" class="ui-btn ui-btn-primary">Log out</button></div></form>';
          document.body.appendChild(dialog);
          dialog.addEventListener('close', () => {
            if (dialog.returnValue === 'confirm') {
              window.location.href = '../../pages/auth/signin.html';
            }
          });
        }
        dialog.showModal();
      });
    }
  }

  const sidebarMarkup = `
    <aside id="sidebar-menu" class="sidebar sidebar-frame">
      <div class="flex flex-col gap-1">
        <div class="brand-header"><h1 class="brand-title">Admin Portal</h1></div>
        <nav class="nav" id="sidebar-nav" aria-label="Admin navigation">
          <a href="../../pages/admin/dashboard.html" class="nav-btn-inactive min-h-[40px] h-[40px] px-3.5 rounded-2xl flex items-center gap-[12px] text-[13px] font-semibold transition-all"><svg class="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2"><rect x="2.5" y="2.5" width="6.5" height="6.5" rx="1.5"/><rect x="11" y="2.5" width="6.5" height="6.5" rx="1.5"/><rect x="2.5" y="11" width="6.5" height="6.5" rx="1.5"/><rect x="11" y="11" width="6.5" height="6.5" rx="1.5"/></svg><span>Dashboard</span></a>
          <a href="../../pages/admin/faculty-applications.html" class="nav-btn-inactive min-h-[40px] h-[40px] px-3.5 rounded-2xl flex items-center gap-[12px] text-[13px] font-semibold transition-all"><svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 14h6M9 18h6M9 10h.01"/></svg><span>Faculty Applications</span></a>
          <a href="../../pages/admin/student-applications.html" class="nav-btn-inactive min-h-[40px] h-[40px] px-3.5 rounded-2xl flex items-center gap-[12px] text-[13px] font-semibold transition-all"><svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24A2 2 0 0 0 5.45 5.11Z"/><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/></svg><span>Student Applications</span></a>
          <a href="../../pages/admin/program-applications.html" class="nav-btn-inactive min-h-[40px] h-[40px] px-3.5 rounded-2xl flex items-center gap-[12px] text-[13px] font-semibold transition-all"><svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 10 5-10 5L2 7l10-5ZM2 12l10 5 10-5M2 17l10 5 10-5"/></svg><span>Program Applications</span></a>
          <a href="../../pages/admin/department-applications.html" class="nav-btn-inactive min-h-[40px] h-[40px] px-3.5 rounded-2xl flex items-center gap-[12px] text-[13px] font-semibold transition-all"><svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg><span>Dept. Applications</span></a>
          <a href="../../pages/admin/students.html" class="nav-btn-inactive min-h-[40px] h-[40px] px-3.5 rounded-2xl flex items-center gap-[12px] text-[13px] font-semibold transition-all"><svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg><span>Students</span></a>
          <a href="../../pages/admin/departments.html" class="nav-btn-inactive min-h-[40px] h-[40px] px-3.5 rounded-2xl flex items-center gap-[12px] text-[13px] font-semibold transition-all"><svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M3 10h18M12 2 3 10h18L12 2ZM7 21V10M12 21V10M17 21V10"/></svg><span>Departments</span></a>
          <a href="../../pages/admin/programs.html" class="nav-btn-inactive min-h-[40px] h-[40px] px-3.5 rounded-2xl flex items-center gap-[12px] text-[13px] font-semibold transition-all"><svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></svg><span>Programs</span></a>
          <a href="../../pages/admin/faculty.html" class="nav-btn-inactive min-h-[40px] h-[40px] px-3.5 rounded-2xl flex items-center gap-[12px] text-[13px] font-semibold transition-all"><svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg><span>Faculty</span></a>
          <a href="../../pages/admin/audit-log.html" class="nav-btn-inactive min-h-[40px] h-[40px] px-3.5 rounded-2xl flex items-center gap-[12px] text-[13px] font-semibold transition-all"><svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><span>Audit Log</span></a>
        </nav>
      </div>
      <div class="sidebar-footer">
        <div class="sidebar-divider"></div>
        <div class="sidebar-account-card">
          <div style="display:flex;align-items:center;gap:10px;"><div class="sidebar-avatar"><span>A</span></div><div class="sidebar-account-details"><span class="sidebar-account-name">Admin User</span><span class="sidebar-account-role">System Admin</span></div></div>
          <button type="button" class="sidebar-logout-btn" aria-label="Log out" title="Log out"><svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M10 17l5-5-5-5M15 12H3M15 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"/></svg></button>
        </div>
      </div>
    </aside>`;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebar);
  } else {
    initSidebar();
  }
})();

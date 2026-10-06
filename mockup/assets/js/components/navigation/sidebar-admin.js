/* Extracted from components/navigation/sidebar-admin.html */
// Set active class on a nav link
function setActiveNav(element) {
    document.querySelectorAll('#sidebar-nav a').forEach(function(nav) {
        nav.classList.remove('nav-btn-active');
        nav.classList.add('nav-btn-inactive');
        nav.removeAttribute('aria-current');
    });

    element.classList.remove('nav-btn-inactive');
    element.classList.add('nav-btn-active');
    element.setAttribute('aria-current', 'page');
}

// Auto-detect current active page from query string or parent URL
(function() {
    var params = new URLSearchParams(window.location.search || '');
    var activeKey = (params.get('active') || '').toLowerCase();

    try {
        var currentPath = (window.parent.location.pathname || window.location.pathname).toLowerCase();
    } catch (e) {
        var currentPath = window.location.pathname.toLowerCase();
    }
    var currentPage = (currentPath.split('/').pop() || '').replace('.html', '');

    var links = document.querySelectorAll('#sidebar-nav a');
    var matched = false;

    links.forEach(function(link) {
        var key = (link.dataset.navKey || '').toLowerCase();
        var href = (link.getAttribute('href') || '').toLowerCase();
        var linkPage = (href.split('/').pop() || '').replace('.html', '');

        if ((activeKey && key === activeKey) || (currentPage && (key === currentPage || linkPage === currentPage))) {
            setActiveNav(link);
            matched = true;
        }
    });

    if (!matched && links.length > 0) {
        setActiveNav(links[0]);
    }

    document.body.classList.add('sidebar-ready');

    links.forEach(function(link) {
        link.addEventListener('click', function(event) {
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
                return;
            }

            event.preventDefault();
            setActiveNav(link);
            window.setTimeout(function() {
                if (window.parent && window.parent !== window) {
                    window.parent.location.href = link.href;
                } else {
                    window.location.href = link.href;
                }
            }, 150);
        });
    });
})();

// Custom Logout Dialog logic
function handleLogout(event) {
    event.preventDefault();
    try {
        var parentDoc = window.parent.document;
        var dialog = parentDoc.getElementById('admin-logout-dialog');

        if (!dialog) {
            dialog = parentDoc.createElement('dialog');
            dialog.id = 'admin-logout-dialog';
            dialog.style.cssText = 'width: min(420px, calc(100% - 32px)); margin: auto; padding: 26px; border: 1px solid #D97251; border-radius: 15px; background: #141413; color: #FFF; font-family: var(--font-sans, \'Outfit\'), sans-serif;';

            var style = parentDoc.getElementById('admin-logout-style');
            if (!style) {
                style = parentDoc.createElement('style');
                style.id = 'admin-logout-style';
                style.textContent = 'dialog#admin-logout-dialog::backdrop { background: rgba(0, 0, 0, 0.6); }';
                parentDoc.head.appendChild(style);
            }

            var form = parentDoc.createElement('form');
            form.method = 'dialog';

            var h2 = parentDoc.createElement('h2');
            h2.textContent = 'Log out?';
            h2.style.cssText = 'margin: 0 0 8px; font-size: 20px; font-weight: bold;';

            var p = parentDoc.createElement('p');
            p.textContent = 'Are you sure you want to end your admin session?';
            p.style.cssText = 'margin: 0 0 22px; color: #9C948B; font-size: 14px; line-height: 1.5;';

            var actions = parentDoc.createElement('div');
            actions.style.cssText = 'display: flex; justify-content: flex-end; gap: 12px;';

            var btnCancel = parentDoc.createElement('button');
            btnCancel.type = 'submit';
            btnCancel.value = 'cancel';
            btnCancel.textContent = 'Cancel';
            btnCancel.style.cssText = 'padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; background: transparent; color: #FFF; border: 1px solid #6C655D; transition: background 0.2s;';
            btnCancel.onmouseover = function() { btnCancel.style.background = 'rgba(255,255,255,0.1)'; };
            btnCancel.onmouseout = function() { btnCancel.style.background = 'transparent'; };

            var btnConfirm = parentDoc.createElement('button');
            btnConfirm.type = 'submit';
            btnConfirm.value = 'confirm';
            btnConfirm.textContent = 'Log out';
            btnConfirm.style.cssText = 'padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; background: #D97251; color: #FFF; border: none; transition: filter 0.2s;';
            btnConfirm.onmouseover = function() { btnConfirm.style.filter = 'brightness(1.1)'; };
            btnConfirm.onmouseout = function() { btnConfirm.style.filter = 'none'; };

            actions.appendChild(btnCancel);
            actions.appendChild(btnConfirm);

            form.appendChild(h2);
            form.appendChild(p);
            form.appendChild(actions);
            dialog.appendChild(form);

            dialog.addEventListener('close', function() {
                if (dialog.returnValue === 'confirm') {
                    window.parent.location.href = '../../pages/auth/signin.html';
                }
            });

            parentDoc.body.appendChild(dialog);
        }

        dialog.showModal();
    } catch (e) {
        if (confirm('Are you sure you want to end your admin session?')) {
            window.parent.location.href = '../../pages/auth/signin.html';
        }
    }
}

// Event bindings (formerly inline onclick attributes)
document.querySelectorAll('[data-nav-key]').forEach((link) => link.addEventListener('click', () => setActiveNav(link)));
document.querySelectorAll('[data-action="logout"]').forEach((btn) => btn.addEventListener('click', handleLogout));

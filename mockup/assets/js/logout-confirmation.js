(() => {
  const assetUrl = new URL(document.currentScript.src);
  const host = window;
  const requestMessage = 'spmis:logout:request';
  const focusMessage = 'spmis:logout:focus';

  function init() {
    if (window.parent !== window) {
      bindSidebarBridge();
      return;
    }
    const controller = host.spmisLogout || (host.spmisLogout = createController());
    controller.bind(document);
  }

  function bindSidebarBridge() {
    if (window.spmisLogoutBridge) return;
    window.spmisLogoutBridge = true;
    document.addEventListener('click', (event) => {
      const button = event.target.closest('.ui-sidebar-logout, .sidebar-logout-btn, .logout-btn');
      if (!button) return;
      event.preventDefault();
      // file:// sidebars can have opaque origins, so authenticate by window source.
      window.parent.postMessage({ type: requestMessage }, '*');
    });
    window.addEventListener('message', (event) => {
      if (event.source !== window.parent || event.data?.type !== focusMessage) return;
      document.querySelector('.ui-sidebar-logout, .sidebar-logout-btn, .logout-btn')?.focus();
    });
  }

  function createController() {
    const doc = host.document;
    const boundDocuments = new WeakSet();
    const role = /\/admin\/|\/sidebar-admin\.html$/.test(host.location.pathname) ? 'admin' : 'faculty';
    const stylesheet = doc.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = new URL('../css/logout-confirmation.css', assetUrl).href;
    doc.head.appendChild(stylesheet);

    const dialog = doc.createElement('dialog');
    dialog.className = 'ui-logout-dialog';
    dialog.setAttribute('aria-labelledby', 'ui-logout-title');
    dialog.setAttribute('aria-describedby', 'ui-logout-description');
    dialog.innerHTML = `
      <form method="dialog">
        <h2 id="ui-logout-title" class="ui-logout-title">Log out?</h2>
        <p id="ui-logout-description" class="ui-logout-description">Are you sure you want to end your ${role} session? You will return to the sign-in page.</p>
        <div class="ui-logout-actions">
          <button type="submit" value="cancel" class="ui-btn ui-btn-outline" autofocus>Cancel</button>
          <button type="submit" value="confirm" class="ui-btn ui-btn-primary">Log out</button>
        </div>
      </form>`;
    doc.body.appendChild(dialog);
    let restoreFocus = null;
    let signingOut = false;

    function removeLogoutRoute() {
      const url = new URL(host.location.href);
      if (!url.searchParams.has('logout')) return;
      url.searchParams.delete('logout');
      host.history.replaceState(host.history.state, '', url);
    }

    function anotherModalIsOpen() {
      return [...doc.querySelectorAll('dialog[open], [role="dialog"], .modal-overlay')]
        .some((element) => {
          if (element === dialog) return false;
          const style = host.getComputedStyle(element);
          return element.getClientRects().length > 0 && style.display !== 'none' &&
            style.visibility !== 'hidden' && style.opacity !== '0';
        });
    }

    function syncRoute() {
      if (signingOut) return;
      const requested = new URL(host.location.href).searchParams.get('logout') === 'true';
      if (!requested) {
        if (dialog.open) dialog.close('cancel');
        return;
      }
      if (dialog.open) return;
      if (anotherModalIsOpen()) {
        removeLogoutRoute();
        return;
      }
      dialog.returnValue = '';
      dialog.showModal();
    }

    // Mockup pages auto-wire every form; logout must bypass those handlers.
    dialog.addEventListener('submit', (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      dialog.close(event.submitter?.value === 'confirm' ? 'confirm' : 'cancel');
    }, true);
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      dialog.close('cancel');
    });
    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right ||
          event.clientY < rect.top || event.clientY > rect.bottom) dialog.close('cancel');
    });
    dialog.addEventListener('close', () => {
      // Ignore an older close event if browser history has reopened the modal.
      if (dialog.open || signingOut) return;
      removeLogoutRoute();
      if (dialog.returnValue !== 'confirm') {
        restoreFocus?.();
        return;
      }
      signingOut = true;
      if (role === 'faculty') {
        try {
          host.sessionStorage.removeItem('faculty-demo-v1');
          host.sessionStorage.removeItem('faculty-sidebar-collapsed');
        } catch {}
      }
      const redirect = () => {
        host.parent.location.href = new URL('../../pages/auth/signin.html', assetUrl).href;
      };
      if (typeof host.showSuccessToast === 'function') {
        host.showSuccessToast('Logged out successfully');
        host.setTimeout(redirect, 700);
      } else {
        redirect();
      }
    });
    host.addEventListener('popstate', syncRoute);
    host.addEventListener('message', (event) => {
      if (event.data?.type !== requestMessage) return;
      const frame = [...doc.querySelectorAll('iframe.sidebar-frame, iframe#sidebar-frame')]
        .find((element) => element.contentWindow === event.source);
      if (!frame) return;
      requestLogout(() => {
        frame.focus();
        frame.contentWindow.postMessage({ type: focusMessage }, '*');
      });
    });

    function requestLogout(onDismiss) {
      if (dialog.open || signingOut || anotherModalIsOpen()) return;
      restoreFocus = onDismiss;
      const url = new URL(host.location.href);
      url.searchParams.set('logout', 'true');
      host.history.pushState(host.history.state, '', url);
      syncRoute();
    }

    function bind(root) {
      if (boundDocuments.has(root)) return;
      boundDocuments.add(root);
      root.addEventListener('click', (event) => {
        const button = event.target.closest('.ui-sidebar-logout, .sidebar-logout-btn, .logout-btn');
        if (!button) return;
        event.preventDefault();
        requestLogout(() => button.focus());
      });
    }

    syncRoute();
    return { bind };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();

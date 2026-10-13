/* Shared initial card loading for the static mockup routes. */
(() => {
  if (window.spmisCardLoadingInitialized) return;
  window.spmisCardLoadingInitialized = true;

  const selector = '.ui-card, .ui-card-interactive, [data-card-loading]';
  const excluded = 'dialog, [role="dialog"], .modal-overlay, .modal-container, .sidebar, nav, [hidden]';

  function skeleton(modifier = '') {
    const bar = document.createElement('span');
    bar.className = `ui-skeleton${modifier ? ` ui-skeleton--${modifier}` : ''}`;
    return bar;
  }

  function placeholder(card) {
    const overlay = document.createElement('div');
    overlay.className = 'ui-loading-placeholder';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.appendChild(skeleton('title'));

    const lines = document.createElement('div');
    lines.className = 'ui-loading-lines';
    if (card.dataset.cardLoading === 'metric' || card.matches('.stat, .metric-card, .ui-dashboard-metric')) {
      lines.appendChild(skeleton('metric'));
      lines.appendChild(skeleton('short'));
    } else {
      lines.appendChild(skeleton());
      lines.appendChild(skeleton('short'));
      // Match the greater density of editable form cards.
      if (card.matches('form') || card.querySelector('form')) {
        lines.appendChild(skeleton());
        lines.appendChild(skeleton('short'));
      }
    }
    overlay.appendChild(lines);
    return overlay;
  }

  function initialize() {
    const candidates = Array.from(document.querySelectorAll(selector)).filter(card =>
      !card.closest(excluded) && !card.matches('.ui-card--loading, .ui-loading-active') &&
      card.getClientRects().length && !card.contains(document.activeElement)
    );
    // An outer card already covers its nested link cards during loading.
    const cards = candidates.filter(card => !candidates.some(parent => parent !== card && parent.contains(card)));
    if (!cards.length) return;

    const status = document.createElement('span');
    status.className = 'ui-loading-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.setAttribute('aria-atomic', 'true');
    document.body.appendChild(status);

    const states = cards.map(card => {
      const overlay = placeholder(card);
      const state = { card, overlay, busy: card.getAttribute('aria-busy'), inert: card.inert };
      card.appendChild(overlay);
      card.classList.add('ui-loading-active');
      card.setAttribute('aria-busy', 'true');
      card.inert = true;
      return state;
    });
    status.textContent = 'Loading card details…';

    window.setTimeout(() => {
      states.forEach(({ card, overlay, busy, inert }) => {
        card.classList.remove('ui-loading-active');
        if (busy === null) card.removeAttribute('aria-busy');
        else card.setAttribute('aria-busy', busy);
        card.inert = inert;
        overlay.remove();
      });
      status.textContent = 'Card details loaded.';
    }, 280);
  }

  // Run after the existing page listeners have populated mock data and reviews.
  if (document.readyState !== 'complete') {
    document.addEventListener('DOMContentLoaded', () => queueMicrotask(initialize), { once: true });
  } else {
    queueMicrotask(initialize);
  }
})();

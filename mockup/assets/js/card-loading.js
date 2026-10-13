/* Shared initial card and text loading for the static mockup routes. */
(() => {
  if (window.spmisCardLoadingInitialized) return;
  window.spmisCardLoadingInitialized = true;

  const selector = '.ui-card, .ui-card-interactive, [data-card-loading]';
  const excluded = 'dialog, [role="dialog"], .modal-overlay, .modal-container, .sidebar, nav, [hidden]';
  const textSelector = 'h1, h2, h3, h4, h5, h6, p, small, .ui-text, .ui-text-muted, .ui-text-caption, .ui-text-mono, .muted, .breadcrumb-text, .ay-text, [data-text-loading]';
  const textExcluded = `${excluded}, .ui-modal, .modal-card, .modal-backdrop, .ui-loading-active, .ui-card--loading, .ui-text--loading, .ui-loading-placeholder, .ui-text-loading-placeholder, .ui-loading-status, [role="status"], [role="alert"], [aria-live], [aria-hidden="true"], [inert], footer, form, table, .ui-table-wrap, .table-wrap, .table-container, .table-body`;
  const controls = 'a, button, input, select, textarea, label, summary, [contenteditable], [role="button"]';

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
    const textCandidates = Array.from(document.querySelectorAll(textSelector)).filter(text =>
      !text.closest(textExcluded) && !text.closest(controls) && !text.querySelector(controls) &&
      text.getClientRects().length && text.textContent.trim() && !text.contains(document.activeElement) &&
      !cards.some(card => card.contains(text))
    );
    const texts = textCandidates.filter(text => !textCandidates.some(parent => parent !== text && parent.contains(text)));
    if (!cards.length && !texts.length) return;

    const status = document.createElement('span');
    status.className = 'ui-loading-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.setAttribute('aria-atomic', 'true');
    document.body.appendChild(status);

    // Retain the actual text nodes, including inline code and their event bindings.
    const textStates = texts.map(text => {
      const style = window.getComputedStyle(text);
      const lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.4;
      const lineCount = Math.max(1, Math.round(text.getBoundingClientRect().height / lineHeight));
      const overlay = document.createElement('span');
      overlay.className = 'ui-text-loading-placeholder';
      overlay.setAttribute('aria-hidden', 'true');
      for (let line = 0; line < lineCount; line++) {
        const bar = skeleton();
        bar.classList.add('ui-skeleton--text-line');
        overlay.appendChild(bar);
      }
      const content = document.createElement('span');
      content.className = 'ui-text-loading-content';
      Array.from(text.childNodes).forEach(node => content.appendChild(node));
      const state = { text, content, overlay, busy: text.getAttribute('aria-busy') };
      text.appendChild(content);
      text.appendChild(overlay);
      text.classList.add('ui-text--loading');
      text.setAttribute('aria-busy', 'true');
      return state;
    });

    const states = cards.map(card => {
      const overlay = placeholder(card);
      const state = { card, overlay, busy: card.getAttribute('aria-busy'), inert: card.inert };
      card.appendChild(overlay);
      card.classList.add('ui-loading-active');
      card.setAttribute('aria-busy', 'true');
      card.inert = true;
      return state;
    });
    status.textContent = texts.length ? 'Loading page details…' : 'Loading card details…';

    window.setTimeout(() => {
      states.forEach(({ card, overlay, busy, inert }) => {
        card.classList.remove('ui-loading-active');
        if (busy === null) card.removeAttribute('aria-busy');
        else card.setAttribute('aria-busy', busy);
        card.inert = inert;
        overlay.remove();
      });
      textStates.forEach(({ text, content, overlay, busy }) => {
        text.classList.remove('ui-text--loading');
        if (busy === null) text.removeAttribute('aria-busy');
        else text.setAttribute('aria-busy', busy);
        // If a page updated the text while loading, keep its newer content.
        if (content.parentNode === text) {
          while (content.firstChild) text.insertBefore(content.firstChild, content);
          content.remove();
        }
        overlay.remove();
      });
      status.textContent = texts.length ? 'Page details loaded.' : 'Card details loaded.';
    }, 280);
  }

  // Run after the existing page listeners have populated mock data and reviews.
  if (document.readyState !== 'complete') {
    document.addEventListener('DOMContentLoaded', () => queueMicrotask(initialize), { once: true });
  } else {
    queueMicrotask(initialize);
  }
})();

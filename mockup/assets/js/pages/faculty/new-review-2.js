/* Extracted from pages/faculty/new-review.html */
function showSuccessToast(message) {
    const toast = document.getElementById('global-success-toast');
    const msgEl = document.getElementById('toast-message');
    if(toast && msgEl) {
        msgEl.textContent = message || 'Action successful!';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
}
document.addEventListener('DOMContentLoaded', () => {
    if (window.spmisNavigationCache && window.spmisNavigationCache.isCached()) {
        document.querySelectorAll('.skeleton-row, .skeleton, .ui-loading-placeholder, .ui-text-loading-placeholder').forEach(el => el.remove());
        document.querySelectorAll('.ui-loading-active, .ui-card--loading').forEach(el => {
            el.classList.remove('ui-loading-active', 'ui-card--loading');
            el.removeAttribute('aria-busy');
            el.inert = false;
        });
    }

    document.querySelectorAll('form').forEach(f => {
        if (f.id === 'review-form') return;
        f.addEventListener('submit', (e) => { e.preventDefault(); showSuccessToast('Successfully submitted!'); });
    });
});

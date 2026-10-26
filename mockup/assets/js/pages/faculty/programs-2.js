/* Extracted from pages/faculty/programs.html */
function showSuccessToast(message) {
    const toast = document.getElementById('global-success-toast');
    const msgEl = document.getElementById('toast-message');
    if(toast && msgEl) {
        msgEl.textContent = message || 'Action successful!';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
}

// Auto-wire action buttons for the mockup
document.addEventListener('DOMContentLoaded', () => {
    if (window.spmisNavigationCache && window.spmisNavigationCache.isCached()) {
        document.querySelectorAll('.skeleton-row, .skeleton, .ui-loading-placeholder, .ui-text-loading-placeholder').forEach(el => el.remove());
        document.querySelectorAll('.ui-loading-active, .ui-card--loading').forEach(el => {
            el.classList.remove('ui-loading-active', 'ui-card--loading');
            el.removeAttribute('aria-busy');
            el.inert = false;
        });
    }

    // For admin tables or action buttons (excluding modal openers)
    document.querySelectorAll('button').forEach(b => {
        if(b.textContent.toLowerCase().includes('approve')) {
            b.addEventListener('click', (e) => {
                if(b.type !== 'submit') {
                    showSuccessToast('Action completed successfully!');
                }
            });
        }
    });
});


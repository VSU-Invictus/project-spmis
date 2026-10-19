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


/* Extracted from pages/faculty/profile.html */
function showSuccessToast(message) {
    const toast = document.getElementById('global-success-toast');
    const msgEl = document.getElementById('toast-message');
    if(toast && msgEl) {
        msgEl.textContent = message || 'Action successful!';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
}

// Auto-wire forms and add buttons for the mockup
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('form').forEach(f => {
        f.addEventListener('submit', (e) => {
            e.preventDefault();
            showSuccessToast('Successfully submitted!');
        });
    });
    
    // For admin tables or faculty modals
    document.querySelectorAll('button').forEach(b => {
        if(b.textContent.toLowerCase().includes('approve') || b.textContent.toLowerCase().includes('submit') || b.textContent.toLowerCase().includes('propose')) {
            b.addEventListener('click', (e) => {
                if(b.type !== 'submit') {
                    showSuccessToast('Action completed successfully!');
                }
            });
        }
    });
});

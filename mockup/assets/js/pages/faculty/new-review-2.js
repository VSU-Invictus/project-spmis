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
    document.querySelectorAll('form').forEach(f => {
        if (f.id === 'review-form') return;
        f.addEventListener('submit', (e) => { e.preventDefault(); showSuccessToast('Successfully submitted!'); });
    });
});

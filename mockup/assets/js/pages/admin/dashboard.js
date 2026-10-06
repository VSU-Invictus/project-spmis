/* Extracted from pages/admin/dashboard.html */
function toggleMobileMenu() {
    const menu = document.getElementById('sidebar-menu');
    menu.classList.toggle('hidden');
}

function handleReview(name) {
    const toast = document.getElementById('toast-modal');
    const toastMsg = document.getElementById('toast-message');
    
    toastMsg.textContent = `Opening review panel for: ${name}`;
    
    toast.classList.remove('translate-y-20', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
    
    setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}

// Initial skeleton loading for dashboard approval queue table
(() => {
    const queueBody = document.querySelector('.ui-table tbody');
    if (queueBody) {
        const rows = Array.from(queueBody.querySelectorAll('tr'));
        rows.forEach(r => r.style.display = 'none');
        const skel = document.createElement('tr');
        skel.className = 'skeleton-row';
        skel.innerHTML = '<td colspan="5"><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div></td>';
        queueBody.appendChild(skel);
        setTimeout(() => {
            skel.remove();
            rows.forEach(r => r.style.display = '');
        }, 250);
    }
})();

// Event bindings (formerly inline onclick attributes)
document.querySelectorAll('[data-review]').forEach((btn) => btn.addEventListener('click', () => handleReview(btn.dataset.review)));

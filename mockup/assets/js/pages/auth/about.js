/* Extracted from pages/auth/about.html */
(async () => {
    // 1. Load the footer component
    const slot = document.querySelector('[data-include]');
    if (slot) {
        try {
            const res = await fetch(slot.getAttribute('data-include'), { cache: 'no-cache' });
            if (res.ok) {
                slot.innerHTML = await res.text();
            } else {
                console.error('Failed to load footer:', res.status, res.statusText);
            }
        } catch (err) {
            console.error('Footer include error:', err);
        }
    }

    // 2. Determine the current page and apply the 'active' class
    let currentPage = decodeURIComponent(window.location.pathname.split('/').pop()).toLowerCase().trim() || 'about.html';
    
    document.querySelectorAll('.footer-nav a').forEach(a => {
        let href = decodeURIComponent(a.getAttribute('href')).toLowerCase().trim().split('/').pop();
        if (href === currentPage) {
            a.classList.add('active');
        }
    });

    // 3. Page Exit Transition (Matches the Sign In page logic)
    document.querySelectorAll('a[href]:not([href^="#"]):not([target="_blank"])').forEach(link => {
        link.addEventListener('click', event => {
            const href = link.getAttribute('href');
            if (!href || href.startsWith('javascript:') || link.classList.contains('active')) return;
            
            event.preventDefault();
            document.body.classList.add('page-exit');
            
            setTimeout(() => { 
                window.location.href = href; 
            }, 300);
        });
    });
})();

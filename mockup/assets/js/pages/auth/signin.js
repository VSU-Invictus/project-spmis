/* Extracted from pages/auth/signin.html */
// ==========================================================
// PASSWORD VISIBILITY TOGGLE (added to signin)
// ==========================================================
document.querySelectorAll('.ui-pwd-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
        const input = document.getElementById(btn.dataset.pwdToggle);
        if (!input) return;
        const show = input.type === 'password';
        input.type = show ? 'text' : 'password';
        btn.classList.toggle('is-visible', show);
        btn.setAttribute('aria-pressed', String(show));
        btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
        // Keep the cursor at the end of the value
        const len = input.value.length;
        try { input.setSelectionRange(len, len); } catch (_) {}
    });
});

const overlay = document.getElementById('google-overlay');
const googleSteps = [...document.querySelectorAll('[data-google-step]')];
const googleEmailForm = document.getElementById('google-email-form');
const googlePasswordForm = document.getElementById('google-password-form');

document.querySelectorAll('.google-input').forEach(input => {
    const field = input.closest('.google-field');
    const syncFilledState = () => field?.classList.toggle('is-filled', Boolean(input.value));
    input.addEventListener('input', syncFilledState, { passive: true });
    syncFilledState();
});

function showGoogleStep(step) {
    googleSteps.forEach(current => current.classList.toggle('active', current.dataset.googleStep === step));
}

function closeGooglePopup() {
    overlay.classList.add('hidden');
    showGoogleStep('accounts');
    googleEmailForm.reset();
    googlePasswordForm.reset();
    document.getElementById('google-email-error').textContent = '';
    document.getElementById('google-password-error').textContent = '';
}

document.getElementById('trigger-google-btn')?.addEventListener('click', () => {
    showGoogleStep('accounts');
    overlay.classList.remove('hidden');
});
document.getElementById('close-google').addEventListener('click', closeGooglePopup);
overlay.addEventListener('click', event => { if (event.target === overlay) closeGooglePopup(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeGooglePopup(); });
document.querySelectorAll('.mock-login-action').forEach(button => button.addEventListener('click', () => {
    window.location.href = button.dataset.role === 'admin' ? '../admin/dashboard.html' : '../faculty/dashboard.html';
}));
document.getElementById('use-another-account').addEventListener('click', () => showGoogleStep('email'));
document.querySelectorAll('[data-google-back]').forEach(button => button.addEventListener('click', () => showGoogleStep('accounts')));

googleEmailForm.addEventListener('submit', event => {
    event.preventDefault();
    const email = document.getElementById('google-email');
    const error = document.getElementById('google-email-error');
    if (!email.value.trim() || !email.validity.valid) {
        error.textContent = 'Enter a valid email address.';
        email.focus();
        return;
    }
    document.getElementById('google-email-display').textContent = email.value.trim();
    showGoogleStep('password');
    document.getElementById('google-password').focus();
});

googlePasswordForm.addEventListener('submit', event => {
    event.preventDefault();
    const password = document.getElementById('google-password');
    const error = document.getElementById('google-password-error');
    if (!password.value.trim()) {
        error.textContent = 'Enter your password.';
        password.focus();
        return;
    }
    window.location.href = '../faculty/dashboard.html';
});

const signinForm = document.getElementById('signin-form');

function clearPopup(field) {
    field.classList.remove('is-shaking');
    const input = field.querySelector('.ui-input');
    const popup = field.querySelector('.ui-field-popup');
    input?.classList.remove('is-invalid');
    input?.removeAttribute('aria-invalid');
    popup?.classList.remove('is-visible');
}

function showPopup(field, message) {
    const input = field.querySelector('.ui-input');
    const popup = field.querySelector('.ui-field-popup');
    const text  = popup?.querySelector('.ui-field-popup-text');
    if (message && text) text.textContent = message;
    input?.classList.add('is-invalid');
    input?.setAttribute('aria-invalid', 'true');
    popup?.classList.add('is-visible');

    field.classList.remove('is-shaking');
    void field.offsetWidth;
    field.classList.add('is-shaking');
}

function validateField(field) {
    const input = field.querySelector('.ui-input');
    if (!input) return true;

    if (!input.value.trim()) {
        showPopup(field, 'Please fill in this field.');
        return false;
    }

    if (input.type === 'email') {
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
        if (!ok) {
            showPopup(field, 'Please enter a valid email address.');
            return false;
        }
    }

    clearPopup(field);
    return true;
}

document.querySelectorAll('.ui-auth-field .ui-input').forEach(input => {
    input.addEventListener('input', () => {
        const field = input.closest('.ui-auth-field');
        if (field && input.value.trim()) clearPopup(field);
    });
});

signinForm.addEventListener('submit', event => {
    event.preventDefault();

    const fields = [...signinForm.querySelectorAll('.ui-auth-field')];
    let firstInvalid = null;

    fields.forEach(field => {
        const ok = validateField(field);
        if (!ok && !firstInvalid) firstInvalid = field;
    });

    if (firstInvalid) {
        firstInvalid.querySelector('.ui-input')?.focus();
        return;
    }

    window.location.href = '../faculty/dashboard.html';
});

// ==========================================================
// MODULAR FOOTER LOADING & PAGE TRANSITIONS
// ==========================================================
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

    // 3. Page Exit Transition
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

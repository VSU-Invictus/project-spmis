/* Extracted from pages/auth/signup.html */
// ==========================================================
// PASSWORD VISIBILITY TOGGLE
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

// ==========================================================
// GOOGLE OVERLAY LOGIC
// 4 steps: accounts → email → password → terms
// ==========================================================
const overlay = document.getElementById('google-overlay');
const googleModal = document.getElementById('google-modal');
const googleSteps = [...document.querySelectorAll('[data-google-step]')];
const googleEmailForm = document.getElementById('google-email-form');
const googlePasswordForm = document.getElementById('google-password-form');
const termsCheckbox = document.getElementById('terms-step-checkbox');
const termsContinueBtn = document.getElementById('terms-step-continue');
const termsScroll = document.querySelector('.terms-step-scroll');
const termsScrollHint = document.getElementById('terms-scroll-hint');
let termsScrolledToBottom = false;

function checkTermsScroll() {
    if (termsScrolledToBottom || !termsScroll) return;
    const atBottom = (termsScroll.scrollTop + termsScroll.clientHeight >= termsScroll.scrollHeight - 16) ||
                     (termsScroll.scrollHeight <= termsScroll.clientHeight + 16);
    if (atBottom) {
        termsScrolledToBottom = true;
        termsCheckbox.disabled = false;
        if (termsScrollHint) {
            termsScrollHint.textContent = '(You may now check the box to agree)';
            termsScrollHint.style.color = '#34a853';
        }
    }
}

if (termsScroll) {
    termsScroll.addEventListener('scroll', checkTermsScroll, { passive: true });
}

let selectedRole = 'faculty';

// Floating label sync
document.querySelectorAll('.google-input').forEach(input => {
    const field = input.closest('.google-field');
    const syncFilledState = () => field?.classList.toggle('is-filled', Boolean(input.value));
    input.addEventListener('input', syncFilledState, { passive: true });
    syncFilledState();
});

function showGoogleStep(step) {
    googleSteps.forEach(current => current.classList.toggle('active', current.dataset.googleStep === step));
    // Hide the Google header on the terms step — terms is generic
    googleModal.classList.toggle('terms-active', step === 'terms');
    if (step === 'terms') {
        setTimeout(checkTermsScroll, 60);
    }
}

function resetGoogleFlow() {
    showGoogleStep('accounts');
    googleEmailForm.reset();
    googlePasswordForm.reset();
    termsCheckbox.checked = false;
    termsCheckbox.disabled = true;
    termsScrolledToBottom = false;
    termsContinueBtn.disabled = true;
    if (termsScroll) termsScroll.scrollTop = 0;
    if (termsScrollHint) {
        termsScrollHint.textContent = '(Please scroll to the bottom of the terms to agree)';
        termsScrollHint.style.color = '#9aa0a6';
    }
    document.getElementById('google-email-error').textContent = '';
    document.getElementById('google-password-error').textContent = '';
    document.querySelectorAll('.google-field').forEach(f => f.classList.remove('is-filled'));
}

function closeGooglePopup() {
    overlay.classList.add('hidden');
    resetGoogleFlow();
}

document.getElementById('trigger-google-btn')?.addEventListener('click', () => {
    resetGoogleFlow();
    overlay.classList.remove('hidden');
});

document.getElementById('close-google').addEventListener('click', closeGooglePopup);
// Intentionally no overlay click-to-close — only the × and Esc.

// Saved account buttons → this is a SIGN-UP flow, so we go straight to terms.
// (Never redirects to a dashboard.)
document.querySelectorAll('.mock-signup-action').forEach(button => button.addEventListener('click', () => {
    selectedRole = button.dataset.role || 'faculty';
    showGoogleStep('terms');
}));

// "Use another account" → email step
document.getElementById('use-another-account').addEventListener('click', () => showGoogleStep('email'));

// Back buttons → accounts step
document.querySelectorAll('[data-google-back]').forEach(button => button.addEventListener('click', () => {
    showGoogleStep('accounts');
}));

// Email → password
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

// Password → terms
googlePasswordForm.addEventListener('submit', event => {
    event.preventDefault();
    const password = document.getElementById('google-password');
    const error = document.getElementById('google-password-error');
    if (!password.value.trim()) {
        error.textContent = 'Enter your password.';
        password.focus();
        return;
    }
    selectedRole = 'faculty';
    showGoogleStep('terms');
});

// Terms checkbox
termsCheckbox.addEventListener('change', () => {
    termsContinueBtn.disabled = !termsCheckbox.checked;
});

// Terms accept → pending verification (never a dashboard)
termsContinueBtn.addEventListener('click', () => {
    window.location.href = 'pending-verification.html';
});

// ESC closes overlay
document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeGooglePopup();
});

// ==========================================================
// EMAIL SIGNUP FORM VALIDATION
// ==========================================================
const signupForm = document.getElementById('signup-form');

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

signupForm.addEventListener('submit', event => {
    event.preventDefault();

    const fields = [...signupForm.querySelectorAll('.ui-auth-field')];
    let firstInvalid = null;

    fields.forEach(field => {
        const ok = validateField(field);
        if (!ok && !firstInvalid) firstInvalid = field;
    });

    if (firstInvalid) {
        firstInvalid.querySelector('.ui-input')?.focus();
        return;
    }

    if (document.getElementById('auth-pwd').value !== document.getElementById('auth-confirm-pwd').value) {
        const confirmField = document.querySelector('[data-field="confirm-password"]');
        showPopup(confirmField, 'Passwords do not match.');
        document.getElementById('auth-confirm-pwd').focus();
        return;
    }

    // Email signup → open Google overlay at terms step
    selectedRole = 'faculty';
    resetGoogleFlow();
    showGoogleStep('terms');
    overlay.classList.remove('hidden');
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

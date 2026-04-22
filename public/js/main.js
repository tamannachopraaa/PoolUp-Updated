document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    const notifMenu = document.querySelector('.notif-menu');
    const notifTrigger = document.querySelector('.notif-trigger');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', String(isOpen));
        });
    }

    if (notifMenu && notifTrigger) {
        notifTrigger.addEventListener('click', (event) => {
            event.preventDefault();
            const isOpen = notifMenu.classList.toggle('open');
            notifTrigger.setAttribute('aria-expanded', String(isOpen));
        });

        document.addEventListener('click', (event) => {
            if (!notifMenu.contains(event.target)) {
                notifMenu.classList.remove('open');
                notifTrigger.setAttribute('aria-expanded', 'false');
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                notifMenu.classList.remove('open');
                notifTrigger.setAttribute('aria-expanded', 'false');
            }
        });
    }

    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-links > li > a[href]').forEach((link) => {
        const href = link.getAttribute('href');
        if (!href || href === '#' || href === 'javascript:void(0)') return;
        if (href === '/' ? currentPath === '/' : currentPath.startsWith(href)) {
            link.classList.add('is-active');
        }
    });

    const stack = document.createElement('div');
    stack.className = 'toast-stack';
    document.body.appendChild(stack);

    function showToast(message) {
        if (!message) return;
        const item = document.createElement('div');
        item.className = 'toast-item';
        item.textContent = message;
        stack.appendChild(item);
        setTimeout(() => {
            item.remove();
        }, 2200);
    }

    const pendingToast = sessionStorage.getItem('pendingToast');
    if (pendingToast) {
        showToast(pendingToast);
        sessionStorage.removeItem('pendingToast');
    }

    const params = new URLSearchParams(window.location.search);
    const mailStatus = params.get('mail');
    const mailMessages = {
        offer_mail_sent: 'Offer created and admin email sent.',
        offer_mail_failed: 'Offer created, but admin email failed.',
        booking_mail_sent: 'Booking confirmed and email sent.',
        booking_mail_partial: 'Booking confirmed, but one email failed.',
        booking_mail_failed: 'Booking confirmed, but email sending failed.',
        booking_mail_skipped: 'Booking confirmed. No email recipient found.',
    };

    if (mailStatus && mailMessages[mailStatus]) {
        showToast(mailMessages[mailStatus]);
        params.delete('mail');
        const query = params.toString();
        const cleanUrl = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
        window.history.replaceState({}, document.title, cleanUrl);
    }

    document.querySelectorAll('form').forEach((form) => {
        form.addEventListener('submit', () => {
            const toastMessage = form.getAttribute('data-toast-message');
            if (toastMessage) {
                sessionStorage.setItem('pendingToast', toastMessage);
            }

            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton) {
                const loadingText = submitButton.getAttribute('data-loading-text');
                if (loadingText) submitButton.textContent = loadingText;
                submitButton.disabled = true;
            }
        });
    });
});
function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const overlay = document.getElementById('mobile-nav-overlay');
    if (!btn || !overlay) return;

    const openIcon = btn.querySelector('.menu-icon-open');
    const closeIcon = btn.querySelector('.menu-icon-close');

    function toggleMenu() {
        const isOpen = overlay.classList.contains('mobile-nav-open');
        if (isOpen) {
            overlay.classList.remove('mobile-nav-open');
            overlay.setAttribute('aria-hidden', 'true');
            btn.setAttribute('aria-expanded', 'false');
            openIcon?.classList.remove('hidden');
            closeIcon?.classList.add('hidden');
            document.body.style.overflow = '';
        } else {
            overlay.classList.add('mobile-nav-open');
            overlay.setAttribute('aria-hidden', 'false');
            btn.setAttribute('aria-expanded', 'true');
            openIcon?.classList.add('hidden');
            closeIcon?.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    btn.addEventListener('click', toggleMenu);

    // Close menu when a link is clicked
    overlay.querySelectorAll('.mobile-nav-link').forEach(link => {
        link.addEventListener('click', () => {
            overlay.classList.remove('mobile-nav-open');
            overlay.setAttribute('aria-hidden', 'true');
            btn.setAttribute('aria-expanded', 'false');
            openIcon?.classList.remove('hidden');
            closeIcon?.classList.add('hidden');
            document.body.style.overflow = '';
        });
    });
}

initMobileMenu();
document.addEventListener('astro:after-swap', initMobileMenu);

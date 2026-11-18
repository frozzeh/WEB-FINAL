document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.querySelector('.site-menu-toggle');
    const drawer = document.getElementById('site-drawer');
    const backdrop = document.querySelector('.site-drawer-backdrop');
    const closeButton = document.querySelector('.site-drawer-close');
    const themeButton = document.querySelector('.theme-toggle');
    const headerThemeButton = document.querySelector('.header-theme-toggle');
    if (!toggle || !drawer || !backdrop || !themeButton) return;
    const nav = drawer.querySelector('.site-drawer-nav');
    const source = document.querySelector('.nav-menu ul');
    if (source) nav.append(source.cloneNode(true));
    let previousFocus = null;
    function close() {
        drawer.classList.remove('is-open');
        backdrop.hidden = true;
        drawer.setAttribute('aria-hidden', 'true');
        drawer.inert = true;
        toggle.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('drawer-open');
        previousFocus?.focus();
    }
    function open() {
        previousFocus = document.activeElement;
        backdrop.hidden = false;
        drawer.inert = false;
        drawer.setAttribute('aria-hidden', 'false');
        drawer.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
        document.body.classList.add('drawer-open');
        closeButton.focus();
    }
    toggle.addEventListener('click', () => drawer.classList.contains('is-open') ? close() : open());
    closeButton.addEventListener('click', close);
    backdrop.addEventListener('click', close);
    drawer.querySelector('#subscribe-open-btn')?.addEventListener('click', close, true);
    document.addEventListener('keydown', event => {
        if (!drawer.classList.contains('is-open')) return;
        if (event.key === 'Escape') { close(); return; }
        if (event.key !== 'Tab') return;
        const items = [...drawer.querySelectorAll('a, button')];
        const first = items[0], last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    function syncTheme() {
        const dark = window.KFCTheme.get() === 'dark';
        themeButton.textContent = dark ? 'Light mode' : 'Dark mode';
        themeButton.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
        themeButton.setAttribute('aria-pressed', String(dark));
        if (headerThemeButton) {
            headerThemeButton.querySelector('span').textContent = dark ? '☀' : '☾';
            headerThemeButton.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
            headerThemeButton.setAttribute('aria-pressed', String(dark));
        }
    }
    const toggleTheme = () => window.KFCTheme.set(window.KFCTheme.get() === 'dark' ? 'light' : 'dark');
    themeButton.addEventListener('click', toggleTheme);
    headerThemeButton?.addEventListener('click', toggleTheme);
    document.addEventListener('kfcthemechange', syncTheme);
    window.addEventListener('storage', event => { if (event.key === 'kfc-theme') { document.documentElement.dataset.theme = event.newValue === 'dark' ? 'dark' : 'light'; syncTheme(); } });
    syncTheme();
});

(() => {
    const key = 'kfc-theme';
    let theme = 'light';
    try { theme = localStorage.getItem(key) === 'dark' ? 'dark' : 'light'; } catch (_) {}
    document.documentElement.dataset.theme = theme;
    window.KFCTheme = {
        get: () => document.documentElement.dataset.theme,
        set(value) {
            const next = value === 'dark' ? 'dark' : 'light';
            document.documentElement.dataset.theme = next;
            try { localStorage.setItem(key, next); } catch (_) {}
            document.dispatchEvent(new CustomEvent('kfcthemechange', { detail: next }));
        }
    };
})();

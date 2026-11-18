(() => {
    'use strict';
    const USERS = 'kfc-users-v1';
    const SESSION = 'kfc-session-v1';
    const emailValid = window.KFCValidation.email;
    const passwordValid = window.KFCValidation.password;
    const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
    const users = () => { const value = read(USERS, []); return Array.isArray(value) ? value : []; };
    const current = () => users().find(user => user.id === read(SESSION, null)) || null;
    const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));
    window.KFCAccount = { current };
    const showError = (id, message) => { const element = document.getElementById(id + '-error'); if (element) element.textContent = message; const input = document.getElementById(id); if (input) input.setAttribute('aria-invalid', String(Boolean(message))); };
    const clearErrors = form => form.querySelectorAll('.account-field input').forEach(input => showError(input.id, ''));
    async function hash(password, salt) {
        if (!crypto.subtle) throw Error('Secure browser storage is unavailable. Open the site from a secure web address.');
        const bytes = new TextEncoder().encode(salt + ':' + password);
        const digest = await crypto.subtle.digest('SHA-256', bytes);
        return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
    }
    function updateLinks() {
        const user = current();
        document.querySelectorAll('.header-account-link, .drawer-account-link').forEach(link => {
            link.href = user ? 'profile.html' : 'login.html';
            link.textContent = user ? 'Profile' : 'Log In';
        });
    }
    document.addEventListener('DOMContentLoaded', () => {
        updateLinks();
        window.addEventListener('storage', event => { if (event.key === USERS || event.key === SESSION) { updateLinks(); renderProfile(); } });
        const signup = document.getElementById('signup-form');
        signup?.addEventListener('submit', async event => {
            event.preventDefault(); clearErrors(signup);
            const status = document.getElementById('signup-status'); status.textContent = '';
            const name = document.getElementById('signup-name').value.trim();
            const email = document.getElementById('signup-email').value.trim().toLowerCase();
            const password = document.getElementById('signup-password').value;
            const confirm = document.getElementById('signup-confirm').value;
            let valid = true;
            if (!window.KFCValidation.name(name)) { showError('signup-name', 'Enter a name with at least 2 characters.'); valid = false; }
            if (!emailValid(email)) { showError('signup-email', 'Enter a valid email address.'); valid = false; }
            else if (users().some(user => user.email === email)) { showError('signup-email', 'An account with this email already exists.'); valid = false; }
            if (!passwordValid(password)) { showError('signup-password', 'Use at least 8 characters with uppercase, lowercase, a number and a symbol.'); valid = false; }
            if (confirm !== password || !confirm) { showError('signup-confirm', 'Passwords must match.'); valid = false; }
            if (!valid) { signup.querySelector('[aria-invalid="true"]')?.focus(); return; }
            try {
                const salt = Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('');
                const id = crypto.randomUUID ? crypto.randomUUID() : salt;
                const user = { id, name, email, salt, hash: await hash(password, salt) };
                save(USERS, [...users(), user]); save(SESSION, id);
                location.href = new URLSearchParams(location.search).get('next') === 'contacts.html' ? 'contacts.html' : 'profile.html';
            } catch (error) { status.textContent = error.message || 'Could not save account in this browser.'; }
        });
        const login = document.getElementById('login-form');
        login?.addEventListener('submit', async event => {
            event.preventDefault(); clearErrors(login);
            const status = document.getElementById('login-status'); status.textContent = '';
            const email = document.getElementById('login-email').value.trim().toLowerCase();
            const password = document.getElementById('login-password').value;
            if (!emailValid(email)) { showError('login-email', 'Enter a valid email address.'); return; }
            if (!password) { showError('login-password', 'Enter your password.'); return; }
            const user = users().find(item => item.email === email);
            try {
                if (!user || await hash(password, user.salt) !== user.hash) { status.textContent = 'Email or password is incorrect.'; return; }
                save(SESSION, user.id); location.href = new URLSearchParams(location.search).get('next') === 'contacts.html' ? 'contacts.html' : 'profile.html';
            } catch (error) { status.textContent = error.message || 'Could not log in.'; }
        });
        const profile = document.getElementById('profile-form');
        profile?.addEventListener('submit', event => {
            event.preventDefault(); clearErrors(profile);
            const name = document.getElementById('profile-name').value.trim();
            if (!window.KFCValidation.name(name)) { showError('profile-name', 'Enter a name with at least 2 characters.'); return; }
            const user = current(); if (!user) { renderProfile(); return; }
            try { save(USERS, users().map(item => item.id === user.id ? { ...item, name } : item)); document.getElementById('profile-status').textContent = 'Name saved.'; updateLinks(); }
            catch { document.getElementById('profile-status').textContent = 'Could not save your name.'; }
        });
        document.getElementById('logout-btn')?.addEventListener('click', () => { try { localStorage.removeItem(SESSION); } catch {} location.href = 'login.html'; });
        renderProfile();
    });
    function renderProfile() {
        const guest = document.getElementById('profile-guest');
        const member = document.getElementById('profile-member');
        if (!guest || !member) return;
        const user = current(); guest.hidden = Boolean(user); member.hidden = !user;
        if (user) { document.getElementById('profile-email').textContent = user.email; document.getElementById('profile-name').value = user.name; }
    }
})();

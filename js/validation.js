window.KFCValidation = Object.freeze({
    email(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim()); },
    name(value) { const text = String(value).trim(); return text.length >= 2 && text.length <= 60; },
    password(value) { return value.length >= 8 && /[a-z]/.test(value) && /[A-Z]/.test(value) && /[0-9]/.test(value) && /[^A-Za-z0-9]/.test(value); },
    review(value) { return String(value).trim().length >= 10; },
    reference(value) { const length = String(value).trim().length; return length >= 2 && length <= 30; }
});

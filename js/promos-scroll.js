(() => {
    const button = document.getElementById('explore-offers-btn');
    const target = document.getElementById('offers-list');

    if (!button || !target) return;

    let animationId = null;

    button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();

        if (animationId !== null) {
            cancelAnimationFrame(animationId);
        }

        const start = window.scrollY;
        const header = document.getElementById('main-header');
        const offset = (header?.offsetHeight || 0) + 20;

        const destination =
            target.getBoundingClientRect().top +
            window.scrollY - offset;

        const distance = destination - start;
        const duration = 1200;
        let startTime = null;

        function animate(timestamp) {
            if (startTime === null) startTime = timestamp;

            const progress = Math.min(
                (timestamp - startTime) / duration,
                1
            );

            const eased = 0.5 - Math.cos(Math.PI * progress) / 2;

            window.scrollTo({
                top: start + distance * eased,
                behavior: 'instant'
            });

            if (progress < 1) {
                animationId = requestAnimationFrame(animate);
            } else {
                animationId = null;
            }
        }

        animationId = requestAnimationFrame(animate);
    }, true);
})();

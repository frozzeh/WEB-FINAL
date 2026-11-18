document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('menu-search-input');
    const status = document.getElementById('menu-search-status');
    const cards = [...document.querySelectorAll('.menu-product-card')];
    if (!input || !status || !cards.length) return;
    function filterDishes() {
        const query = input.value.trim().toLocaleLowerCase();
        let visible = 0;
        cards.forEach(card => {
            const content = [card.querySelector('.card-title')?.textContent,
                card.querySelector('.card-desc')?.textContent,
                ...[...card.querySelectorAll('.ingredient-list li')].map(item => item.textContent)]
                .join(' ').toLocaleLowerCase();
            card.hidden = !content.includes(query);
            if (!card.hidden) visible++;
        });
        status.textContent = query ? (visible ? visible + ' of ' + cards.length + ' dishes found.' : 'No dishes found. Try another search.') : '';
    }
    input.addEventListener('input', filterDishes);
    filterDishes();
});

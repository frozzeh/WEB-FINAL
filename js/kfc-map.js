document.addEventListener('DOMContentLoaded', () => {
    const citySelect = document.getElementById('map-city');
    const frame = document.getElementById('kfc-map-frame');
    const status = document.getElementById('kfc-map-status');
    const list = document.getElementById('kfc-map-list');
    const retry = document.getElementById('kfc-map-retry');
    if (!citySelect || !frame || !status || !list || !retry) return;
    const cities = {
        astana: { name: 'Astana', lat: 51.17, lon: 71.45 },
        almaty: { name: 'Almaty', lat: 43.24, lon: 76.89 },
        shymkent: { name: 'Shymkent', lat: 42.32, lon: 69.59 }
    };
    // KFC Kazakhstan lists these restaurants; coordinates mark their shopping centres.
    const fallback = {
        astana: [{ id: 'official-astana', name: 'KFC Astana | Khan Shatyr', address: 'Khan Shatyr, Turan Ave 37 (shopping centre)', lat: 51.13251, lon: 71.40387 }],
        almaty: [{ id: 'official-almaty', name: 'KFC Almaty | Dostyk Plaza', address: 'Zholdasbekov Street 111 (shopping centre)', lat: 43.233992, lon: 76.957411 }],
        shymkent: [{ id: 'official-shymkent', name: 'KFC Shymkent | Shymkent Plaza', address: 'Al-Farabi Square 3/1 (shopping centre)', lat: 42.3146, lon: 69.58793 }]
    };
    const cache = new Map();
    let controller = null;
    let requestNumber = 0;
    function mapUrl(lat, lon, selected) {
        const spread = selected ? 0.012 : 0.12;
        const params = new URLSearchParams({
            bbox: [lon - spread, lat - spread, lon + spread, lat + spread].join(','),
            layer: 'mapnik'
        });
        if (selected) params.set('marker', [lat, lon].join(','));
        return 'https://www.openstreetmap.org/export/embed.html?' + params;
    }
    function showLocation(location, city) {
        frame.src = mapUrl(location.lat, location.lon, true);
        frame.title = 'Map showing ' + location.name + ' in ' + city.name;
        list.querySelectorAll('button').forEach(button => button.classList.toggle('is-selected', button.dataset.id === location.id));
    }
    function render(locations, city, isFallback = false) {
        list.replaceChildren();
        if (!locations.length) {
            status.textContent = 'No KFC locations are mapped for ' + city.name + ' right now.';
            frame.src = mapUrl(city.lat, city.lon, false);
            return;
        }
        status.textContent = isFallback
            ? 'Live map data is unavailable. Showing a KFC restaurant listed by KFC Kazakhstan; the pin marks its shopping centre.'
            : locations.length + ' mapped KFC locations in ' + city.name + '.';
        locations.forEach(location => {
            const button = document.createElement('button');
            button.type = 'button';
            button.dataset.id = location.id;
            const title = document.createElement('strong'); title.textContent = location.name;
            const address = document.createElement('span'); address.textContent = location.address || 'View on map';
            button.append(title, address);
            button.addEventListener('click', () => showLocation(location, city));
            list.append(button);
        });
        showLocation(locations[0], city);
    }
    async function load() {
        const city = cities[citySelect.value];
        if (!city) return;
        if (controller) controller.abort();
        const thisRequest = ++requestNumber;
        list.replaceChildren();
        retry.hidden = true;
        status.textContent = 'Loading mapped restaurants...';
        if (cache.has(citySelect.value)) { render(cache.get(citySelect.value), city); return; }
        render(fallback[citySelect.value], city, true);
        status.textContent = 'Showing a KFC restaurant listed by KFC Kazakhstan. Loading more map locations...';
        controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 18000);
        const around = '(around:20000,' + city.lat + ',' + city.lon + ')';
        const query = '[out:json][timeout:20];(nwr["brand"~"^KFC$",i]' + around + ';nwr["name"~"^KFC",i]' + around + ';);out center;';
        try {
            const response = await fetch('https://overpass.private.coffee/api/interpreter?data=' + encodeURIComponent(query), { signal: controller.signal });
            if (!response.ok) throw Error('Location service unavailable');
            const data = await response.json();
            if (!Array.isArray(data.elements)) throw Error('Invalid location response');
            const locations = data.elements.map(item => {
                const lat = item.lat ?? item.center?.lat;
                const lon = item.lon ?? item.center?.lon;
                if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
                const tags = item.tags || {};
                const address = [tags['addr:street'], tags['addr:housenumber']].filter(Boolean).join(', ');
                return { id: item.type + '/' + item.id, lat, lon, name: tags.name || 'KFC', address };
            }).filter(Boolean).slice(0, 20);
            if (thisRequest !== requestNumber) return;
            if (!locations.length) throw Error('No mapped locations');
            cache.set(citySelect.value, locations);
            render(locations, city);
        } catch (error) {
            if (thisRequest !== requestNumber) return;
            render(fallback[citySelect.value], city, true);
            retry.hidden = false;
        } finally {
            clearTimeout(timer);
        }
    }
    citySelect.addEventListener('change', load);
    retry.addEventListener('click', load);
    load();
});

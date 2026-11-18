document.addEventListener('DOMContentLoaded', () => {
    const citySelect = document.getElementById('map-city');
    const title = document.getElementById('weather-title');
    const status = document.getElementById('weather-status');
    const retry = document.getElementById('weather-retry');
    if (!citySelect || !title || !status || !retry) return;

    const cities = {
        astana: { name: 'Astana', lat: 51.17, lon: 71.45 },
        almaty: { name: 'Almaty', lat: 43.24, lon: 76.89 },
        shymkent: { name: 'Shymkent', lat: 42.32, lon: 69.59 }
    };
    let controller;
    let requestNumber = 0;

    function describe(code) {
        if (code === 0) return 'Clear sky';
        if ([1, 2, 3].includes(code)) return 'Cloudy';
        if ([45, 48].includes(code)) return 'Fog';
        if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'Rain';
        if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return 'Snow';
        if (code >= 95) return 'Thunderstorm';
        return 'Current conditions';
    }

    async function loadWeather() {
        const city = cities[citySelect.value];
        if (!city) return;
        controller?.abort();
        const thisRequest = ++requestNumber;
        const activeController = new AbortController();
        controller = activeController;
        const timer = setTimeout(() => activeController.abort(), 10000);
        title.textContent = 'Weather in ' + city.name;
        status.textContent = 'Loading weather in ' + city.name + '...';
        retry.hidden = true;

        const params = new URLSearchParams({
            latitude: city.lat,
            longitude: city.lon,
            current: 'temperature_2m,weather_code'
        });
        try {
            const response = await fetch('https://api.open-meteo.com/v1/forecast?' + params, { signal: activeController.signal });
            if (!response.ok) throw Error('Weather service unavailable');
            const data = await response.json();
            const temperature = data?.current?.temperature_2m;
            const code = data?.current?.weather_code;
            if (!Number.isFinite(temperature) || !Number.isFinite(code)) throw Error('Invalid weather data');
            if (thisRequest !== requestNumber) return;
            status.textContent = Math.round(temperature) + ' °C · ' + describe(code);
        } catch (_) {
            if (thisRequest !== requestNumber) return;
            status.textContent = 'Weather in ' + city.name + ' is unavailable right now.';
            retry.hidden = false;
        } finally {
            clearTimeout(timer);
        }
    }

    citySelect.addEventListener('change', loadWeather);
    retry.addEventListener('click', loadWeather);
    loadWeather();
});

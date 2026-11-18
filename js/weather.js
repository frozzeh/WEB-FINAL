document.addEventListener('DOMContentLoaded', () => {
    const status = document.getElementById('weather-status');
    const retry = document.getElementById('weather-retry');
    if (!status || !retry) return;
    const endpoint = 'https://api.open-meteo.com/v1/forecast?latitude=51.17&longitude=71.45&current=temperature_2m,weather_code';
    function describe(code) {
        if (code === 0) return 'Clear sky';
        if ([1, 2, 3].includes(code)) return 'Cloudy';
        if ([45, 48].includes(code)) return 'Fog';
        if (code >= 51 && code <= 67 || code >= 80 && code <= 82) return 'Rain';
        if (code >= 71 && code <= 77 || code >= 85 && code <= 86) return 'Snow';
        if (code >= 95) return 'Thunderstorm';
        return 'Current conditions';
    }
    async function loadWeather() {
        status.textContent = 'Loading weather...';
        retry.hidden = true;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 10000);
        try {
            const response = await fetch(endpoint, { signal: controller.signal });
            if (!response.ok) throw Error('Weather service unavailable');
            const data = await response.json();
            const temperature = data?.current?.temperature_2m;
            const code = data?.current?.weather_code;
            if (!Number.isFinite(temperature) || !Number.isFinite(code)) throw Error('Invalid weather data');
            status.textContent = Math.round(temperature) + ' °C · ' + describe(code);
        } catch (_) {
            status.textContent = 'Weather is unavailable right now.';
            retry.hidden = false;
        } finally {
            clearTimeout(timer);
        }
    }
    retry.addEventListener('click', loadWeather);
    loadWeather();
});

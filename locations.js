(() => {
    const key = (country, city) => [country, city].map(v => String(v || '').normalize('NFKC').trim().toLowerCase()).join('/');
    let cache = {};
    try { cache = JSON.parse(localStorage.getItem('filmFlowLocations') || '{}') || {}; } catch (_) {}
    const valid = p => p && Number.isFinite(p.latitude) && Number.isFinite(p.longitude) && Math.abs(p.latitude) <= 90 && Math.abs(p.longitude) <= 180;
    window.getSavedLocation = (country, city) => {
        const p = cache[key(country, city)];
        return valid(p) ? { ...p } : null;
    };
    document.addEventListener('DOMContentLoaded', () => {
        const input = document.getElementById('city-custom-input');
        const country = document.getElementById('country');
        const city = document.getElementById('city');
        const countryInput = document.getElementById('country-custom-input');
        const box = document.createElement('div');
        box.className = 'location-search';
        box.innerHTML = `<div class="location-actions"><button type="button" class="location-search-button"><i class="fas fa-search" aria-hidden="true"></i> Search location</button><button type="button" class="location-manual-button" title="Choose coordinates manually" aria-label="Choose coordinates manually"><i class="fas fa-map-marker-alt" aria-hidden="true"></i></button></div><div class="location-feedback" role="status" aria-live="polite"></div><div class="location-results"></div><div class="location-manual" hidden><label>Latitude<input class="location-lat" type="number" min="-90" max="90" step="any" placeholder="37.5534"></label><label>Longitude<input class="location-lon" type="number" min="-180" max="180" step="any" placeholder="129.1155"></label><button type="button" class="location-use">Use location</button></div><button type="button" class="location-later">Locate later</button><a class="location-credit" href="https://open-meteo.com/en/docs/geocoding-api" target="_blank" rel="noopener noreferrer">Open-Meteo / GeoNames</a>`;
        // Keep all location controls inside the existing custom-city group.
        input.insertAdjacentElement('afterend', box);
        const feedback = box.querySelector('.location-feedback');
        const results = box.querySelector('.location-results');
        const search = box.querySelector('.location-search-button');
        const manual = box.querySelector('.location-manual');
        let controller;
        let version = 0;
        function context() {
            const selectedCountry = countriesRegions.find(c => c.code === country.value);
            return { country: selectedCountry ? selectedCountry.name : countryInput.value.trim(), city: city.value === 'other' ? input.value.trim() : city.value, code: selectedCountry?.code };
        }
        function invalidate() {
            version++;
            controller?.abort();
            search.disabled = false;
            results.replaceChildren();
            manual.hidden = true;
        }
        window.refreshLocationMatch = () => {
            invalidate();
            const c = context();
            const record = films.find(r => r.id == editingRecordId);
            if (record && key(record.country, record.city) === key(c.country,c.city) && valid(record.location)) cache[key(c.country,c.city)] = record.location;
            const match = window.getSavedLocation(c.country,c.city);
            feedback.textContent = match ? `Located: ${match.name}` : '';
        };
        function save(match, c) {
            if (!valid(match)) return;
            cache[key(c.country,c.city)] = match;
            try { localStorage.setItem('filmFlowLocations', JSON.stringify(cache)); } catch (_) { feedback.textContent = 'Location selected. Local storage is full.'; return; }
            results.replaceChildren();
            manual.hidden = true;
            feedback.textContent = `Located: ${match.name}`;
        }
        input.addEventListener('input', window.refreshLocationMatch);
        countryInput.addEventListener('input', window.refreshLocationMatch);
        country.addEventListener('change', window.refreshLocationMatch);
        city.addEventListener('change', window.refreshLocationMatch);
        search.addEventListener('click', async () => {
            invalidate();
            const c = context();
            if (c.city.length < 2 || !c.country) { feedback.textContent = 'Enter a country and at least two city characters.'; return; }
            const requestVersion = version;
            controller = new AbortController();
            const requestController = controller;
            const timer = setTimeout(() => requestController.abort(), 12000);
            search.disabled = true;
            feedback.textContent = 'Searching...';
            const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
            url.search = new URLSearchParams({ name: c.city, count: '8', language: 'en', ...(c.code && /^[A-Z]{2}$/.test(c.code) ? { countryCode: c.code } : { name: `${c.city}, ${c.country}` }) }).toString();
            try {
                const response = await fetch(url, { signal: controller.signal });
                if (!response.ok) throw new Error('Search unavailable');
                const data = await response.json();
                if (requestVersion !== version) return;
                const matches = (data.results || []).filter(valid);
                feedback.textContent = matches.length ? 'Choose a matching location' : 'No matching location. Choose coordinates or locate later.';
                matches.forEach(match => {
                    const button = document.createElement('button');
                    button.type = 'button';
                    const name = document.createElement('strong');
                    name.textContent = match.name;
                    const detail = document.createElement('small');
                    detail.textContent = [match.admin2,match.admin1,match.country].filter(Boolean).join(' / ');
                    button.append(name,detail);
                    button.addEventListener('click', () => save({ latitude: match.latitude, longitude: match.longitude, name: [match.name,match.admin1,match.country].filter(Boolean).join(', '), source: 'Open-Meteo / GeoNames' },c));
                    results.appendChild(button);
                });
            } catch (_) {
                if (requestVersion === version) feedback.textContent = 'Search unavailable. You can save now and locate later.';
            } finally {
                clearTimeout(timer);
                if (requestVersion === version) search.disabled = false;
            }
        });
        box.querySelector('.location-manual-button').addEventListener('click', () => { invalidate(); manual.hidden = false; });
        box.querySelector('.location-use').addEventListener('click', () => {
            const c = context();
            const lat = box.querySelector('.location-lat').value;
            const lon = box.querySelector('.location-lon').value;
            const match = { latitude: Number(lat), longitude: Number(lon), name: `${c.city}, ${c.country}`, source: 'manual' };
            if (!c.city || !c.country || !lat || !lon || !valid(match)) { feedback.textContent = 'Enter valid coordinates and a city name.'; return; }
            save(match,c);
        });
        box.querySelector('.location-later').addEventListener('click', () => { invalidate(); feedback.textContent = 'You can save this record and locate it later.'; });
    });
})();

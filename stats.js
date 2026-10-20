// Coordinates are local: personal shooting locations never leave the browser.
(() => {
    const coordinates = {
        CN: { Shanghai: [121.47,31.23], Hangzhou: [120.16,30.27], Beijing: [116.41,39.90], Guangzhou: [113.26,23.13], Shenzhen: [114.06,22.54], Chengdu: [104.07,30.57], Nanjing: [118.80,32.06], Wuhan: [114.31,30.59], "Xi'an": [108.94,34.34], Chongqing: [106.55,29.56], Tianjin: [117.20,39.08], Qingdao: [120.38,36.07], Dalian: [121.61,38.91], Xiamen: [118.09,24.48] },
        JP: { Tokyo: [139.69,35.68], Osaka: [135.50,34.69], Kyoto: [135.77,35.01], Yokohama: [139.64,35.44], Nagoya: [136.91,35.18], Sapporo: [141.35,43.06], Fukuoka: [130.40,33.59], Kobe: [135.20,34.69], Hiroshima: [132.46,34.39], Sendai: [140.87,38.27], Kawasaki: [139.70,35.53], Saitama: [139.65,35.86], Chiba: [140.11,35.61], Kitakyushu: [130.88,33.88] },
        US: { 'New York': [-74.01,40.71], 'Los Angeles': [-118.24,34.05], Chicago: [-87.63,41.88], 'San Francisco': [-122.42,37.77] },
        GB: { London: [-.13,51.51], Edinburgh: [-3.19,55.95] },
        FR: { Paris: [2.35,48.86], Nice: [7.26,43.71] },
        IT: { Rome: [12.50,41.90], Milan: [9.19,45.46], Venice: [12.32,45.44] },
        DE: { Berlin: [13.41,52.52], Munich: [11.58,48.14] },
        KR: { Seoul: [126.98,37.57], Busan: [129.08,35.18], Andong: [128.73,36.57], Incheon: [126.71,37.46], Daegu: [128.60,35.87], Daejeon: [127.38,36.35], Gwangju: [126.85,35.16], Suwon: [127.03,37.26], Ulsan: [129.31,35.54], Changwon: [128.68,35.23], Goyang: [126.83,37.66], Yongin: [127.18,37.24], Bucheon: [126.77,37.50], Ansan: [126.83,37.32], Cheongju: [127.49,36.64] },
        SG: { Singapore: [103.82,1.35] },
        TH: { Bangkok: [100.50,13.76], 'Chiang Mai': [98.99,18.79], Phuket: [98.39,7.88] },
        MY: { 'Kuala Lumpur': [101.69,3.14] },
        AU: { Sydney: [151.21,-33.87], Melbourne: [144.96,-37.81] },
        CA: { Toronto: [-79.38,43.65], Vancouver: [-123.12,49.28] },
        'CN-HK': { 'Hong Kong Island': [114.19,22.26], Kowloon: [114.18,22.32] },
        'CN-TW': { Taipei: [121.57,25.03], Kaohsiung: [120.30,22.63] }
    };
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    let selectedYear = '';
    let mode = 'name';
    const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    function location(record) {
        const country = countriesRegions.find(c => c.code === record.country || c.name === record.country);
        const entries = coordinates[country ? country.code : record.country];
        return entries && Object.entries(entries).find(([name]) => name.toLowerCase() === String(record.city).trim().toLowerCase())?.[1];
    }
    function route(records) {
        const ordered = [...records].sort((a,b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
        const visits = ordered.map(r => ({ record: r, point: location(r) }));
        const known = visits.filter(v => v.point);
        if (!known.length) return '<p class="analytics-muted">No mapped shooting locations yet.</p>';
        // Mercator projection, uniformly scaled to preserve actual geographic positions.
        const projected = known.map(v => [v.point[0], Math.log(Math.tan(Math.PI / 4 + v.point[1] * Math.PI / 360)) * 180 / Math.PI]);
        const xs = projected.map(p => p[0]), ys = projected.map(p => p[1]);
        const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
        const scale = Math.min(260 / (maxX - minX || 1), 100 / (maxY - minY || 1));
        const points = projected.map(p => [160 + (p[0] - (minX + maxX)/2) * scale, 85 - (p[1] - (minY + maxY)/2) * scale]);
        let cursor = 0;
        const positions = visits.map(v => v.point ? points[cursor++] : null);
        const lines = positions.map((p,i) => {
            const previous = positions[i-1];
            if (!p || !previous || (p[0] === previous[0] && p[1] === previous[1])) return '';
            const middle = [(p[0]+previous[0])/2, (p[1]+previous[1])/2];
            return `<path d="M ${previous.join(' ')} L ${middle.join(' ')} L ${p.join(' ')}" marker-mid="url(#route-direction)"/>`;
        }).join('');
        const seen = new Set();
        const labels = [];
        const dots = known.map((v,i) => {
            const key = v.point.join(',');
            if (seen.has(key)) return '';
            seen.add(key);
            const [x,y] = points[i];
            let labelY = y - 12;
            while (labels.some(p => Math.abs(p[0]-x) < 75 && Math.abs(p[1]-labelY) < 15)) labelY += 16;
            labels.push([x,labelY]);
            return `<g><title>${escape(v.record.city)}</title><path class="place-star" d="M ${x} ${y-7} Q ${x+1.5} ${y-1.5} ${x+7} ${y} Q ${x+1.5} ${y+1.5} ${x} ${y+7} Q ${x-1.5} ${y+1.5} ${x-7} ${y} Q ${x-1.5} ${y-1.5} ${x} ${y-7} Z"/><text x="${x}" y="${labelY}" text-anchor="${x < 65 ? 'start' : x > 255 ? 'end' : 'middle'}">${escape(v.record.city)}</text></g>`;
        }).join('');
        const missing = visits.filter(v => !v.point).length;
        return `<svg class="places-chart" viewBox="0 0 320 170" role="img" aria-label="Shooting locations connected in Records order, newest first"><defs><marker id="route-direction" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 6 3 L 0 6 Z" fill="#667eea"/></marker></defs><g class="place-lines">${lines}</g>${dots}</svg>${missing ? `<p class="analytics-muted">${missing} record(s) have locations not yet mapped.</p>` : ''}`;
    }
    window.updateStatistics = function() {
        const content = document.querySelector('#stats-page .stats-content');
        if (!content) return;
        document.querySelector('#stats-page .data-actions').hidden = true;
        const years = [...new Set(films.map(r => String(r.date || '').slice(0,4)).filter(y => /^\d{4}$/.test(y)))].sort().reverse();
        if (!selectedYear || !years.includes(selectedYear)) selectedYear = years[0] || String(new Date().getFullYear());
        const records = films.filter(r => String(r.date || '').startsWith(selectedYear + '-'));
        const cities = new Set(records.filter(r => r.city).map(r => `${r.country}/${r.city}`));
        const cameras = new Set(records.filter(r => r.camera).map(r => r.camera));
        const months = Array(12).fill(0);
        records.forEach(r => { const m = Number(r.date.slice(5,7)); if (m >= 1 && m <= 12) months[m-1]++; });
        const max = Math.max(1,...months);
        const counts = new Map();
        records.forEach(r => { if (r[mode]) counts.set(r[mode], (counts.get(r[mode]) || 0) + 1); });
        content.innerHTML = `<div class="analytics-toolbar"><details class="analytics-year-picker"><summary aria-label="Statistics year"><i class="fas fa-calendar" aria-hidden="true"></i>${selectedYear}<i class="fas fa-chevron-down" aria-hidden="true"></i></summary><div class="analytics-year-options">${(years.length ? years : [selectedYear]).map(y => `<button type="button" data-year="${y}" aria-pressed="${y === selectedYear}">${y}</button>`).join('')}</div></details><button type="button" class="analytics-export" aria-label="Export records" title="Export records"><i class="fas fa-download" aria-hidden="true"></i></button></div>
            <div class="analytics-totals"><div><strong>${records.length}</strong><span>Rolls</span></div><div><strong>${cameras.size}</strong><span>Cameras</span></div><div><strong>${cities.size}</strong><span>Cities</span></div></div>
            ${!records.length ? '<p class="analytics-muted">No records for this year yet.</p>' : ''}
            <section class="analytics-section"><h3>Places</h3>${route(records)}</section>
            <section class="analytics-section"><h3>Rolls per Month</h3><div class="monthly-chart">${months.map((count,i) => `<div class="monthly-column"><div class="monthly-track"><div style="height:${count/max*100}%">${count ? `<span>${count}</span>` : ''}</div></div><small>${monthNames[i]}</small></div>`).join('')}</div></section>
            <section class="analytics-section"><div class="analytics-section-heading"><h3>Film &amp; Camera</h3><div class="analytics-modes"><button type="button" data-mode="name" aria-pressed="${mode === 'name'}">Film</button><button type="button" data-mode="camera" aria-pressed="${mode === 'camera'}">Camera</button></div></div><div class="usage-list">${[...counts].sort((a,b) => b[1]-a[1]).map(([name,count]) => `<div class="usage-row"><span>${escape(name)}</span><div class="usage-track"><div style="width:${count/Math.max(1,records.length)*100}%"></div></div><small>${count} ${count === 1 ? 'roll' : 'rolls'}</small></div>`).join('') || '<p class="analytics-muted">No data yet.</p>'}</div></section>
            `;
        content.querySelectorAll('[data-year]').forEach(button => button.addEventListener('click', () => { selectedYear = button.dataset.year; updateStatistics(); }));
        const overview = document.createElement('h3');
        overview.className = 'analytics-overview-title';
        overview.textContent = 'Overview';
        content.querySelector('.analytics-toolbar').prepend(overview);
        content.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => { mode = button.dataset.mode; updateStatistics(); }));
        content.querySelector('.analytics-export').addEventListener('click', exportData);
    };
})();

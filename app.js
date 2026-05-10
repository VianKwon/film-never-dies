// Film Flow - Film Photography Journal
// Complete Application Logic

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
    
    // Load existing films from localStorage
    loadFilms();
    
    // Initialize Select2 for country/city selection
    initSelect2();
    
    // Initialize Cover Flow
    initCoverFlow();
    
    // Update statistics
    updateStatistics();
});

// Global variables
let films = [];
let currentCoverFlowIndex = 0;
let uploadedPhotos = {
    1: null,
    2: null,
    3: null
};

// Country/Region and city data
const countriesRegions = [
    { code: 'CN', name: 'China', type: 'country', cities: ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Hangzhou', 'Nanjing', 'Wuhan', 'Xi\'an', 'Chongqing', 'Tianjin', 'Qingdao', 'Dalian', 'Xiamen'] },
    { code: 'CN-HK', name: 'Hong Kong, China', type: 'region', cities: ['Hong Kong Island', 'Kowloon', 'New Territories', 'Lantau Island', 'Tsuen Wan', 'Tuen Mun', 'Yuen Long', 'North District'] },
    { code: 'CN-TW', name: 'Taiwan, China', type: 'region', cities: ['Taipei', 'Kaohsiung', 'Taichung', 'Tainan', 'Banqiao', 'Hsinchu', 'Keelung', 'Chiayi', 'Taoyuan', 'Changhua', 'Pingtung', 'Hualien', 'Taitung'] },
    { code: 'CN-MO', name: 'Macau, China', type: 'region', cities: ['Macau Peninsula', 'Taipa', 'Coloane', 'Cotai'] },
    { code: 'JP', name: 'Japan', type: 'country', cities: ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Hiroshima', 'Sendai', 'Kawasaki', 'Saitama', 'Chiba', 'Kitakyushu'] },
    { code: 'US', name: 'United States', type: 'country', cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus'] },
    { code: 'GB', name: 'United Kingdom', type: 'country', cities: ['London', 'Birmingham', 'Manchester', 'Liverpool', 'Leeds', 'Sheffield', 'Bristol', 'Glasgow', 'Edinburgh', 'Cardiff', 'Belfast', 'Leicester', 'Bradford', 'Coventry'] },
    { code: 'FR', name: 'France', type: 'country', cities: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Saint-Étienne', 'Toulon'] },
    { code: 'DE', name: 'Germany', type: 'country', cities: ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig', 'Bremen', 'Dresden', 'Hanover', 'Nuremberg'] },
    { code: 'IT', name: 'Italy', type: 'country', cities: ['Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna', 'Florence', 'Venice', 'Verona', 'Trieste', 'Padua', 'Taranto', 'Brescia'] },
    { code: 'KR', name: 'South Korea', type: 'country', cities: ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Suwon', 'Ulsan', 'Changwon', 'Goyang', 'Yongin', 'Bucheon', 'Ansan', 'Cheongju'] },
    { code: 'AU', name: 'Australia', type: 'country', cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Canberra', 'Newcastle', 'Wollongong', 'Hobart', 'Geelong', 'Townsville', 'Cairns', 'Darwin'] },
    { code: 'CA', name: 'Canada', type: 'country', cities: ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener', 'London', 'Victoria', 'Halifax', 'Oshawa'] },
    { code: 'SG', name: 'Singapore', type: 'country', cities: ['Singapore'] },
    { code: 'MY', name: 'Malaysia', type: 'country', cities: ['Kuala Lumpur', 'George Town', 'Johor Bahru', 'Ipoh', 'Shah Alam', 'Petaling Jaya', 'Kuching', 'Kota Kinabalu', 'Malacca City', 'Alor Setar', 'Kuala Terengganu', 'Kuantan', 'Sandakan', 'Tawau'] },
    { code: 'TH', name: 'Thailand', type: 'country', cities: ['Bangkok', 'Chiang Mai', 'Pattaya', 'Phuket', 'Khon Kaen', 'Udon Thani', 'Hat Yai', 'Nakhon Ratchasima', 'Surat Thani', 'Nakhon Si Thammarat', 'Ubon Ratchathani', 'Songkhla', 'Pathum Thani', 'Samut Prakan'] },
    { code: 'VN', name: 'Vietnam', type: 'country', cities: ['Hanoi', 'Ho Chi Minh City', 'Da Nang', 'Haiphong', 'Can Tho', 'Bien Hoa', 'Nha Trang', 'Hue', 'Vung Tau', 'Qui Nhon', 'Rach Gia', 'Long Xuyen', 'Thai Nguyen', 'Nam Dinh'] },
    { code: 'PH', name: 'Philippines', type: 'country', cities: ['Manila', 'Quezon City', 'Davao City', 'Caloocan', 'Cebu City', 'Zamboanga City', 'Taguig', 'Antipolo', 'Pasig', 'Valenzuela', 'Dasmarinas', 'Parañaque', 'Bacoor', 'General Santos'] },
    { code: 'ID', name: 'Indonesia', type: 'country', cities: ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Makassar', 'Palembang', 'Depok', 'Tangerang', 'South Tangerang', 'Semarang', 'Makassar', 'Batam', 'Pekanbaru'] },
    { code: 'IN', name: 'India', type: 'country', cities: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Visakhapatnam'] }
];

// Initialize application
function initApp() {
    // Setup form submission
    const filmForm = document.getElementById('film-form');
    filmForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveFilmRecord();
    });
    
    // Setup country change event
    const countrySelect = document.getElementById('country');
    countrySelect.addEventListener('change', function() {
        updateCities(this.value);
    });
    
    // Initialize toast notifications
    initToast();
}

// Initialize Select2
function initSelect2() {
    // Initialize country select
    $('#country').select2({
        placeholder: 'Select country/region',
        allowClear: true,
        width: '100%',
        theme: 'default'
    });
    
    // Initialize city select
    $('#city').select2({
        placeholder: 'Select city',
        allowClear: true,
        width: '100%',
        theme: 'default',
        disabled: true
    });
    
    // Populate countries/regions
    const countrySelect = document.getElementById('country');
    countriesRegions.forEach(country => {
        const option = document.createElement('option');
        option.value = country.code;
        option.textContent = country.name;
        countrySelect.appendChild(option);
    });
}

// Update cities based on selected country
function updateCities(countryCode) {
    const citySelect = document.getElementById('city');
    const select2City = $('#city');
    
    if (!countryCode) {
        citySelect.disabled = true;
        select2City.prop('disabled', true);
        select2City.empty();
        select2City.append('<option value="">Select country/region first</option>');
        select2City.val('').trigger('change');
        return;
    }
    
    // Find selected country/region
    const country = countriesRegions.find(c => c.code === countryCode);
    if (!country) return;
    
    // Enable city select
    citySelect.disabled = false;
    select2City.prop('disabled', false);
    
    // Clear existing options
    select2City.empty();
    select2City.append('<option value="">Select city</option>');
    
    // Add cities
    country.cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
    });
    
    select2City.val('').trigger('change');
}

// Page Navigation Functions
function showCoverflowPage() {
    switchPage('coverflow-page');
    initCoverFlow();
}

function showListPage() {
    switchPage('list-page');
    renderRecordsList();
}

function showAddPage() {
    switchPage('add-page');
}

function showStatsPage() {
    switchPage('stats-page');
    updateStatistics();
}

function switchPage(pageId) {
    console.log('🔍 switchPage called with:', pageId);
    
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    console.log('Found', pages.length, 'pages');
    
    pages.forEach((page, index) => {
        console.log(`Page ${index}: ${page.id}, active: ${page.classList.contains('active')}`);
        page.classList.remove('active');
        page.style.display = 'none'; // Force hide
    });
    
    // Show selected page
    const selectedPage = document.getElementById(pageId);
    console.log('Selected page:', selectedPage ? selectedPage.id : 'NOT FOUND');
    
    if (selectedPage) {
        selectedPage.classList.add('active');
        selectedPage.style.display = 'block'; // Force show
        
        // Show/hide bottom nav
        const bottomNav = document.getElementById('bottom-nav');
        if (bottomNav) {
            if (pageId === 'coverflow-page') {
                bottomNav.style.display = 'none';
                console.log('📱 Hiding bottom nav');
            } else {
                bottomNav.style.display = 'flex';
                console.log('📱 Showing bottom nav');
            }
        }
        
        // Show/hide back buttons
        const backButtons = document.querySelectorAll('.back-btn');
        backButtons.forEach(btn => {
            if (pageId === 'coverflow-page') {
                btn.style.display = 'none';
            } else {
                btn.style.display = 'flex';
            }
        });
        
        console.log('✅ Page switched to:', pageId);
    } else {
        console.error('❌ Page not found:', pageId);
    }
}

// Cover Flow Functions
function initCoverFlow() {
    // Filter films that have photos
    const filmsWithPhotos = films.filter(film => film.photos && film.photos.length > 0);
    
    if (filmsWithPhotos.length === 0) {
        const track = document.getElementById('coverflow-track');
        track.innerHTML = `
            <div class="coverflow-empty">
                <div class="empty-icon">
                    <i class="fas fa-camera"></i>
                </div>
                <h3>No photos yet</h3>
                <p>Add your first film record to start the gallery</p>
                <button class="btn btn-primary" onclick="showListPage()">
                    <i class="fas fa-list"></i> Go to Records
                </button>
            </div>
        `;
        document.getElementById('camera-info').textContent = '-';
        document.getElementById('film-info').textContent = '-';
        return;
    }
    
    // Create array of all photos with their film info
    let allPhotos = [];
    filmsWithPhotos.forEach(film => {
        film.photos.forEach((photo, photoIndex) => {
            allPhotos.push({
                image: photo,
                film: film,
                photoIndex: photoIndex
            });
        });
    });
    
    // Clear track
    const track = document.getElementById('coverflow-track');
    track.innerHTML = '';
    
    // Create cover flow items
    allPhotos.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'coverflow-item';
        itemElement.dataset.index = index;
        
        itemElement.innerHTML = `
            <img src="${item.image}" alt="Film photo ${index + 1}">
        `;
        
        track.appendChild(itemElement);
    });
    
    // Set initial position
    currentCoverFlowIndex = Math.floor(allPhotos.length / 2);
    updateCoverFlow();
    
    // Setup swipe events
    setupSwipeEvents();
}

function updateCoverFlow() {
    const items = document.querySelectorAll('.coverflow-item');
    const totalItems = items.length;
    
    if (totalItems === 0) return;
    
    // Get current photo info
    const filmsWithPhotos = films.filter(film => film.photos && film.photos.length > 0);
    let photoCount = 0;
    let currentFilm = null;
    let currentPhotoIndex = 0;
    
    for (const film of filmsWithPhotos) {
        if (currentCoverFlowIndex < photoCount + film.photos.length) {
            currentFilm = film;
            currentPhotoIndex = currentCoverFlowIndex - photoCount;
            break;
        }
        photoCount += film.photos.length;
    }
    
    // Update photo info
    if (currentFilm) {
        document.getElementById('camera-info').textContent = currentFilm.camera || 'Unknown Camera';
        document.getElementById('film-info').textContent = currentFilm.name || 'Unknown Film';
    }
    
    // Update item positions
    items.forEach((item, index) => {
        // Remove all position classes
        item.classList.remove('center', 'left-1', 'left-2', 'left-3', 'right-1', 'right-2', 'right-3');
        
        const distance = index - currentCoverFlowIndex;
        
        if (distance === 0) {
            item.classList.add('center');
        } else if (distance === -1) {
            item.classList.add('left-1');
        } else if (distance === -2) {
            item.classList.add('left-2');
        } else if (distance === -3) {
            item.classList.add('left-3');
        } else if (distance === 1) {
            item.classList.add('right-1');
        } else if (distance === 2) {
            item.classList.add('right-2');
        } else if (distance === 3) {
            item.classList.add('right-3');
        } else if (distance < -3) {
            item.style.display = 'none';
        } else if (distance > 3) {
            item.style.display = 'none';
        } else {
            item.style.display = 'block';
        }
    });
}

function setupSwipeEvents() {
    const track = document.getElementById('coverflow-track');
    let startX = 0;
    let isDragging = false;
    
    // Mouse events
    track.addEventListener('mousedown', (e) => {
        startX = e.clientX;
        isDragging = true;
        track.style.cursor = 'grabbing';
    });
    
    track.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
    });
    
    track.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        
        const endX = e.clientX;
        const diffX = startX - endX;
        
        if (Math.abs(diffX) > 50) {
            if (diffX > 0) {
                // Swipe left
                navigateCoverFlow(1);
            } else {
                // Swipe right
                navigateCoverFlow(-1);
            }
        }
        
        isDragging = false;
        track.style.cursor = 'grab';
    });
    
    track.addEventListener('mouseleave', () => {
        isDragging = false;
        track.style.cursor = 'grab';
    });
    
    // Touch events
    track.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
    });
    
    track.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
    });
    
    track.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        
        const endX = e.changedTouches[0].clientX;
        const diffX = startX - endX;
        
        if (Math.abs(diffX) > 30) {
            if (diffX > 0) {
                // Swipe left
                navigateCoverFlow(1);
            } else {
                // Swipe right
                navigateCoverFlow(-1);
            }
        }
        
        isDragging = false;
    });
    
    // Keyboard events
    document.addEventListener('keydown', (e) => {
        if (document.getElementById('coverflow-page').classList.contains('active')) {
            if (e.key === 'ArrowLeft') {
                navigateCoverFlow(-1);
            } else if (e.key === 'ArrowRight') {
                navigateCoverFlow(1);
            }
        }
    });
}

function navigateCoverFlow(direction) {
    const items = document.querySelectorAll('.coverflow-item');
    const totalItems = items.length;
    
    if (totalItems === 0) return;
    
    currentCoverFlowIndex += direction;
    
    // Wrap around
    if (currentCoverFlowIndex < 0) {
        currentCoverFlowIndex = totalItems - 1;
    } else if (currentCoverFlowIndex >= totalItems) {
        currentCoverFlowIndex = 0;
    }
    
    updateCoverFlow();
}

// Records List Functions
function renderRecordsList() {
    const container = document.getElementById('records-container');
    
    if (films.length === 0) {
        container.innerHTML = `
            <div class="empty-list">
                <div class="empty-icon">
                    <i class="fas fa-film"></i>
                </div>
                <h3>No records yet</h3>
                <p>Add your first film record</p>
                <button class="btn btn-primary" onclick="showAddPage()">
                    <i class="fas fa-plus"></i> Add First Record
                </button>
            </div>
        `;
        return;
    }
    
    // Sort films by date (newest first)
    const sortedFilms = [...films].sort((a, b) => {
        return new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt);
    });
    
    // Create records list
    container.innerHTML = sortedFilms.map(film => `
        <div class="record-item">
            <div class="record-photos">
                ${film.photos && film.photos.length > 0 ? 
                    film.photos.map(photo => `
                        <div class="record-photo">
                            <img src="${photo}" alt="Film photo">
                        </div>
                    `).join('') : 
                    '<div class="record-photo" style="display: flex; align-items: center; justify-content: center; color: var(--label-tertiary);"><i class="fas fa-image"></i></div>'
                }
            </div>
            <div class="record-info">
                <div class="record-camera">${film.camera || 'Unknown Camera'}</div>
                <div class="record-film">${film.name || 'Unknown Film'}</div>
                <div class="record-date">
                    <i class="fas fa-calendar"></i>
                    ${formatDate(film.date || film.createdAt)}
                </div>
                ${film.city ? `
                    <div class="record-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${film.city}${film.country ? `, ${getCountryName(film.country)}` : ''}
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function getCountryName(countryCode) {
    const country = countriesRegions.find(c => c.code === countryCode);
    return country ? country.name : countryCode;
}
// Film Flow - Film Photography Journal
// Complete Application Logic

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
    
    // Load existing films from localStorage
    loadFilms();
    
    // Initialize Select2 for country/city selection
    initSelect2();
    
    // Initialize Cover Flow
    initCoverFlow();
    
    // Update statistics
    updateStatistics();
});

// Global variables
let currentCoverFlowIndex = 0;
let uploadedPhotos = {
    1: null,
    2: null,
    3: null
};

// Country/Region and city data
const countriesRegions = [
    { code: 'CN', name: 'China', type: 'country', cities: ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Hangzhou', 'Nanjing', 'Wuhan', 'Xi\'an', 'Chongqing', 'Tianjin', 'Qingdao', 'Dalian', 'Xiamen'] },
    { code: 'CN-HK', name: 'Hong Kong, China', type: 'region', cities: ['Hong Kong Island', 'Kowloon', 'New Territories', 'Lantau Island', 'Tsuen Wan', 'Tuen Mun', 'Yuen Long', 'North District'] },
    { code: 'CN-TW', name: 'Taiwan, China', type: 'region', cities: ['Taipei', 'Kaohsiung', 'Taichung', 'Tainan', 'Banqiao', 'Hsinchu', 'Keelung', 'Chiayi', 'Taoyuan', 'Changhua', 'Pingtung', 'Hualien', 'Taitung'] },
    { code: 'CN-MO', name: 'Macau, China', type: 'region', cities: ['Macau Peninsula', 'Taipa', 'Coloane', 'Cotai'] },
    { code: 'JP', name: 'Japan', type: 'country', cities: ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Hiroshima', 'Sendai', 'Kawasaki', 'Saitama', 'Chiba', 'Kitakyushu'] },
    { code: 'US', name: 'United States', type: 'country', cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus'] },
    { code: 'GB', name: 'United Kingdom', type: 'country', cities: ['London', 'Birmingham', 'Manchester', 'Liverpool', 'Leeds', 'Sheffield', 'Bristol', 'Glasgow', 'Edinburgh', 'Cardiff', 'Belfast', 'Leicester', 'Bradford', 'Coventry'] },
    { code: 'FR', name: 'France', type: 'country', cities: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Saint-Étienne', 'Toulon'] },
    { code: 'DE', name: 'Germany', type: 'country', cities: ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig', 'Bremen', 'Dresden', 'Hanover', 'Nuremberg'] },
    { code: 'IT', name: 'Italy', type: 'country', cities: ['Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna', 'Florence', 'Venice', 'Verona', 'Trieste', 'Padua', 'Taranto', 'Brescia'] },
    { code: 'KR', name: 'South Korea', type: 'country', cities: ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Suwon', 'Ulsan', 'Changwon', 'Goyang', 'Yongin', 'Bucheon', 'Ansan', 'Cheongju'] },
    { code: 'AU', name: 'Australia', type: 'country', cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Canberra', 'Newcastle', 'Wollongong', 'Hobart', 'Geelong', 'Townsville', 'Cairns', 'Darwin'] },
    { code: 'CA', name: 'Canada', type: 'country', cities: ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener', 'London', 'Victoria', 'Halifax', 'Oshawa'] },
    { code: 'SG', name: 'Singapore', type: 'country', cities: ['Singapore'] },
    { code: 'MY', name: 'Malaysia', type: 'country', cities: ['Kuala Lumpur', 'George Town', 'Johor Bahru', 'Ipoh', 'Shah Alam', 'Petaling Jaya', 'Kuching', 'Kota Kinabalu', 'Malacca City', 'Alor Setar', 'Kuala Terengganu', 'Kuantan', 'Sandakan', 'Tawau'] },
    { code: 'TH', name: 'Thailand', type: 'country', cities: ['Bangkok', 'Chiang Mai', 'Pattaya', 'Phuket', 'Khon Kaen', 'Udon Thani', 'Hat Yai', 'Nakhon Ratchasima', 'Surat Thani', 'Nakhon Si Thammarat', 'Ubon Ratchathani', 'Songkhla', 'Pathum Thani', 'Samut Prakan'] },
    { code: 'VN', name: 'Vietnam', type: 'country', cities: ['Hanoi', 'Ho Chi Minh City', 'Da Nang', 'Haiphong', 'Can Tho', 'Bien Hoa', 'Nha Trang', 'Hue', 'Vung Tau', 'Qui Nhon', 'Rach Gia', 'Long Xuyen', 'Thai Nguyen', 'Nam Dinh'] },
    { code: 'PH', name: 'Philippines', type: 'country', cities: ['Manila', 'Quezon City', 'Davao City', 'Caloocan', 'Cebu City', 'Zamboanga City', 'Taguig', 'Antipolo', 'Pasig', 'Valenzuela', 'Dasmarinas', 'Parañaque', 'Bacoor', 'General Santos'] },
    { code: 'ID', name: 'Indonesia', type: 'country', cities: ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Makassar', 'Palembang', 'Depok', 'Tangerang', 'South Tangerang', 'Semarang', 'Makassar', 'Batam', 'Pekanbaru'] },
    { code: 'IN', name: 'India', type: 'country', cities: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Visakhapatnam'] }
];

// Initialize application
function initApp() {
    // Setup form submission
    const filmForm = document.getElementById('film-form');
    filmForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveFilmRecord();
    });
    
    // Setup country change event
    const countrySelect = document.getElementById('country');
    countrySelect.addEventListener('change', function() {
        updateCities(this.value);
    });
    
    // Initialize toast notifications
    initToast();
}

// Initialize Select2
function initSelect2() {
    // Initialize country select
    $('#country').select2({
        placeholder: 'Select country/region',
        allowClear: true,
        width: '100%',
        theme: 'default'
    });
    
    // Initialize city select
    $('#city').select2({
        placeholder: 'Select city',
        allowClear: true,
        width: '100%',
        theme: 'default',
        disabled: true
    });
    
    // Populate countries/regions
    const countrySelect = document.getElementById('country');
    countriesRegions.forEach(country => {
        const option = document.createElement('option');
        option.value = country.code;
        option.textContent = country.name;
        countrySelect.appendChild(option);
    });
}

// Update cities based on selected country
function updateCities(countryCode) {
    const citySelect = document.getElementById('city');
    const select2City = $('#city');
    
    if (!countryCode) {
        citySelect.disabled = true;
        select2City.prop('disabled', true);
        select2City.empty();
        select2City.append('<option value="">Select country/region first</option>');
        select2City.val('').trigger('change');
        return;
    }
    
    // Find selected country/region
    const country = countriesRegions.find(c => c.code === countryCode);
    if (!country) return;
    
    // Enable city select
    citySelect.disabled = false;
    select2City.prop('disabled', false);
    
    // Clear existing options
    select2City.empty();
    select2City.append('<option value="">Select city</option>');
    
    // Add cities
    country.cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
    });
    
    select2City.val('').trigger('change');
}

// Page Navigation Functions
function showCoverflowPage() {
    switchPage('coverflow-page');
    initCoverFlow();
}

function showListPage() {
    switchPage('list-page');
    renderRecordsList();
}

function showAddPage() {
    switchPage('add-page');
}

function showStatsPage() {
    switchPage('stats-page');
    updateStatistics();
}

function switchPage(pageId) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const selectedPage = document.getElementById(pageId);
    if (selectedPage) {
        selectedPage.classList.add('active');
        
        // Show/hide bottom nav
        const bottomNav = document.getElementById('bottom-nav');
        if (bottomNav) {
            if (pageId === 'coverflow-page') {
                bottomNav.style.display = 'none';  // Hide on coverflow
            } else {
                bottomNav.style.display = 'flex';  // Show on other pages
            }
        }
        
        // Show/hide back buttons
        const backButtons = document.querySelectorAll('.back-btn');
        backButtons.forEach(btn => {
            if (pageId === 'coverflow-page') {
                btn.style.display = 'none';  // Hide on coverflow
            } else {
                btn.style.display = 'flex';  // Show on other pages
            }
        });
        
        showToast(`Switched to ${selectedPage.querySelector('h2')?.textContent || 'Home'}`, 'info');
    }
}

// Cover Flow Functions
function initCoverFlow() {
    // Filter films that have photos
    const filmsWithPhotos = films.filter(film => film.photos && film.photos.length > 0);
    
    if (filmsWithPhotos.length === 0) {
        const track = document.getElementById('coverflow-track');
        track.innerHTML = `
            <div class="coverflow-empty">
                <div class="empty-icon">
                    <i class="fas fa-camera"></i>
                </div>
                <h3>No photos yet</h3>
                <p>Add your first film record to start the gallery</p>
                <button class="btn btn-primary" onclick="showListPage()">
                    <i class="fas fa-list"></i> Go to Records
                </button>
            </div>
        `;
        document.getElementById('camera-info').textContent = '-';
        document.getElementById('film-info').textContent = '-';
        return;
    }
    
    // Create array of all photos with their film info
    let allPhotos = [];
    filmsWithPhotos.forEach(film => {
        film.photos.forEach((photo, photoIndex) => {
            allPhotos.push({
                image: photo,
                film: film,
                photoIndex: photoIndex
            });
        });
    });
    
    // Clear track
    const track = document.getElementById('coverflow-track');
    track.innerHTML = '';
    
    // Create cover flow items
    allPhotos.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'coverflow-item';
        itemElement.dataset.index = index;
        
        itemElement.innerHTML = `
            <img src="${item.image}" alt="Film photo ${index + 1}">
        `;
        
        track.appendChild(itemElement);
    });
    
    // Set initial position
    currentCoverFlowIndex = Math.floor(allPhotos.length / 2);
    updateCoverFlow();
    
    // Setup swipe events
    setupSwipeEvents();
}

function updateCoverFlow() {
    const items = document.querySelectorAll('.coverflow-item');
    const totalItems = items.length;
    
    if (totalItems === 0) return;
    
    // Get current photo info
    const filmsWithPhotos = films.filter(film => film.photos && film.photos.length > 0);
    let photoCount = 0;
    let currentFilm = null;
    let currentPhotoIndex = 0;
    
    for (const film of filmsWithPhotos) {
        if (currentCoverFlowIndex < photoCount + film.photos.length) {
            currentFilm = film;
            currentPhotoIndex = currentCoverFlowIndex - photoCount;
            break;
        }
        photoCount += film.photos.length;
    }
    
    // Update photo info
    if (currentFilm) {
        document.getElementById('camera-info').textContent = currentFilm.camera || 'Unknown Camera';
        document.getElementById('film-info').textContent = currentFilm.name || 'Unknown Film';
    }
    
    // Update item positions
    items.forEach((item, index) => {
        // Remove all position classes
        item.classList.remove('center', 'left-1', 'left-2', 'left-3', 'right-1', 'right-2', 'right-3');
        
        const distance = index - currentCoverFlowIndex;
        
        if (distance === 0) {
            item.classList.add('center');
        } else if (distance === -1) {
            item.classList.add('left-1');
        } else if (distance === -2) {
            item.classList.add('left-2');
        } else if (distance === -3) {
            item.classList.add('left-3');
        } else if (distance === 1) {
            item.classList.add('right-1');
        } else if (distance === 2) {
            item.classList.add('right-2');
        } else if (distance === 3) {
            item.classList.add('right-3');
        } else if (distance < -3) {
            item.style.display = 'none';
        } else if (distance > 3) {
            item.style.display = 'none';
        } else {
            item.style.display = 'block';
        }
    });
}

function setupSwipeEvents() {
    const track = document.getElementById('coverflow-track');
    let startX = 0;
    let isDragging = false;
    
    // Mouse events
    track.addEventListener('mousedown', (e) => {
        startX = e.clientX;
        isDragging = true;
        track.style.cursor = 'grabbing';
    });
    
    track.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
    });
    
    track.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        
        const endX = e.clientX;
        const diffX = startX - endX;
        
        if (Math.abs(diffX) > 50) {
            if (diffX > 0) {
                // Swipe left
                navigateCoverFlow(1);
            } else {
                // Swipe right
                navigateCoverFlow(-1);
            }
        }
        
        isDragging = false;
        track.style.cursor = 'grab';
    });
    
    track.addEventListener('mouseleave', () => {
        isDragging = false;
        track.style.cursor = 'grab';
    });
    
    // Touch events
    track.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
    });
    
    track.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
    });
    
    track.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        
        const endX = e.changedTouches[0].clientX;
        const diffX = startX - endX;
        
        if (Math.abs(diffX) > 30) {
            if (diffX > 0) {
                // Swipe left
                navigateCoverFlow(1);
            } else {
                // Swipe right
                navigateCoverFlow(-1);
            }
        }
        
        isDragging = false;
    });
    
    // Keyboard events
    document.addEventListener('keydown', (e) => {
        if (document.getElementById('coverflow-page').classList.contains('active')) {
            if (e.key === 'ArrowLeft') {
                navigateCoverFlow(-1);
            } else if (e.key === 'ArrowRight') {
                navigateCoverFlow(1);
            }
        }
    });
}

function navigateCoverFlow(direction) {
    const items = document.querySelectorAll('.coverflow-item');
    const totalItems = items.length;
    
    if (totalItems === 0) return;
    
    currentCoverFlowIndex += direction;
    
    // Wrap around
    if (currentCoverFlowIndex < 0) {
        currentCoverFlowIndex = totalItems - 1;
    } else if (currentCoverFlowIndex >= totalItems) {
        currentCoverFlowIndex = 0;
    }
    
    updateCoverFlow();
}

// Records List Functions
function renderRecordsList() {
    const container = document.getElementById('records-container');
    
    if (films.length === 0) {
        container.innerHTML = `
            <div class="empty-list">
                <div class="empty-icon">
                    <i class="fas fa-film"></i>
                </div>
                <h3>No records yet</h3>
                <p>Add your first film record</p>
                <button class="btn btn-primary" onclick="showAddPage()">
                    <i class="fas fa-plus"></i> Add First Record
                </button>
            </div>
        `;
        return;
    }
    
    // Sort films by date (newest first)
    const sortedFilms = [...films].sort((a, b) => {
        return new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt);
    });
    
    // Create records list
    container.innerHTML = sortedFilms.map(film => `
        <div class="record-item">
            <div class="record-photos">
                ${film.photos && film.photos.length > 0 ? 
                    film.photos.map(photo => `
                        <div class="record-photo">
                            <img src="${photo}" alt="Film photo">
                        </div>
                    `).join('') : 
                    '<div class="record-photo" style="display: flex; align-items: center; justify-content: center; color: var(--label-tertiary);"><i class="fas fa-image"></i></div>'
                }
            </div>
            <div class="record-info">
                <div class="record-camera">${film.camera || 'Unknown Camera'}</div>
                <div class="record-film">${film.name || 'Unknown Film'}</div>
                <div class="record-date">
                    <i class="fas fa-calendar"></i>
                    ${formatDate(film.date || film.createdAt)}
                </div>
                ${film.city ? `
                    <div class="record-location">
                        <i class="fas fa-map-marker-alt"></i>
                        ${film.city}${film.country ? `, ${getCountryName(film.country)}` : ''}
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function getCountryName(countryCode) {
    const country = countriesRegions.find(c => c.code === countryCode);
    return country ? country.name : countryCode;
}



保存 app.js 文件后，告诉我，我再发第二部分代码。
好啦继续吧
回复 权威燕: 
好啦继续吧
现在发送 app.js 的第二部分（最终部分）：
📄 第三步：更新 app.js（第二部分）
在GitHub上编辑 app.js 文件，在现有代码的末尾追加以下内容：

// Photo Upload Functions
function triggerUpload(boxNumber) {
    document.getElementById(`photo-${boxNumber}`).click();
}

function handlePhotoUpload(boxNumber, input) {
    const file = input.files[0];
    if (!file) return;
    
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
        showToast('Please upload image files', 'error');
        return;
    }
    
    // 检查文件大小（最大50MB，压缩后会变小）
    if (file.size > 50 * 1024 * 1024) {
        showToast('Image size should be less than 50MB', 'error');
        return;
    }
    
    // 创建Canvas进行压缩
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // 计算压缩尺寸 - 针对胶片照片优化
            const maxWidth = 1920; // 最大宽度，适合4K显示
            const maxHeight = 1920; // 最大高度
            let width = img.width;
            let height = img.height;
            
            // 计算缩放比例，保持宽高比
            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width = Math.floor(width * ratio);
                height = Math.floor(height * ratio);
            }
            
            // 创建Canvas
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            
            // 绘制图片
            const ctx = canvas.getContext('2d');
            
            // 设置高质量压缩
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            
            // 填充白色背景（防止透明背景变黑）
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);
            
            // 绘制图片
            ctx.drawImage(img, 0, 0, width, height);
            
            // 压缩质量设置（针对胶片照片优化）
            let quality = 0.75; // 75%质量，平衡画质和文件大小
            
            // 如果是JPEG，使用更高压缩
            if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
                quality = 0.7; // JPEG 70%质量
            }
            
            // 转换为DataURL
            canvas.toBlob(function(blob) {
                const compressedReader = new FileReader();
                compressedReader.onload = function(e) {
                    uploadedPhotos[boxNumber] = e.target.result;
                    updatePhotoPreview(boxNumber, e.target.result);
                    
                    // 显示压缩信息
                    const originalSize = (file.size / 1024 / 1024).toFixed(2);
                    const compressedSize = (blob.size / 1024 / 1024).toFixed(2);
                    const compressionRatio = ((1 - blob.size / file.size) * 100).toFixed(1);
                    
                    showToast(`Photo ${boxNumber}: ${originalSize}MB → ${compressedSize}MB (compressed ${compressionRatio}%)`, 'success');
                };
                compressedReader.readAsDataURL(blob);
            }, file.type, quality);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function updatePhotoPreview(boxNumber, imageData) {
    const uploadBox = document.getElementById(`upload-box-${boxNumber}`);
    const previewContainer = document.getElementById('photo-preview');
    
    // Hide upload box
    uploadBox.style.display = 'none';
    
    // Create preview element
    let previewElement = document.getElementById(`preview-${boxNumber}`);
    if (!previewElement) {
        previewElement = document.createElement('div');
        previewElement.id = `preview-${boxNumber}`;
        previewElement.className = 'preview-image';
        previewContainer.appendChild(previewElement);
    }
    
    previewElement.innerHTML = `
        <img src="${imageData}" alt="Preview ${boxNumber}">
        <button class="remove-photo" onclick="removePhoto(${boxNumber})">
            <i class="fas fa-times"></i>
        </button>
    `;
}

function removePhoto(boxNumber) {
    uploadedPhotos[boxNumber] = null;
    
    // Show upload box
    const uploadBox = document.getElementById(`upload-box-${boxNumber}`);
    uploadBox.style.display = 'flex';
    
    // Remove preview
    const previewElement = document.getElementById(`preview-${boxNumber}`);
    if (previewElement) {
        previewElement.remove();
    }
    
    showToast(`Photo ${boxNumber} removed`, 'warning');
}

// Save Film Record
function saveFilmRecord() {
    // Get form values
    const filmName = document.getElementById('film-name').value.trim();
    const filmType = document.getElementById('film-type').value;
    const iso = document.getElementById('iso').value;
    const camera = document.getElementById('camera').value.trim();
    const dateShot = document.getElementById('date-shot').value;
    const country = document.getElementById('country').value;
    const city = document.getElementById('city').value;
    const notes = document.getElementById('notes').value.trim();
    
    // Validate required fields
    if (!filmName || !filmType) {
        showToast('Please fill in Film Name and Film Type', 'error');
        return;
    }
    
    if (!country) {
        showToast('Please select a country/region', 'error');
        return;
    }
    
    if (!city) {
        showToast('Please select a city', 'error');
        return;
    }
    
    // Collect uploaded photos
    const photos = [];
    for (let i = 1; i <= 3; i++) {
        if (uploadedPhotos[i]) {
            photos.push(uploadedPhotos[i]);
        }
    }
    
    // Create film object
    const film = {
        id: Date.now(),
        name: filmName,
        type: filmType,
        iso: iso || null,
        camera: camera || null,
        date: dateShot || new Date().toISOString().split('T')[0],
        country: country,
        city: city,
        notes: notes || null,
        photos: photos,
        createdAt: new Date().toISOString()
    };
    
    // Add to films array
    films.push(film);
    
    // Save to localStorage
    saveFilms();
    
    // Reset form
    resetForm();
    
    // Show success message
    showToast(`"${filmName}" saved successfully!`, 'success');
    
    // Switch to list page
    setTimeout(() => {
        showListPage();
    }, 1000);
}

// Reset form
function resetForm() {
    document.getElementById('film-form').reset();
    
    // Reset photos
    for (let i = 1; i <= 3; i++) {
        uploadedPhotos[i] = null;
        const uploadBox = document.getElementById(`upload-box-${i}`);
        if (uploadBox) uploadBox.style.display = 'flex';
    }
    
    // Clear previews
    const previewContainer = document.getElementById('photo-preview');
    previewContainer.innerHTML = '';
    
    // Reset city select
    $('#city').prop('disabled', true).empty().append('<option value="">Select country/region first</option>').val('').trigger('change');
}

// Save films to localStorage
function saveFilms() {
    try {
        localStorage.setItem('filmFlowRecords', JSON.stringify(films));
    } catch (e) {
        showToast('Error saving data: ' + e.message, 'error');
    }
}

// Load films from localStorage
function loadFilms() {
    try {
        const saved = localStorage.getItem('filmFlowRecords');
        if (saved) {
            films = JSON.parse(saved);
            
            // Ensure photos are properly loaded
            films.forEach(film => {
                if (!film.photos) film.photos = [];
            });
        }
    } catch (e) {
        showToast('Error loading data: ' + e.message, 'error');
        films = [];
    }
}

// Update statistics
function updateStatistics() {
    // Update overview stats
    document.getElementById('stat-total').textContent = films.length;
    
    // Count unique cameras
    const cameras = new Set();
    films.forEach(film => {
        if (film.camera) cameras.add(film.camera);
    });
    document.getElementById('stat-cameras').textContent = cameras.size;
    
    // Count unique cities
    const cities = new Set();
    films.forEach(film => {
        if (film.city) cities.add(film.city);
    });
    document.getElementById('stat-cities').textContent = cities.size;
    
    // Update detailed stats
    updateCameraStats();
    updateFilmStats();
    updateCityStats();
    updateTypeStats();
}

// Update camera statistics
function updateCameraStats() {
    const cameraStats = document.getElementById('camera-stats');
    
    if (films.length === 0) {
        cameraStats.innerHTML = `
            <div class="empty-stat">
                <i class="fas fa-camera-slash"></i>
                <p>No camera data yet</p>
            </div>
        `;
        return;
    }
    
    // Count films by camera
    const cameraCount = {};
    films.forEach(film => {
        if (film.camera) {
            cameraCount[film.camera] = (cameraCount[film.camera] || 0) + 1;
        }
    });
    
    // Create bar chart
    let html = '';
    const cameras = Object.keys(cameraCount).sort((a, b) => cameraCount[b] - cameraCount[a]);
    
    cameras.forEach(camera => {
        const count = cameraCount[camera];
        const percentage = (count / films.length) * 100;
        
        html += `
            <div class="bar-item">
                <div class="bar-label">
                    <span>${camera}</span>
                    <span>${count} roll${count > 1 ? 's' : ''}</span>
                </div>
                <div class="bar-container">
                    <div class="bar-fill" style="width: ${percentage}%"></div>
                    <div class="bar-value">${Math.round(percentage)}%</div>
                </div>
            </div>
        `;
    });
    
    cameraStats.innerHTML = html;
}

// Update film statistics
function updateFilmStats() {
    const filmStats = document.getElementById('film-stats');
    
    if (films.length === 0) {
        filmStats.innerHTML = `
            <div class="empty-stat">
                <i class="fas fa-film"></i>
                <p>No film data yet</p>
            </div>
        `;
        return;
    }
    
    // Count films by name
    const filmCount = {};
    films.forEach(film => {
        filmCount[film.name] = (filmCount[film.name] || 0) + 1;
    });
    
    // Create bar chart
    let html = '';
    const filmNames = Object.keys(filmCount).sort((a, b) => filmCount[b] - filmCount[a]);
    
    filmNames.forEach(filmName => {
        const count = filmCount[filmName];
        const percentage = (count / films.length) * 100;
        
        html += `
            <div class="bar-item">
                <div class="bar-label">
                    <span>${filmName}</span>
                    <span>${count} roll${count > 1 ? 's' : ''}</span>
                </div>
                <div class="bar-container">
                    <div class="bar-fill" style="width: ${percentage}%"></div>
                    <div class="bar-value">${Math.round(percentage)}%</div>
                </div>
            </div>
        `;
    });
    
    filmStats.innerHTML = html;
}

// Update city statistics
function updateCityStats() {
    const cityStats = document.getElementById('city-stats');
    
    if (films.length === 0) {
        cityStats.innerHTML = `
            <div class="empty-stat">
                <i class="fas fa-map-marker-alt"></i>
                <p>No city data yet</p>
            </div>
        `;
        return;
    }
    
    // Count films by city
    const cityCount = {};
    films.forEach(film => {
        if (film.city) {
            cityCount[film.city] = (cityCount[film.city] || 0) + 1;
        }
    });
    
    // Create bar chart
    let html = '';
    const cities = Object.keys(cityCount).sort((a, b) => cityCount[b] - cityCount[a]);
    
    cities.forEach(city => {
        const count = cityCount[city];
        const percentage = (count / films.length) * 100;
        
        html += `
            <div class="bar-item">
                <div class="bar-label">
                    <span>${city}</span>
                    <span>${count} roll${count > 1 ? 's' : ''}</span>
                </div>
                <div class="bar-container">
                    <div class="bar-fill" style="width: ${percentage}%"></div>
                    <div class="bar-value">${Math.round(percentage)}%</div>
                </div>
            </div>
        `;
    });
    
    cityStats.innerHTML = html;
}

// Update film type statistics
function updateTypeStats() {
    const typeStats = document.getElementById('type-stats');
    
    if (films.length === 0) {
        typeStats.innerHTML = `
            <div class="empty-stat">
                <i class="fas fa-chart-pie"></i>
                <p>No type data yet</p>
            </div>
        `;
        return;
    }
    
    // Count films by type
    const typeCount = {};
    films.forEach(film => {
        typeCount[film.type] = (typeCount[film.type] || 0) + 1;
    });
    
    // Create pie chart (simplified)
    let html = '<div class="pie-chart">';
    const types = Object.keys(typeCount);
    let startAngle = 0;
    
    // Colors for pie chart
    const colors = ['#0a84ff', '#30d158', '#ff9f0a', '#ff375f', '#bf5af2', '#5e5ce6'];
    
    types.forEach((type, index) => {
        const count = typeCount[type];
        const percentage = (count / films.length) * 100;
        const angle = (percentage / 100) * 360;
        
        html += `
            <div class="pie-segment" style="
                --start-angle: ${startAngle}deg;
                --end-angle: ${startAngle + angle}deg;
                --color: ${colors[index % colors.length]};
            ">
                <div class="segment-label">${type} (${count})</div>
            </div>
        `;
        
        startAngle += angle;
    });
    
    html += '</div>';
    typeStats.innerHTML = html;
}

// Format date
function formatDate(dateString) {
    if (!dateString) return 'Unknown date';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Toast notification system
function initToast() {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    // Create toast if it doesn't exist
    if (!toast) {
        const toastElement = document.createElement('div');
        toastElement.id = 'toast';
        toastElement.className = 'toast';
        toastElement.innerHTML = `
            <div class="toast-content">
                <i class="toast-icon"></i>
                <span class="toast-message"></span>
            </div>
        `;
        document.body.appendChild(toastElement);
    }
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    // Set icon based on type
    const iconMap = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    const toastIcon = toast.querySelector('.toast-icon');
    const toastMessage = toast.querySelector('.toast-message');
    
    toastIcon.className = `toast-icon ${iconMap[type] || iconMap.info}`;
    toastMessage.textContent = message;
    
    // Show toast
    toast.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Export data function
function exportData() {
    const data = {
        version: '2.0',
        app: 'Film Flow',
        exportedAt: new Date().toISOString(),
        totalFilms: films.length,
        films: films
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `film-flow-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Data exported successfully!', 'success');
}

// Import data function
function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                
                if (!data.films || !Array.isArray(data.films)) {
                    throw new Error('Invalid file format');
                }
                
        if (confirm(`Import ${data.films.length} film records? This will replace your current data.`)) {
                    films = data.films;
                    saveFilms();
                    initCoverFlow();
                    renderRecordsList();
                    updateStatistics();
                    showToast(`Imported ${data.films.length} films`, 'success');
                }
            } catch (error) {
                showToast('Error importing: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

// Add CSS for statistics and pie chart
const statsStyle = document.createElement('style');
statsStyle.textContent = `
    .bar-item {
        margin-bottom: 12px;
    }
    
    .bar-label {
        font-size: 14px;
        margin-bottom: 4px;
        color: var(--label-secondary);
        display: flex;
        justify-content: space-between;
    }
    
    .bar-container {
        height: 8px;
        background: var(--tertiary-background);
        border-radius: 4px;
        overflow: hidden;
        position: relative;
    }
    
    .bar-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--accent-color), var(--accent-secondary));
        border-radius: 4px;
        transition: width 0.5s ease;
    }
    
    .bar-value {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--label-primary);
    }
    
    .pie-chart {
        width: 200px;
        height: 200px;
        border-radius: 50%;
        position: relative;
        margin: 0 auto;
        background: conic-gradient(
            var(--color1, #0a84ff) 0% 30%,
            var(--color2, #30d158) 30% 60%,
            var(--color3, #ff9f0a) 60% 100%
        );
    }
    
    .pie-segment {
        position: absolute;
        width: 100%;
        height: 100%;
        clip-path: polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%);
        transform: rotate(var(--start-angle, 0deg));
    }
    
    .segment-label {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 12px;
        font-weight: 600;
        color: white;
        text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }
`;
document.head.appendChild(statsStyle);

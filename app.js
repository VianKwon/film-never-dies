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

// Country and city data
const countries = [
    { code: 'CN', name: 'China', cities: ['Beijing', 'Shanghai', 'Guangzhou', 'Shenzhen', 'Chengdu', 'Hangzhou', 'Nanjing', 'Wuhan', 'Xi\'an', 'Chongqing'] },
    { code: 'JP', name: 'Japan', cities: ['Tokyo', 'Osaka', 'Kyoto', 'Yokohama', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Hiroshima', 'Sendai'] },
    { code: 'US', name: 'United States', cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'] },
    { code: 'GB', name: 'United Kingdom', cities: ['London', 'Birmingham', 'Manchester', 'Liverpool', 'Leeds', 'Sheffield', 'Bristol', 'Glasgow', 'Edinburgh', 'Cardiff'] },
    { code: 'FR', name: 'France', cities: ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille'] },
    { code: 'DE', name: 'Germany', cities: ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig'] },
    { code: 'IT', name: 'Italy', cities: ['Rome', 'Milan', 'Naples', 'Turin', 'Palermo', 'Genoa', 'Bologna', 'Florence', 'Venice', 'Verona'] },
    { code: 'KR', name: 'South Korea', cities: ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Suwon', 'Ulsan', 'Changwon', 'Goyang'] },
    { code: 'AU', name: 'Australia', cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Canberra', 'Newcastle', 'Wollongong', 'Hobart'] },
    { code: 'CA', name: 'Canada', cities: ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener'] },
    { code: 'TW', name: 'Taiwan', cities: ['Taipei', 'Kaohsiung', 'Taichung', 'Tainan', 'Banqiao', 'Hsinchu', 'Keelung', 'Chiayi', 'Taoyuan', 'Changhua'] },
    { code: 'HK', name: 'Hong Kong', cities: ['Hong Kong Island', 'Kowloon', 'New Territories', 'Lantau Island'] },
    { code: 'MO', name: 'Macau', cities: ['Macau Peninsula', 'Taipa', 'Coloane'] },
    { code: 'SG', name: 'Singapore', cities: ['Singapore'] },
    { code: 'MY', name: 'Malaysia', cities: ['Kuala Lumpur', 'George Town', 'Johor Bahru', 'Ipoh', 'Shah Alam', 'Petaling Jaya', 'Kuching', 'Kota Kinabalu', 'Malacca City', 'Alor Setar'] },
    { code: 'TH', name: 'Thailand', cities: ['Bangkok', 'Chiang Mai', 'Pattaya', 'Phuket', 'Khon Kaen', 'Udon Thani', 'Hat Yai', 'Nakhon Ratchasima', 'Surat Thani', 'Nakhon Si Thammarat'] },
    { code: 'VN', name: 'Vietnam', cities: ['Hanoi', 'Ho Chi Minh City', 'Da Nang', 'Haiphong', 'Can Tho', 'Bien Hoa', 'Nha Trang', 'Hue', 'Vung Tau', 'Qui Nhon'] },
    { code: 'PH', name: 'Philippines', cities: ['Manila', 'Quezon City', 'Davao City', 'Caloocan', 'Cebu City', 'Zamboanga City', 'Taguig', 'Antipolo', 'Pasig', 'Valenzuela'] },
    { code: 'ID', name: 'Indonesia', cities: ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Makassar', 'Palembang', 'Depok', 'Tangerang', 'South Tangerang'] },
    { code: 'IN', name: 'India', cities: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur'] }
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
        placeholder: 'Select country',
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
    
    // Populate countries
    const countrySelect = document.getElementById('country');
    countries.forEach(country => {
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
        select2City.append('<option value="">Select country first</option>');
        select2City.val('').trigger('change');
        return;
    }
    
    // Find selected country
    const country = countries.find(c => c.code === countryCode);
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
    const country = countries.find(c => c.code === countryCode);
    return country ? country.name : countryCode;
}

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
        placeholder: 'Select country',
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
    
    // Populate countries
    const countrySelect = document.getElementById('country');
    countries.forEach(country => {
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
        select2City.append('<option value="">Select country first</option>');
        select2City.val('').trigger('change');
        return;
    }
    
    // Find selected country
    const country = countries.find(c => c.code === countryCode);
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
    const country = countries.find(c => c.code === countryCode);
    return country ? country.name : countryCode;
}

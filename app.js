// Film Flow - Film Photography Journal
// Complete Application Logic - Part 1 of 2

/* ====== GLOBAL VARIABLES ====== */
let films = [];
let currentCoverFlowIndex = 0;
let uploadedPhotos = {
    1: null,
    2: null,
    3: null
};
let coverflowPhotos = [];

/* ====== LOCAL STORAGE KEYS ====== */
const STORAGE_KEYS = {
    records: 'filmFlowRecords',
    cameras: 'filmFlowCameras',
    filmNames: 'filmFlowFilmNames'
};

/* ====== HELPERS ====== */
function normalizeText(value) {
    if (value === null || value === undefined) return '';
    return String(value).trim().replace(/\s+/g, ' ');
}

function loadStringArray(key) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return [];
        const arr = JSON.parse(raw);
        if (!Array.isArray(arr)) return [];
        return arr.map(normalizeText).filter(Boolean);
    } catch (e) {
        return [];
    }
}

function saveStringArray(key, arr) {
    try {
        localStorage.setItem(key, JSON.stringify(arr));
    } catch (e) {
        console.error('❌ Error saving list:', key, e);
    }
}

function upsertHistoryValue(arr, value, max = 30) {
    const v = normalizeText(value);
    if (!v) return arr;
    const lower = v.toLowerCase();
    const filtered = arr.filter(x => normalizeText(x).toLowerCase() !== lower);
    filtered.unshift(v);
    return filtered.slice(0, max);
}

function addOptionIfMissing(selectId, value) {
    const v = normalizeText(value);
    if (!v) return;
    const el = document.getElementById(selectId);
    if (!el) return;
    const exists = Array.from(el.options).some(opt => normalizeText(opt.value).toLowerCase() === v.toLowerCase());
    if (!exists) {
        const opt = document.createElement('option');
        opt.value = v;
        opt.textContent = v;
        el.appendChild(opt);
    }
}

/* ====== COUNTRY/REGION AND CITY DATA ====== */
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

/* ====== MOBILE DETECTION ====== */
const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|Windows Phone/i.test(navigator.userAgent);
const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
const isAndroid = /Android/i.test(navigator.userAgent);

/* Popular countries/regions shown in dropdown (still supports free input via tags) */
const POPULAR_COUNTRY_CODES = [
    'CN', 'CN-HK', 'CN-TW',
    'JP', 'KR', 'SG', 'TH',
    'US', 'GB', 'FR', 'DE', 'IT',
    'AU', 'CA'
];

/* ====== INITIALIZATION ====== */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎬 Film Flow: DOM loaded, starting initialization...');
    
    // Mobile optimizations
    if (isMobile) {
        setupMobileEvents();
        console.log('📱 Mobile device detected:', isIOS ? 'iOS' : isAndroid ? 'Android' : 'Other');
    }
    
    // Load existing films
    loadFilms();
    
    // Setup navigation
    setupNavigation();

    // Setup coverflow buttons (keep swipe + buttons)
    setupCoverflowControls();
    
    // Initialize Select2 (wait for jQuery to load)
    setTimeout(() => {
        initSelect2();
    }, 500);
    
    // Setup file input change events
    setTimeout(() => {
        for (let i = 1; i <= 3; i++) {
            const fileInput = document.getElementById(`photo-${i}`);
            if (fileInput) {
                fileInput.addEventListener('change', function(e) {
                    console.log(`📁 File selected for box ${i}`);
                    handlePhotoUpload(i, this);
                });
                console.log(`✅ File input ${i} setup complete`);
            }
        }
    }, 100);
    
    // Setup form submission
    setupForm();
    
    // Show initial page
    showCoverflowPage();
    
    console.log('✅ Film Flow initialization complete!');
});

function setupCoverflowControls() {
    const prevBtn = document.getElementById('coverflow-prev');
    const nextBtn = document.getElementById('coverflow-next');
    const shuffleBtn = document.getElementById('coverflow-shuffle');
    if (prevBtn) {
        prevBtn.onclick = function(e) {
            e.preventDefault();
            navigateCoverFlow(-1);
        };
    }
    if (nextBtn) {
        nextBtn.onclick = function(e) {
            e.preventDefault();
            navigateCoverFlow(1);
        };
    }
    if (shuffleBtn) {
        shuffleBtn.onclick = function(e) {
            e.preventDefault();
            if (!coverflowPhotos || coverflowPhotos.length === 0) return;
            currentCoverFlowIndex = Math.floor(Math.random() * coverflowPhotos.length);
            updateCoverFlow();
        };
    }
}

/* ====== PAGE NAVIGATION FUNCTIONS ====== */
function showCoverflowPage() {
    console.log('📱 Switching to Cover Flow page');
    switchPage('coverflow-page');
    initCoverFlow();
}

function showListPage() {
    console.log('📱 Switching to List page');
    switchPage('list-page');
    renderRecordsList();
}

function showAddPage() {
    console.log('📱 Switching to Add page');
    switchPage('add-page');
}

function showStatsPage() {
    console.log('📱 Switching to Stats page');
    switchPage('stats-page');
    updateStatistics();
}

function switchPage(pageId) {
    console.log(`🔄 Switching to page: ${pageId}`);
    
    // 1. Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
        page.style.display = 'none';
    });
    
    // 2. Show selected page
    const selectedPage = document.getElementById(pageId);
    if (selectedPage) {
        selectedPage.classList.add('active');
        selectedPage.style.display = 'block';
        
        // 3. Update bottom nav active state
        const tabs = document.querySelectorAll('.tab');
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.target === pageId);
        });
        
        console.log(`✅ Page ${pageId} is now visible`);
    } else {
        console.error(`❌ Page ${pageId} not found!`);
    }
}

/* ====== NAVIGATION SETUP ====== */
function setupNavigation() {
    console.log('🔗 Setting up navigation...');
    
    // Bottom navigation tabs (demo-like)
    const tabs = document.querySelectorAll('.tab');
    console.log(`Found ${tabs.length} bottom tabs`);
    tabs.forEach(tab => {
        tab.onclick = function(e) {
            e.preventDefault();
            const target = this.dataset.target;
            if (!target) return;
            console.log(`🔘 Tab clicked -> ${target}`);
            if (target === 'coverflow-page') showCoverflowPage();
            else if (target === 'list-page') showListPage();
            else if (target === 'add-page') showAddPage();
            else if (target === 'stats-page') showStatsPage();
            else switchPage(target);
        };
    });
    
    console.log('✅ Navigation setup complete');
}

/* ====== SELECT2 INITIALIZATION ====== */
function initSelect2() {
    console.log('🌍 Initializing Select2...');
    
    // Check if jQuery and Select2 are loaded
    if (typeof jQuery === 'undefined') {
        console.error('❌ jQuery not loaded! Please check index.html');
        return;
    }
    
    if (typeof jQuery.fn.select2 === 'undefined') {
        console.error('❌ Select2 not loaded! Please check index.html');
        return;
    }
    
    console.log('✅ jQuery and Select2 are loaded');
    
    // 1. First populate countries
    populateCountries();
    
    // 2. Then populate film and camera history
    populateFilmAndCameraHistory();
    
    // 3. Initialize all Select2 elements
    
    // Film name
    $('#film-name').select2({
        placeholder: 'Select or type film name',
        allowClear: true,
        width: '100%',
        theme: 'default',
        tags: true
    });
    
    // Camera model
    $('#camera').select2({
        placeholder: 'Select or type camera model',
        allowClear: true,
        width: '100%',
        theme: 'default',
        tags: true
    });
    
    // Country/region
    $('#country').select2({
        placeholder: 'Select country/region',
        allowClear: true,
        width: '100%',
        theme: 'default',
        tags: true
    });
    
    // City
    $('#city').select2({
        placeholder: 'Select or type city',
        allowClear: true,
        width: '100%',
        theme: 'default',
        tags: true
    });
    
    // Listen for country/region changes
    $('#country').on('change', function() {
        const countryCode = $(this).val();
        console.log('Country/region selected:', countryCode);
        updateCities(countryCode);
    });
    
    console.log('✅ Select2 initialized successfully');
}

function populateFilmAndCameraHistory() {
    // Read from localStorage history lists
    const cameras = loadStringArray(STORAGE_KEYS.cameras);
    const filmNames = loadStringArray(STORAGE_KEYS.filmNames);
    
    console.log('📋 Populating history - Cameras:', cameras);
    console.log('📋 Populating history - Film names:', filmNames);
    
    // Clean and repopulate film names
    const filmSelect = document.getElementById('film-name');
    if (filmSelect) {
        // 清空所有选项
        filmSelect.innerHTML = '';
        // 添加空选项
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        filmSelect.appendChild(emptyOption);
        // 添加历史选项（去重）
        const seenFilmNames = new Set();
        filmNames.forEach(v => {
            if (!seenFilmNames.has(v.toLowerCase())) {
                seenFilmNames.add(v.toLowerCase());
                const option = document.createElement('option');
                option.value = v;
                option.textContent = v;
                filmSelect.appendChild(option);
            }
        });
    }
    
    // Clean and repopulate cameras
    const cameraSelect = document.getElementById('camera');
    if (cameraSelect) {
        // 清空所有选项
        cameraSelect.innerHTML = '';
        // 添加空选项
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        cameraSelect.appendChild(emptyOption);
        // 添加历史选项（去重）
        const seenCameras = new Set();
        cameras.forEach(v => {
            if (!seenCameras.has(v.toLowerCase())) {
                seenCameras.add(v.toLowerCase());
                const option = document.createElement('option');
                option.value = v;
                option.textContent = v;
                cameraSelect.appendChild(option);
            }
        });
    }
}

function populateCountries() {
    const countrySelect = document.getElementById('country');
    if (!countrySelect) {
        console.error('❌ Country select element not found');
        return;
    }
    
    // Clear existing options
    countrySelect.innerHTML = '';
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select country/region';
    countrySelect.appendChild(defaultOption);
    
    // Add popular countries/regions (user can still type custom with tags)
    const popularCountries = countriesRegions.filter(c => POPULAR_COUNTRY_CODES.includes(c.code));
    popularCountries.forEach(country => {
        const option = document.createElement('option');
        option.value = country.code;
        option.textContent = country.name;
        countrySelect.appendChild(option);
    });
    
    console.log(`✅ Populated ${popularCountries.length} popular countries/regions`);
}

function updateCities(countryCode) {
    const citySelect = document.getElementById('city');
    const select2City = $('#city');
    
    // Always allow city input (tags mode); if country matches our preset list, we give suggestions.
    
    // Find selected country/region
    const country = countriesRegions.find(c => c.code === countryCode);
    // Enable city select
    citySelect.disabled = false;
    select2City.prop('disabled', false);
    
    // Clear existing options
    select2City.empty();
    select2City.append('<option value=""></option>');
    
    if (country && Array.isArray(country.cities)) {
        // Add cities (suggestions)
        country.cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
        console.log(`✅ Populated ${country.cities.length} cities for ${country.name}`);
    } else {
        // Country is custom typed (tags); no preset cities
        console.log('ℹ️ Custom country/region selected; city suggestions skipped');
    }

    select2City.val('').trigger('change');
}

/* ====== PHOTO UPLOAD FUNCTIONS ====== */

function handlePhotoUpload(boxNumber, input) {
    const file = input.files[0];
    if (!file) return;
    
    console.log(`📤 Processing photo ${boxNumber}: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    
    // Check file type
    if (!file.type.startsWith('image/')) {
        showToast('Please upload image files only', 'error');
        return;
    }
    
    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
        showToast('Image size should be less than 50MB', 'error');
        return;
    }
    
    // Create reader to load image
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            // Calculate compression dimensions
            const maxWidth = 1920;
            const maxHeight = 1920;
            let width = img.width;
            let height = img.height;
            
            // Maintain aspect ratio
            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width = Math.floor(width * ratio);
                height = Math.floor(height * ratio);
            }
            
            // Create canvas for compression
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            
            const ctx = canvas.getContext('2d');
            
            // White background for transparency
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);
            
            // Draw image
            ctx.drawImage(img, 0, 0, width, height);
            
            // Compression quality (70-75%)
            let quality = 0.75;
            if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
                quality = 0.7;
            }
            
            // Convert to blob
            canvas.toBlob(function(blob) {
                const compressedReader = new FileReader();
                compressedReader.onload = function(e) {
                    // Save compressed image
                    uploadedPhotos[boxNumber] = e.target.result;
                    updatePhotoPreview(boxNumber, e.target.result);
                    
                    // Show compression info
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
    const uploadWrapper = document.getElementById(`upload-wrapper-${boxNumber}`);
    const uploadBox = document.getElementById(`upload-box-${boxNumber}`);
    if (!uploadWrapper || !uploadBox) return;
    
    // Hide upload box
    uploadBox.style.display = 'none';
    
    // Create or update preview element directly in the wrapper
    let previewElement = document.getElementById(`preview-${boxNumber}`);
    if (!previewElement) {
        previewElement = document.createElement('div');
        previewElement.id = `preview-${boxNumber}`;
        previewElement.className = 'preview-image';
        uploadWrapper.appendChild(previewElement);
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
    
    // Show upload box again
    const uploadBox = document.getElementById(`upload-box-${boxNumber}`);
    if (uploadBox) {
        uploadBox.style.display = 'flex';
    }
    
    // Remove preview
    const previewElement = document.getElementById(`preview-${boxNumber}`);
    if (previewElement) {
        previewElement.remove();
    }
    
    // Reset file input
    const fileInput = document.getElementById(`photo-${boxNumber}`);
    if (fileInput) {
        fileInput.value = '';
    }
    
    showToast(`Photo ${boxNumber} removed`, 'warning');
}

// Film Flow - Film Photography Journal
// Complete Application Logic - Part 2 of 2

/* ====== FORM HANDLING ====== */
function setupForm() {
    const filmForm = document.getElementById('film-form');
    if (filmForm) {
        filmForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveFilmRecord();
        });
        console.log('✅ Form submission setup complete');
    }
}

function saveFilmRecord() {
    console.log('💾 Saving film record...');
    
    // Get form values
    const filmName = normalizeText(document.getElementById('film-name').value);
    const filmType = document.getElementById('film-type').value;
    const iso = document.getElementById('iso').value;
    const camera = normalizeText(document.getElementById('camera').value);
    const dateShot = document.getElementById('date-shot').value;
    const country = normalizeText(document.getElementById('country').value);
    const city = normalizeText(document.getElementById('city').value);
    const notes = normalizeText(document.getElementById('notes').value);
    
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

    // Update input histories (camera + film name) to reduce repetitive typing & avoid stats splitting
    if (camera) {
        let cameras = loadStringArray(STORAGE_KEYS.cameras);
        console.log('📷 Before adding camera - history:', cameras);
        cameras = upsertHistoryValue(cameras, camera);
        saveStringArray(STORAGE_KEYS.cameras, cameras);
        console.log('📷 After adding camera - history:', cameras);
    }
    if (filmName) {
        let filmNames = loadStringArray(STORAGE_KEYS.filmNames);
        console.log('🎞️ Before adding film - history:', filmNames);
        filmNames = upsertHistoryValue(filmNames, filmName);
        saveStringArray(STORAGE_KEYS.filmNames, filmNames);
        console.log('🎞️ After adding film - history:', filmNames);
    }
    
    // Reset form
    resetForm();
    
    // Show success message
    showToast(`"${filmName}" saved successfully!`, 'success');
    
    // Switch to list page after a delay
    setTimeout(() => {
        showListPage();
    }, 1000);
    
    console.log(`✅ Film record saved: ${filmName}`);
}

function resetForm() {
    const filmForm = document.getElementById('film-form');
    if (filmForm) {
        filmForm.reset();
    }

    // Reset Select2 fields
    if (typeof jQuery !== 'undefined' && typeof jQuery.fn.select2 !== 'undefined') {
        $('#film-name').val(null).trigger('change');
        $('#camera').val(null).trigger('change');
        $('#country').val(null).trigger('change');
        $('#city').val(null).trigger('change');
    }
    
    // Reset photos
    for (let i = 1; i <= 3; i++) {
        uploadedPhotos[i] = null;
        const uploadBox = document.getElementById(`upload-box-${i}`);
        if (uploadBox) uploadBox.style.display = 'flex';
        
        const previewElement = document.getElementById(`preview-${i}`);
        if (previewElement) {
            previewElement.remove();
        }
        
        const fileInput = document.getElementById(`photo-${i}`);
        if (fileInput) {
            fileInput.value = '';
        }
    }
    
    console.log('✅ Form reset complete');
}

/* ====== DATA STORAGE ====== */
function saveFilms() {
    try {
        localStorage.setItem(STORAGE_KEYS.records, JSON.stringify(films));
        console.log(`💾 Saved ${films.length} films to localStorage`);
    } catch (e) {
        console.error('❌ Error saving data:', e);
        showToast('Error saving data: ' + e.message, 'error');
    }
}

function loadFilms() {
    try {
        const saved = localStorage.getItem(STORAGE_KEYS.records);
        if (saved) {
            films = JSON.parse(saved);
            
            // Ensure photos are properly loaded
            films.forEach(film => {
                if (!film.photos) film.photos = [];
                // Normalize key fields to avoid stats splitting due to whitespace differences
                film.name = normalizeText(film.name);
                film.camera = film.camera ? normalizeText(film.camera) : null;
                film.country = film.country ? normalizeText(film.country) : '';
                film.city = film.city ? normalizeText(film.city) : '';
                film.notes = film.notes ? normalizeText(film.notes) : null;
            });
            
            console.log(`📂 Loaded ${films.length} films from localStorage`);

            // Backfill histories from existing records
            let cameras = loadStringArray(STORAGE_KEYS.cameras);
            let filmNames = loadStringArray(STORAGE_KEYS.filmNames);
            films.forEach(f => {
                if (f.camera) cameras = upsertHistoryValue(cameras, f.camera);
                if (f.name) filmNames = upsertHistoryValue(filmNames, f.name);
            });
            saveStringArray(STORAGE_KEYS.cameras, cameras);
            saveStringArray(STORAGE_KEYS.filmNames, filmNames);
        } else {
            console.log('📂 No saved films found, starting fresh');
        }
    } catch (e) {
        console.error('❌ Error loading data:', e);
        films = [];
    }
}

/* ====== COVER FLOW FUNCTIONS ====== */
function initCoverFlow() {
    console.log('🎞️ Initializing Cover Flow...');
    const track = document.getElementById('coverflow-track');
    
    if (!track) {
        console.error('❌ Cover flow track not found!');
        return;
    }
    
    // Filter films that have photos
    const filmsWithPhotos = films.filter(film => film.photos && film.photos.length > 0);
    
    if (filmsWithPhotos.length === 0) {
        track.innerHTML = `
            <div class="coverflow-empty">
                <div class="empty-icon">
                    <i class="fas fa-camera"></i>
                </div>
                <h3>No photos yet</h3>
                <p>Add your first film record to start the gallery</p>
                <button class="btn btn-primary" id="go-to-records-btn">
                    <i class="fas fa-list"></i> Go to Records
                </button>
            </div>
        `;
        
        // Add event listener to the button
        setTimeout(() => {
            const goBtn = document.getElementById('go-to-records-btn');
            if (goBtn) {
                goBtn.onclick = showListPage;
            }
        }, 100);
        
        document.getElementById('camera-info').textContent = '-';
        document.getElementById('film-info').textContent = '-';
        
        console.log('✅ Cover Flow initialized (empty state)');
        return;
    }
    
    // Create array of all photos with film info (store globally for shuffle & click)
    coverflowPhotos = [];
    filmsWithPhotos.forEach(film => {
        film.photos.forEach((photo, photoIndex) => {
            coverflowPhotos.push({
                image: photo,
                film: film,
                photoIndex: photoIndex
            });
        });
    });
    
    // Clear track
    track.innerHTML = '';
    
    // Create cover flow items
    coverflowPhotos.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'coverflow-item';
        itemElement.dataset.index = index;
        
        itemElement.innerHTML = `
            <img src="${item.image}" alt="Film photo ${index + 1}">
        `;
        itemElement.addEventListener('click', () => {
            currentCoverFlowIndex = index;
            updateCoverFlow();
        });
        
        track.appendChild(itemElement);
    });
    
    // Set initial position (show the newest photo by default)
    currentCoverFlowIndex = Math.max(0, coverflowPhotos.length - 1);
    updateCoverFlow();
    
    // Setup swipe events
    setupSwipeEvents();
    
    console.log(`✅ Cover Flow initialized with ${allPhotos.length} photos`);
}

function updateCoverFlow() {
    const items = document.querySelectorAll('.coverflow-item');
    const totalItems = items.length;
    
    if (totalItems === 0) return;

    // Update photo info (demo requirement: only keep camera model + film name)
    const current = coverflowPhotos[currentCoverFlowIndex];
    if (current && current.film) {
        document.getElementById('camera-info').textContent = current.film.camera || 'Unknown Camera';
        document.getElementById('film-info').textContent = current.film.name || 'Unknown Film';
    } else {
        document.getElementById('camera-info').textContent = '-';
        document.getElementById('film-info').textContent = '-';
    }
    
    // Update item positions
    items.forEach((item, index) => {
        // Always reset display first (fixes "only a few photos show after many records")
        item.style.display = 'block';
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
        }
    });
}

function setupSwipeEvents() {
    const track = document.getElementById('coverflow-track');
    if (!track) return;
    if (track.dataset.swipeBound === '1') return;
    track.dataset.swipeBound = '1';
    
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
    
    // Keyboard events (bind once)
    if (!window.__filmFlowCoverflowKeyboardBound) {
        window.__filmFlowCoverflowKeyboardBound = true;
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

/* ====== RECORDS LIST FUNCTIONS ====== */
function renderRecordsList() {
    const container = document.getElementById('records-container');
    if (!container) return;
    
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

/* ====== STATISTICS FUNCTIONS ====== */
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

function updateCameraStats() {
    const cameraStats = document.getElementById('camera-stats');
    if (!cameraStats) return;
    
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

    const cameras = Object.keys(cameraCount).sort((a, b) => cameraCount[b] - cameraCount[a]).slice(0, 5);
    if (cameras.length === 0) {
        cameraStats.innerHTML = `
            <div class="empty-stat">
                <i class="fas fa-camera-slash"></i>
                <p>No camera data yet</p>
            </div>
        `;
        return;
    }

    let html = '';
    cameras.forEach(camera => {
        const count = cameraCount[camera];
        const pct = films.length ? Math.round((count / films.length) * 100) : 0;
        html += `
            <div class="top-row"><div>${camera}</div><div>${count} (${pct}%)</div></div>
            <div class="bar"><div style="width:${pct}%"></div></div>
        `;
    });
    cameraStats.innerHTML = html;
}

function updateFilmStats() {
    const filmStats = document.getElementById('film-stats');
    if (!filmStats) return;
    
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
        if (film.name) {
            filmCount[film.name] = (filmCount[film.name] || 0) + 1;
        }
    });

    const filmNames = Object.keys(filmCount).sort((a, b) => filmCount[b] - filmCount[a]).slice(0, 5);
    if (filmNames.length === 0) {
        filmStats.innerHTML = `
            <div class="empty-stat">
                <i class="fas fa-film"></i>
                <p>No film data yet</p>
            </div>
        `;
        return;
    }

    let html = '';
    filmNames.forEach(filmName => {
        const count = filmCount[filmName];
        const pct = films.length ? Math.round((count / films.length) * 100) : 0;
        html += `
            <div class="top-row"><div>${filmName}</div><div>${count} (${pct}%)</div></div>
            <div class="bar"><div style="width:${pct}%"></div></div>
        `;
    });
    filmStats.innerHTML = html;
}

function updateCityStats() {
    const cityStats = document.getElementById('city-stats');
    if (!cityStats) return;
    
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

function updateTypeStats() {
    const typeStats = document.getElementById('type-stats');
    if (!typeStats) return;
    
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

/* ====== UTILITY FUNCTIONS ====== */
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

/* ====== TOAST NOTIFICATION ====== */
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

/* ====== MOBILE EVENTS ====== */
function setupMobileEvents() {
    console.log('📱 Setting up mobile events...');
    
    // Prevent double-tap zoom
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // Button touch feedback
    const buttons = document.querySelectorAll('button, .btn, .nav-btn, .upload-box');
    buttons.forEach(btn => {
        btn.addEventListener('touchstart', function() {
            this.style.opacity = '0.8';
        });
        
        btn.addEventListener('touchend', function() {
            this.style.opacity = '1';
        });
    });
    
    console.log('✅ Mobile events setup complete');
}

/* ====== DATA EXPORT/IMPORT ====== */
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

/* ====== GLOBAL EXPORT ====== */
// Make functions available globally for HTML onclick attributes
window.showCoverflowPage = showCoverflowPage;
window.showListPage = showListPage;
window.showAddPage = showAddPage;
window.showStatsPage = showStatsPage;
window.switchPage = switchPage;
window.removePhoto = removePhoto;
window.exportData = exportData;
window.importData = importData;

console.log('🎉 Film Flow application loaded successfully!');

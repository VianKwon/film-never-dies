// Film Flow - Clean Version
// ====== MOBILE DETECTION & OPTIMIZATION ======
const isMobile = /iPhone|iPad|iPod|Android|webOS|BlackBerry|Windows Phone/i.test(navigator.userAgent);
const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
const isAndroid = /Android/i.test(navigator.userAgent);

console.log(`📱 Device Info:
  Mobile: ${isMobile}
  iOS: ${isIOS}
  Android: ${isAndroid}
  User Agent: ${navigator.userAgent.substring(0, 80)}...
`);

// 移动端优化
if (isMobile) {
    // 添加移动端class
    document.documentElement.classList.add('mobile-device');
    
    // iOS 特殊处理
    if (isIOS) {
        document.documentElement.classList.add('ios-device');
        console.log('📱 iOS device detected, applying optimizations');
    }
    
    // Android 特殊处理
    if (isAndroid) {
        document.documentElement.classList.add('android-device');
        console.log('📱 Android device detected, applying optimizations');
    }
}

// 移动端事件优化
function setupMobileEvents() {
    if (!isMobile) return;
    
    console.log('📱 Setting up mobile events');
    
    // 防止双击缩放
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // 优化按钮点击反馈
    const buttons = document.querySelectorAll('button, .btn, .nav-btn');
    buttons.forEach(btn => {
        btn.addEventListener('touchstart', function() {
            this.style.opacity = '0.8';
        });
        
        btn.addEventListener('touchend', function() {
            this.style.opacity = '1';
        });
    });
}
// ====== GLOBAL VARIABLES (ONLY ONE DECLARATION) ======
let films = [];
let currentCoverFlowIndex = 0;
let uploadedPhotos = { 1: null, 2: null, 3: null };

// ====== INITIALIZATION ======
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎬 Film Flow Initializing...');
    
    // 移动端优化
    if (isMobile) {
        setupMobileEvents();
    }
    
    // 初始化Select2（需要等待jQuery加载）
    setTimeout(() => {
        initSelect2();
    }, 500); // 给jQuery和Select2更多时间加载
    
    // 设置照片上传
    setupPhotoUpload();
    
    // 设置导航
    setupNavigation();
    
    // 加载数据
    loadFilms();
    
    // 显示初始页面
    showCoverflowPage();
    
    console.log('✅ Film Flow Ready');
});
// ====== COUNTRY/REGION AND CITY DATA ======
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

// ====== PAGE NAVIGATION ======
function showCoverflowPage() {
    console.log('📱 Switching to Cover Flow');
    switchPage('coverflow-page');
    initCoverFlow();
}

function showListPage() {
    console.log('📱 Switching to List');
    switchPage('list-page');
    renderRecordsList();
}

function showAddPage() {
    console.log('📱 Switching to Add');
    switchPage('add-page');
}

function showStatsPage() {
    console.log('📱 Switching to Stats');
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
        
        // 3. Handle bottom nav
        const bottomNav = document.getElementById('bottom-nav');
        if (bottomNav) {
            if (pageId === 'coverflow-page') {
                bottomNav.style.display = 'none';
            } else {
                bottomNav.style.display = 'flex';
            }
        }
        
        // 4. Handle back buttons
        const backButtons = document.querySelectorAll('.back-btn');
        backButtons.forEach(btn => {
            if (pageId === 'coverflow-page') {
                btn.style.display = 'none';
            } else {
                btn.style.display = 'flex';
            }
        });
        
        console.log(`✅ Page ${pageId} displayed`);
    } else {
        console.error(`❌ Page ${pageId} not found!`);
    }
}

function setupNavigation() {
    console.log('🔗 Setting up navigation...');
    
    // Bottom nav buttons
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        const text = btn.querySelector('span').textContent;
        btn.onclick = function(e) {
            e.preventDefault();
            console.log(`🔘 ${text} button clicked`);
            
            if (text === 'Records') {
                showListPage();
            } else if (text === 'Add') {
                showAddPage();
            } else if (text === 'Stats') {
                showStatsPage();
            }
        };
    });
    // ====== SELECT2 INITIALIZATION ======
function initSelect2() {
    console.log('🌍 Initializing Select2...');
    
    // 检查jQuery和Select2是否加载
    if (typeof jQuery === 'undefined') {
        console.error('❌ jQuery not loaded! Please check if jQuery is included in index.html');
        return;
    }
    
    if (typeof jQuery.fn.select2 === 'undefined') {
        console.error('❌ Select2 not loaded! Please check if Select2 is included in index.html');
        return;
    }
    
    console.log('✅ jQuery and Select2 are loaded');
    
    // 初始化国家/地区选择
    $('#country').select2({
        placeholder: 'Select country/region',
        allowClear: true,
        width: '100%',
        theme: 'default'
    });
    
    // 初始化城市选择（初始时禁用）
    $('#city').select2({
        placeholder: 'Select city',
        allowClear: true,
        width: '100%',
        theme: 'default',
        disabled: true
    });
    
    // 填充国家/地区数据
    populateCountries();
    
    // 监听国家/地区变化
    $('#country').on('change', function() {
        const countryCode = $(this).val();
        console.log('Country selected:', countryCode);
        updateCities(countryCode);
    });
    
    console.log('✅ Select2 initialized successfully');
}

function populateCountries() {
    const countrySelect = document.getElementById('country');
    if (!countrySelect) {
        console.error('❌ Country select element not found');
        return;
    }
    
    // 清空现有选项
    countrySelect.innerHTML = '';
    
    // 添加默认选项
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select country/region';
    countrySelect.appendChild(defaultOption);
    
    // 添加国家/地区选项
    countriesRegions.forEach(country => {
        const option = document.createElement('option');
        option.value = country.code;
        option.textContent = country.name;
        countrySelect.appendChild(option);
    });
    
    console.log(`✅ Populated ${countriesRegions.length} countries/regions`);
}

function updateCities(countryCode) {
    const citySelect = document.getElementById('city');
    const select2City = $('#city');
    
    if (!countryCode) {
        // 禁用城市选择
        citySelect.disabled = true;
        select2City.prop('disabled', true);
        select2City.empty();
        select2City.append('<option value="">Select country/region first</option>');
        select2City.val('').trigger('change');
        return;
    }
    
    // 查找选中的国家/地区
    const country = countriesRegions.find(c => c.code === countryCode);
    if (!country) {
        console.error('❌ Country not found:', countryCode);
        return;
    }
    
    // 启用城市选择
    citySelect.disabled = false;
    select2City.prop('disabled', false);
    
    // 清空现有选项
    select2City.empty();
    select2City.append('<option value="">Select city</option>');
    
    // 添加城市选项
    country.cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
    });
    
    select2City.val('').trigger('change');
    console.log(`✅ Populated ${country.cities.length} cities for ${country.name}`);
}
    // Back buttons
    const backButtons = document.querySelectorAll('.back-btn');
    backButtons.forEach(btn => {
        btn.onclick = function(e) {
            e.preventDefault();
            console.log('🔙 Back button clicked');
            showCoverflowPage();
        };
    });
    
    console.log(`✅ ${navButtons.length} nav buttons, ${backButtons.length} back buttons setup`);
}



// ====== COVER FLOW ======
function initCoverFlow() {
    console.log('🎞️ Initializing Cover Flow');
    const track = document.getElementById('coverflow-track');
    
    if (!track) {
        console.error('❌ Cover flow track not found!');
        return;
    }
    
    // Check for photos
    const hasPhotos = films.some(film => film.photos && film.photos.length > 0);
    
    if (!hasPhotos) {
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
        
        // Add event listener to the new button
        setTimeout(() => {
            const goBtn = document.getElementById('go-to-records-btn');
            if (goBtn) {
                goBtn.onclick = showListPage;
            }
        }, 100);
    }
    
    console.log('✅ Cover Flow initialized');
}

// ====== DATA MANAGEMENT ======
function loadFilms() {
    try {
        const saved = localStorage.getItem('filmFlowRecords');
        if (saved) {
            films = JSON.parse(saved);
            console.log(`📂 Loaded ${films.length} film records`);
        }
    } catch (e) {
        console.error('❌ Error loading films:', e);
    }
}

// ====== PLACEHOLDER FUNCTIONS ======
function renderRecordsList() {
    const container = document.getElementById('records-container');
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <h3>Records List</h3>
                <p>Total films: ${films.length}</p>
                <button class="btn btn-primary" onclick="showAddPage()">
                    <i class="fas fa-plus"></i> Add New Record
                </button>
            </div>
        `;
    }
}

function updateStatistics() {
    const container = document.getElementById('stats-page');
    if (container) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <h3>Statistics</h3>
                <p>Total films: ${films.length}</p>
                <p>Coming soon: Charts and analytics</p>
            </div>
        `;
    }
}

// ====== GLOBAL EXPORT ======
window.showCoverflowPage = showCoverflowPage;
window.showListPage = showListPage;
window.showAddPage = showAddPage;
window.showStatsPage = showStatsPage;

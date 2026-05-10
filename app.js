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
    
    // Load existing films
    loadFilms();
    
    // Setup navigation
    setupNavigation();
    
    // Show initial page
    showCoverflowPage();
    
    console.log('✅ Film Flow Ready');
});

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

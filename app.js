// Film Flow - Film Photography Journal
// Main Application Logic

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
    
    // Load existing films from localStorage
    loadFilms();
    
    // Initialize gallery
    initGallery();
    
    // Update statistics
    updateStatistics();
});

// Global variables
let films = [];
let currentGalleryIndex = 0;
let uploadedPhotos = {
    1: null,
    2: null,
    3: null
};

// Initialize application
function initApp() {
    // Setup form submission
    const filmForm = document.getElementById('film-form');
    filmForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveFilmRecord();
    });
    
    // Setup navigation buttons
    setupNavigation();
    
    // Setup gallery controls
    setupGalleryControls();
    
    // Initialize toast notifications
    initToast();
}

// Setup navigation
function setupNavigation() {
    // Navigation items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add active class to clicked item
            this.classList.add('active');
        });
    });
}

// Switch between pages
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
        
        // Update navigation
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => item.classList.remove('active'));
        
        if (pageId === 'gallery-page') {
            document.querySelector('.nav-item:nth-child(1)').classList.add('active');
            initGallery();
        } else if (pageId === 'add-page') {
            document.querySelector('.nav-item.add-btn').classList.add('active');
        } else if (pageId === 'stats-page') {
            document.querySelector('.nav-item:nth-child(3)').classList.add('active');
            updateStatistics();
        }
        
        showToast(`Switched to ${selectedPage.querySelector('h2').textContent}`, 'info');
    }
}

// Initialize gallery
function initGallery() {
    const galleryTrack = document.querySelector('.coverflow-track');
    
    if (films.length === 0) {
        galleryTrack.innerHTML = `
            <div class="coverflow-empty">
                <div class="empty-icon">
                    <i class="fas fa-camera"></i>
                </div>
                <h3>No films yet</h3>
                <p>Add your first film record to start the gallery</p>
                <button class="btn btn-primary" onclick="switchPage('add-page')">
                    <i class="fas fa-plus"></i> Add First Record
                </button>
            </div>
        `;
        updateGalleryIndicator();
        return;
    }
    
    // Clear gallery
    galleryTrack.innerHTML = '';
    
    // Create film cards
    films.forEach((film, index) => {
        const filmCard = createFilmCard(film, index);
        galleryTrack.appendChild(filmCard);
    });
    
    // Set first film as active
    setActiveFilm(0);
    updateGalleryIndicator();
    
    // Setup scroll snapping
    setupGalleryScroll();
}

// Create film card for gallery
function createFilmCard(film, index) {
    const card = document.createElement('div');
    card.className = 'film-card';
    card.dataset.index = index;
    
    // Get first photo for card
    const firstPhoto = film.photos && film.photos.length > 0 ? film.photos[0] : null;
    
    card.innerHTML = `
        <div class="film-images" onclick="setActiveFilm(${index})">
            ${firstPhoto ? 
                `<img src="${firstPhoto}" alt="${film.name}" class="film-image">` :
                `<div class="film-image" style="background: linear-gradient(135deg, #667eea, #764ba2); display: flex; align-items: center; justify-content: center; color: white;">
                    <i class="fas fa-film" style="font-size: 3rem;"></i>
                </div>`
            }
            ${film.photos && film.photos.length > 0 ? 
                `<div class="image-count">${film.photos.length} photo${film.photos.length > 1 ? 's' : ''}</div>` : ''
            }
        </div>
        <div class="film-info">
            <h3 class="film-title">${film.name}</h3>
            <div class="film-meta">
                <span class="film-tag">${film.type}</span>
                ${film.camera ? `<span class="film-tag">${film.camera}</span>` : ''}
            </div>
            <div class="film-date">${formatDate(film.date)}</div>
        </div>
    `;
    
    return card;
}

// Set active film in gallery
function setActiveFilm(index) {
    // Update active card
    const filmCards = document.querySelectorAll('.film-card');
    filmCards.forEach(card => card.classList.remove('active'));
    
    if (filmCards[index]) {
        filmCards[index].classList.add('active');
        currentGalleryIndex = index;
        
        // Update film details
        updateFilmDetails(films[index]);
        
        // Scroll to center
        filmCards[index].scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
        });
    }
    
    updateGalleryIndicator();
}

// Update film details panel
function updateFilmDetails(film) {
    if (!film) return;
    
    document.getElementById('current-film-title').textContent = film.name;
    document.getElementById('detail-camera').textContent = film.camera || '-';
    document.getElementById('detail-film').textContent = film.name;
    document.getElementById('detail-iso').textContent = film.iso || '-';
    document.getElementById('detail-date').textContent = formatDate(film.date);
    document.getElementById('detail-notes').textContent = film.notes || 'No notes';
    
    // Update tags
    const tagsContainer = document.getElementById('current-film-tags');
    tagsContainer.innerHTML = '';
    
    const tags = [film.type];
    if (film.location) tags.push(film.location);
    
    tags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = 'tag';
        tagElement.textContent = tag;
        tagsContainer.appendChild(tagElement);
    });
}

// Setup gallery scroll
function setupGalleryControls() {
    // Touch swipe support
    const galleryTrack = document.querySelector('.coverflow-track');
    let startX = 0;
    let scrollLeft = 0;
    
    galleryTrack.addEventListener('touchstart', (e) => {
        startX = e.touches[0].pageX;
        scrollLeft = galleryTrack.scrollLeft;
    });
    
    galleryTrack.addEventListener('touchmove', (e) => {
        if (!startX) return;
        const x = e.touches[0].pageX;
        const walk = (x - startX) * 2;
        galleryTrack.scrollLeft = scrollLeft - walk;
    });
    
    galleryTrack.addEventListener('touchend', () => {
        startX = 0;
    });
}

// Scroll gallery
function scrollGallery(direction) {
    const newIndex = currentGalleryIndex + direction;
    
    if (newIndex >= 0 && newIndex < films.length) {
        setActiveFilm(newIndex);
    }
}

// Update gallery indicator
function updateGalleryIndicator() {
    document.getElementById('current-index').textContent = films.length > 0 ? currentGalleryIndex + 1 : 0;
    document.getElementById('total-films').textContent = films.length;
}

// Photo upload functions
function triggerUpload(boxNumber) {
    document.getElementById(`photo-${boxNumber}`).click();
}

function handlePhotoUpload(boxNumber, input) {
    const file = input.files[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showToast('Image size should be less than 5MB', 'error');
        return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
        showToast('Please upload an image file', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedPhotos[boxNumber] = e.target.result;
        updatePhotoPreview(boxNumber, e.target.result);
        showToast(`Photo ${boxNumber} uploaded`, 'success');
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

// Save film record
function saveFilmRecord() {
    // Get form values
    const filmName = document.getElementById('film-name').value.trim();
    const filmType = document.getElementById('film-type').value;
    const iso = document.getElementById('iso').value;
    const camera = document.getElementById('camera').value.trim();
    const dateShot = document.getElementById('date-shot').value;
    const location = document.getElementById('location').value.trim();
    const notes = document.getElementById('notes').value.trim();
    
    // Validate required fields
    if (!filmName || !filmType) {
        showToast('Please fill in Film Name and Film Type', 'error');
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
        location: location || null,
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
    
    // Switch to gallery page
    setTimeout(() => {
        switchPage('gallery-page');
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
    
    // Update detailed stats
    updateCameraStats();
    updateFilmStats();
    updateTypeStats();
    updateTimelineStats();
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
            <div class="stat-bar-item">
                <div class="bar-label">${camera}</div>
                <div class="bar-container">
                    <div class="bar-fill" style="width: ${percentage}%"></div>
                    <div class="bar-value">${count}</div>
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
            <div class="stat-bar-item">
                <div class="bar-label">${filmName}</div>
                <div class="bar-container">
                    <div class="bar-fill" style="width: ${percentage}%"></div>
                    <div class="bar-value">${count}</div>
                </div>
            </div>
        `;
    });
    
    filmStats.innerHTML = html;
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
    const colors = ['#007aff', '#34c759', '#ff9500', '#ff3b30', '#af52de', '#5856d6'];
    
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

// Update timeline statistics
function updateTimelineStats() {
    const timelineStats = document.getElementById('timeline-stats');
    
    if (films.length === 0) {
        timelineStats.innerHTML = `
            <div class="empty-stat">
                <i class="fas fa-calendar"></i>
                <p>No timeline data yet</p>
            </div>
        `;
        return;
    }
    
    // Group films by month
    const monthCount = {};
    films.forEach(film => {
        const date = new Date(film.date);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthCount[monthYear] = (monthCount[monthYear] || 0) + 1;
    });
    
    // Create timeline
    let html = '<div class="timeline">';
    const months = Object.keys(monthCount).sort();
    
    months.forEach(month => {
        const count = monthCount[month];
        const [year, monthNum] = month.split('-');
        const monthName = new Date(year, monthNum - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        
        html += `
            <div class="timeline-item">
                <div class="timeline-date">${monthName}</div>
                <div class="timeline-bar">
                    <div class="timeline-fill" style="width: ${Math.min(count * 20, 100)}%"></div>
                    <div class="timeline-count">${count} roll${count > 1 ? 's' : ''}</div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    timelineStats.innerHTML = html;
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

// Add CSS for statistics
const statsStyle = document.createElement('style');
statsStyle.textContent = `
    .stat-bar-item {
        margin-bottom: 12px;
    }
    
    .bar-label {
        font-size: 14px;
        margin-bottom: 4px;
        color: var(--label-secondary);
    }
    
    .bar-container {
        display: flex;
        align-items: center;
        gap: 12px;
    }
    
    .bar-fill {
        height: 8px;
        background: var(--accent-color);
        border-radius: 4px;
        transition: width 0.5s ease;
    }
    
    .bar-value {
        font-size: 14px;
        font-weight: 600;
        min-width: 30px;
        text-align: right;
    }
    
    .pie-chart {
        width: 200px;
        height: 200px;
        border-radius: 50%;
        position: relative;
        margin: 0 auto;
        background: conic-gradient(
            var(--color1, #007aff) 0% 30%,
            var(--color2, #34c759) 30% 60%,
            var(--color3, #ff9500) 60% 100%
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
    
    .timeline {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }
    
    .timeline-item {
        display: flex;
        align-items: center;
        gap: 16px;
    }
    
    .timeline-date {
        font-size: 14px;
        color: var(--label-secondary);
        min-width: 80px;
    }
    
    .timeline-bar {
        flex: 1;
        height: 24px;
        background: var(--tertiary-background);
        border-radius: 12px;
        position: relative;
        overflow: hidden;
    }
    
    .timeline-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--accent-color), var(--accent-secondary));
        border-radius: 12px;
        transition: width 0.5s ease;
    }
    
    .timeline-count {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 12px;
        font-weight: 600;
        color: var(--label-primary);
    }
`;
document.head.appendChild(statsStyle);

// Export data function (for future use)
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

// Import data function (for future use)
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
                    initGallery();
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

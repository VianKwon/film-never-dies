// Film Never Dies - Film Record System
// Main Application JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize app
    initApp();
    
    // Load existing films from localStorage
    loadFilms();
    
    // Update statistics
    updateStatistics();
});

// Film data structure
let films = [];

// Initialize app
function initApp() {
    // Form submission
    const filmForm = document.getElementById('filmForm');
    filmForm.addEventListener('submit', function(e) {
        e.preventDefault();
        addFilm();
    });
    
    // Clear all button
    document.getElementById('clearAll').addEventListener('click', clearAllFilms);
    
    // Filter change
    document.getElementById('filterType').addEventListener('change', renderFilms);
    
    // Export button
    document.getElementById('exportBtn').addEventListener('click', exportData);
    
    // Footer links
    document.getElementById('exportData').addEventListener('click', exportData);
    document.getElementById('importData').addEventListener('click', importData);
    document.getElementById('printData').addEventListener('click', printData);
    
    // Modal close button
    document.querySelector('.close').addEventListener('click', closeModal);
    document.getElementById('copyBtn').addEventListener('click', copyToClipboard);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('dataModal');
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Add a new film
function addFilm() {
    const filmName = document.getElementById('filmName').value.trim();
    const filmType = document.getElementById('filmType').value;
    const iso = document.getElementById('iso').value;
    const dateLoaded = document.getElementById('dateLoaded').value;
    const camera = document.getElementById('camera').value.trim();
    const notes = document.getElementById('notes').value.trim();
    
    if (!filmName || !filmType) {
        alert('Please fill in at least Film Name and Film Type');
        return;
    }
    
    const film = {
        id: Date.now(),
        name: filmName,
        type: filmType,
        iso: iso || 'Not specified',
        dateLoaded: dateLoaded || new Date().toISOString().split('T')[0],
        camera: camera || 'Not specified',
        notes: notes,
        createdAt: new Date().toISOString(),
        status: 'loaded' // loaded, exposed, developed, scanned
    };
    
    films.push(film);
    saveFilms();
    renderFilms();
    updateStatistics();
    
    // Reset form
    document.getElementById('filmForm').reset();
    
    // Show success message
    showNotification(`Added: ${filmName} (${filmType})`);
}

// Render films list
function renderFilms() {
    const filmList = document.getElementById('filmList');
    const filterType = document.getElementById('filterType').value;
    
    // Filter films
    let filteredFilms = films;
    if (filterType !== 'all') {
        filteredFilms = films.filter(film => film.type === filterType);
    }
    
    if (filteredFilms.length === 0) {
        filmList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🎞️</div>
                <h3>No films found</h3>
                <p>${filterType === 'all' ? 'Add your first film record!' : 'No films of this type'}</p>
            </div>
        `;
        return;
    }
    
    // Sort by date (newest first)
    filteredFilms.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Create film items
    filmList.innerHTML = filteredFilms.map(film => `
        <div class="film-item" data-id="${film.id}">
            <div class="film-header">
                <div class="film-title">${film.name}</div>
                <span class="film-type">${film.type}</span>
            </div>
            
            <div class="film-details">
                <div class="film-detail">
                    <span class="detail-label">ISO</span>
                    <span class="detail-value">${film.iso}</span>
                </div>
                <div class="film-detail">
                    <span class="detail-label">Date Loaded</span>
                    <span class="detail-value">${formatDate(film.dateLoaded)}</span>
                </div>
                <div class="film-detail">
                    <span class="detail-label">Camera</span>
                    <span class="detail-value">${film.camera}</span>
                </div>
                <div class="film-detail">
                    <span class="detail-label">Status</span>
                    <span class="detail-value">${film.status}</span>
                </div>
            </div>
            
            ${film.notes ? `<div class="film-notes">${film.notes}</div>` : ''}
            
            <div class="film-actions">
                <button class="action-btn edit" onclick="editFilm(${film.id})">Edit</button>
                <button class="action-btn delete" onclick="deleteFilm(${film.id})">Delete</button>
            </div>
        </div>
    `).join('');
    
    // Update total films count
    document.getElementById('totalFilms').textContent = `${films.length} film${films.length !== 1 ? 's' : ''}`;
}

// Update statistics
function updateStatistics() {
    const total = films.length;
    const count35mm = films.filter(f => f.type === '35mm').length;
    const count120 = films.filter(f => f.type === '120').length;
    
    // Count films from this month
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const thisMonthFilms = films.filter(f => {
        const filmDate = new Date(f.createdAt);
        return filmDate.getMonth() === thisMonth && filmDate.getFullYear() === thisYear;
    }).length;
    
    document.getElementById('statTotal').textContent = total;
    document.getElementById('stat35mm').textContent = count35mm;
    document.getElementById('stat120').textContent = count120;
    document.getElementById('statThisMonth').textContent = thisMonthFilms;
}

// Save films to localStorage
function saveFilms() {
    localStorage.setItem('filmRecords', JSON.stringify(films));
}

// Load films from localStorage
function loadFilms() {
    const saved = localStorage.getItem('filmRecords');
    if (saved) {
        films = JSON.parse(saved);
        renderFilms();
    }
}

// Clear all films
function clearAllFilms() {
    if (confirm('Are you sure you want to delete ALL film records? This cannot be undone.')) {
        films = [];
        saveFilms();
        renderFilms();
        updateStatistics();
        showNotification('All films cleared');
    }
}

// Delete a film
function deleteFilm(id) {
    if (confirm('Delete this film record?')) {
        films = films.filter(film => film.id !== id);
        saveFilms();
        renderFilms();
        updateStatistics();
        showNotification('Film deleted');
    }
}

// Edit a film (simplified version)
function editFilm(id) {
    const film = films.find(f => f.id === id);
    if (!film) return;
    
    // For simplicity, we'll just delete and re-add with editing
    // In a real app, you'd have a proper edit form
    document.getElementById('filmName').value = film.name;
    document.getElementById('filmType').value = film.type;
    document.getElementById('iso').value = film.iso === 'Not specified' ? '' : film.iso;
    document.getElementById('dateLoaded').value = film.dateLoaded;
    document.getElementById('camera').value = film.camera === 'Not specified' ? '' : film.camera;
    document.getElementById('notes').value = film.notes || '';
    
    // Remove the old film
    films = films.filter(f => f.id !== id);
    saveFilms();
    
    // Scroll to form
    document.getElementById('filmForm').scrollIntoView({ behavior: 'smooth' });
    showNotification('Editing film...');
}

// Export data
function exportData() {
    const data = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        totalFilms: films.length,
        films: films
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    showModal('Export Data', `
        <p>Copy the data below to save it:</p>
        <textarea id="dataText" readonly>${jsonString}</textarea>
        <button class="btn btn-primary" id="copyBtn">Copy to Clipboard</button>
        <button class="btn btn-secondary" onclick="downloadJSON()">Download as File</button>
    `);
}

// Import data
function importData() {
    showModal('Import Data', `
        <p>Paste your film data here:</p>
        <textarea id="importText" placeholder='Paste JSON data here...'></textarea>
        <button class="btn btn-primary" onclick="processImport()">Import Data</button>
        <p class="small-text">Note: This will replace your current film records.</p>
    `);
}

// Process import
function processImport() {
    const importText = document.getElementById('importText').value.trim();
    
    if (!importText) {
        alert('Please paste some data first');
        return;
    }
    
    try {
        const data = JSON.parse(importText);
        
        // Validate data structure
        if (!data.films || !Array.isArray(data.films)) {
            throw new Error('Invalid data format');
        }
        
        if (confirm(`Import ${data.films.length} film records? This will replace your current data.`)) {
            films = data.films;
            saveFilms();
            renderFilms();
            updateStatistics();
            closeModal();
            showNotification(`Imported ${data.films.length} films`);
        }
    } catch (error) {
        alert('Error importing data: ' + error.message);
    }
}

// Print data
function printData() {
    window.print();
}

// Download as JSON file
function downloadJSON() {
    const data = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        totalFilms: films.length,
        films: films
    };
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `film-records-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('File downloaded');
}

// Copy to clipboard
function copyToClipboard() {
    const textarea = document.getElementById('dataText');
    textarea.select();
    textarea.setSelectionRange(0, 99999); // For mobile
    
    try {
        document.execCommand('copy');
        showNotification('Copied to clipboard!');
    } catch (err) {
        alert('Failed to copy: ' + err);
    }
}

// Show modal
function showModal(title, content) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = content;
    document.getElementById('dataModal').style.display = 'flex';
}

// Close modal
function closeModal() {
    document.getElementById('dataModal').style.display = 'none';
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--accent-color);
        color: var(--primary-color);
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: var(--shadow);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Format date
function formatDate(dateString) {
    if (!dateString) return 'Not specified';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .small-text {
        font-size: 0.9rem;
        color: var(--text-light);
        margin-top: 10px;
    }
    
    .film-notes {
        margin-top: 10px;
        padding: 10px;
        background: #f8f9fa;
        border-radius: 6px;
        font-style: italic;
        color: var(--text-light);
    }
`;
document.head.appendChild(style);

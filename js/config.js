// Site Configuration for JavaScript
const CONFIG = {
    // Get from window.SITE_CONFIG set by PHP
    SITE_URL: window.SITE_CONFIG?.site_url || '',
    API_BASE: window.SITE_CONFIG?.site_url + '/api/' || '/api/',
    CURRENT_USER: window.SITE_CONFIG?.current_user || null,
    CSRF_TOKEN: window.SITE_CONFIG?.csrf_token || '',
    IS_ADMIN: window.SITE_CONFIG?.is_admin || false,
    
    // API Endpoints
    API: {
        LOGIN: 'api/login.php',
        REGISTER: 'api/register.php',
        LOGOUT: 'logout.php',
        TRACKS: 'api/tracks.php',
        USERS: 'api/users.php',
        PLAYLISTS: 'api/playlists.php',
        LIKES: 'api/likes.php',
        UPLOAD: 'api/upload.php',
        SEARCH: 'api/search.php',
        ANALYTICS: 'api/analytics.php'
    },
    
    // Player Settings
    PLAYER: {
        VOLUME_DEFAULT: 0.7,
        SEEK_STEP: 10, // seconds
        AUTOPLAY: false,
        SHUFFLE: false,
        REPEAT: 0 // 0: none, 1: all, 2: one
    },
    
    // Upload Settings
    UPLOAD: {
        MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
        ALLOWED_TYPES: ['mp3', 'wav', 'flac', 'm4a'],
        CHUNK_SIZE: 1024 * 1024 // 1MB chunks
    },
    
    // UI Settings
    UI: {
        ANIMATION_DURATION: 300,
        TOAST_DURATION: 3000,
        MODAL_BACKDROP_CLOSE: true,
        PAGINATION_LIMIT: 20
    },
    
    // Local Storage Keys
    STORAGE: {
        USER_PREFERENCES: 'music_stream_prefs',
        PLAYER_STATE: 'player_state',
        QUEUE: 'player_queue',
        VOLUME: 'player_volume'
    }
};

// Utility Functions
const Utils = {
    // Format duration from seconds to MM:SS
    formatDuration(seconds) {
        if (!seconds || isNaN(seconds)) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },
    
    // Format file size
    formatFileSize(bytes) {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    },
    
    // Format number with Persian digits
    formatNumber(num) {
        if (!num) return '0';
        return num.toString().replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
    },
    
    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Show notification toast
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Add to container or create one
        let container = document.querySelector('.toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        
        container.appendChild(toast);
        
        // Animate in
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Remove after duration
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => container.removeChild(toast), 300);
        }, CONFIG.UI.TOAST_DURATION);
    },
    
    // AJAX wrapper with CSRF token
    async ajax(url, options = {}) {
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        };
        
        // Add CSRF token for POST requests
        if (options.method === 'POST' || options.method === 'PUT' || options.method === 'DELETE') {
            if (options.body && typeof options.body === 'object') {
                options.body.csrf_token = CONFIG.CSRF_TOKEN;
            }
        }
        
        const mergedOptions = { ...defaultOptions, ...options };
        
        try {
            const response = await fetch(url, mergedOptions);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'درخواست با خطا مواجه شد');
            }
            
            return data;
        } catch (error) {
            console.error('AJAX Error:', error);
            throw error;
        }
    },
    
    // Form data helper for file uploads
    formData(formElement) {
        const formData = new FormData(formElement);
        formData.append('csrf_token', CONFIG.CSRF_TOKEN);
        return formData;
    },
    
    // Local storage helpers
    storage: {
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                return defaultValue;
            }
        },
        
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                return false;
            }
        },
        
        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                return false;
            }
        }
    },
    
    // URL parameter helpers
    url: {
        getParam(name) {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get(name);
        },
        
        setParam(name, value) {
            const url = new URL(window.location);
            url.searchParams.set(name, value);
            window.history.replaceState({}, '', url);
        },
        
        removeParam(name) {
            const url = new URL(window.location);
            url.searchParams.delete(name);
            window.history.replaceState({}, '', url);
        }
    }
};

// Check for login/register success messages
document.addEventListener('DOMContentLoaded', () => {
    const loginSuccess = Utils.url.getParam('login');
    const registerSuccess = Utils.url.getParam('register');
    const logoutSuccess = Utils.url.getParam('logout');
    const error = Utils.url.getParam('error');
    
    if (loginSuccess === 'success') {
        Utils.showToast('ورود موفقیت‌آمیز بود', 'success');
        Utils.url.removeParam('login');
    }
    
    if (registerSuccess === 'success') {
        Utils.showToast('ثبت نام موفقیت‌آمیز بود', 'success');
        Utils.url.removeParam('register');
    }
    
    if (logoutSuccess === 'success') {
        Utils.showToast('خروج موفقیت‌آمیز بود', 'info');
        Utils.url.removeParam('logout');
    }
    
    if (error === 'access_denied') {
        Utils.showToast('دسترسی غیرمجاز', 'error');
        Utils.url.removeParam('error');
    }
});

// Export for use in other files
window.CONFIG = CONFIG;
window.Utils = Utils;
// Main Application JavaScript
class MusicApp {
    constructor() {
        this.currentPage = 'home';
        this.musicLibrary = [];
        this.playlists = [];
        this.currentUser = null;
        this.init();
    }

    init() {
        this.loadSampleData();
        this.bindEvents();
        this.loadHomePage();
        this.setupNavigation();
    }

    // Sample music data for demonstration
    loadSampleData() {
        this.musicLibrary = [
            {
                id: 1,
                title: "نوای عشق",
                artist: "محمد علیزاده",
                album: "آلبوم عاشقانه",
                duration: 248,
                src: "music/sample1.mp3",
                cover: "images/cover1.jpg",
                genre: "پاپ"
            },
            {
                id: 2,
                title: "قطره باران",
                artist: "حمید هیراد",
                album: "بازگشت",
                duration: 312,
                src: "music/sample2.mp3",
                cover: "images/cover2.jpg",
                genre: "پاپ"
            },
            {
                id: 3,
                title: "شب بخیر",
                artist: "سیروان خسروی",
                album: "شب‌های تهران",
                duration: 276,
                src: "music/sample3.mp3",
                cover: "images/cover3.jpg",
                genre: "راک"
            },
            {
                id: 4,
                title: "عطر یاس",
                artist: "مرتضی پاشایی",
                album: "یادگاری",
                duration: 298,
                src: "music/sample4.mp3",
                cover: "images/cover4.jpg",
                genre: "سنتی"
            },
            {
                id: 5,
                title: "رقص در آسمان",
                artist: "رضا صادقی",
                album: "آسمان آبی",
                duration: 234,
                src: "music/sample5.mp3",
                cover: "images/cover5.jpg",
                genre: "پاپ"
            },
            {
                id: 6,
                title: "برف می‌بارد",
                artist: "بنیامین بهادری",
                album: "زمستان سرد",
                duration: 267,
                src: "music/sample6.mp3",
                cover: "images/cover6.jpg",
                genre: "بالاد"
            }
        ];

        this.playlists = [
            {
                id: 1,
                name: "آهنگ‌های پسندیده",
                tracks: [1, 3, 5],
                cover: "images/liked-cover.jpg"
            }
        ];
    }

    bindEvents() {
        // Navigation events
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.navigateToPage(page);
            });
        });

        // Search functionality
        const searchInput = document.getElementById('search-input');
        searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        // Modal events
        this.setupModals();

        // Playlist creation
        document.querySelector('.create-playlist-btn').addEventListener('click', () => {
            this.createNewPlaylist();
        });

        // Filter buttons in library
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterLibrary(e.target.dataset.filter);
            });
        });
    }

    setupNavigation() {
        // Back and forward buttons
        const backBtn = document.getElementById('back-btn');
        const forwardBtn = document.getElementById('forward-btn');
        
        // Disable buttons initially
        backBtn.disabled = true;
        forwardBtn.disabled = true;
    }

    navigateToPage(page) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.add('hidden');
        });

        // Show target page
        document.getElementById(`${page}-page`).classList.remove('hidden');

        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-page="${page}"]`).classList.add('active');

        this.currentPage = page;

        // Load page content
        switch(page) {
            case 'home':
                this.loadHomePage();
                break;
            case 'search':
                this.loadSearchPage();
                break;
            case 'library':
                this.loadLibraryPage();
                break;
        }
    }

    loadHomePage() {
        this.loadFeaturedTracks();
        this.loadRecentTracks();
        this.loadPopularTracks();
    }

    loadFeaturedTracks() {
        const container = document.getElementById('featured-tracks');
        const featured = this.musicLibrary.slice(0, 3);
        
        container.innerHTML = featured.map(track => `
            <div class="featured-track fade-in" onclick="musicPlayer.playTrack(${track.id})">
                <h3>${track.title}</h3>
                <p>${track.artist}</p>
                <span class="genre">${track.genre}</span>
            </div>
        `).join('');
    }

    loadRecentTracks() {
        const container = document.getElementById('recent-tracks');
        const recent = this.musicLibrary.slice(0, 4);
        
        container.innerHTML = recent.map(track => `
            <div class="track-card fade-in" onclick="musicPlayer.playTrack(${track.id})">
                <img src="${track.cover}" alt="${track.title}" class="track-cover" onerror="this.src='images/default-cover.jpg'">
                <div class="track-title">${track.title}</div>
                <div class="track-artist">${track.artist}</div>
                <div class="play-overlay">
                    <i class="fas fa-play"></i>
                </div>
            </div>
        `).join('');
    }

    loadPopularTracks() {
        const container = document.getElementById('popular-tracks');
        
        container.innerHTML = this.musicLibrary.map((track, index) => `
            <div class="track-item" onclick="musicPlayer.playTrack(${track.id})">
                <div class="track-number">${index + 1}</div>
                <div class="track-info">
                    <img src="${track.cover}" alt="${track.title}" class="track-cover" onerror="this.src='images/default-cover.jpg'">
                    <div class="track-details">
                        <div class="track-title">${track.title}</div>
                        <div class="track-artist">${track.artist}</div>
                    </div>
                </div>
                <div class="track-duration">${this.formatDuration(track.duration)}</div>
                <div class="track-actions">
                    <button class="action-btn" onclick="event.stopPropagation(); this.toggleLike(${track.id})">
                        <i class="far fa-heart"></i>
                    </button>
                    <button class="action-btn" onclick="event.stopPropagation(); this.addToPlaylist(${track.id})">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    loadSearchPage() {
        const container = document.getElementById('search-results');
        if (!this.lastSearchQuery) {
            container.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>چیزی جستجو کنید</p>
                </div>
            `;
        }
    }

    loadLibraryPage() {
        const container = document.getElementById('library-content');
        
        container.innerHTML = `
            <div class="track-grid">
                ${this.playlists.map(playlist => `
                    <div class="track-card" onclick="this.openPlaylist(${playlist.id})">
                        <img src="${playlist.cover}" alt="${playlist.name}" class="track-cover" onerror="this.src='images/default-cover.jpg'">
                        <div class="track-title">${playlist.name}</div>
                        <div class="track-artist">${playlist.tracks.length} آهنگ</div>
                        <div class="play-overlay">
                            <i class="fas fa-play"></i>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    handleSearch(query) {
        this.lastSearchQuery = query;
        
        if (!query.trim()) {
            this.loadSearchPage();
            return;
        }

        const results = this.musicLibrary.filter(track => 
            track.title.toLowerCase().includes(query.toLowerCase()) ||
            track.artist.toLowerCase().includes(query.toLowerCase()) ||
            track.album.toLowerCase().includes(query.toLowerCase())
        );

        const container = document.getElementById('search-results');
        
        if (results.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>نتیجه‌ای یافت نشد برای "${query}"</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="search-header">
                <h2>نتایج جستجو برای "${query}"</h2>
                <p>${results.length} نتیجه یافت شد</p>
            </div>
            <div class="track-list">
                ${results.map((track, index) => `
                    <div class="track-item" onclick="musicPlayer.playTrack(${track.id})">
                        <div class="track-number">${index + 1}</div>
                        <div class="track-info">
                            <img src="${track.cover}" alt="${track.title}" class="track-cover" onerror="this.src='images/default-cover.jpg'">
                            <div class="track-details">
                                <div class="track-title">${track.title}</div>
                                <div class="track-artist">${track.artist}</div>
                            </div>
                        </div>
                        <div class="track-duration">${this.formatDuration(track.duration)}</div>
                        <div class="track-actions">
                            <button class="action-btn" onclick="event.stopPropagation(); this.toggleLike(${track.id})">
                                <i class="far fa-heart"></i>
                            </button>
                            <button class="action-btn" onclick="event.stopPropagation(); this.addToPlaylist(${track.id})">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    setupModals() {
        const loginModal = document.getElementById('login-modal');
        const registerModal = document.getElementById('register-modal');
        const loginBtn = document.getElementById('login-btn');
        const showRegister = document.getElementById('show-register');
        const showLogin = document.getElementById('show-login');

        // Open login modal
        loginBtn.addEventListener('click', () => {
            loginModal.classList.remove('hidden');
        });

        // Switch between modals
        showRegister.addEventListener('click', (e) => {
            e.preventDefault();
            loginModal.classList.add('hidden');
            registerModal.classList.remove('hidden');
        });

        showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            registerModal.classList.add('hidden');
            loginModal.classList.remove('hidden');
        });

        // Close modals
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                loginModal.classList.add('hidden');
                registerModal.classList.add('hidden');
            });
        });

        // Close on outside click
        [loginModal, registerModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                }
            });
        });
    }

    filterLibrary(filter) {
        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

        // Filter content based on selection
        this.loadLibraryPage();
    }

    createNewPlaylist() {
        const name = prompt('نام پلی‌لیست جدید:');
        if (name && name.trim()) {
            const newPlaylist = {
                id: this.playlists.length + 1,
                name: name.trim(),
                tracks: [],
                cover: 'images/default-playlist.jpg'
            };
            this.playlists.push(newPlaylist);
            this.loadLibraryPage();
            this.updatePlaylistsSidebar();
        }
    }

    updatePlaylistsSidebar() {
        const container = document.querySelector('.playlists-list');
        container.innerHTML = this.playlists.map(playlist => `
            <div class="playlist-item" onclick="app.openPlaylist(${playlist.id})">
                <i class="fas fa-music"></i>
                <span>${playlist.name}</span>
            </div>
        `).join('');
    }

    openPlaylist(playlistId) {
        const playlist = this.playlists.find(p => p.id === playlistId);
        if (!playlist) return;

        // Switch to library page and show playlist
        this.navigateToPage('library');
        
        const container = document.getElementById('library-content');
        const playlistTracks = playlist.tracks.map(trackId => 
            this.musicLibrary.find(track => track.id === trackId)
        ).filter(track => track);

        container.innerHTML = `
            <div class="playlist-header">
                <img src="${playlist.cover}" alt="${playlist.name}" class="playlist-cover" onerror="this.src='images/default-playlist.jpg'">
                <div class="playlist-info">
                    <h2>${playlist.name}</h2>
                    <p>${playlist.tracks.length} آهنگ</p>
                    <button class="play-btn" onclick="musicPlayer.playPlaylist(${playlist.id})">
                        <i class="fas fa-play"></i>
                        پخش
                    </button>
                </div>
            </div>
            <div class="track-list">
                ${playlistTracks.map((track, index) => `
                    <div class="track-item" onclick="musicPlayer.playTrack(${track.id})">
                        <div class="track-number">${index + 1}</div>
                        <div class="track-info">
                            <img src="${track.cover}" alt="${track.title}" class="track-cover" onerror="this.src='images/default-cover.jpg'">
                            <div class="track-details">
                                <div class="track-title">${track.title}</div>
                                <div class="track-artist">${track.artist}</div>
                            </div>
                        </div>
                        <div class="track-duration">${this.formatDuration(track.duration)}</div>
                        <div class="track-actions">
                            <button class="action-btn" onclick="event.stopPropagation(); this.removeFromPlaylist(${playlist.id}, ${track.id})">
                                <i class="fas fa-minus"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    toggleLike(trackId) {
        const likedPlaylist = this.playlists.find(p => p.name === "آهنگ‌های پسندیده");
        if (!likedPlaylist) return;

        const trackIndex = likedPlaylist.tracks.indexOf(trackId);
        if (trackIndex > -1) {
            likedPlaylist.tracks.splice(trackIndex, 1);
        } else {
            likedPlaylist.tracks.push(trackId);
        }

        // Update UI
        this.updateLikeButton(trackId, trackIndex === -1);
    }

    updateLikeButton(trackId, isLiked) {
        // Update heart icon in player
        const likeBtn = document.getElementById('like-btn');
        const icon = likeBtn.querySelector('i');
        
        if (isLiked) {
            icon.className = 'fas fa-heart';
            likeBtn.classList.add('liked');
        } else {
            icon.className = 'far fa-heart';
            likeBtn.classList.remove('liked');
        }
    }

    addToPlaylist(trackId) {
        if (this.playlists.length === 0) {
            alert('ابتدا یک پلی‌لیست ایجاد کنید');
            return;
        }

        // Show playlist selection modal
        const playlistOptions = this.playlists.map(playlist => 
            `<option value="${playlist.id}">${playlist.name}</option>`
        ).join('');

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h2>افزودن به پلی‌لیست</h2>
                <select id="playlist-select">
                    ${playlistOptions}
                </select>
                <button onclick="this.confirmAddToPlaylist(${trackId})">افزودن</button>
            </div>
        `;

        document.body.appendChild(modal);
        
        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
    }

    confirmAddToPlaylist(trackId) {
        const select = document.getElementById('playlist-select');
        const playlistId = parseInt(select.value);
        const playlist = this.playlists.find(p => p.id === playlistId);
        
        if (playlist && !playlist.tracks.includes(trackId)) {
            playlist.tracks.push(trackId);
            alert('آهنگ به پلی‌لیست اضافه شد');
        }

        // Remove modal
        const modal = document.querySelector('.modal');
        if (modal) document.body.removeChild(modal);
    }

    removeFromPlaylist(playlistId, trackId) {
        const playlist = this.playlists.find(p => p.id === playlistId);
        if (playlist) {
            const index = playlist.tracks.indexOf(trackId);
            if (index > -1) {
                playlist.tracks.splice(index, 1);
                this.openPlaylist(playlistId); // Refresh playlist view
            }
        }
    }

    formatDuration(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    getTrackById(id) {
        return this.musicLibrary.find(track => track.id === id);
    }

    getPlaylistById(id) {
        return this.playlists.find(playlist => playlist.id === id);
    }

    // User authentication methods
    login(email, password) {
        // Simulate login
        this.currentUser = {
            id: 1,
            name: 'کاربر',
            email: email
        };
        
        document.getElementById('login-btn').innerHTML = `
            <i class="fas fa-user"></i>
            ${this.currentUser.name}
        `;
        
        document.getElementById('login-modal').classList.add('hidden');
    }

    register(name, email, password) {
        // Simulate registration
        this.login(email, password);
        document.getElementById('register-modal').classList.add('hidden');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new MusicApp();
});
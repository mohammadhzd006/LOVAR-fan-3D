// Admin Panel JavaScript
class AdminPanel {
    constructor() {
        this.currentSection = 'dashboard';
        this.musicData = [];
        this.usersData = [];
        this.playlistsData = [];
        this.statistics = {};
        this.charts = {};
        this.init();
    }

    init() {
        this.loadSampleData();
        this.bindEvents();
        this.initCharts();
        this.loadDashboard();
        this.updateStatistics();
    }

    loadSampleData() {
        // Load sample music data
        this.musicData = [
            {
                id: 1,
                title: "نوای عشق",
                artist: "محمد علیزاده",
                album: "آلبوم عاشقانه",
                genre: "پاپ",
                duration: 248,
                plays: 1250,
                cover: "images/cover1.jpg",
                src: "music/sample1.mp3",
                dateAdded: "2024-01-15"
            },
            {
                id: 2,
                title: "قطره باران",
                artist: "حمید هیراد",
                album: "بازگشت",
                genre: "پاپ",
                duration: 312,
                plays: 2100,
                cover: "images/cover2.jpg",
                src: "music/sample2.mp3",
                dateAdded: "2024-01-20"
            },
            {
                id: 3,
                title: "شب بخیر",
                artist: "سیروان خسروی",
                album: "شب‌های تهران",
                genre: "راک",
                duration: 276,
                plays: 890,
                cover: "images/cover3.jpg",
                src: "music/sample3.mp3",
                dateAdded: "2024-02-01"
            }
        ];

        // Load sample users data
        this.usersData = [
            {
                id: 1,
                name: "علی احمدی",
                email: "ali@example.com",
                role: "user",
                status: "active",
                avatar: "images/user1.jpg",
                joinDate: "2024-01-10",
                lastActivity: "2024-02-15"
            },
            {
                id: 2,
                name: "سارا محمدی",
                email: "sara@example.com",
                role: "vip",
                status: "active",
                avatar: "images/user2.jpg",
                joinDate: "2024-01-15",
                lastActivity: "2024-02-14"
            },
            {
                id: 3,
                name: "رضا کریمی",
                email: "reza@example.com",
                role: "admin",
                status: "active",
                avatar: "images/user3.jpg",
                joinDate: "2023-12-01",
                lastActivity: "2024-02-16"
            }
        ];

        // Load sample playlists
        this.playlistsData = [
            {
                id: 1,
                name: "آهنگ‌های پسندیده",
                tracks: [1, 2],
                cover: "images/liked-cover.jpg",
                isPublic: true,
                createdBy: 1
            },
            {
                id: 2,
                name: "پاپ محبوب",
                tracks: [1, 2],
                cover: "images/pop-cover.jpg",
                isPublic: true,
                createdBy: 2
            }
        ];

        this.statistics = {
            totalTracks: this.musicData.length,
            totalUsers: this.usersData.length,
            totalPlaylists: this.playlistsData.length,
            totalPlays: 5240
        };
    }

    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.navigateToSection(section);
            });
        });

        // Modal events
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.closeModal(modal.id);
            });
        });

        // Upload form
        const uploadForm = document.getElementById('upload-form');
        if (uploadForm) {
            uploadForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleMusicUpload();
            });
        }

        // Search and filters
        this.bindSearchAndFilters();

        // Content tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Settings forms
        this.bindSettingsForms();

        // Mobile menu toggle
        const menuToggle = document.querySelector('.menu-toggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }
    }

    bindSearchAndFilters() {
        const musicSearch = document.getElementById('music-search');
        const genreFilter = document.getElementById('genre-filter');
        const userSearch = document.getElementById('user-search');
        const userRoleFilter = document.getElementById('user-role-filter');
        const userStatusFilter = document.getElementById('user-status-filter');

        if (musicSearch) {
            musicSearch.addEventListener('input', () => this.filterMusic());
        }
        if (genreFilter) {
            genreFilter.addEventListener('change', () => this.filterMusic());
        }
        if (userSearch) {
            userSearch.addEventListener('input', () => this.filterUsers());
        }
        if (userRoleFilter) {
            userRoleFilter.addEventListener('change', () => this.filterUsers());
        }
        if (userStatusFilter) {
            userStatusFilter.addEventListener('change', () => this.filterUsers());
        }
    }

    bindSettingsForms() {
        const generalSettings = document.getElementById('general-settings');
        const playerSettings = document.getElementById('player-settings');
        const securitySettings = document.getElementById('security-settings');
        const seoSettings = document.getElementById('seo-settings');

        if (generalSettings) {
            generalSettings.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveGeneralSettings();
            });
        }
        if (playerSettings) {
            playerSettings.addEventListener('submit', (e) => {
                e.preventDefault();
                this.savePlayerSettings();
            });
        }
        if (securitySettings) {
            securitySettings.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveSecuritySettings();
            });
        }
        if (seoSettings) {
            seoSettings.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveSeoSettings();
            });
        }
    }

    navigateToSection(section) {
        // Hide all sections
        document.querySelectorAll('.admin-section').forEach(sec => {
            sec.classList.remove('active');
        });

        // Show target section
        document.getElementById(section).classList.add('active');

        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Update section title
        const titles = {
            'dashboard': 'داشبورد',
            'music-management': 'مدیریت موزیک',
            'playlist-management': 'مدیریت پلی‌لیست',
            'user-management': 'مدیریت کاربران',
            'content-management': 'مدیریت محتوا',
            'file-manager': 'مدیریت فایل',
            'analytics': 'آمار و گزارش',
            'settings': 'تنظیمات',
            'backup': 'پشتیبان‌گیری'
        };
        document.getElementById('section-title').textContent = titles[section];

        this.currentSection = section;

        // Load section data
        switch(section) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'music-management':
                this.loadMusicManagement();
                break;
            case 'playlist-management':
                this.loadPlaylistManagement();
                break;
            case 'user-management':
                this.loadUserManagement();
                break;
            case 'content-management':
                this.loadContentManagement();
                break;
            case 'file-manager':
                this.loadFileManager();
                break;
            case 'analytics':
                this.loadAnalytics();
                break;
            case 'settings':
                this.loadSettings();
                break;
            case 'backup':
                this.loadBackup();
                break;
        }
    }

    loadDashboard() {
        this.updateStatistics();
        this.loadPopularTracks();
        this.loadRecentActivities();
        this.updateCharts();
    }

    updateStatistics() {
        document.getElementById('total-tracks').textContent = this.statistics.totalTracks;
        document.getElementById('total-users').textContent = this.statistics.totalUsers;
        document.getElementById('total-playlists').textContent = this.statistics.totalPlaylists;
        document.getElementById('total-plays').textContent = this.statistics.totalPlays;
    }

    loadPopularTracks() {
        const container = document.getElementById('popular-tracks-admin');
        const popularTracks = this.musicData
            .sort((a, b) => b.plays - a.plays)
            .slice(0, 5);

        container.innerHTML = popularTracks.map((track, index) => `
            <div class="track-item">
                <div class="track-number">${index + 1}</div>
                <div class="track-info">
                    <img src="${track.cover}" alt="${track.title}" class="track-cover" onerror="this.src='images/default-cover.jpg'">
                    <div class="track-details">
                        <div class="track-title">${track.title}</div>
                        <div class="track-artist">${track.artist}</div>
                    </div>
                </div>
                <div class="track-plays">${track.plays.toLocaleString()} پخش</div>
            </div>
        `).join('');
    }

    loadRecentActivities() {
        const container = document.getElementById('recent-activities');
        const activities = [
            { icon: 'fas fa-music', text: 'آهنگ جدید "قطره باران" اضافه شد', time: '2 ساعت پیش' },
            { icon: 'fas fa-user-plus', text: 'کاربر جدید ثبت نام کرد', time: '3 ساعت پیش' },
            { icon: 'fas fa-list', text: 'پلی‌لیست "پاپ محبوب" ایجاد شد', time: '5 ساعت پیش' },
            { icon: 'fas fa-download', text: 'پشتیبان‌گیری خودکار انجام شد', time: '1 روز پیش' }
        ];

        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-text">${activity.text}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
        `).join('');
    }

    loadMusicManagement() {
        const tbody = document.getElementById('music-table-body');
        if (!tbody) return;

        tbody.innerHTML = this.musicData.map(track => `
            <tr>
                <td><img src="${track.cover}" alt="${track.title}" onerror="this.src='images/default-cover.jpg'"></td>
                <td>${track.title}</td>
                <td>${track.artist}</td>
                <td>${track.album}</td>
                <td>${track.genre}</td>
                <td>${this.formatDuration(track.duration)}</td>
                <td>${track.plays.toLocaleString()}</td>
                <td>${this.formatDate(track.dateAdded)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="adminPanel.editTrack(${track.id})" title="ویرایش">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn view" onclick="adminPanel.viewTrack(${track.id})" title="مشاهده">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn delete" onclick="adminPanel.deleteTrack(${track.id})" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    loadPlaylistManagement() {
        const container = document.getElementById('admin-playlist-grid');
        if (!container) return;

        container.innerHTML = this.playlistsData.map(playlist => `
            <div class="playlist-card">
                <img src="${playlist.cover}" alt="${playlist.name}" class="card-image" onerror="this.src='images/default-playlist.jpg'">
                <div class="card-content">
                    <div class="card-title">${playlist.name}</div>
                    <div class="card-subtitle">${playlist.tracks.length} آهنگ • ${playlist.isPublic ? 'عمومی' : 'خصوصی'}</div>
                    <div class="card-actions">
                        <button class="btn-primary btn-sm" onclick="adminPanel.editPlaylist(${playlist.id})">
                            <i class="fas fa-edit"></i>
                            ویرایش
                        </button>
                        <button class="btn-secondary btn-sm" onclick="adminPanel.deletePlaylist(${playlist.id})">
                            <i class="fas fa-trash"></i>
                            حذف
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    loadUserManagement() {
        const tbody = document.getElementById('users-table-body');
        if (!tbody) return;

        tbody.innerHTML = this.usersData.map(user => `
            <tr>
                <td><img src="${user.avatar}" alt="${user.name}" onerror="this.src='images/default-avatar.jpg'"></td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td><span class="badge role-${user.role}">${this.translateRole(user.role)}</span></td>
                <td><span class="badge status-${user.status}">${this.translateStatus(user.status)}</span></td>
                <td>${this.formatDate(user.joinDate)}</td>
                <td>${this.formatDate(user.lastActivity)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="adminPanel.editUser(${user.id})" title="ویرایش">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn view" onclick="adminPanel.viewUser(${user.id})" title="مشاهده">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn delete" onclick="adminPanel.deleteUser(${user.id})" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    loadContentManagement() {
        this.loadPages();
        this.loadBanners();
        this.loadAnnouncements();
        this.loadFeaturedContent();
    }

    loadPages() {
        const container = document.getElementById('pages-grid');
        if (!container) return;

        const pages = [
            { id: 1, title: 'صفحه اصلی', status: 'published', lastModified: '2024-02-15' },
            { id: 2, title: 'درباره ما', status: 'published', lastModified: '2024-02-10' },
            { id: 3, title: 'تماس با ما', status: 'draft', lastModified: '2024-02-12' }
        ];

        container.innerHTML = pages.map(page => `
            <div class="page-card">
                <div class="card-content">
                    <div class="card-title">${page.title}</div>
                    <div class="card-subtitle">وضعیت: ${page.status === 'published' ? 'منتشر شده' : 'پیش‌نویس'}</div>
                    <div class="card-subtitle">آخرین تغییر: ${this.formatDate(page.lastModified)}</div>
                    <div class="card-actions">
                        <button class="btn-primary btn-sm" onclick="adminPanel.editPage(${page.id})">
                            <i class="fas fa-edit"></i>
                            ویرایش
                        </button>
                        <button class="btn-secondary btn-sm" onclick="adminPanel.deletePage(${page.id})">
                            <i class="fas fa-trash"></i>
                            حذف
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    loadBanners() {
        const container = document.getElementById('banners-grid');
        if (!container) return;

        const banners = [
            { id: 1, title: 'بنر تبلیغاتی ۱', image: 'images/banner1.jpg', active: true },
            { id: 2, title: 'بنر تبلیغاتی ۲', image: 'images/banner2.jpg', active: false }
        ];

        container.innerHTML = banners.map(banner => `
            <div class="banner-card">
                <img src="${banner.image}" alt="${banner.title}" class="card-image" onerror="this.src='images/default-banner.jpg'">
                <div class="card-content">
                    <div class="card-title">${banner.title}</div>
                    <div class="card-subtitle">وضعیت: ${banner.active ? 'فعال' : 'غیرفعال'}</div>
                    <div class="card-actions">
                        <button class="btn-primary btn-sm" onclick="adminPanel.editBanner(${banner.id})">
                            <i class="fas fa-edit"></i>
                            ویرایش
                        </button>
                        <button class="btn-secondary btn-sm" onclick="adminPanel.toggleBanner(${banner.id})">
                            <i class="fas fa-toggle-${banner.active ? 'on' : 'off'}"></i>
                            ${banner.active ? 'غیرفعال' : 'فعال'}
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    loadAnnouncements() {
        const container = document.getElementById('announcements-list');
        if (!container) return;

        const announcements = [
            { id: 1, title: 'به‌روزرسانی سیستم', content: 'سیستم فردا به‌روزرسانی خواهد شد', date: '2024-02-15', active: true },
            { id: 2, title: 'رویداد ویژه', content: 'رویداد ویژه هفته آینده برگزار می‌شود', date: '2024-02-10', active: false }
        ];

        container.innerHTML = announcements.map(announcement => `
            <div class="announcement-item">
                <div class="announcement-header">
                    <h4>${announcement.title}</h4>
                    <span class="announcement-date">${this.formatDate(announcement.date)}</span>
                </div>
                <div class="announcement-content">${announcement.content}</div>
                <div class="announcement-actions">
                    <button class="btn-primary btn-sm" onclick="adminPanel.editAnnouncement(${announcement.id})">
                        <i class="fas fa-edit"></i>
                        ویرایش
                    </button>
                    <button class="btn-secondary btn-sm" onclick="adminPanel.deleteAnnouncement(${announcement.id})">
                        <i class="fas fa-trash"></i>
                        حذف
                    </button>
                </div>
            </div>
        `).join('');
    }

    loadFeaturedContent() {
        const container = document.getElementById('featured-content');
        if (!container) return;

        container.innerHTML = `
            <div class="featured-management">
                <h4>محتوای ویژه صفحه اصلی</h4>
                <div class="featured-sections">
                    <div class="featured-section">
                        <h5>آهنگ‌های ویژه</h5>
                        <button class="btn-primary" onclick="adminPanel.manageFeaturedTracks()">
                            <i class="fas fa-cog"></i>
                            مدیریت آهنگ‌های ویژه
                        </button>
                    </div>
                    <div class="featured-section">
                        <h5>پلی‌لیست‌های ویژه</h5>
                        <button class="btn-primary" onclick="adminPanel.manageFeaturedPlaylists()">
                            <i class="fas fa-cog"></i>
                            مدیریت پلی‌لیست‌های ویژه
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    loadFileManager() {
        const container = document.getElementById('file-grid');
        if (!container) return;

        const files = [
            { type: 'folder', name: 'music', icon: 'fas fa-folder' },
            { type: 'folder', name: 'images', icon: 'fas fa-folder' },
            { type: 'file', name: 'sample1.mp3', icon: 'fas fa-music' },
            { type: 'file', name: 'cover1.jpg', icon: 'fas fa-image' },
            { type: 'file', name: 'backup.zip', icon: 'fas fa-file-archive' }
        ];

        container.innerHTML = files.map(file => `
            <div class="file-item" onclick="adminPanel.handleFileClick('${file.name}', '${file.type}')">
                <div class="file-icon">
                    <i class="${file.icon}"></i>
                </div>
                <div class="file-name">${file.name}</div>
            </div>
        `).join('');
    }

    loadAnalytics() {
        this.initAnalyticsCharts();
    }

    loadSettings() {
        // Settings are loaded via HTML, no additional loading needed
    }

    loadBackup() {
        const container = document.getElementById('backup-history');
        if (!container) return;

        const backups = [
            { date: '2024-02-15', size: '45.2 MB', type: 'automatic' },
            { date: '2024-02-10', size: '43.8 MB', type: 'manual' },
            { date: '2024-02-05', size: '42.1 MB', type: 'automatic' }
        ];

        container.innerHTML = backups.map(backup => `
            <div class="backup-item">
                <div class="backup-info">
                    <strong>${this.formatDate(backup.date)}</strong>
                    <small>${backup.size} - ${backup.type === 'automatic' ? 'خودکار' : 'دستی'}</small>
                </div>
                <div class="backup-actions">
                    <button class="btn-secondary btn-sm" onclick="adminPanel.downloadBackup('${backup.date}')">
                        <i class="fas fa-download"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Music Management Functions
    handleMusicUpload() {
        const form = document.getElementById('upload-form');
        const formData = new FormData(form);
        
        const progressBar = document.querySelector('.upload-progress');
        const progressFill = document.getElementById('upload-progress');
        const progressText = document.getElementById('upload-progress-text');
        
        progressBar.classList.remove('hidden');
        
        // Simulate upload progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 30;
            if (progress > 100) progress = 100;
            
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `${Math.round(progress)}%`;
            
            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    this.addNewTrack(formData);
                    this.closeModal('upload-modal');
                    progressBar.classList.add('hidden');
                    form.reset();
                }, 500);
            }
        }, 200);
    }

    addNewTrack(formData) {
        const newTrack = {
            id: this.musicData.length + 1,
            title: formData.get('track-title') || document.getElementById('track-title').value,
            artist: formData.get('track-artist') || document.getElementById('track-artist').value,
            album: formData.get('track-album') || document.getElementById('track-album').value,
            genre: formData.get('track-genre') || document.getElementById('track-genre').value,
            duration: 0, // Would be calculated from actual file
            plays: 0,
            cover: 'images/default-cover.jpg',
            src: 'music/new-track.mp3',
            dateAdded: new Date().toISOString().split('T')[0]
        };

        this.musicData.push(newTrack);
        this.statistics.totalTracks++;
        this.updateStatistics();
        this.loadMusicManagement();
        this.showNotification('آهنگ با موفقیت اضافه شد', 'success');
    }

    editTrack(trackId) {
        const track = this.musicData.find(t => t.id === trackId);
        if (track) {
            // Open edit modal with track data
            this.showNotification(`ویرایش آهنگ "${track.title}"`, 'info');
        }
    }

    viewTrack(trackId) {
        const track = this.musicData.find(t => t.id === trackId);
        if (track) {
            this.showNotification(`مشاهده جزئیات آهنگ "${track.title}"`, 'info');
        }
    }

    deleteTrack(trackId) {
        if (confirm('آیا از حذف این آهنگ اطمینان دارید؟')) {
            this.musicData = this.musicData.filter(t => t.id !== trackId);
            this.statistics.totalTracks--;
            this.updateStatistics();
            this.loadMusicManagement();
            this.showNotification('آهنگ با موفقیت حذف شد', 'success');
        }
    }

    filterMusic() {
        const searchTerm = document.getElementById('music-search').value.toLowerCase();
        const genreFilter = document.getElementById('genre-filter').value;
        
        let filteredData = this.musicData;
        
        if (searchTerm) {
            filteredData = filteredData.filter(track => 
                track.title.toLowerCase().includes(searchTerm) ||
                track.artist.toLowerCase().includes(searchTerm) ||
                track.album.toLowerCase().includes(searchTerm)
            );
        }
        
        if (genreFilter) {
            filteredData = filteredData.filter(track => track.genre === genreFilter);
        }
        
        this.renderMusicTable(filteredData);
    }

    renderMusicTable(data) {
        const tbody = document.getElementById('music-table-body');
        if (!tbody) return;

        tbody.innerHTML = data.map(track => `
            <tr>
                <td><img src="${track.cover}" alt="${track.title}" onerror="this.src='images/default-cover.jpg'"></td>
                <td>${track.title}</td>
                <td>${track.artist}</td>
                <td>${track.album}</td>
                <td>${track.genre}</td>
                <td>${this.formatDuration(track.duration)}</td>
                <td>${track.plays.toLocaleString()}</td>
                <td>${this.formatDate(track.dateAdded)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="adminPanel.editTrack(${track.id})" title="ویرایش">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn view" onclick="adminPanel.viewTrack(${track.id})" title="مشاهده">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn delete" onclick="adminPanel.deleteTrack(${track.id})" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    exportMusicData() {
        const csvContent = "data:text/csv;charset=utf-8," 
            + "عنوان,هنرمند,آلبوم,ژانر,مدت زمان,تعداد پخش,تاریخ افزودن\n"
            + this.musicData.map(track => 
                `"${track.title}","${track.artist}","${track.album}","${track.genre}","${this.formatDuration(track.duration)}","${track.plays}","${track.dateAdded}"`
            ).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "music_data.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // User Management Functions
    filterUsers() {
        const searchTerm = document.getElementById('user-search').value.toLowerCase();
        const roleFilter = document.getElementById('user-role-filter').value;
        const statusFilter = document.getElementById('user-status-filter').value;
        
        let filteredData = this.usersData;
        
        if (searchTerm) {
            filteredData = filteredData.filter(user => 
                user.name.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm)
            );
        }
        
        if (roleFilter) {
            filteredData = filteredData.filter(user => user.role === roleFilter);
        }
        
        if (statusFilter) {
            filteredData = filteredData.filter(user => user.status === statusFilter);
        }
        
        this.renderUsersTable(filteredData);
    }

    renderUsersTable(data) {
        const tbody = document.getElementById('users-table-body');
        if (!tbody) return;

        tbody.innerHTML = data.map(user => `
            <tr>
                <td><img src="${user.avatar}" alt="${user.name}" onerror="this.src='images/default-avatar.jpg'"></td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td><span class="badge role-${user.role}">${this.translateRole(user.role)}</span></td>
                <td><span class="badge status-${user.status}">${this.translateStatus(user.status)}</span></td>
                <td>${this.formatDate(user.joinDate)}</td>
                <td>${this.formatDate(user.lastActivity)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="adminPanel.editUser(${user.id})" title="ویرایش">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn view" onclick="adminPanel.viewUser(${user.id})" title="مشاهده">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn delete" onclick="adminPanel.deleteUser(${user.id})" title="حذف">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    editUser(userId) {
        const user = this.usersData.find(u => u.id === userId);
        if (user) {
            this.showNotification(`ویرایش کاربر "${user.name}"`, 'info');
        }
    }

    viewUser(userId) {
        const user = this.usersData.find(u => u.id === userId);
        if (user) {
            this.showNotification(`مشاهده جزئیات کاربر "${user.name}"`, 'info');
        }
    }

    deleteUser(userId) {
        if (confirm('آیا از حذف این کاربر اطمینان دارید؟')) {
            this.usersData = this.usersData.filter(u => u.id !== userId);
            this.statistics.totalUsers--;
            this.updateStatistics();
            this.loadUserManagement();
            this.showNotification('کاربر با موفقیت حذف شد', 'success');
        }
    }

    // Content Management Functions
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
    }

    // File Manager Functions
    handleFileClick(fileName, fileType) {
        if (fileType === 'folder') {
            this.showNotification(`ورود به پوشه "${fileName}"`, 'info');
            // Navigate to folder
        } else {
            this.showNotification(`انتخاب فایل "${fileName}"`, 'info');
            // Select file
        }
    }

    createFolder() {
        const folderName = prompt('نام پوشه جدید:');
        if (folderName && folderName.trim()) {
            this.showNotification(`پوشه "${folderName}" ایجاد شد`, 'success');
            this.loadFileManager();
        }
    }

    // Settings Functions
    saveGeneralSettings() {
        this.showNotification('تنظیمات عمومی ذخیره شد', 'success');
    }

    savePlayerSettings() {
        this.showNotification('تنظیمات پخش‌کننده ذخیره شد', 'success');
    }

    saveSecuritySettings() {
        this.showNotification('تنظیمات امنیتی ذخیره شد', 'success');
    }

    saveSeoSettings() {
        this.showNotification('تنظیمات سئو ذخیره شد', 'success');
    }

    // Backup Functions
    createBackup() {
        this.showNotification('در حال ایجاد پشتیبان...', 'info');
        
        // Simulate backup creation
        setTimeout(() => {
            this.showNotification('پشتیبان با موفقیت ایجاد شد', 'success');
            this.loadBackup();
        }, 2000);
    }

    restoreBackup() {
        const fileInput = document.getElementById('backup-file');
        if (fileInput.files.length === 0) {
            this.showNotification('لطفاً فایل پشتیبان را انتخاب کنید', 'error');
            return;
        }

        if (confirm('آیا از بازیابی از این فایل پشتیبان اطمینان دارید؟ تمام داده‌های فعلی جایگزین خواهد شد.')) {
            this.showNotification('در حال بازیابی...', 'info');
            
            setTimeout(() => {
                this.showNotification('بازیابی با موفقیت انجام شد', 'success');
            }, 3000);
        }
    }

    setupAutoBackup() {
        const frequency = document.getElementById('auto-backup-frequency').value;
        this.showNotification(`پشتیبان‌گیری خودکار ${frequency === 'daily' ? 'روزانه' : frequency === 'weekly' ? 'هفتگی' : 'ماهانه'} فعال شد`, 'success');
    }

    downloadBackup(date) {
        this.showNotification(`دانلود پشتیبان ${this.formatDate(date)}`, 'info');
    }

    // Chart Functions
    initCharts() {
        this.initMonthlyChart();
    }

    initMonthlyChart() {
        const ctx = document.getElementById('monthly-chart');
        if (!ctx) return;

        this.charts.monthly = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['دی', 'بهمن', 'اسفند', 'فروردین', 'اردیبهشت', 'خرداد'],
                datasets: [{
                    label: 'پخش ماهانه',
                    data: [1200, 1900, 3000, 5000, 4000, 3000],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    initAnalyticsCharts() {
        this.initVisitsChart();
        this.initGenresChart();
        this.initUsersChart();
        this.initRevenueChart();
    }

    initVisitsChart() {
        const ctx = document.getElementById('visits-chart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'],
                datasets: [{
                    label: 'بازدید',
                    data: [120, 190, 300, 500, 200, 300, 450],
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    initGenresChart() {
        const ctx = document.getElementById('genres-chart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['پاپ', 'راک', 'سنتی', 'بالاد'],
                datasets: [{
                    data: [30, 25, 20, 25],
                    backgroundColor: [
                        '#667eea',
                        '#764ba2',
                        '#f093fb',
                        '#f5576c'
                    ]
                }]
            },
            options: {
                responsive: true
            }
        });
    }

    initUsersChart() {
        const ctx = document.getElementById('users-chart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['ژانویه', 'فوریه', 'مارس', 'آپریل', 'می', 'ژوئن'],
                datasets: [{
                    label: 'کاربران جدید',
                    data: [65, 59, 80, 81, 56, 55],
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    initRevenueChart() {
        const ctx = document.getElementById('revenue-chart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                datasets: [{
                    label: 'درآمد (میلیون تومان)',
                    data: [12, 19, 30, 25],
                    backgroundColor: 'rgba(255, 193, 7, 0.8)',
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    updateCharts() {
        if (this.charts.monthly) {
            // Update chart data
            this.charts.monthly.update();
        }
    }

    updateAnalytics() {
        this.showNotification('آمار بروزرسانی شد', 'success');
        this.initAnalyticsCharts();
    }

    // Utility Functions
    formatDuration(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('fa-IR');
    }

    translateRole(role) {
        const roles = {
            'admin': 'ادمین',
            'user': 'کاربر',
            'vip': 'ویژه'
        };
        return roles[role] || role;
    }

    translateStatus(status) {
        const statuses = {
            'active': 'فعال',
            'inactive': 'غیرفعال',
            'banned': 'مسدود'
        };
        return statuses[status] || status;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'times' : 'info'}"></i>
            <span>${message}</span>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    toggleSidebar() {
        const sidebar = document.querySelector('.admin-sidebar');
        sidebar.classList.toggle('show');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
    }

    // Modal Functions
    showUploadModal() {
        document.getElementById('upload-modal').classList.remove('hidden');
    }

    showAddUserModal() {
        this.showNotification('فرم افزودن کاربر جدید', 'info');
    }

    showContentModal() {
        this.showNotification('فرم افزودن محتوای جدید', 'info');
    }

    showUploadFileModal() {
        this.showNotification('فرم آپلود فایل', 'info');
    }

    createNewPlaylist() {
        const name = prompt('نام پلی‌لیست جدید:');
        if (name && name.trim()) {
            const newPlaylist = {
                id: this.playlistsData.length + 1,
                name: name.trim(),
                tracks: [],
                cover: 'images/default-playlist.jpg',
                isPublic: true,
                createdBy: 1
            };
            this.playlistsData.push(newPlaylist);
            this.statistics.totalPlaylists++;
            this.updateStatistics();
            this.loadPlaylistManagement();
            this.showNotification('پلی‌لیست جدید ایجاد شد', 'success');
        }
    }

    editPlaylist(playlistId) {
        const playlist = this.playlistsData.find(p => p.id === playlistId);
        if (playlist) {
            this.showNotification(`ویرایش پلی‌لیست "${playlist.name}"`, 'info');
        }
    }

    deletePlaylist(playlistId) {
        if (confirm('آیا از حذف این پلی‌لیست اطمینان دارید؟')) {
            this.playlistsData = this.playlistsData.filter(p => p.id !== playlistId);
            this.statistics.totalPlaylists--;
            this.updateStatistics();
            this.loadPlaylistManagement();
            this.showNotification('پلی‌لیست با موفقیت حذف شد', 'success');
        }
    }
}

// Global Functions
function logout() {
    if (confirm('آیا می‌خواهید از پنل مدیریت خارج شوید؟')) {
        window.location.href = 'index.html';
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

function showUploadModal() {
    adminPanel.showUploadModal();
}

function showAddUserModal() {
    adminPanel.showAddUserModal();
}

function showContentModal() {
    adminPanel.showContentModal();
}

function showUploadFileModal() {
    adminPanel.showUploadFileModal();
}

function createNewPlaylist() {
    adminPanel.createNewPlaylist();
}

function createFolder() {
    adminPanel.createFolder();
}

function exportMusicData() {
    adminPanel.exportMusicData();
}

function updateAnalytics() {
    adminPanel.updateAnalytics();
}

function createBackup() {
    adminPanel.createBackup();
}

function restoreBackup() {
    adminPanel.restoreBackup();
}

function setupAutoBackup() {
    adminPanel.setupAutoBackup();
}

function toggleSidebar() {
    adminPanel.toggleSidebar();
}

// Initialize Admin Panel
document.addEventListener('DOMContentLoaded', () => {
    window.adminPanel = new AdminPanel();
});
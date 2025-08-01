<?php
// Set page variables
$page_title = "پنل مدیریت";
$page_description = "پنل مدیریت سایت موزیک استریم";

// Include header
include 'includes/header.php';

// Check if user is admin
if (!$auth->isAdmin()) {
    header('Location: index.php?error=access_denied');
    exit;
}

// Initialize classes
$music = new Music($db);

// Get statistics
$stats = [
    'total_tracks' => 0,
    'total_users' => 0,
    'total_plays' => 0,
    'total_likes' => 0
];

try {
    // Get total tracks
    $tracks_query = "SELECT COUNT(*) as count FROM tracks WHERE status = 'active'";
    $tracks_stmt = $db->prepare($tracks_query);
    $tracks_stmt->execute();
    $stats['total_tracks'] = $tracks_stmt->fetch()['count'];
    
    // Get total users
    $users_query = "SELECT COUNT(*) as count FROM users WHERE status = 'active'";
    $users_stmt = $db->prepare($users_query);
    $users_stmt->execute();
    $stats['total_users'] = $users_stmt->fetch()['count'];
    
    // Get total plays
    $plays_query = "SELECT SUM(plays_count) as total FROM tracks";
    $plays_stmt = $db->prepare($plays_query);
    $plays_stmt->execute();
    $stats['total_plays'] = $plays_stmt->fetch()['total'] ?? 0;
    
    // Get total likes
    $likes_query = "SELECT COUNT(*) as count FROM user_likes";
    $likes_stmt = $db->prepare($likes_query);
    $likes_stmt->execute();
    $stats['total_likes'] = $likes_stmt->fetch()['count'];
    
} catch (Exception $e) {
    error_log("Admin stats error: " . $e->getMessage());
}

// Get recent tracks for management
$recent_tracks = $music->getAllTracks(1, 10);

// Set additional JS
$additional_js = ['js/admin.php.js'];
?>

<!-- Admin Container -->
<div class="admin-container">
    <!-- Admin Sidebar -->
    <div class="admin-sidebar">
        <div class="admin-logo">
            <h2><i class="fas fa-shield-alt"></i> پنل مدیریت</h2>
        </div>
        
        <nav class="admin-nav">
            <ul>
                <li><a href="#" class="admin-nav-item active" data-section="dashboard">
                    <i class="fas fa-tachometer-alt"></i> داشبورد
                </a></li>
                <li><a href="#" class="admin-nav-item" data-section="music-management">
                    <i class="fas fa-music"></i> مدیریت موزیک
                </a></li>
                <li><a href="#" class="admin-nav-item" data-section="user-management">
                    <i class="fas fa-users"></i> مدیریت کاربران
                </a></li>
                <li><a href="#" class="admin-nav-item" data-section="playlist-management">
                    <i class="fas fa-list"></i> مدیریت پلی‌لیست‌ها
                </a></li>
                <li><a href="#" class="admin-nav-item" data-section="analytics">
                    <i class="fas fa-chart-bar"></i> آمار و گزارش
                </a></li>
                <li><a href="#" class="admin-nav-item" data-section="settings">
                    <i class="fas fa-cog"></i> تنظیمات
                </a></li>
                <li><a href="index.php" class="admin-nav-item">
                    <i class="fas fa-home"></i> بازگشت به سایت
                </a></li>
            </ul>
        </nav>
    </div>
    
    <!-- Admin Main Content -->
    <div class="admin-main">
        <!-- Admin Header -->
        <div class="admin-header">
            <div class="admin-header-left">
                <h1 id="page-title">داشبورد</h1>
            </div>
            <div class="admin-header-right">
                <div class="admin-user-info">
                    <img src="<?php echo $current_user['avatar'] ?: 'images/default-avatar.jpg'; ?>" alt="<?php echo htmlspecialchars($current_user['full_name']); ?>">
                    <span><?php echo htmlspecialchars($current_user['full_name']); ?></span>
                </div>
                <a href="logout.php" class="btn-logout">خروج</a>
            </div>
        </div>
        
        <!-- Dashboard Section -->
        <div class="admin-section active" id="dashboard">
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-music"></i>
                    </div>
                    <div class="stat-info">
                        <h3><?php echo number_format($stats['total_tracks']); ?></h3>
                        <p>کل آهنگ‌ها</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="stat-info">
                        <h3><?php echo number_format($stats['total_users']); ?></h3>
                        <p>کل کاربران</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-play"></i>
                    </div>
                    <div class="stat-info">
                        <h3><?php echo number_format($stats['total_plays']); ?></h3>
                        <p>کل پخش‌ها</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">
                        <i class="fas fa-heart"></i>
                    </div>
                    <div class="stat-info">
                        <h3><?php echo number_format($stats['total_likes']); ?></h3>
                        <p>کل پسندیده‌ها</p>
                    </div>
                </div>
            </div>
            
            <div class="dashboard-charts">
                <div class="chart-container">
                    <h3>آمار پخش ماهانه</h3>
                    <canvas id="monthly-plays-chart"></canvas>
                </div>
                <div class="chart-container">
                    <h3>آمار کاربران جدید</h3>
                    <canvas id="new-users-chart"></canvas>
                </div>
            </div>
        </div>
        
        <!-- Music Management Section -->
        <div class="admin-section" id="music-management">
            <div class="section-header">
                <h2>مدیریت موزیک</h2>
                <button class="btn-primary" id="add-track-btn">
                    <i class="fas fa-plus"></i> افزودن آهنگ جدید
                </button>
            </div>
            
            <div class="filters">
                <input type="text" id="music-search" placeholder="جستجوی آهنگ...">
                <select id="music-genre-filter">
                    <option value="">همه ژانرها</option>
                </select>
                <select id="music-status-filter">
                    <option value="">همه وضعیت‌ها</option>
                    <option value="active">فعال</option>
                    <option value="inactive">غیرفعال</option>
                    <option value="pending">در انتظار</option>
                </select>
            </div>
            
            <div class="music-table-container">
                <table class="admin-table" id="music-table">
                    <thead>
                        <tr>
                            <th>کاور</th>
                            <th>عنوان</th>
                            <th>هنرمند</th>
                            <th>ژانر</th>
                            <th>مدت زمان</th>
                            <th>تعداد پخش</th>
                            <th>وضعیت</th>
                            <th>عملیات</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php if ($recent_tracks['success'] && !empty($recent_tracks['tracks'])): ?>
                            <?php foreach ($recent_tracks['tracks'] as $track): ?>
                                <tr data-track-id="<?php echo $track['id']; ?>">
                                    <td>
                                        <img src="<?php echo $track['cover_image'] ?: 'images/default-cover.jpg'; ?>" 
                                             alt="Cover" class="track-cover-small">
                                    </td>
                                    <td><?php echo htmlspecialchars($track['title']); ?></td>
                                    <td><?php echo htmlspecialchars($track['artist_name']); ?></td>
                                    <td><?php echo htmlspecialchars($track['genre'] ?: '-'); ?></td>
                                    <td><?php echo $track['duration'] ? gmdate("i:s", $track['duration']) : '--:--'; ?></td>
                                    <td><?php echo number_format($track['plays_count']); ?></td>
                                    <td>
                                        <span class="status-badge status-<?php echo $track['status']; ?>">
                                            <?php 
                                            $status_labels = ['active' => 'فعال', 'inactive' => 'غیرفعال', 'pending' => 'در انتظار'];
                                            echo $status_labels[$track['status']] ?? $track['status'];
                                            ?>
                                        </span>
                                    </td>
                                    <td>
                                        <button class="btn-edit" data-track-id="<?php echo $track['id']; ?>">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn-delete" data-track-id="<?php echo $track['id']; ?>">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        <?php else: ?>
                            <tr>
                                <td colspan="8" class="no-data">آهنگی یافت نشد</td>
                            </tr>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- User Management Section -->
        <div class="admin-section" id="user-management">
            <div class="section-header">
                <h2>مدیریت کاربران</h2>
            </div>
            
            <div class="filters">
                <input type="text" id="user-search" placeholder="جستجوی کاربر...">
                <select id="user-role-filter">
                    <option value="">همه نقش‌ها</option>
                    <option value="user">کاربر عادی</option>
                    <option value="admin">مدیر</option>
                </select>
                <select id="user-status-filter">
                    <option value="">همه وضعیت‌ها</option>
                    <option value="active">فعال</option>
                    <option value="inactive">غیرفعال</option>
                    <option value="banned">مسدود</option>
                </select>
            </div>
            
            <div class="users-table-container">
                <table class="admin-table" id="users-table">
                    <thead>
                        <tr>
                            <th>آواتار</th>
                            <th>نام کامل</th>
                            <th>ایمیل</th>
                            <th>نقش</th>
                            <th>تاریخ عضویت</th>
                            <th>آخرین ورود</th>
                            <th>وضعیت</th>
                            <th>عملیات</th>
                        </tr>
                    </thead>
                    <tbody>
                        <!-- Users will be loaded dynamically -->
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Analytics Section -->
        <div class="admin-section" id="analytics">
            <div class="section-header">
                <h2>آمار و گزارش</h2>
                <div class="date-range-picker">
                    <input type="date" id="start-date">
                    <input type="date" id="end-date">
                    <button class="btn-secondary" id="apply-date-filter">اعمال</button>
                </div>
            </div>
            
            <div class="analytics-grid">
                <div class="analytics-card">
                    <h3>محبوب‌ترین آهنگ‌ها</h3>
                    <div id="popular-tracks-chart"></div>
                </div>
                <div class="analytics-card">
                    <h3>آمار ژانرها</h3>
                    <canvas id="genres-chart"></canvas>
                </div>
                <div class="analytics-card">
                    <h3>آمار روزانه</h3>
                    <canvas id="daily-stats-chart"></canvas>
                </div>
            </div>
        </div>
        
        <!-- Settings Section -->
        <div class="admin-section" id="settings">
            <div class="section-header">
                <h2>تنظیمات سیستم</h2>
            </div>
            
            <div class="settings-tabs">
                <button class="tab-btn active" data-tab="general">عمومی</button>
                <button class="tab-btn" data-tab="upload">آپلود</button>
                <button class="tab-btn" data-tab="security">امنیت</button>
                <button class="tab-btn" data-tab="backup">پشتیبان‌گیری</button>
            </div>
            
            <div class="settings-content">
                <div class="settings-tab active" id="general-tab">
                    <form id="general-settings-form">
                        <div class="form-group">
                            <label>نام سایت:</label>
                            <input type="text" name="site_name" value="<?php echo SITE_NAME; ?>">
                        </div>
                        <div class="form-group">
                            <label>ایمیل ادمین:</label>
                            <input type="email" name="admin_email" value="<?php echo ADMIN_EMAIL; ?>">
                        </div>
                        <div class="form-group">
                            <label>توضیحات سایت:</label>
                            <textarea name="site_description"></textarea>
                        </div>
                        <button type="submit" class="btn-primary">ذخیره تنظیمات</button>
                    </form>
                </div>
                
                <div class="settings-tab" id="upload-tab">
                    <form id="upload-settings-form">
                        <div class="form-group">
                            <label>حداکثر حجم فایل (مگابایت):</label>
                            <input type="number" name="max_file_size" value="<?php echo MAX_FILE_SIZE / 1024 / 1024; ?>">
                        </div>
                        <div class="form-group">
                            <label>فرمت‌های مجاز:</label>
                            <input type="text" name="allowed_formats" value="<?php echo implode(', ', ALLOWED_MUSIC_TYPES); ?>">
                        </div>
                        <button type="submit" class="btn-primary">ذخیره تنظیمات</button>
                    </form>
                </div>
                
                <div class="settings-tab" id="security-tab">
                    <form id="security-settings-form">
                        <div class="form-group">
                            <label>فعال‌سازی تأیید ایمیل:</label>
                            <input type="checkbox" name="email_verification">
                        </div>
                        <div class="form-group">
                            <label>محدودیت تلاش ورود:</label>
                            <input type="number" name="login_attempts" value="5">
                        </div>
                        <button type="submit" class="btn-primary">ذخیره تنظیمات</button>
                    </form>
                </div>
                
                <div class="settings-tab" id="backup-tab">
                    <div class="backup-controls">
                        <button class="btn-primary" id="create-backup-btn">
                            <i class="fas fa-download"></i> ایجاد پشتیبان
                        </button>
                        <button class="btn-secondary" id="restore-backup-btn">
                            <i class="fas fa-upload"></i> بازیابی پشتیبان
                        </button>
                    </div>
                    <div class="backup-list">
                        <!-- Backup files will be listed here -->
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Modals -->
<!-- Add Track Modal -->
<div class="modal hidden" id="add-track-modal">
    <div class="modal-content large">
        <div class="modal-header">
            <h3>افزودن آهنگ جدید</h3>
            <button class="modal-close">&times;</button>
        </div>
        <form id="add-track-form" enctype="multipart/form-data">
            <div class="form-row">
                <div class="form-group">
                    <label for="track-title">عنوان آهنگ:</label>
                    <input type="text" id="track-title" name="title" required>
                </div>
                <div class="form-group">
                    <label for="track-artist">هنرمند:</label>
                    <select id="track-artist" name="artist_id" required>
                        <option value="">انتخاب هنرمند</option>
                        <!-- Artists loaded dynamically -->
                    </select>
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="track-album">آلبوم:</label>
                    <select id="track-album" name="album_id">
                        <option value="">انتخاب آلبوم (اختیاری)</option>
                        <!-- Albums loaded dynamically -->
                    </select>
                </div>
                <div class="form-group">
                    <label for="track-genre">ژانر:</label>
                    <input type="text" id="track-genre" name="genre">
                </div>
            </div>
            <div class="form-group">
                <label for="track-file">فایل صوتی:</label>
                <input type="file" id="track-file" name="audio_file" accept=".mp3,.wav,.flac,.m4a" required>
            </div>
            <div class="form-group">
                <label for="track-lyrics">متن آهنگ:</label>
                <textarea id="track-lyrics" name="lyrics" rows="5"></textarea>
            </div>
            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" name="featured">
                    آهنگ ویژه
                </label>
            </div>
            <input type="hidden" name="csrf_token" value="<?php echo $auth->generateCSRFToken(); ?>">
            <div class="modal-footer">
                <button type="submit" class="btn-primary">افزودن آهنگ</button>
                <button type="button" class="btn-secondary modal-close">انصراف</button>
            </div>
        </form>
    </div>
</div>

<!-- Include Charts.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<?php
// Include footer
include 'includes/footer.php';
?>
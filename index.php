<?php
// Set page variables
$page_title = "صفحه اصلی";
$page_description = "سایت پخش آنلاین موسیقی - لذت شنیدن بهترین آهنگ‌ها";

// Include header
include 'includes/header.php';

// Initialize Music class
$music = new Music($db);

// Get featured tracks
$featured_tracks = $music->getAllTracks(1, 6, '', '', true);

// Get latest tracks
$latest_tracks = $music->getAllTracks(1, 12);

// Get genres for sidebar
$genres_result = $music->getGenres();
$genres = $genres_result['success'] ? $genres_result['genres'] : [];
?>

<!-- Sidebar -->
<div class="sidebar">
    <div class="logo">
        <h2><i class="fas fa-music"></i> موزیک استریم</h2>
    </div>
    
    <!-- Navigation -->
    <nav class="main-nav">
        <ul>
            <li><a href="#" class="nav-item active" data-page="home"><i class="fas fa-home"></i> خانه</a></li>
            <li><a href="#" class="nav-item" data-page="search"><i class="fas fa-search"></i> جستجو</a></li>
            <li><a href="#" class="nav-item" data-page="library"><i class="fas fa-music"></i> کتابخانه</a></li>
            <?php if ($current_user): ?>
                <li><a href="#" class="nav-item" data-page="likes"><i class="fas fa-heart"></i> پسندیده‌ها</a></li>
            <?php endif; ?>
        </ul>
    </nav>
    
    <!-- Genres -->
    <?php if (!empty($genres)): ?>
    <div class="sidebar-section">
        <h3>ژانرهای موسیقی</h3>
        <ul class="genre-list">
            <?php foreach ($genres as $genre): ?>
                <li><a href="#" class="genre-item" data-genre="<?php echo htmlspecialchars($genre); ?>"><?php echo htmlspecialchars($genre); ?></a></li>
            <?php endforeach; ?>
        </ul>
    </div>
    <?php endif; ?>
    
    <!-- Playlists -->
    <div class="sidebar-section">
        <div class="section-header">
            <h3>پلی‌لیست‌ها</h3>
            <?php if ($current_user): ?>
                <button class="btn-create-playlist" id="create-playlist-btn"><i class="fas fa-plus"></i></button>
            <?php endif; ?>
        </div>
        <div id="playlist-list">
            <?php if ($current_user): ?>
                <!-- Playlists will be loaded dynamically -->
            <?php else: ?>
                <p class="login-message">برای ایجاد پلی‌لیست وارد شوید</p>
            <?php endif; ?>
        </div>
    </div>
</div>

<!-- Main Content -->
<div class="main-content">
    <!-- Top Bar -->
    <div class="top-bar">
        <div class="search-container">
            <input type="text" id="search-input" placeholder="جستجوی آهنگ، هنرمند یا آلبوم...">
            <i class="fas fa-search search-icon"></i>
        </div>
        
        <div class="user-section">
            <?php if ($current_user): ?>
                <div class="user-dropdown">
                    <button class="user-btn">
                        <img src="<?php echo $current_user['avatar'] ?: 'images/default-avatar.jpg'; ?>" alt="<?php echo htmlspecialchars($current_user['full_name']); ?>">
                        <span><?php echo htmlspecialchars($current_user['full_name']); ?></span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="dropdown-menu">
                        <a href="profile.php"><i class="fas fa-user"></i> پروفایل</a>
                        <a href="settings.php"><i class="fas fa-cog"></i> تنظیمات</a>
                        <?php if ($current_user['role'] === 'admin'): ?>
                            <a href="admin.php"><i class="fas fa-shield-alt"></i> پنل مدیریت</a>
                        <?php endif; ?>
                        <a href="logout.php"><i class="fas fa-sign-out-alt"></i> خروج</a>
                    </div>
                </div>
            <?php else: ?>
                <button class="btn-login" id="login-btn">ورود</button>
                <button class="btn-register" id="register-btn">ثبت نام</button>
            <?php endif; ?>
        </div>
    </div>
    
    <!-- Page Content -->
    <div class="page-content">
        <!-- Home Page -->
        <div class="page-section active" id="home-page">
            <div class="welcome-section">
                <h1>به موزیک استریم خوش آمدید</h1>
                <p>لذت شنیدن بهترین آهنگ‌ها را تجربه کنید</p>
            </div>
            
            <!-- Featured Tracks -->
            <?php if ($featured_tracks['success'] && !empty($featured_tracks['tracks'])): ?>
            <section class="featured-section">
                <h2>آهنگ‌های ویژه</h2>
                <div class="featured-tracks">
                    <?php foreach ($featured_tracks['tracks'] as $track): ?>
                        <div class="featured-track" data-track-id="<?php echo $track['id']; ?>">
                            <div class="track-cover">
                                <img src="<?php echo $track['cover_image'] ?: 'images/default-cover.jpg'; ?>" alt="<?php echo htmlspecialchars($track['title']); ?>">
                                <div class="play-overlay">
                                    <button class="play-btn" data-track-id="<?php echo $track['id']; ?>">
                                        <i class="fas fa-play"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="track-info">
                                <h3><?php echo htmlspecialchars($track['title']); ?></h3>
                                <p><?php echo htmlspecialchars($track['artist_name']); ?></p>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </section>
            <?php endif; ?>
            
            <!-- Latest Tracks -->
            <?php if ($latest_tracks['success'] && !empty($latest_tracks['tracks'])): ?>
            <section class="latest-section">
                <h2>آخرین آهنگ‌ها</h2>
                <div class="track-list">
                    <?php foreach ($latest_tracks['tracks'] as $index => $track): ?>
                        <div class="track-item" data-track-id="<?php echo $track['id']; ?>">
                            <div class="track-number"><?php echo $index + 1; ?></div>
                            <div class="track-cover">
                                <img src="<?php echo $track['cover_image'] ?: 'images/default-cover.jpg'; ?>" alt="<?php echo htmlspecialchars($track['title']); ?>">
                            </div>
                            <div class="track-details">
                                <h4><?php echo htmlspecialchars($track['title']); ?></h4>
                                <p><?php echo htmlspecialchars($track['artist_name']); ?></p>
                            </div>
                            <div class="track-album">
                                <?php echo htmlspecialchars($track['album_title'] ?: 'تک آهنگ'); ?>
                            </div>
                            <div class="track-duration">
                                <?php echo $track['duration'] ? gmdate("i:s", $track['duration']) : '--:--'; ?>
                            </div>
                            <div class="track-actions">
                                <button class="btn-play" data-track-id="<?php echo $track['id']; ?>">
                                    <i class="fas fa-play"></i>
                                </button>
                                <?php if ($current_user): ?>
                                    <button class="btn-like" data-track-id="<?php echo $track['id']; ?>">
                                        <i class="far fa-heart"></i>
                                    </button>
                                    <button class="btn-add-playlist" data-track-id="<?php echo $track['id']; ?>">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                <?php endif; ?>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
                
                <?php if ($latest_tracks['pagination']['total_pages'] > 1): ?>
                    <div class="pagination">
                        <button class="btn-load-more" data-page="2">بارگذاری بیشتر</button>
                    </div>
                <?php endif; ?>
            </section>
            <?php endif; ?>
        </div>
        
        <!-- Search Page -->
        <div class="page-section" id="search-page">
            <div class="search-header">
                <h2>نتایج جستجو</h2>
                <div class="search-filters">
                    <select id="genre-filter">
                        <option value="">همه ژانرها</option>
                        <?php foreach ($genres as $genre): ?>
                            <option value="<?php echo htmlspecialchars($genre); ?>"><?php echo htmlspecialchars($genre); ?></option>
                        <?php endforeach; ?>
                    </select>
                </div>
            </div>
            <div id="search-results">
                <p class="no-results">چیزی جستجو کنید...</p>
            </div>
        </div>
        
        <!-- Library Page -->
        <div class="page-section" id="library-page">
            <?php if ($current_user): ?>
                <div class="library-header">
                    <h2>کتابخانه موسیقی</h2>
                    <div class="library-tabs">
                        <button class="tab-btn active" data-tab="liked">پسندیده‌ها</button>
                        <button class="tab-btn" data-tab="playlists">پلی‌لیست‌ها</button>
                        <button class="tab-btn" data-tab="recent">اخیراً شنیده</button>
                    </div>
                </div>
                <div id="library-content">
                    <!-- Content loaded dynamically -->
                </div>
            <?php else: ?>
                <div class="login-required">
                    <h2>ورود به حساب کاربری</h2>
                    <p>برای دسترسی به کتابخانه موسیقی وارد شوید</p>
                    <button class="btn-login-large">ورود</button>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>

<!-- Player Bar -->
<div class="player-bar">
    <div class="player-track-info">
        <div class="track-cover">
            <img id="player-cover" src="images/default-cover.jpg" alt="Track Cover">
        </div>
        <div class="track-details">
            <h4 id="player-title">آهنگی انتخاب نشده</h4>
            <p id="player-artist">هنرمند</p>
        </div>
    </div>
    
    <div class="player-controls">
        <div class="control-buttons">
            <button id="shuffle-btn" class="control-btn"><i class="fas fa-random"></i></button>
            <button id="prev-btn" class="control-btn"><i class="fas fa-step-backward"></i></button>
            <button id="play-pause-btn" class="control-btn main-btn"><i class="fas fa-play"></i></button>
            <button id="next-btn" class="control-btn"><i class="fas fa-step-forward"></i></button>
            <button id="repeat-btn" class="control-btn"><i class="fas fa-redo"></i></button>
        </div>
        <div class="progress-container">
            <span id="current-time">0:00</span>
            <div class="progress-bar">
                <div class="progress-fill" id="progress-fill"></div>
                <div class="progress-handle" id="progress-handle"></div>
            </div>
            <span id="total-time">0:00</span>
        </div>
    </div>
    
    <div class="player-extra">
        <?php if ($current_user): ?>
            <button id="like-current-btn" class="control-btn"><i class="far fa-heart"></i></button>
        <?php endif; ?>
        <div class="volume-container">
            <button id="volume-btn" class="control-btn"><i class="fas fa-volume-up"></i></button>
            <div class="volume-slider">
                <input type="range" id="volume-range" min="0" max="100" value="70">
            </div>
        </div>
    </div>
</div>

<!-- Modals -->
<?php if (!$current_user): ?>
<!-- Login Modal -->
<div class="modal hidden" id="login-modal">
    <div class="modal-content">
        <div class="modal-header">
            <h3>ورود به حساب کاربری</h3>
            <button class="modal-close">&times;</button>
        </div>
        <form id="login-form" method="POST" action="api/login.php">
            <div class="form-group">
                <label for="login-email">ایمیل:</label>
                <input type="email" id="login-email" name="email" required>
            </div>
            <div class="form-group">
                <label for="login-password">رمز عبور:</label>
                <input type="password" id="login-password" name="password" required>
            </div>
            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" name="remember" id="remember-me">
                    مرا به خاطر بسپار
                </label>
            </div>
            <input type="hidden" name="csrf_token" value="<?php echo $auth->generateCSRFToken(); ?>">
            <button type="submit" class="btn-submit">ورود</button>
        </form>
        <div class="modal-footer">
            <p>حساب کاربری ندارید؟ <a href="#" id="switch-to-register">ثبت نام کنید</a></p>
        </div>
    </div>
</div>

<!-- Register Modal -->
<div class="modal hidden" id="register-modal">
    <div class="modal-content">
        <div class="modal-header">
            <h3>ثبت نام</h3>
            <button class="modal-close">&times;</button>
        </div>
        <form id="register-form" method="POST" action="api/register.php">
            <div class="form-group">
                <label for="register-fullname">نام کامل:</label>
                <input type="text" id="register-fullname" name="full_name" required>
            </div>
            <div class="form-group">
                <label for="register-username">نام کاربری:</label>
                <input type="text" id="register-username" name="username" required>
            </div>
            <div class="form-group">
                <label for="register-email">ایمیل:</label>
                <input type="email" id="register-email" name="email" required>
            </div>
            <div class="form-group">
                <label for="register-password">رمز عبور:</label>
                <input type="password" id="register-password" name="password" required>
            </div>
            <div class="form-group">
                <label for="register-confirm">تکرار رمز عبور:</label>
                <input type="password" id="register-confirm" name="password_confirm" required>
            </div>
            <input type="hidden" name="csrf_token" value="<?php echo $auth->generateCSRFToken(); ?>">
            <button type="submit" class="btn-submit">ثبت نام</button>
        </form>
        <div class="modal-footer">
            <p>قبلاً ثبت نام کرده‌اید؟ <a href="#" id="switch-to-login">وارد شوید</a></p>
        </div>
    </div>
</div>
<?php endif; ?>

<!-- Audio Element -->
<audio id="audio-player" preload="none"></audio>

<?php
// Include footer
include 'includes/footer.php';
?>
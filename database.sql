-- Music Streaming Database Structure
-- Compatible with cPanel MySQL

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

-- Users Table
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `role` enum('admin','user','vip') DEFAULT 'user',
  `status` enum('active','inactive','banned') DEFAULT 'active',
  `email_verified` tinyint(1) DEFAULT 0,
  `verification_token` varchar(255) DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_expires` datetime DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_role` (`role`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Artists Table
CREATE TABLE `artists` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `bio` text,
  `image` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `social_links` json DEFAULT NULL,
  `verified` tinyint(1) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_name` (`name`),
  KEY `idx_verified` (`verified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Albums Table
CREATE TABLE `albums` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `artist_id` int(11) NOT NULL,
  `description` text,
  `cover_image` varchar(255) DEFAULT NULL,
  `release_date` date DEFAULT NULL,
  `genre` varchar(50) DEFAULT NULL,
  `total_tracks` int(11) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_artist` (`artist_id`),
  KEY `idx_genre` (`genre`),
  KEY `idx_release_date` (`release_date`),
  FOREIGN KEY (`artist_id`) REFERENCES `artists` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tracks Table
CREATE TABLE `tracks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(150) NOT NULL,
  `slug` varchar(150) NOT NULL,
  `artist_id` int(11) NOT NULL,
  `album_id` int(11) DEFAULT NULL,
  `file_path` varchar(500) NOT NULL,
  `cover_image` varchar(255) DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  `file_size` bigint(20) DEFAULT NULL,
  `bitrate` int(11) DEFAULT NULL,
  `genre` varchar(50) DEFAULT NULL,
  `lyrics` text,
  `track_number` int(11) DEFAULT NULL,
  `plays_count` int(11) DEFAULT 0,
  `downloads_count` int(11) DEFAULT 0,
  `likes_count` int(11) DEFAULT 0,
  `featured` tinyint(1) DEFAULT 0,
  `status` enum('active','inactive','pending') DEFAULT 'active',
  `uploaded_by` int(11) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_artist` (`artist_id`),
  KEY `idx_album` (`album_id`),
  KEY `idx_genre` (`genre`),
  KEY `idx_featured` (`featured`),
  KEY `idx_status` (`status`),
  KEY `idx_plays` (`plays_count`),
  KEY `idx_uploaded_by` (`uploaded_by`),
  FOREIGN KEY (`artist_id`) REFERENCES `artists` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`album_id`) REFERENCES `albums` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Playlists Table
CREATE TABLE `playlists` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `description` text,
  `cover_image` varchar(255) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `is_public` tinyint(1) DEFAULT 1,
  `is_featured` tinyint(1) DEFAULT 0,
  `tracks_count` int(11) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_slug` (`user_id`, `slug`),
  KEY `idx_user` (`user_id`),
  KEY `idx_public` (`is_public`),
  KEY `idx_featured` (`is_featured`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Playlist Tracks Table
CREATE TABLE `playlist_tracks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `playlist_id` int(11) NOT NULL,
  `track_id` int(11) NOT NULL,
  `position` int(11) NOT NULL,
  `added_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `playlist_track` (`playlist_id`, `track_id`),
  KEY `idx_position` (`position`),
  FOREIGN KEY (`playlist_id`) REFERENCES `playlists` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`track_id`) REFERENCES `tracks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User Likes Table
CREATE TABLE `user_likes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `track_id` int(11) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_track` (`user_id`, `track_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`track_id`) REFERENCES `tracks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Play History Table
CREATE TABLE `play_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `track_id` int(11) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `duration_played` int(11) DEFAULT NULL,
  `completed` tinyint(1) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_track` (`track_id`),
  KEY `idx_date` (`created_at`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`track_id`) REFERENCES `tracks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Genres Table
CREATE TABLE `genres` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `slug` varchar(50) NOT NULL,
  `description` text,
  `image` varchar(255) DEFAULT NULL,
  `color` varchar(7) DEFAULT NULL,
  `tracks_count` int(11) DEFAULT 0,
  `featured` tinyint(1) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_featured` (`featured`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Settings Table
CREATE TABLE `settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `key` varchar(100) NOT NULL,
  `value` text,
  `type` enum('string','integer','boolean','json','text') DEFAULT 'string',
  `description` text,
  `group` varchar(50) DEFAULT 'general',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`),
  KEY `idx_group` (`group`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pages Table
CREATE TABLE `pages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `slug` varchar(200) NOT NULL,
  `content` longtext,
  `excerpt` text,
  `meta_title` varchar(200) DEFAULT NULL,
  `meta_description` text,
  `status` enum('published','draft','private') DEFAULT 'draft',
  `template` varchar(50) DEFAULT 'default',
  `featured_image` varchar(255) DEFAULT NULL,
  `author_id` int(11) DEFAULT NULL,
  `published_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_status` (`status`),
  KEY `idx_author` (`author_id`),
  FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Comments Table
CREATE TABLE `comments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `track_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `status` enum('approved','pending','spam') DEFAULT 'pending',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_track` (`track_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_parent` (`parent_id`),
  KEY `idx_status` (`status`),
  FOREIGN KEY (`track_id`) REFERENCES `tracks` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`parent_id`) REFERENCES `comments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Banners Table
CREATE TABLE `banners` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `description` text,
  `image` varchar(255) NOT NULL,
  `link_url` varchar(500) DEFAULT NULL,
  `link_text` varchar(50) DEFAULT NULL,
  `position` varchar(50) DEFAULT 'homepage',
  `order_index` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `start_date` timestamp NULL DEFAULT NULL,
  `end_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_position` (`position`),
  KEY `idx_active` (`is_active`),
  KEY `idx_order` (`order_index`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Analytics Table
CREATE TABLE `analytics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `metric` varchar(50) NOT NULL,
  `value` bigint(20) DEFAULT 0,
  `additional_data` json DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `date_metric` (`date`, `metric`),
  KEY `idx_date` (`date`),
  KEY `idx_metric` (`metric`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Default Data

-- Default Admin User
INSERT INTO `users` (`username`, `email`, `password`, `first_name`, `last_name`, `role`, `status`, `email_verified`) VALUES
('admin', 'admin@yourdomain.com', '$2y$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxweMqJr.lPUqD1BhFfmYYmjJmK', 'مدیر', 'سیستم', 'admin', 'active', 1);

-- Default Genres
INSERT INTO `genres` (`name`, `slug`, `description`, `color`, `featured`) VALUES
('پاپ', 'pop', 'موسیقی پاپ ایرانی', '#1DB954', 1),
('راک', 'rock', 'موسیقی راک', '#E22134', 1),
('سنتی', 'traditional', 'موسیقی سنتی ایرانی', '#FF9500', 1),
('بالاد', 'ballad', 'آهنگ‌های بالاد', '#00D4FF', 1),
('کلاسیک', 'classical', 'موسیقی کلاسیک', '#8B5CF6', 0),
('فولک', 'folk', 'موسیقی فولک', '#10B981', 0);

-- Default Settings
INSERT INTO `settings` (`key`, `value`, `type`, `description`, `group`) VALUES
('site_name', 'موزیک استریم', 'string', 'نام سایت', 'general'),
('site_description', 'پخش آنلاین موسیقی', 'string', 'توضیحات سایت', 'general'),
('admin_email', 'admin@yourdomain.com', 'string', 'ایمیل مدیر', 'general'),
('registration_enabled', '1', 'boolean', 'امکان ثبت نام کاربران', 'users'),
('email_verification', '0', 'boolean', 'تأیید ایمیل برای ثبت نام', 'users'),
('max_upload_size', '52428800', 'integer', 'حداکثر حجم آپلود (بایت)', 'uploads'),
('allowed_formats', '["mp3","wav","flac","m4a"]', 'json', 'فرمت‌های مجاز', 'uploads'),
('player_autoplay', '0', 'boolean', 'پخش خودکار', 'player'),
('player_shuffle', '0', 'boolean', 'پخش تصادفی پیش‌فرض', 'player'),
('analytics_enabled', '1', 'boolean', 'فعال بودن آمارگیری', 'analytics');

-- Sample Artists
INSERT INTO `artists` (`name`, `slug`, `bio`, `verified`) VALUES
('محمد علیزاده', 'mohammad-alizadeh', 'خواننده محبوب موسیقی پاپ ایرانی', 1),
('حمید هیراد', 'hamid-hirad', 'آهنگساز و خواننده', 1),
('سیروان خسروی', 'sirvan-khosravi', 'خواننده و نوازنده', 1);

-- Sample Albums
INSERT INTO `albums` (`title`, `slug`, `artist_id`, `description`, `release_date`, `genre`) VALUES
('آلبوم عاشقانه', 'romantic-album', 1, 'مجموعه آهنگ‌های عاشقانه', '2024-01-01', 'پاپ'),
('بازگشت', 'bazgasht', 2, 'آلبوم بازگشت', '2024-01-15', 'پاپ'),
('شب‌های تهران', 'tehran-nights', 3, 'آلبوم شب‌های تهران', '2024-02-01', 'راک');

-- Create upload directories
-- Note: These directories should be created manually on the server
-- uploads/
-- uploads/music/
-- uploads/images/
-- uploads/covers/
-- uploads/avatars/

COMMIT;
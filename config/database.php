<?php
// Database Configuration for cPanel
class Database {
    private $host = 'localhost';
    private $db_name = 'gbtechir_musicly';
    private $username = 'gbtechir_hzd';
    private $password = 'H.m33343536';
    private $charset = 'utf8mb4';
    public $conn;

    public function getConnection() {
        $this->conn = null;
        
        try {
            $dsn = "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=" . $this->charset;
            $this->conn = new PDO($dsn, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch(PDOException $exception) {
            error_log("Connection error: " . $exception->getMessage());
            return false;
        }
        
        return $this->conn;
    }

    public function closeConnection() {
        $this->conn = null;
    }
}

// Database Settings
define('DB_HOST', 'localhost');
define('DB_NAME', 'gbtechir_musicly');
define('DB_USER', 'gbtechir_hzd');
define('DB_PASS', 'H.m33343536');
define('DB_CHARSET', 'utf8mb4');

// Site Settings
define('SITE_URL', 'https://gbtech.ir');
define('SITE_NAME', 'موزیک استریم');
define('ADMIN_EMAIL', 'admin@gbtech.ir');

// Upload Settings
define('UPLOAD_PATH', 'uploads/');
define('MUSIC_PATH', 'uploads/music/');
define('IMAGES_PATH', 'uploads/images/');
define('MAX_FILE_SIZE', 50 * 1024 * 1024); // 50MB

// Security Settings
define('JWT_SECRET', 'gbtech_musicly_secret_key_2024_hzd_secure');
define('BCRYPT_COST', 12);

// API Settings
define('API_VERSION', 'v1');
define('API_BASE_URL', SITE_URL . '/api/' . API_VERSION . '/');

// File Types
define('ALLOWED_MUSIC_TYPES', ['mp3', 'wav', 'flac', 'm4a']);
define('ALLOWED_IMAGE_TYPES', ['jpg', 'jpeg', 'png', 'gif', 'webp']);

// Error Reporting (Set to 0 in production)
if ($_SERVER['HTTP_HOST'] === 'localhost' || strpos($_SERVER['HTTP_HOST'], '192.168.') !== false) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
    define('DEBUG_MODE', true);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
    define('DEBUG_MODE', false);
}

// Timezone
date_default_timezone_set('Asia/Tehran');

// Session Settings
ini_set('session.cookie_httponly', 1);
ini_set('session.use_only_cookies', 1);
ini_set('session.cookie_secure', isset($_SERVER['HTTPS']));

// CORS Settings
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>
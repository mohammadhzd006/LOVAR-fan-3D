<?php
session_start();
require_once 'config/database.php';
require_once 'classes/Auth.php';
require_once 'classes/Music.php';
require_once 'classes/User.php';

// Initialize database connection
$database = new Database();
$db = $database->getConnection();

// Initialize Auth system
$auth = new Auth($db);
$current_user = $auth->getCurrentUser();

// Site settings
$site_name = SITE_NAME;
$site_url = SITE_URL;
?>
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo isset($page_title) ? $page_title . ' - ' . $site_name : $site_name; ?></title>
    <meta name="description" content="<?php echo isset($page_description) ? $page_description : 'سایت پخش آنلاین موسیقی'; ?>">
    
    <!-- CSS Files -->
    <link rel="stylesheet" href="css/style.css">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Vazir:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="images/favicon.ico">
    
    <!-- SEO Meta Tags -->
    <meta property="og:title" content="<?php echo isset($page_title) ? $page_title : $site_name; ?>">
    <meta property="og:description" content="<?php echo isset($page_description) ? $page_description : 'سایت پخش آنلاین موسیقی'; ?>">
    <meta property="og:url" content="<?php echo $site_url . $_SERVER['REQUEST_URI']; ?>">
    <meta property="og:type" content="website">
    <meta property="og:image" content="<?php echo $site_url; ?>/images/og-image.jpg">
    
    <!-- CSRF Token -->
    <meta name="csrf-token" content="<?php echo $auth->generateCSRFToken(); ?>">
    
    <!-- User Data for JavaScript -->
    <script>
        window.SITE_CONFIG = {
            site_url: '<?php echo $site_url; ?>',
            current_user: <?php echo $current_user ? json_encode($current_user) : 'null'; ?>,
            csrf_token: '<?php echo $auth->generateCSRFToken(); ?>',
            is_admin: <?php echo ($current_user && $current_user['role'] === 'admin') ? 'true' : 'false'; ?>
        };
    </script>
</head>
<body>
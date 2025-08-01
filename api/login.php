<?php
header('Content-Type: application/json');
session_start();

require_once '../config/database.php';
require_once '../classes/Auth.php';

// Initialize
$database = new Database();
$db = $database->getConnection();
$auth = new Auth($db);

$response = ['success' => false];

try {
    // Check if request is POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        $response['message'] = 'متد درخواست باید POST باشد';
        echo json_encode($response);
        exit;
    }
    
    // Verify CSRF token
    if (!$auth->verifyCSRFToken($_POST['csrf_token'] ?? '')) {
        $response['message'] = 'توکن امنیتی نامعتبر است';
        echo json_encode($response);
        exit;
    }
    
    // Get input data
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $remember = isset($_POST['remember']);
    
    // Validate input
    if (empty($email) || empty($password)) {
        $response['message'] = 'ایمیل و رمز عبور الزامی است';
        echo json_encode($response);
        exit;
    }
    
    // Attempt login
    $login_result = $auth->login($email, $password, $remember);
    
    if ($login_result['success']) {
        $response = $login_result;
        
        // For AJAX requests, return success
        if (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && 
            strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') {
            echo json_encode($response);
        } else {
            // For regular form submissions, redirect
            header('Location: ../index.php?login=success');
        }
    } else {
        $response = $login_result;
        echo json_encode($response);
    }
    
} catch (Exception $e) {
    error_log("Login API error: " . $e->getMessage());
    $response['message'] = 'خطای سیستمی رخ داده است';
    echo json_encode($response);
}

$database->closeConnection();
?>
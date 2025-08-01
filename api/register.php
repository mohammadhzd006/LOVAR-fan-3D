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
    $data = [
        'full_name' => trim($_POST['full_name'] ?? ''),
        'username' => trim($_POST['username'] ?? ''),
        'email' => trim($_POST['email'] ?? ''),
        'password' => $_POST['password'] ?? '',
        'password_confirm' => $_POST['password_confirm'] ?? ''
    ];
    
    // Validate password confirmation
    if ($data['password'] !== $data['password_confirm']) {
        $response['message'] = 'رمز عبور و تکرار آن مطابقت ندارند';
        echo json_encode($response);
        exit;
    }
    
    // Remove password confirmation from data
    unset($data['password_confirm']);
    
    // Attempt registration
    $register_result = $auth->register($data);
    
    if ($register_result['success']) {
        $response = $register_result;
        
        // Auto-login after successful registration
        $login_result = $auth->login($data['email'], $data['password']);
        if ($login_result['success']) {
            $response['user'] = $login_result['user'];
            $response['token'] = $login_result['token'];
        }
        
        // For AJAX requests, return success
        if (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && 
            strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') {
            echo json_encode($response);
        } else {
            // For regular form submissions, redirect
            header('Location: ../index.php?register=success');
        }
    } else {
        $response = $register_result;
        echo json_encode($response);
    }
    
} catch (Exception $e) {
    error_log("Register API error: " . $e->getMessage());
    $response['message'] = 'خطای سیستمی رخ داده است';
    echo json_encode($response);
}

$database->closeConnection();
?>
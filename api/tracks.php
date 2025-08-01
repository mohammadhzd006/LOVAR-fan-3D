<?php
header('Content-Type: application/json');
session_start();

require_once '../config/database.php';
require_once '../classes/Auth.php';
require_once '../classes/Music.php';

// Initialize
$database = new Database();
$db = $database->getConnection();
$auth = new Auth($db);
$music = new Music($db);

$response = ['success' => false];

try {
    $method = $_SERVER['REQUEST_METHOD'];
    
    switch ($method) {
        case 'GET':
            // Get tracks with optional filters
            $page = (int)($_GET['page'] ?? 1);
            $limit = (int)($_GET['limit'] ?? 20);
            $search = $_GET['search'] ?? '';
            $genre = $_GET['genre'] ?? '';
            $featured = isset($_GET['featured']) && $_GET['featured'] === 'true';
            
            $result = $music->getAllTracks($page, $limit, $search, $genre, $featured);
            $response = $result;
            break;
            
        case 'POST':
            // Add new track (admin only)
            if (!$auth->isAdmin()) {
                $response['message'] = 'دسترسی غیرمجاز';
                break;
            }
            
            // Verify CSRF token
            if (!$auth->verifyCSRFToken($_POST['csrf_token'] ?? '')) {
                $response['message'] = 'توکن امنیتی نامعتبر است';
                break;
            }
            
            $data = [
                'title' => $_POST['title'] ?? '',
                'artist_id' => $_POST['artist_id'] ?? '',
                'album_id' => $_POST['album_id'] ?? null,
                'genre' => $_POST['genre'] ?? '',
                'lyrics' => $_POST['lyrics'] ?? '',
                'track_number' => $_POST['track_number'] ?? null,
                'featured' => isset($_POST['featured']) ? 1 : 0,
                'uploaded_by' => $auth->getCurrentUser()['id']
            ];
            
            $file_info = $_FILES['audio_file'] ?? null;
            $result = $music->addTrack($data, $file_info);
            $response = $result;
            break;
            
        case 'PUT':
            // Update track (admin only)
            if (!$auth->isAdmin()) {
                $response['message'] = 'دسترسی غیرمجاز';
                break;
            }
            
            parse_str(file_get_contents("php://input"), $put_data);
            
            if (!$auth->verifyCSRFToken($put_data['csrf_token'] ?? '')) {
                $response['message'] = 'توکن امنیتی نامعتبر است';
                break;
            }
            
            $track_id = $put_data['id'] ?? '';
            if (empty($track_id)) {
                $response['message'] = 'شناسه آهنگ الزامی است';
                break;
            }
            
            $update_data = [
                'title' => $put_data['title'] ?? null,
                'artist_id' => $put_data['artist_id'] ?? null,
                'album_id' => $put_data['album_id'] ?? null,
                'genre' => $put_data['genre'] ?? null,
                'lyrics' => $put_data['lyrics'] ?? null,
                'track_number' => $put_data['track_number'] ?? null,
                'featured' => isset($put_data['featured']) ? 1 : 0
            ];
            
            // Remove null values
            $update_data = array_filter($update_data, function($value) {
                return $value !== null;
            });
            
            $result = $music->updateTrack($track_id, $update_data);
            $response = $result;
            break;
            
        case 'DELETE':
            // Delete track (admin only)
            if (!$auth->isAdmin()) {
                $response['message'] = 'دسترسی غیرمجاز';
                break;
            }
            
            parse_str(file_get_contents("php://input"), $delete_data);
            
            if (!$auth->verifyCSRFToken($delete_data['csrf_token'] ?? '')) {
                $response['message'] = 'توکن امنیتی نامعتبر است';
                break;
            }
            
            $track_id = $delete_data['id'] ?? '';
            if (empty($track_id)) {
                $response['message'] = 'شناسه آهنگ الزامی است';
                break;
            }
            
            $result = $music->deleteTrack($track_id);
            $response = $result;
            break;
            
        default:
            $response['message'] = 'متد درخواست پشتیبانی نمی‌شود';
            break;
    }
    
} catch (Exception $e) {
    error_log("Tracks API error: " . $e->getMessage());
    $response['message'] = 'خطای سیستمی رخ داده است';
}

echo json_encode($response);
$database->closeConnection();
?>
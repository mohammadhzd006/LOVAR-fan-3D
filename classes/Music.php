<?php
class Music {
    private $db;
    private $tracks_table = "tracks";
    private $artists_table = "artists";
    private $albums_table = "albums";
    private $playlists_table = "playlists";
    private $playlist_tracks_table = "playlist_tracks";
    private $user_likes_table = "user_likes";
    private $play_history_table = "play_history";
    
    public function __construct($database) {
        $this->db = $database;
    }
    
    // Get all tracks with pagination
    public function getAllTracks($page = 1, $limit = 20, $search = '', $genre = '', $featured = false) {
        try {
            $offset = ($page - 1) * $limit;
            
            $where_conditions = ["t.status = 'active'"];
            $params = [];
            
            if (!empty($search)) {
                $where_conditions[] = "(t.title LIKE :search OR a.name LIKE :search OR al.title LIKE :search)";
                $params[':search'] = "%$search%";
            }
            
            if (!empty($genre)) {
                $where_conditions[] = "t.genre = :genre";
                $params[':genre'] = $genre;
            }
            
            if ($featured) {
                $where_conditions[] = "t.featured = 1";
            }
            
            $where_clause = implode(' AND ', $where_conditions);
            
            $query = "SELECT t.*, a.name as artist_name, al.title as album_title,
                            (SELECT COUNT(*) FROM {$this->user_likes_table} WHERE track_id = t.id) as likes_count
                     FROM {$this->tracks_table} t 
                     LEFT JOIN {$this->artists_table} a ON t.artist_id = a.id 
                     LEFT JOIN {$this->albums_table} al ON t.album_id = al.id 
                     WHERE $where_clause 
                     ORDER BY t.created_at DESC 
                     LIMIT :limit OFFSET :offset";
            
            $stmt = $this->db->prepare($query);
            
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
            
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            
            $tracks = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Get total count
            $count_query = "SELECT COUNT(*) as total 
                           FROM {$this->tracks_table} t 
                           LEFT JOIN {$this->artists_table} a ON t.artist_id = a.id 
                           LEFT JOIN {$this->albums_table} al ON t.album_id = al.id 
                           WHERE $where_clause";
            
            $count_stmt = $this->db->prepare($count_query);
            foreach ($params as $key => $value) {
                $count_stmt->bindValue($key, $value);
            }
            $count_stmt->execute();
            $total = $count_stmt->fetch(PDO::FETCH_ASSOC)['total'];
            
            return [
                'success' => true,
                'tracks' => $tracks,
                'pagination' => [
                    'current_page' => $page,
                    'total_pages' => ceil($total / $limit),
                    'total_items' => $total,
                    'items_per_page' => $limit
                ]
            ];
            
        } catch (Exception $e) {
            error_log("Get tracks error: " . $e->getMessage());
            return ['success' => false, 'message' => 'خطا در دریافت آهنگ‌ها'];
        }
    }
    
    // Get track by ID
    public function getTrackById($id) {
        try {
            $query = "SELECT t.*, a.name as artist_name, al.title as album_title,
                            (SELECT COUNT(*) FROM {$this->user_likes_table} WHERE track_id = t.id) as likes_count
                     FROM {$this->tracks_table} t 
                     LEFT JOIN {$this->artists_table} a ON t.artist_id = a.id 
                     LEFT JOIN {$this->albums_table} al ON t.album_id = al.id 
                     WHERE t.id = :id AND t.status = 'active'";
            
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id);
            $stmt->execute();
            
            if ($stmt->rowCount() > 0) {
                return ['success' => true, 'track' => $stmt->fetch(PDO::FETCH_ASSOC)];
            }
            
            return ['success' => false, 'message' => 'آهنگ یافت نشد'];
            
        } catch (Exception $e) {
            error_log("Get track error: " . $e->getMessage());
            return ['success' => false, 'message' => 'خطا در دریافت آهنگ'];
        }
    }
    
    // Add new track
    public function addTrack($data, $file_info = null) {
        try {
            // Validate required fields
            if (empty($data['title']) || empty($data['artist_id'])) {
                return ['success' => false, 'message' => 'عنوان آهنگ و هنرمند الزامی است'];
            }
            
            // Generate unique slug
            $slug = $this->generateSlug($data['title']);
            
            // Handle file upload if provided
            $file_path = null;
            $file_size = null;
            $duration = null;
            
            if ($file_info && $file_info['error'] === UPLOAD_ERR_OK) {
                $upload_result = $this->handleFileUpload($file_info);
                if (!$upload_result['success']) {
                    return $upload_result;
                }
                $file_path = $upload_result['file_path'];
                $file_size = $upload_result['file_size'];
                $duration = $upload_result['duration'] ?? null;
            }
            
            $query = "INSERT INTO {$this->tracks_table} 
                     (title, slug, artist_id, album_id, file_path, cover_image, duration, 
                      file_size, bitrate, genre, lyrics, track_number, featured, uploaded_by, created_at) 
                     VALUES (:title, :slug, :artist_id, :album_id, :file_path, :cover_image, :duration, 
                             :file_size, :bitrate, :genre, :lyrics, :track_number, :featured, :uploaded_by, NOW())";
            
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':title', $data['title']);
            $stmt->bindParam(':slug', $slug);
            $stmt->bindParam(':artist_id', $data['artist_id']);
            $stmt->bindParam(':album_id', $data['album_id'] ?? null);
            $stmt->bindParam(':file_path', $file_path);
            $stmt->bindParam(':cover_image', $data['cover_image'] ?? null);
            $stmt->bindParam(':duration', $duration);
            $stmt->bindParam(':file_size', $file_size);
            $stmt->bindParam(':bitrate', $data['bitrate'] ?? null);
            $stmt->bindParam(':genre', $data['genre'] ?? null);
            $stmt->bindParam(':lyrics', $data['lyrics'] ?? null);
            $stmt->bindParam(':track_number', $data['track_number'] ?? null);
            $stmt->bindParam(':featured', $data['featured'] ?? 0);
            $stmt->bindParam(':uploaded_by', $data['uploaded_by'] ?? null);
            
            if ($stmt->execute()) {
                $track_id = $this->db->lastInsertId();
                return [
                    'success' => true, 
                    'message' => 'آهنگ با موفقیت اضافه شد',
                    'track_id' => $track_id
                ];
            }
            
            return ['success' => false, 'message' => 'خطا در افزودن آهنگ'];
            
        } catch (Exception $e) {
            error_log("Add track error: " . $e->getMessage());
            return ['success' => false, 'message' => 'خطای سیستمی در افزودن آهنگ'];
        }
    }
    
    // Update track
    public function updateTrack($id, $data) {
        try {
            $set_clauses = [];
            $params = [':id' => $id];
            
            $allowed_fields = ['title', 'artist_id', 'album_id', 'cover_image', 'genre', 'lyrics', 'track_number', 'featured'];
            
            foreach ($allowed_fields as $field) {
                if (isset($data[$field])) {
                    $set_clauses[] = "$field = :$field";
                    $params[":$field"] = $data[$field];
                }
            }
            
            if (empty($set_clauses)) {
                return ['success' => false, 'message' => 'هیچ فیلدی برای به‌روزرسانی ارسال نشده'];
            }
            
            $set_clauses[] = "updated_at = NOW()";
            $set_clause = implode(', ', $set_clauses);
            
            $query = "UPDATE {$this->tracks_table} SET $set_clause WHERE id = :id";
            $stmt = $this->db->prepare($query);
            
            if ($stmt->execute($params)) {
                return ['success' => true, 'message' => 'آهنگ با موفقیت به‌روزرسانی شد'];
            }
            
            return ['success' => false, 'message' => 'خطا در به‌روزرسانی آهنگ'];
            
        } catch (Exception $e) {
            error_log("Update track error: " . $e->getMessage());
            return ['success' => false, 'message' => 'خطای سیستمی در به‌روزرسانی'];
        }
    }
    
    // Delete track
    public function deleteTrack($id) {
        try {
            // Get track info for file deletion
            $track = $this->getTrackById($id);
            if (!$track['success']) {
                return $track;
            }
            
            // Soft delete
            $query = "UPDATE {$this->tracks_table} SET status = 'deleted', updated_at = NOW() WHERE id = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $id);
            
            if ($stmt->execute()) {
                // Optionally delete physical file
                if (!empty($track['track']['file_path']) && file_exists($track['track']['file_path'])) {
                    unlink($track['track']['file_path']);
                }
                
                return ['success' => true, 'message' => 'آهنگ با موفقیت حذف شد'];
            }
            
            return ['success' => false, 'message' => 'خطا در حذف آهنگ'];
            
        } catch (Exception $e) {
            error_log("Delete track error: " . $e->getMessage());
            return ['success' => false, 'message' => 'خطای سیستمی در حذف آهنگ'];
        }
    }
    
    // Like/Unlike track
    public function toggleLike($user_id, $track_id) {
        try {
            // Check if already liked
            $check_query = "SELECT id FROM {$this->user_likes_table} WHERE user_id = :user_id AND track_id = :track_id";
            $check_stmt = $this->db->prepare($check_query);
            $check_stmt->bindParam(':user_id', $user_id);
            $check_stmt->bindParam(':track_id', $track_id);
            $check_stmt->execute();
            
            if ($check_stmt->rowCount() > 0) {
                // Unlike
                $delete_query = "DELETE FROM {$this->user_likes_table} WHERE user_id = :user_id AND track_id = :track_id";
                $delete_stmt = $this->db->prepare($delete_query);
                $delete_stmt->bindParam(':user_id', $user_id);
                $delete_stmt->bindParam(':track_id', $track_id);
                
                if ($delete_stmt->execute()) {
                    $this->updateTrackLikesCount($track_id);
                    return ['success' => true, 'action' => 'unliked', 'message' => 'آهنگ از لیست پسندیده‌ها حذف شد'];
                }
            } else {
                // Like
                $insert_query = "INSERT INTO {$this->user_likes_table} (user_id, track_id, created_at) VALUES (:user_id, :track_id, NOW())";
                $insert_stmt = $this->db->prepare($insert_query);
                $insert_stmt->bindParam(':user_id', $user_id);
                $insert_stmt->bindParam(':track_id', $track_id);
                
                if ($insert_stmt->execute()) {
                    $this->updateTrackLikesCount($track_id);
                    return ['success' => true, 'action' => 'liked', 'message' => 'آهنگ به لیست پسندیده‌ها اضافه شد'];
                }
            }
            
            return ['success' => false, 'message' => 'خطا در عملیات'];
            
        } catch (Exception $e) {
            error_log("Toggle like error: " . $e->getMessage());
            return ['success' => false, 'message' => 'خطای سیستمی'];
        }
    }
    
    // Record play history
    public function recordPlay($user_id, $track_id) {
        try {
            // Insert play record
            $query = "INSERT INTO {$this->play_history_table} (user_id, track_id, played_at) VALUES (:user_id, :track_id, NOW())";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':user_id', $user_id);
            $stmt->bindParam(':track_id', $track_id);
            $stmt->execute();
            
            // Update play count
            $update_query = "UPDATE {$this->tracks_table} SET plays_count = plays_count + 1 WHERE id = :track_id";
            $update_stmt = $this->db->prepare($update_query);
            $update_stmt->bindParam(':track_id', $track_id);
            $update_stmt->execute();
            
            return ['success' => true];
            
        } catch (Exception $e) {
            error_log("Record play error: " . $e->getMessage());
            return ['success' => false];
        }
    }
    
    // Get user's liked tracks
    public function getUserLikes($user_id, $page = 1, $limit = 20) {
        try {
            $offset = ($page - 1) * $limit;
            
            $query = "SELECT t.*, a.name as artist_name, al.title as album_title, ul.created_at as liked_at
                     FROM {$this->user_likes_table} ul
                     JOIN {$this->tracks_table} t ON ul.track_id = t.id
                     LEFT JOIN {$this->artists_table} a ON t.artist_id = a.id
                     LEFT JOIN {$this->albums_table} al ON t.album_id = al.id
                     WHERE ul.user_id = :user_id AND t.status = 'active'
                     ORDER BY ul.created_at DESC
                     LIMIT :limit OFFSET :offset";
            
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':user_id', $user_id);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            
            return ['success' => true, 'tracks' => $stmt->fetchAll(PDO::FETCH_ASSOC)];
            
        } catch (Exception $e) {
            error_log("Get user likes error: " . $e->getMessage());
            return ['success' => false, 'message' => 'خطا در دریافت آهنگ‌های پسندیده'];
        }
    }
    
    // Get genres
    public function getGenres() {
        try {
            $query = "SELECT DISTINCT genre FROM {$this->tracks_table} WHERE genre IS NOT NULL AND status = 'active' ORDER BY genre";
            $stmt = $this->db->prepare($query);
            $stmt->execute();
            
            return ['success' => true, 'genres' => $stmt->fetchAll(PDO::FETCH_COLUMN)];
            
        } catch (Exception $e) {
            error_log("Get genres error: " . $e->getMessage());
            return ['success' => false, 'message' => 'خطا در دریافت ژانرها'];
        }
    }
    
    // Private helper methods
    private function generateSlug($title) {
        $slug = strtolower(trim($title));
        $slug = preg_replace('/[^a-z0-9\s\u0600-\u06FF]/', '', $slug);
        $slug = preg_replace('/\s+/', '-', $slug);
        
        // Check if slug exists and make it unique
        $original_slug = $slug;
        $counter = 1;
        
        while ($this->slugExists($slug)) {
            $slug = $original_slug . '-' . $counter;
            $counter++;
        }
        
        return $slug;
    }
    
    private function slugExists($slug) {
        $query = "SELECT id FROM {$this->tracks_table} WHERE slug = :slug";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':slug', $slug);
        $stmt->execute();
        return $stmt->rowCount() > 0;
    }
    
    private function handleFileUpload($file_info) {
        try {
            // Validate file type
            $allowed_types = ALLOWED_MUSIC_TYPES;
            $file_extension = strtolower(pathinfo($file_info['name'], PATHINFO_EXTENSION));
            
            if (!in_array($file_extension, $allowed_types)) {
                return ['success' => false, 'message' => 'فرمت فایل مجاز نیست'];
            }
            
            // Validate file size
            if ($file_info['size'] > MAX_FILE_SIZE) {
                return ['success' => false, 'message' => 'حجم فایل بیش از حد مجاز است'];
            }
            
            // Generate unique filename
            $filename = uniqid() . '_' . time() . '.' . $file_extension;
            $upload_path = MUSIC_PATH . $filename;
            
            // Create directory if not exists
            if (!is_dir(MUSIC_PATH)) {
                mkdir(MUSIC_PATH, 0777, true);
            }
            
            // Move uploaded file
            if (move_uploaded_file($file_info['tmp_name'], $upload_path)) {
                return [
                    'success' => true,
                    'file_path' => $upload_path,
                    'file_size' => $file_info['size'],
                    'original_name' => $file_info['name']
                ];
            }
            
            return ['success' => false, 'message' => 'خطا در آپلود فایل'];
            
        } catch (Exception $e) {
            error_log("File upload error: " . $e->getMessage());
            return ['success' => false, 'message' => 'خطای سیستمی در آپلود'];
        }
    }
    
    private function updateTrackLikesCount($track_id) {
        $query = "UPDATE {$this->tracks_table} SET likes_count = (
                     SELECT COUNT(*) FROM {$this->user_likes_table} WHERE track_id = :track_id
                  ) WHERE id = :track_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':track_id', $track_id);
        $stmt->execute();
    }
}
?>
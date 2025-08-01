<?php
class Auth {
    private $db;
    private $table_name = "users";
    
    public function __construct($database) {
        $this->db = $database;
    }
    
    // Register new user
    public function register($data) {
        try {
            // Validate input
            $validation = $this->validateRegistration($data);
            if (!$validation['success']) {
                return $validation;
            }
            
            // Check if email already exists
            if ($this->emailExists($data['email'])) {
                return ['success' => false, 'message' => 'این ایمیل قبلاً ثبت شده است'];
            }
            
            // Hash password
            $hashed_password = password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => BCRYPT_COST]);
            
            // Generate verification token
            $verification_token = bin2hex(random_bytes(32));
            
            // Insert user
            $query = "INSERT INTO " . $this->table_name . " 
                     (username, email, password, full_name, verification_token, created_at) 
                     VALUES (:username, :email, :password, :full_name, :verification_token, NOW())";
            
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':username', $data['username']);
            $stmt->bindParam(':email', $data['email']);
            $stmt->bindParam(':password', $hashed_password);
            $stmt->bindParam(':full_name', $data['full_name']);
            $stmt->bindParam(':verification_token', $verification_token);
            
            if ($stmt->execute()) {
                $user_id = $this->db->lastInsertId();
                
                // Send verification email (optional)
                // $this->sendVerificationEmail($data['email'], $verification_token);
                
                return [
                    'success' => true, 
                    'message' => 'ثبت نام با موفقیت انجام شد',
                    'user_id' => $user_id
                ];
            }
            
            return ['success' => false, 'message' => 'خطا در ثبت نام'];
            
        } catch (Exception $e) {
            error_log("Registration error: " . $e->getMessage());
            return ['success' => false, 'message' => 'خطای سیستمی در ثبت نام'];
        }
    }
    
    // Login user
    public function login($email, $password, $remember = false) {
        try {
            // Get user by email
            $query = "SELECT id, username, email, password, full_name, role, avatar, status, email_verified 
                     FROM " . $this->table_name . " 
                     WHERE email = :email AND status = 'active' LIMIT 1";
            
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':email', $email);
            $stmt->execute();
            
            if ($stmt->rowCount() > 0) {
                $user = $stmt->fetch(PDO::FETCH_ASSOC);
                
                // Verify password
                if (password_verify($password, $user['password'])) {
                    
                    // Update last login
                    $this->updateLastLogin($user['id']);
                    
                    // Create session
                    $this->createSession($user, $remember);
                    
                    // Remove password from user data
                    unset($user['password']);
                    
                    return [
                        'success' => true,
                        'message' => 'ورود موفقیت‌آمیز',
                        'user' => $user,
                        'token' => $this->generateJWTToken($user)
                    ];
                }
            }
            
            return ['success' => false, 'message' => 'ایمیل یا رمز عبور اشتباه است'];
            
        } catch (Exception $e) {
            error_log("Login error: " . $e->getMessage());
            return ['success' => false, 'message' => 'خطای سیستمی در ورود'];
        }
    }
    
    // Logout user
    public function logout() {
        // Destroy session
        session_unset();
        session_destroy();
        
        // Clear remember me cookie
        if (isset($_COOKIE['remember_token'])) {
            setcookie('remember_token', '', time() - 3600, '/');
        }
        
        return ['success' => true, 'message' => 'خروج موفقیت‌آمیز'];
    }
    
    // Get current user
    public function getCurrentUser() {
        // Check session
        if (isset($_SESSION['user_id'])) {
            return $this->getUserById($_SESSION['user_id']);
        }
        
        // Check remember me cookie
        if (isset($_COOKIE['remember_token'])) {
            return $this->getUserByRememberToken($_COOKIE['remember_token']);
        }
        
        return null;
    }
    
    // Check if user is logged in
    public function isLoggedIn() {
        return $this->getCurrentUser() !== null;
    }
    
    // Check if user is admin
    public function isAdmin() {
        $user = $this->getCurrentUser();
        return $user && $user['role'] === 'admin';
    }
    
    // Generate CSRF token
    public function generateCSRFToken() {
        if (!isset($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }
    
    // Verify CSRF token
    public function verifyCSRFToken($token) {
        return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
    }
    
    // Change password
    public function changePassword($user_id, $current_password, $new_password) {
        try {
            // Get current password hash
            $query = "SELECT password FROM " . $this->table_name . " WHERE id = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':id', $user_id);
            $stmt->execute();
            
            if ($stmt->rowCount() > 0) {
                $user = $stmt->fetch(PDO::FETCH_ASSOC);
                
                // Verify current password
                if (password_verify($current_password, $user['password'])) {
                    
                    // Hash new password
                    $new_hashed = password_hash($new_password, PASSWORD_BCRYPT, ['cost' => BCRYPT_COST]);
                    
                    // Update password
                    $update_query = "UPDATE " . $this->table_name . " 
                                   SET password = :password, updated_at = NOW() 
                                   WHERE id = :id";
                    
                    $update_stmt = $this->db->prepare($update_query);
                    $update_stmt->bindParam(':password', $new_hashed);
                    $update_stmt->bindParam(':id', $user_id);
                    
                    if ($update_stmt->execute()) {
                        return ['success' => true, 'message' => 'رمز عبور با موفقیت تغییر یافت'];
                    }
                }
            }
            
            return ['success' => false, 'message' => 'رمز عبور فعلی اشتباه است'];
            
        } catch (Exception $e) {
            error_log("Change password error: " . $e->getMessage());
            return ['success' => false, 'message' => 'خطا در تغییر رمز عبور'];
        }
    }
    
    // Private helper methods
    private function validateRegistration($data) {
        $errors = [];
        
        if (empty($data['username']) || strlen($data['username']) < 3) {
            $errors[] = 'نام کاربری باید حداقل 3 کاراکتر باشد';
        }
        
        if (empty($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'ایمیل معتبر وارد کنید';
        }
        
        if (empty($data['password']) || strlen($data['password']) < 6) {
            $errors[] = 'رمز عبور باید حداقل 6 کاراکتر باشد';
        }
        
        if (empty($data['full_name'])) {
            $errors[] = 'نام کامل الزامی است';
        }
        
        if (!empty($errors)) {
            return ['success' => false, 'message' => implode(', ', $errors)];
        }
        
        return ['success' => true];
    }
    
    private function emailExists($email) {
        $query = "SELECT id FROM " . $this->table_name . " WHERE email = :email";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        return $stmt->rowCount() > 0;
    }
    
    private function createSession($user, $remember = false) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['role'] = $user['role'];
        
        if ($remember) {
            $remember_token = bin2hex(random_bytes(32));
            setcookie('remember_token', $remember_token, time() + (30 * 24 * 60 * 60), '/'); // 30 days
            
            // Store remember token in database
            $query = "UPDATE " . $this->table_name . " 
                     SET remember_token = :token 
                     WHERE id = :id";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':token', $remember_token);
            $stmt->bindParam(':id', $user['id']);
            $stmt->execute();
        }
    }
    
    private function updateLastLogin($user_id) {
        $query = "UPDATE " . $this->table_name . " 
                 SET last_login = NOW() 
                 WHERE id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $user_id);
        $stmt->execute();
    }
    
    private function getUserById($id) {
        $query = "SELECT id, username, email, full_name, role, avatar, status 
                 FROM " . $this->table_name . " 
                 WHERE id = :id AND status = 'active'";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            return $stmt->fetch(PDO::FETCH_ASSOC);
        }
        return null;
    }
    
    private function getUserByRememberToken($token) {
        $query = "SELECT id, username, email, full_name, role, avatar, status 
                 FROM " . $this->table_name . " 
                 WHERE remember_token = :token AND status = 'active'";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':token', $token);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            return $stmt->fetch(PDO::FETCH_ASSOC);
        }
        return null;
    }
    
    private function generateJWTToken($user) {
        // Simple JWT-like token (for demonstration)
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode([
            'user_id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
            'exp' => time() + (24 * 60 * 60) // 24 hours
        ]);
        
        $headerEncoded = base64url_encode($header);
        $payloadEncoded = base64url_encode($payload);
        
        $signature = hash_hmac('sha256', $headerEncoded . "." . $payloadEncoded, JWT_SECRET, true);
        $signatureEncoded = base64url_encode($signature);
        
        return $headerEncoded . "." . $payloadEncoded . "." . $signatureEncoded;
    }
}

// Helper function for base64 URL encoding
function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}
?>
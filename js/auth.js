// Authentication JavaScript
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.token = localStorage.getItem('auth_token');
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkAuthStatus();
    }

    bindEvents() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin(e);
            });
        }

        // Register form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister(e);
            });
        }

        // Modal switching
        const showRegister = document.getElementById('show-register');
        const showLogin = document.getElementById('show-login');

        if (showRegister) {
            showRegister.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchToRegister();
            });
        }

        if (showLogin) {
            showLogin.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchToLogin();
            });
        }

        // Logout
        document.addEventListener('click', (e) => {
            if (e.target.matches('.logout-btn, .logout-btn *')) {
                this.logout();
            }
        });
    }

    async handleLogin(event) {
        const formData = new FormData(event.target);
        const email = formData.get('email');
        const password = formData.get('password');

        if (!email || !password) {
            this.showError('لطفاً تمام فیلدها را پر کنید');
            return;
        }

        this.showLoading(true);

        try {
            // Simulate API call - Replace with actual API endpoint
            const response = await this.simulateLogin(email, password);
            
            if (response.success) {
                this.setAuthData(response.user, response.token);
                this.closeModals();
                this.showSuccess('با موفقیت وارد شدید');
                this.updateUI();
            } else {
                this.showError(response.message || 'خطا در ورود');
            }
        } catch (error) {
            this.showError('خطا در اتصال به سرور');
            console.error('Login error:', error);
        }

        this.showLoading(false);
    }

    async handleRegister(event) {
        const formData = new FormData(event.target);
        const name = formData.get('name');
        const email = formData.get('email');
        const password = formData.get('password');

        if (!name || !email || !password) {
            this.showError('لطفاً تمام فیلدها را پر کنید');
            return;
        }

        if (password.length < 6) {
            this.showError('رمز عبور باید حداقل 6 کاراکتر باشد');
            return;
        }

        if (!this.validateEmail(email)) {
            this.showError('فرمت ایمیل صحیح نیست');
            return;
        }

        this.showLoading(true);

        try {
            // Simulate API call - Replace with actual API endpoint
            const response = await this.simulateRegister(name, email, password);
            
            if (response.success) {
                this.setAuthData(response.user, response.token);
                this.closeModals();
                this.showSuccess('ثبت نام با موفقیت انجام شد');
                this.updateUI();
            } else {
                this.showError(response.message || 'خطا در ثبت نام');
            }
        } catch (error) {
            this.showError('خطا در اتصال به سرور');
            console.error('Register error:', error);
        }

        this.showLoading(false);
    }

    // Simulate login API call
    async simulateLogin(email, password) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Demo credentials
                if (email === 'user@test.com' && password === '123456') {
                    resolve({
                        success: true,
                        user: {
                            id: 1,
                            name: 'کاربر تست',
                            email: email,
                            role: 'user',
                            avatar: 'images/default-avatar.jpg'
                        },
                        token: 'demo_token_' + Date.now()
                    });
                } else if (email === 'admin@test.com' && password === 'admin123') {
                    resolve({
                        success: true,
                        user: {
                            id: 2,
                            name: 'مدیر سیستم',
                            email: email,
                            role: 'admin',
                            avatar: 'images/admin-avatar.jpg'
                        },
                        token: 'admin_token_' + Date.now()
                    });
                } else {
                    resolve({
                        success: false,
                        message: 'ایمیل یا رمز عبور اشتباه است'
                    });
                }
            }, 1000);
        });
    }

    // Simulate register API call
    async simulateRegister(name, email, password) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Check if email already exists (simple simulation)
                const existingEmails = ['user@test.com', 'admin@test.com'];
                
                if (existingEmails.includes(email)) {
                    resolve({
                        success: false,
                        message: 'این ایمیل قبلاً ثبت شده است'
                    });
                } else {
                    resolve({
                        success: true,
                        user: {
                            id: Date.now(),
                            name: name,
                            email: email,
                            role: 'user',
                            avatar: 'images/default-avatar.jpg'
                        },
                        token: 'new_token_' + Date.now()
                    });
                }
            }, 1000);
        });
    }

    setAuthData(user, token) {
        this.currentUser = user;
        this.token = token;
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_data', JSON.stringify(user));
    }

    checkAuthStatus() {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');

        if (token && userData) {
            try {
                this.currentUser = JSON.parse(userData);
                this.token = token;
                this.updateUI();
            } catch (error) {
                console.error('Error parsing user data:', error);
                this.logout();
            }
        }
    }

    logout() {
        this.currentUser = null;
        this.token = null;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        this.updateUI();
        this.showSuccess('با موفقیت خارج شدید');
    }

    updateUI() {
        const loginBtn = document.getElementById('login-btn');
        
        if (this.currentUser) {
            // User is logged in
            if (loginBtn) {
                loginBtn.innerHTML = `
                    <img src="${this.currentUser.avatar}" alt="${this.currentUser.name}" class="user-avatar" onerror="this.src='images/default-avatar.jpg'">
                    <span>${this.currentUser.name}</span>
                    <i class="fas fa-chevron-down"></i>
                `;
                loginBtn.classList.add('logged-in');
                
                // Add dropdown menu
                this.createUserDropdown(loginBtn);
            }
        } else {
            // User is not logged in
            if (loginBtn) {
                loginBtn.innerHTML = `
                    <i class="fas fa-user"></i>
                    ورود
                `;
                loginBtn.classList.remove('logged-in');
                this.removeUserDropdown();
            }
        }
    }

    createUserDropdown(loginBtn) {
        // Remove existing dropdown
        this.removeUserDropdown();

        const dropdown = document.createElement('div');
        dropdown.className = 'user-dropdown';
        dropdown.innerHTML = `
            <div class="dropdown-header">
                <img src="${this.currentUser.avatar}" alt="${this.currentUser.name}" onerror="this.src='images/default-avatar.jpg'">
                <div class="user-info">
                    <div class="user-name">${this.currentUser.name}</div>
                    <div class="user-email">${this.currentUser.email}</div>
                </div>
            </div>
            <div class="dropdown-menu">
                <a href="#" class="dropdown-item" onclick="authSystem.openProfile()">
                    <i class="fas fa-user"></i>
                    پروفایل
                </a>
                <a href="#" class="dropdown-item" onclick="authSystem.openSettings()">
                    <i class="fas fa-cog"></i>
                    تنظیمات
                </a>
                ${this.currentUser.role === 'admin' ? `
                    <a href="admin.html" class="dropdown-item">
                        <i class="fas fa-cogs"></i>
                        پنل مدیریت
                    </a>
                ` : ''}
                <div class="dropdown-divider"></div>
                <a href="#" class="dropdown-item logout-item" onclick="authSystem.logout()">
                    <i class="fas fa-sign-out-alt"></i>
                    خروج
                </a>
            </div>
        `;

        loginBtn.appendChild(dropdown);

        // Toggle dropdown
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            dropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!loginBtn.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });
    }

    removeUserDropdown() {
        const existingDropdown = document.querySelector('.user-dropdown');
        if (existingDropdown) {
            existingDropdown.remove();
        }
    }

    switchToRegister() {
        document.getElementById('login-modal').classList.add('hidden');
        document.getElementById('register-modal').classList.remove('hidden');
    }

    switchToLogin() {
        document.getElementById('register-modal').classList.add('hidden');
        document.getElementById('login-modal').classList.remove('hidden');
    }

    closeModals() {
        document.getElementById('login-modal').classList.add('hidden');
        document.getElementById('register-modal').classList.add('hidden');
    }

    openProfile() {
        this.showNotification('صفحه پروفایل در دست ساخت است', 'info');
    }

    openSettings() {
        this.showNotification('صفحه تنظیمات در دست ساخت است', 'info');
    }

    showLoading(show) {
        const loginBtn = document.querySelector('#login-form button[type="submit"]');
        const registerBtn = document.querySelector('#register-form button[type="submit"]');

        [loginBtn, registerBtn].forEach(btn => {
            if (btn) {
                if (show) {
                    btn.disabled = true;
                    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال پردازش...';
                } else {
                    btn.disabled = false;
                    if (btn === loginBtn) {
                        btn.innerHTML = 'ورود';
                    } else {
                        btn.innerHTML = 'ثبت نام';
                    }
                }
            }
        });
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.auth-notification');
        existingNotifications.forEach(notification => notification.remove());

        // Create notification
        const notification = document.createElement('div');
        notification.className = `auth-notification auth-notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // API methods for real implementation
    async loginAPI(email, password) {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        return await response.json();
    }

    async registerAPI(name, email, password) {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password })
        });

        return await response.json();
    }

    async refreshToken() {
        if (!this.token) return false;

        try {
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.setAuthData(data.user, data.token);
                return true;
            } else {
                this.logout();
                return false;
            }
        } catch (error) {
            console.error('Token refresh error:', error);
            this.logout();
            return false;
        }
    }

    isAuthenticated() {
        return this.currentUser !== null && this.token !== null;
    }

    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }

    getAuthHeader() {
        return this.token ? { 'Authorization': `Bearer ${this.token}` } : {};
    }
}

// Initialize authentication system
document.addEventListener('DOMContentLoaded', () => {
    window.authSystem = new AuthSystem();
});
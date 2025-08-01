// Authentication System for PHP Backend
class AuthSystem {
    constructor() {
        this.currentUser = CONFIG.CURRENT_USER;
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.updateUI();
    }
    
    bindEvents() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        // Register form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
        
        // Modal triggers
        const loginBtns = document.querySelectorAll('#login-btn, .btn-login, .btn-login-large');
        const registerBtns = document.querySelectorAll('#register-btn, .btn-register');
        
        loginBtns.forEach(btn => {
            btn.addEventListener('click', () => this.showLoginModal());
        });
        
        registerBtns.forEach(btn => {
            btn.addEventListener('click', () => this.showRegisterModal());
        });
        
        // Switch between modals
        const switchToRegister = document.getElementById('switch-to-register');
        const switchToLogin = document.getElementById('switch-to-login');
        
        if (switchToRegister) {
            switchToRegister.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideLoginModal();
                this.showRegisterModal();
            });
        }
        
        if (switchToLogin) {
            switchToLogin.addEventListener('click', (e) => {
                e.preventDefault();
                this.hideRegisterModal();
                this.showLoginModal();
            });
        }
        
        // Modal close events
        const modalCloses = document.querySelectorAll('.modal-close');
        modalCloses.forEach(btn => {
            btn.addEventListener('click', () => this.hideAllModals());
        });
        
        // Close modal on backdrop click
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideAllModals();
                }
            });
        });
        
        // User dropdown
        const userBtn = document.querySelector('.user-btn');
        if (userBtn) {
            userBtn.addEventListener('click', () => this.toggleUserDropdown());
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const dropdown = document.querySelector('.user-dropdown');
            if (dropdown && !dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
    }
    
    async handleLogin(event) {
        event.preventDefault();
        
        const form = event.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        // Show loading state
        submitBtn.textContent = 'در حال ورود...';
        submitBtn.disabled = true;
        
        try {
            // Submit form using fetch
            const formData = new FormData(form);
            
            const response = await fetch(CONFIG.API.LOGIN, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                Utils.showToast(result.message || 'ورود موفقیت‌آمیز', 'success');
                
                // Update current user
                this.currentUser = result.user;
                CONFIG.CURRENT_USER = result.user;
                
                // Hide modal
                this.hideLoginModal();
                
                // Update UI
                this.updateUI();
                
                // Reload page to update server-side session
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
                
            } else {
                Utils.showToast(result.message || 'خطا در ورود', 'error');
            }
            
        } catch (error) {
            console.error('Login error:', error);
            Utils.showToast('خطای ارتباط با سرور', 'error');
        } finally {
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
    
    async handleRegister(event) {
        event.preventDefault();
        
        const form = event.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        // Validate passwords match
        const password = form.querySelector('#register-password').value;
        const confirmPassword = form.querySelector('#register-confirm').value;
        
        if (password !== confirmPassword) {
            Utils.showToast('رمز عبور و تکرار آن مطابقت ندارند', 'error');
            return;
        }
        
        // Show loading state
        submitBtn.textContent = 'در حال ثبت نام...';
        submitBtn.disabled = true;
        
        try {
            // Submit form using fetch
            const formData = new FormData(form);
            
            const response = await fetch(CONFIG.API.REGISTER, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                Utils.showToast(result.message || 'ثبت نام موفقیت‌آمیز', 'success');
                
                // Update current user if auto-login happened
                if (result.user) {
                    this.currentUser = result.user;
                    CONFIG.CURRENT_USER = result.user;
                }
                
                // Hide modal
                this.hideRegisterModal();
                
                // Update UI
                this.updateUI();
                
                // Reload page to update server-side session
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
                
            } else {
                Utils.showToast(result.message || 'خطا در ثبت نام', 'error');
            }
            
        } catch (error) {
            console.error('Register error:', error);
            Utils.showToast('خطای ارتباط با سرور', 'error');
        } finally {
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }
    
    showLoginModal() {
        const modal = document.getElementById('login-modal');
        if (modal) {
            modal.classList.remove('hidden');
            // Focus on email field
            setTimeout(() => {
                const emailField = modal.querySelector('#login-email');
                if (emailField) emailField.focus();
            }, 100);
        }
    }
    
    hideLoginModal() {
        const modal = document.getElementById('login-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
    
    showRegisterModal() {
        const modal = document.getElementById('register-modal');
        if (modal) {
            modal.classList.remove('hidden');
            // Focus on full name field
            setTimeout(() => {
                const nameField = modal.querySelector('#register-fullname');
                if (nameField) nameField.focus();
            }, 100);
        }
    }
    
    hideRegisterModal() {
        const modal = document.getElementById('register-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
    
    hideAllModals() {
        this.hideLoginModal();
        this.hideRegisterModal();
    }
    
    toggleUserDropdown() {
        const dropdown = document.querySelector('.user-dropdown');
        if (dropdown) {
            dropdown.classList.toggle('active');
        }
    }
    
    updateUI() {
        // Update navigation based on auth status
        const loginBtns = document.querySelectorAll('.btn-login, .btn-register');
        const userSection = document.querySelector('.user-dropdown');
        const authRequiredElements = document.querySelectorAll('.auth-required');
        const guestOnlyElements = document.querySelectorAll('.guest-only');
        
        if (this.currentUser) {
            // Hide login/register buttons
            loginBtns.forEach(btn => btn.style.display = 'none');
            
            // Show user dropdown
            if (userSection) {
                userSection.style.display = 'flex';
            }
            
            // Show auth-required elements
            authRequiredElements.forEach(el => el.style.display = '');
            
            // Hide guest-only elements
            guestOnlyElements.forEach(el => el.style.display = 'none');
            
        } else {
            // Show login/register buttons
            loginBtns.forEach(btn => btn.style.display = '');
            
            // Hide user dropdown
            if (userSection) {
                userSection.style.display = 'none';
            }
            
            // Hide auth-required elements
            authRequiredElements.forEach(el => el.style.display = 'none');
            
            // Show guest-only elements
            guestOnlyElements.forEach(el => el.style.display = '');
        }
    }
    
    // Check if user is logged in
    isLoggedIn() {
        return this.currentUser !== null;
    }
    
    // Check if user is admin
    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }
    
    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }
    
    // Logout (redirect to logout.php)
    logout() {
        window.location.href = CONFIG.API.LOGOUT;
    }
}

// Initialize authentication system
document.addEventListener('DOMContentLoaded', () => {
    window.authSystem = new AuthSystem();
});

// Export for use in other files
window.AuthSystem = AuthSystem;
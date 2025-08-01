# 🎵 موزیک استریم - نسخه PHP

سایت پخش آنلاین موسیقی با قابلیت‌های کامل، نوشته شده با PHP، MySQL و JavaScript برای اجرا روی cPanel.

## 🌟 ویژگی‌های اصلی

### 🎧 برای کاربران:
- **پخش موزیک آنلاین** با کنترل‌های کامل (play, pause, next, previous, shuffle, repeat)
- **سیستم احراز هویت کامل** (ثبت نام، ورود، خروج، مدیریت نشست)
- **جستجوی پیشرفته** در آهنگ‌ها، هنرمندان و آلبوم‌ها
- **ایجاد و مدیریت پلی‌لیست‌ها** شخصی
- **سیستم لایک** برای آهنگ‌های مورد علاقه
- **تاریخچه پخش** و پیشنهادات شخصی
- **رابط کاربری ریسپانسیو** و بهینه برای موبایل
- **پشتیبانی از RTL** و فونت فارسی

### 🎛️ برای مدیران:
- **داشبورد مدیریت کامل** با آمار و نمودارهای تعاملی
- **مدیریت موزیک** (آپلود، ویرایش، حذف، دسته‌بندی)
- **مدیریت کاربران** (مشاهده، ویرایش، تغییر وضعیت)
- **مدیریت پلی‌لیست‌ها** و محتوای ویژه
- **آمار و گزارش‌گیری پیشرفته** با Chart.js
- **مدیریت تنظیمات سیستم** و امنیت
- **پشتیبان‌گیری و بازیابی** اطلاعات

## 🛠️ تکنولوژی‌های استفاده شده

### Frontend:
- **HTML5** - ساختار صفحات
- **CSS3** - استایل‌دهی و انیمیشن‌ها
- **JavaScript (ES6+)** - تعاملات کاربری
- **Chart.js** - نمودارهای آماری
- **Font Awesome** - آیکون‌ها
- **Vazir Font** - فونت فارسی

### Backend:
- **PHP 7.4+** - منطق سرور
- **MySQL 5.7+** - پایگاه داده
- **PDO** - اتصال ایمن به دیتابیس
- **Sessions** - مدیریت نشست کاربران

### امنیت:
- **CSRF Protection** - محافظت از حملات CSRF
- **Password Hashing** - رمزنگاری رمز عبور
- **SQL Injection Prevention** - استفاده از Prepared Statements
- **XSS Protection** - محافظت از حملات XSS

## 📋 پیش‌نیازها

- **PHP 7.4** یا بالاتر
- **MySQL 5.7** یا بالاتر
- **Apache/Nginx** با mod_rewrite
- **cPanel** یا محیط میزبانی مشابه
- **دسترسی به phpMyAdmin**

## 🚀 نصب و راه‌اندازی

### مرحله 1: دانلود و آپلود
```bash
# دانلود فایل‌های پروژه
# آپلود تمام فایل‌ها در public_html
```

### مرحله 2: تنظیم پایگاه داده
1. در cPanel وارد **MySQL Databases** شوید
2. پایگاه داده جدید ایجاد کنید
3. کاربر جدید ایجاد کرده و به دیتابیس دسترسی دهید
4. در **phpMyAdmin** محتویات `database.sql` را اجرا کنید

### مرحله 3: تنظیم کانفیگ
فایل `config/database.php` را ویرایش کرده و اطلاعات دیتابیس را وارد کنید:

```php
// Database Settings
define('DB_HOST', 'localhost');
define('DB_NAME', 'your_database_name');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');

// Site Settings
define('SITE_URL', 'https://yourdomain.com');
define('ADMIN_EMAIL', 'admin@yourdomain.com');
```

### مرحله 4: ایجاد پوشه‌های آپلود
```bash
mkdir uploads
mkdir uploads/music
mkdir uploads/images
mkdir uploads/covers
mkdir uploads/avatars

chmod 755 uploads
chmod 777 uploads/music uploads/images uploads/covers uploads/avatars
```

### مرحله 5: تنظیم مجوزها
```bash
chmod 644 *.php *.html *.css *.js
chmod 755 api/ classes/ includes/
chmod 644 .htaccess
```

## 🔑 اطلاعات ورود پیش‌فرض

### ادمین اصلی (از دیتابیس):
- **نام کاربری**: `admin`
- **ایمیل**: `admin@yourdomain.com`
- **رمز عبور**: `admin123`

⚠️ **مهم**: حتماً رمز عبور ادمین را در اولین ورود تغییر دهید!

### حساب‌های تست:
- **کاربر عادی**: `user@test.com` / `123456`
- **ادمین تست**: `admin@test.com` / `admin123`

## 📁 ساختار پروژه

```
music-stream-php/
├── 📄 index.php                 # صفحه اصلی
├── 📄 admin.php                 # پنل مدیریت
├── 📄 logout.php               # صفحه خروج
├── 📂 config/
│   └── 📄 database.php          # تنظیمات دیتابیس
├── 📂 classes/
│   ├── 📄 Auth.php             # کلاس احراز هویت
│   ├── 📄 Music.php            # کلاس مدیریت موزیک
│   └── 📄 User.php             # کلاس کاربران
├── 📂 includes/
│   ├── 📄 header.php           # هدر مشترک
│   └── 📄 footer.php           # فوتر مشترک
├── 📂 api/
│   ├── 📄 login.php            # API ورود
│   ├── 📄 register.php         # API ثبت نام
│   ├── 📄 tracks.php           # API آهنگ‌ها
│   └── 📄 ...                  # سایر APIها
├── 📂 css/
│   ├── 📄 style.css            # استایل اصلی
│   └── 📄 admin.css            # استایل پنل ادمین
├── 📂 js/
│   ├── 📄 config.js            # تنظیمات JavaScript
│   ├── 📄 auth.php.js          # احراز هویت
│   ├── 📄 app.php.js           # منطق اصلی
│   ├── 📄 player.php.js        # پخش‌کننده
│   └── 📄 admin.php.js         # پنل ادمین
├── 📂 uploads/
│   ├── 📂 music/               # فایل‌های موزیک
│   ├── 📂 images/              # تصاویر
│   ├── 📂 covers/              # کاور آهنگ‌ها
│   └── 📂 avatars/             # آواتار کاربران
├── 📄 .htaccess                # تنظیمات Apache
├── 📄 database.sql             # ساختار دیتابیس
└── 📄 README_PHP.md            # این فایل
```

## 🔧 API Endpoints

### احراز هویت:
- `POST /api/login.php` - ورود کاربر
- `POST /api/register.php` - ثبت نام کاربر
- `GET /logout.php` - خروج کاربر

### موزیک:
- `GET /api/tracks.php` - دریافت آهنگ‌ها
- `POST /api/tracks.php` - آپلود آهنگ جدید (ادمین)
- `PUT /api/tracks.php` - ویرایش آهنگ (ادمین)
- `DELETE /api/tracks.php` - حذف آهنگ (ادمین)

### کاربران:
- `GET /api/users.php` - لیست کاربران (ادمین)
- `PUT /api/users.php` - ویرایش کاربر (ادمین)

## 🎨 تم‌سازی و شخصی‌سازی

### تغییر رنگ‌ها:
فایل `css/style.css` را ویرایش کنید:
```css
:root {
    --primary-color: #1db954;    /* رنگ اصلی */
    --secondary-color: #191414;  /* رنگ ثانویه */
    --accent-color: #1ed760;     /* رنگ تاکیدی */
}
```

### اضافه کردن لوگو:
تصویر لوگو را در `images/logo.png` قرار دهید و در فایل‌های PHP مسیر را تغییر دهید.

## 🔒 تنظیمات امنیتی

### 1. SSL/HTTPS:
```apache
# در .htaccess خطوط زیر را فعال کنید:
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### 2. محدودیت IP برای پنل ادمین:
```apache
<Files "admin.php">
    Order deny,allow
    Deny from all
    Allow from YOUR_IP_ADDRESS
</Files>
```

### 3. مخفی کردن اطلاعات PHP:
```php
// در config/database.php
error_reporting(0);
ini_set('display_errors', 0);
```

## 📊 بهینه‌سازی عملکرد

### 1. کش کردن فایل‌ها:
فایل `.htaccess` شامل تنظیمات کش است که فعال‌سازی شده.

### 2. فشرده‌سازی Gzip:
```apache
# در .htaccess فعال شده:
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/css text/javascript
</IfModule>
```

### 3. بهینه‌سازی تصاویر:
- استفاده از فرمت WebP برای مرورگرهای پشتیبان
- تنظیم کیفیت مناسب برای کاور آهنگ‌ها

## 🐛 عیب‌یابی

### مشکلات رایج:

1. **خطای اتصال به دیتابیس:**
   - اطلاعات `config/database.php` را بررسی کنید
   - مطمئن شوید MySQL فعال است

2. **خطای 500:**
   - فایل `error_log` سرور را بررسی کنید
   - مجوزهای فایل‌ها را چک کنید

3. **آپلود فایل کار نمی‌کند:**
   - مجوز پوشه `uploads` باید `777` باشد
   - تنظیمات PHP upload را بررسی کنید

4. **JavaScript کار نمی‌کند:**
   - Console مرورگر را برای خطاها بررسی کنید
   - مطمئن شوید فایل‌های JS بارگذاری شده‌اند

## 📧 پشتیبانی

برای گزارش باگ یا درخواست ویژگی جدید:
- **ایمیل**: admin@yourdomain.com
- **مسائل**: از طریق GitHub Issues

## 📄 لایسنس

این پروژه تحت لایسنس MIT منتشر شده است.

## 🔄 به‌روزرسانی

برای به‌روزرسانی به نسخه جدید:

1. از فایل‌های فعلی backup تهیه کنید
2. فایل‌های جدید را آپلود کنید
3. اگر تغییراتی در دیتابیس لازم است اعمال کنید
4. فایل cache مرورگر را پاک کنید

## 🎉 ویژگی‌های آینده

- [ ] پشتیبانی از Podcast
- [ ] پخش زنده رادیو
- [ ] اتصال به Spotify API
- [ ] اپلیکیشن موبایل
- [ ] پلاگین Discord
- [ ] هوش مصنوعی برای پیشنهادات

---

**نکته**: این سایت کاملاً آماده برای استفاده در محیط تولید است. از موزیک استریم لذت ببرید! 🎵✨
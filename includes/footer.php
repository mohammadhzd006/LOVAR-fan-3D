    <!-- JavaScript Files -->
    <script src="js/config.js"></script>
    <script src="js/app.php.js"></script>
    <script src="js/player.php.js"></script>
    <script src="js/auth.php.js"></script>
    
    <!-- Additional JavaScript for specific pages -->
    <?php if (isset($additional_js)): ?>
        <?php foreach ($additional_js as $js_file): ?>
            <script src="<?php echo $js_file; ?>"></script>
        <?php endforeach; ?>
    <?php endif; ?>
    
    <!-- Analytics (if enabled) -->
    <?php if (defined('GOOGLE_ANALYTICS_ID') && GOOGLE_ANALYTICS_ID): ?>
    <script async src="https://www.googletagmanager.com/gtag/js?id=<?php echo GOOGLE_ANALYTICS_ID; ?>"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '<?php echo GOOGLE_ANALYTICS_ID; ?>');
    </script>
    <?php endif; ?>
    
    <!-- Performance Monitoring -->
    <script>
        // Page load time
        window.addEventListener('load', function() {
            const loadTime = performance.now();
            console.log('Page loaded in ' + Math.round(loadTime) + 'ms');
        });
    </script>
</body>
</html>
<?php
// Close database connection
if (isset($database)) {
    $database->closeConnection();
}
?>
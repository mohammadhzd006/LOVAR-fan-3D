<?php
session_start();

require_once 'config/database.php';
require_once 'classes/Auth.php';

// Initialize
$database = new Database();
$db = $database->getConnection();
$auth = new Auth($db);

// Perform logout
$result = $auth->logout();

// Redirect to home page
header('Location: index.php?logout=success');
exit;
?>
<?php
require_once 'includes/db.php';

if (isLoggedIn()) {
    redirect('profile.php');
}

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username']);
    $password = $_POST['password'];
    $confirm_password = $_POST['confirm_password'];
    $ip_address = $_SERVER['REMOTE_ADDR'];

    // Basic validation
    if (empty($username) || empty($password)) {
        $error = 'Please fill in all fields.';
    } elseif ($password !== $confirm_password) {
        $error = 'Passwords do not match.';
    } elseif (strlen($username) < 4 || strlen($username) > 20) {
        $error = 'Username must be between 4 and 20 characters.';
    } elseif (strlen($password) < 6) {
        $error = 'Password must be at least 6 characters.';
    } else {
        // Normalize username to lowercase for ID (matches Game Server logic)
        $userId = strtolower($username);

        // Retrieve users to check checks: existing username, IP limit
        // Since data is JSON, we can querying JSON fields in MySQL 5.7+ / 8.0
        
        // 1. Check if username exists (ID is username)
        $stmt = $pdo->prepare("SELECT COUNT(*) FROM User WHERE id = ?");
        $stmt->execute([$userId]);
        if ($stmt->fetchColumn() > 0) {
            $error = 'Username already exists.';
        } else {
            // 2. Check IP limit (1 account per IP)
            // We need to store IP in the JSON data
            // JSON_EXTRACT(data, '$.ip')
            
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM User WHERE JSON_EXTRACT(data, '$.ip') = ?");
            try {
                $stmt->execute([$ip_address]);
                $count = $stmt->fetchColumn();
                
                if ($count >= 1) { // Limit to 1
                    $error = 'You can only register 1 account per IP address.';
                } else {
                    // Create user
                    // Game server expects: bcrypt(md5(password).toLowerCase() + salt)
                    $processedPassword = strtolower(md5($password)) . GLOBAL_SALT;
                    $passwordHash = password_hash($processedPassword, PASSWORD_BCRYPT, ['cost' => 10]);
                    
                    // UserJson structure: { username: string, password: string | null, characters: number[], ip: string }
                    // We add 'ip' field to track registration IP (ensure it matches what we check above)
                    $userData = [
                        'username' => $username, // Store display name with case
                        'password' => $passwordHash,
                        'characters' => [],
                        'ip' => $ip_address,
                        'created_at' => time()
                    ];
                    
                    $json = json_encode($userData);
                    
                    $stmt = $pdo->prepare("INSERT INTO User (id, data) VALUES (?, ?)");
                    if ($stmt->execute([$userId, $json])) {
                        $success = 'Account created successfully! You can now <a href="login.php" class="text-warning">Login</a>.';
                    } else {
                        $error = 'Failed to register account. Please try again.';
                    }
                }
            } catch (PDOException $e) {
                // If JSON functions not supported or other DB error
                $error = 'Database error: ' . $e->getMessage();
            }
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register - Myth War Online</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        body {
            background-color: #121212;
            color: #fff;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background-image: url('https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80');
            background-size: cover;
            background-position: center;
        }
        .register-card {
            background-color: rgba(0, 0, 0, 0.85);
            padding: 40px;
            border-radius: 15px;
            width: 100%;
            max-width: 450px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(5px);
        }
        .form-control {
            background-color: #333;
            border: 1px solid #444;
            color: #fff;
        }
        .form-control:focus {
            background-color: #444;
            color: #fff;
            border-color: #ffc107;
            box-shadow: none;
        }
        .btn-custom {
            background-color: #ffc107;
            color: #000;
            font-weight: bold;
            width: 100%;
        }
        .btn-custom:hover {
            background-color: #e0a800;
        }
        .back-link {
            display: block;
            text-align: center;
            margin-top: 20px;
            color: #aaa;
            text-decoration: none;
        }
        .back-link:hover {
            color: #ffc107;
        }
    </style>
</head>
<body>

    <div class="register-card">
        <h2 class="text-center mb-4" style="color: #ffc107;">Register</h2>
        
        <?php if ($error): ?>
            <div class="alert alert-danger"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>
        
        <?php if ($success): ?>
            <div class="alert alert-success"><?php echo $success; ?></div>
        <?php else: ?>

        <form method="POST" action="">
            <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <div class="input-group">
                    <span class="input-group-text bg-dark border-secondary text-white"><i data-lucide="user"></i></span>
                    <input type="text" class="form-control" id="username" name="username" required minlength="4" maxlength="20">
                </div>
            </div>
            <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <div class="input-group">
                    <span class="input-group-text bg-dark border-secondary text-white"><i data-lucide="lock"></i></span>
                    <input type="password" class="form-control" id="password" name="password" required minlength="6">
                </div>
            </div>
            <div class="mb-3">
                <label for="confirm_password" class="form-label">Confirm Password</label>
                <div class="input-group">
                    <span class="input-group-text bg-dark border-secondary text-white"><i data-lucide="lock"></i></span>
                    <input type="password" class="form-control" id="confirm_password" name="confirm_password" required minlength="6">
                </div>
            </div>
            <button type="submit" class="btn btn-custom mt-3">Register Account</button>
        </form>
        <?php endif; ?>

        <div class="text-center mt-3">
            <span style="color: #aaa;">Already have an account?</span> <a href="login.php" class="text-warning text-decoration-none">Login</a>
        </div>
        <a href="index.php" class="back-link"><i data-lucide="arrow-left" size="14"></i> Back to Home</a>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        lucide.createIcons();
    </script>
</body>
</html>

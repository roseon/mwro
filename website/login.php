<?php
require_once 'includes/db.php';

if (isLoggedIn()) {
    redirect('profile.php');
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username']);
    $password = $_POST['password'];

    if (empty($username) || empty($password)) {
        $error = 'Please enter both username and password.';
    } else {
        // Normalize username to lowercase for ID
        $userId = strtolower($username);

        // Users are stored in the 'User' table with 'id' as username and 'data' column containing JSON
        $stmt = $pdo->prepare("SELECT * FROM User WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        if ($user) {
            $userData = json_decode($user['data'], true);
            // Verify password using password_verify (compatible with bcrypt)
            // Game server matches: md5(password).toLowerCase() + salt
            $processedPassword = strtolower(md5($password)) . GLOBAL_SALT;
            
            if (isset($userData['password']) && password_verify($processedPassword, $userData['password'])) {
                $_SESSION['user_id'] = $userId; // Use canonical ID
                $_SESSION['user_data'] = $userData;
                redirect('profile.php');
            } else {
                $error = 'Invalid username or password.';
            }
        } else {
            $error = 'Invalid username or password.';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Myth War Online</title>
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
        .login-card {
            background-color: rgba(0, 0, 0, 0.85);
            padding: 40px;
            border-radius: 15px;
            width: 100%;
            max-width: 400px;
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

    <div class="login-card">
        <h2 class="text-center mb-4" style="color: #ffc107;">Login</h2>
        
        <?php if ($error): ?>
            <div class="alert alert-danger"><?php echo htmlspecialchars($error); ?></div>
        <?php endif; ?>

        <form method="POST" action="">
            <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <div class="input-group">
                    <span class="input-group-text bg-dark border-secondary text-white"><i data-lucide="user"></i></span>
                    <input type="text" class="form-control" id="username" name="username" required>
                </div>
            </div>
            <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <div class="input-group">
                    <span class="input-group-text bg-dark border-secondary text-white"><i data-lucide="lock"></i></span>
                    <input type="password" class="form-control" id="password" name="password" required>
                </div>
            </div>
            <button type="submit" class="btn btn-custom mt-3">Login</button>
        </form>

        <div class="text-center mt-3">
            <span style="color: #aaa;">Don't have an account?</span> <a href="register.php" class="text-warning text-decoration-none">Register</a>
        </div>
        <a href="index.php" class="back-link"><i data-lucide="arrow-left" size="14"></i> Back to Home</a>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        lucide.createIcons();
    </script>
</body>
</html>

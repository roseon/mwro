<?php
require_once 'includes/db.php';

if (!isLoggedIn()) {
    redirect('login.php');
}

$username = $_SESSION['user_id'];

// Always fetch fresh data from DB to reflect in-game changes
$stmt = $pdo->prepare("SELECT * FROM User WHERE id = ?");
$stmt->execute([$username]);
$dbUserRaw = $stmt->fetch();

if (!$dbUserRaw) {
    // Session exists but user not in DB (deleted)?
    session_destroy();
    redirect('login.php');
}

$user = json_decode($dbUserRaw['data'], true);
$_SESSION['user_data'] = $user; // Update session with fresh data

$message = '';
$error = '';

// Handle Password Change
if (isset($_POST['change_password'])) {
    $current_password = $_POST['current_password'];
    $new_password = $_POST['new_password'];
    $confirm_new = $_POST['confirm_new'];

    if (empty($current_password) || empty($new_password)) {
        $error = 'Please fill in all fields.';
    } elseif ($new_password !== $confirm_new) {
        $error = 'New passwords do not match.';
    } else {
        // Prepare to fetch fresh data (already have it in $user)
        // Game server matches: md5(password).toLowerCase() + salt
        $processedCurrent = strtolower(md5($current_password)) . GLOBAL_SALT;
        
        if (password_verify($processedCurrent, $user['password'])) {
            $processedNew = strtolower(md5($new_password)) . GLOBAL_SALT;
            $user['password'] = password_hash($processedNew, PASSWORD_BCRYPT, ['cost' => 10]);
            
            $json = json_encode($user);
            $update = $pdo->prepare("UPDATE User SET data = ? WHERE id = ?");
            if ($update->execute([$json, $username])) {
                $message = 'Password updated successfully.';
                $_SESSION['user_data'] = $user; // Update session
            } else {
                $error = 'Failed to update password.';
            }
        } else {
            $error = 'Incorrect current password.';
        }
    }
}

// Handle Character Deletion
if (isset($_POST['delete_character'])) {
    $charIdToDelete = $_POST['char_id'];
    
    // Verify ownership
    if (in_array($charIdToDelete, $user['characters'])) {
        // Remove from user's character list
        $user['characters'] = array_values(array_diff($user['characters'], [$charIdToDelete]));
        
        // Update User in DB
        $json = json_encode($user);
        $updateUser = $pdo->prepare("UPDATE User SET data = ? WHERE id = ?");
        
        if ($updateUser->execute([$json, $username])) {
            // Delete character from Player table
            $deletePlayer = $pdo->prepare("DELETE FROM Player WHERE id = ?");
            $deletePlayer->execute([$charIdToDelete]);
            
            $message = 'Character deleted successfully.';
            $_SESSION['user_data'] = $user;
        } else {
            $error = 'Failed to delete character.';
        }
    } else {
        $error = 'You do not own this character.';
    }
}


// Fetch User Characters
$characters = [];
if (isset($user['characters']) && is_array($user['characters'])) {
    foreach ($user['characters'] as $charId) {
        $stmt = $pdo->prepare("SELECT * FROM Player WHERE id = ?");
        $stmt->execute([$charId]);
        $char = $stmt->fetch();
        if ($char) {
            $characters[] = json_decode($char['data'], true);
        }
    }
}

// Helper for Race/Class
function getRaceName($raceId) {
    if ($raceId == 0) return 'Human';
    if ($raceId == 1) return 'Centaur';
    if ($raceId == 2) return 'Mage';
    if ($raceId == 3) return 'Borg';
    return 'Unknown';
}
function getGenderName($genderId) {
    return $genderId == 0 ? 'Male' : 'Female';
}

function getCharacterImage($race, $gender) {
    $basePath = 'assets/img/';
    
    // Race: 0=Human, 1=Centaur, 2=Mage, 3=Borg
    // Gender: 0=Male, 1=Female
    
    if ($race == 0) { // Human
        return $basePath . ($gender == 1 ? 'Human Female.png' : 'Human Male.png');
    } elseif ($race == 1) { // Centaur
        return $basePath . ($gender == 1 ? 'Centaure Female.png' : 'Centaur Male.png');
    } elseif ($race == 2) { // Mage
        return $basePath . ($gender == 1 ? 'Mage Female.png' : 'Mage Male.png');
    } elseif ($race == 3) { // Borg
        return $basePath . ($gender == 1 ? 'Borg Female.png' : 'Borg Male.png');
    }
    
    // Fallback
    return $basePath . 'Human Male.png';
}

function getLevelFromExp($totalExp, $reborn) {
    $maxLevel = ($reborn == 0) ? 104 : 124;
    // Cap iteration to avoid infinite loops if something is weird, though maxLevel handles it.
    for ($lvl = 1; $lvl < $maxLevel; $lvl++) {
        // Calculate exp required for NEXT level ($lvl + 1)
        $nextLvl = $lvl + 1;
        $expNeeded = 0;
        
        if ($reborn == 0) {
            if ($nextLvl < 49) $expNeeded = floor(3.4 * pow($nextLvl + 2, 4));
            else $expNeeded = 4 * pow($nextLvl, 4);
        } else {
             $expNeeded = round(4.8 * pow($nextLvl, 4));
        }
        
        if ($totalExp < $expNeeded) return $lvl;
    }
    return $maxLevel;
}

function getSkillLevel($exp) {
    // Thresholds from SkillsGroup.ts
    // map[2]=60 means need 60 exp to be level 2.
    $map = [0, 0, 60, 130, 312, 690, 1372, 2490, 4200, 6682, 10140, 14802];
    
    for ($i = 11; $i >= 2; $i--) {
        if ($exp >= $map[$i]) return $i;
    }
    return 1;
}

function getRankName($skillsJson) {
    if (!is_array($skillsJson)) return 'Civilian';
    
    $totalSkillLevels = 0;
    foreach ($skillsJson as $skill) {
        $totalSkillLevels += getSkillLevel($skill['exp']);
    }
    
    if ($totalSkillLevels >= 80) return 'General';
    if ($totalSkillLevels >= 60) return 'Sergeant';
    if ($totalSkillLevels >= 40) return 'Corporal';
    if ($totalSkillLevels >= 20) return 'Recruit';
    return 'Civilian';
}
?>
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profile - Myth War Online</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        body {
            background-color: #121212;
            color: #ffffff;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .navbar {
            background-color: rgba(0, 0, 0, 0.8) !important;
            backdrop-filter: blur(10px);
        }
        .navbar-brand {
            font-weight: bold;
            color: #ffc107 !important;
        }
        .nav-link {
            color: #e0e0e0 !important;
        }
        .nav-link:hover {
            color: #ffc107 !important;
        }
        .profile-header {
            background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80');
            background-size: cover;
            background-position: center;
            padding: 100px 0 50px;
            text-align: center;
            border-bottom: 2px solid #ffc107;
        }
        .avatar {
            width: 120px;
            height: 120px;
            background-color: #333;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: 4px solid #ffc107;
            margin-bottom: 20px;
        }
        .section-card {
            background-color: #1e1e1e;
            border-radius: 10px;
            padding: 25px;
            margin-bottom: 30px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        }
        .char-card {
            background-color: #2c2c2c;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            border-left: 4px solid #ffc107;
            transition: transform 0.2s;
        }
        .char-card:hover {
            transform: translateX(5px);
            background-color: #333;
        }
        .char-icon {
            width: 60px;
            height: 60px;
            overflow: hidden;
            border-radius: 50%;
            border: 2px solid #ffc107;
            margin-right: 15px;
            flex-shrink: 0;
            background-color: #000;
        }
        .char-icon img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: top center;
        }
        .char-info {
            flex-grow: 1;
            padding-left: 15px;
        }
        .char-name {
            font-weight: bold;
            font-size: 1.1rem;
            color: #ffc107;
        }
        .char-detail {
            color: #aaa;
            font-size: 0.9rem;
        }
        .char-level {
            background-color: #000;
            color: #fff;
            padding: 5px 10px;
            border-radius: 15px;
            font-weight: bold;
            font-size: 0.9rem;
        }
        .form-control {
            background-color: #333;
            border: 1px solid #444;
            color: #fff;
        }
        .form-control:focus {
            background-color: #333;
            color: #fff;
            border-color: #ffc107;
            box-shadow: none;
        }
    </style>
</head>
<body>

    <!-- Navbar -->
    <nav class="navbar navbar-expand-lg fixed-top">
        <div class="container">
            <a class="navbar-brand" href="index.php"><i data-lucide="sword"></i> Myth War</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item"><a class="nav-link" href="index.php">Home</a></li>
                    <li class="nav-item"><a class="nav-link" href="index.php#news">News</a></li>
                    <?php if (isset($user['isAdmin']) && $user['isAdmin']): ?>
                        <li class="nav-item"><a class="nav-link text-warning" href="admin.php">Admin</a></li>
                    <?php endif; ?>
                    <li class="nav-item"><a class="nav-link active" href="profile.php">Profile</a></li>
                    <li class="nav-item"><a class="nav-link" href="logout.php">Logout</a></li>
                </ul>
            </div>
        </div>
    </nav>

    <div class="profile-header">
        <div class="container">
            <div class="avatar">
                <i data-lucide="user" size="64" color="#fff"></i>
            </div>
            <h2><?php echo htmlspecialchars($username); ?></h2>
            <p class="text-white-50">Member since <?php echo isset($user['created_at']) ? date('M Y', $user['created_at']) : 'Beginning of Time'; ?></p>
        </div>
    </div>

    <div class="container mt-5">
        <div class="row">
            <!-- Characters Column -->
            <div class="col-lg-8">
                <div class="section-card">
                    <h3 class="mb-4"><i data-lucide="users" class="me-2"></i> My Characters</h3>
                    
                    <?php if (empty($characters)): ?>
                        <div class="alert alert-secondary">No characters found. Log in to the game to create one!</div>
                    <?php else: ?>
                        <div class="row">
                            <?php foreach ($characters as $char): ?>
                                <div class="col-md-12">
                                    <div class="char-card">
                                        <div class="char-icon">
                                            <img src="<?php echo getCharacterImage($char['race'], $char['gender']); ?>" alt="Character">
                                        </div>
                                        <div class="char-info">
                                            <div class="char-name">
                                                <?php echo htmlspecialchars($char['name']); ?>
                                                <span class="badge bg-warning text-dark ms-2" style="font-size: 0.7em; vertical-align: middle;">
                                                    <?php echo getRankName($char['skills']); ?>
                                                </span>
                                            </div>
                                            <div class="char-detail">
                                                <?php echo getRaceName($char['race']) . ' ' . getGenderName($char['gender']); ?>
                                                &bull; Map: <?php echo $char['mapId']; ?>
                                            </div>
                                        </div>
                                        <div class="char-level">
                                            Lvl <?php 
                                                $level = getLevelFromExp($char['totalExp'], $char['reborn']);
                                                echo $level; 
                                            ?>
                                            <div style="font-size: 0.7em; font-weight: normal; opacity: 0.7;">
                                                <?php echo number_format($char['totalExp']); ?> Exp
                                            </div>
                                        </div>
                                        <div class="char-actions ms-3">
                                            <button type="button" class="btn btn-outline-danger btn-sm" title="Delete Character" 
                                                    data-bs-toggle="modal" data-bs-target="#deleteModal" 
                                                    data-char-id="<?php echo $char['id']; ?>"
                                                    data-char-name="<?php echo htmlspecialchars($char['name']); ?>">
                                                <i data-lucide="trash-2" size="16"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>
                </div>
            </div>

            <!-- Settings Column -->
            <div class="col-lg-4">
                <div class="section-card">
                    <h3 class="mb-4"><i data-lucide="settings" class="me-2"></i> Account Settings</h3>
                    
                    <?php if ($message): ?>
                        <div class="alert alert-success"><?php echo $message; ?></div>
                    <?php endif; ?>
                    <?php if ($error): ?>
                        <div class="alert alert-danger"><?php echo $error; ?></div>
                    <?php endif; ?>

                    <form method="POST" action="">
                        <input type="hidden" name="change_password" value="1">
                        <div class="mb-3">
                            <label class="form-label">Current Password</label>
                            <input type="password" name="current_password" class="form-control" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">New Password</label>
                            <input type="password" name="new_password" class="form-control" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Confirm New Password</label>
                            <input type="password" name="confirm_new" class="form-control" required>
                        </div>
                        <button type="submit" class="btn btn-warning w-100 fw-bold">Update Password</button>
                    </form>
                </div>
                
                <div class="section-card text-center">
                    <h4>Account Status</h4>
                    <p class="text-success fw-bold">Active</p>
                    <hr class="border-secondary">
                    <p class="small text-muted">IP: <?php echo $_SERVER['REMOTE_ADDR']; ?></p>
                </div>
            </div>
        </div>
    </div>

    <footer class="mt-5 pb-4 text-center">
        <div class="container">
            <p class="text-muted">&copy; 2023 Myth War Online</p>
        </div>
    </footer>

    <!-- Delete Confirmation Modal -->
    <div class="modal fade" id="deleteModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content bg-dark text-white border-secondary">
                <div class="modal-header border-secondary">
                    <h5 class="modal-title text-danger">Delete Character</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to delete <strong id="deleteCharName" class="text-warning"></strong>?</p>
                    <p class="text-muted small">This action cannot be undone. All data associated with this character will be permanently lost.</p>
                </div>
                <div class="modal-footer border-secondary">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <form method="POST" action="">
                        <input type="hidden" name="delete_character" value="1">
                        <input type="hidden" name="char_id" id="deleteCharId" value="">
                        <button type="submit" class="btn btn-danger">Delete Character</button>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        lucide.createIcons();

        const deleteModal = document.getElementById('deleteModal');
        if (deleteModal) {
            deleteModal.addEventListener('show.bs.modal', event => {
                const button = event.relatedTarget;
                const charId = button.getAttribute('data-char-id');
                const charName = button.getAttribute('data-char-name');
                
                const modalIdInput = deleteModal.querySelector('#deleteCharId');
                const modalNameSpan = deleteModal.querySelector('#deleteCharName');
                
                modalIdInput.value = charId;
                modalNameSpan.textContent = charName;
            });
        }
    </script>
</body>
</html>

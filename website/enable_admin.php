<?php
require_once 'includes/db.php';

?>
<!DOCTYPE html>
<html>
<head>
    <title>Enable Admin</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-dark text-white p-5">
    <div class="container">
        <h1>Admin Enabler Tool</h1>
        <?php
        if (isset($_POST['grant_all'])) {
            $stmt = $pdo->query("SELECT * FROM User");
            $count = 0;
            while ($row = $stmt->fetch()) {
                $id = $row['id'];
                $data = json_decode($row['data'], true);
                
                if (!isset($data['isAdmin']) || $data['isAdmin'] !== true) {
                    $data['isAdmin'] = true;
                    $json = json_encode($data);
                    $update = $pdo->prepare("UPDATE User SET data = ? WHERE id = ?");
                    $update->execute([$json, $id]);
                    echo "<div class='alert alert-success'>Granted admin privileges to: <strong>" . htmlspecialchars($id) . "</strong></div>";
                    $count++;
                }
            }
            if ($count == 0) {
                echo "<div class='alert alert-info'>All users are already admins.</div>";
            }
            echo "<a href='admin.php' class='btn btn-primary'>Go to Admin Panel</a>";
        } else {
            echo "<p>Click the button below to grant 'isAdmin' privileges to ALL registered users.</p>";
            echo "<form method='POST'><button type='submit' name='grant_all' class='btn btn-warning'>Grant Admin to All Users</button></form>";
        }
        ?>
    </div>
</body>
</html>


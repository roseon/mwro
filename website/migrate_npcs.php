<?php
require_once 'includes/db.php';

// Adjust path for CLI or Web
// Note: Changed from relative to absolute-like based on previous successes
$baseDir = __DIR__ . '/../mw-tools/build/game-server/file-storage/MythWarServer/_default/Npc/';

if (!is_dir($baseDir)) {
    die("Directory not found: $baseDir");
}

$files = scandir($baseDir);
echo "<h3>Scanning directory: $baseDir</h3>";
echo "Found " . count($files) . " entries.<br>";

$count = 0;
foreach ($files as $file) {
    if (pathinfo($file, PATHINFO_EXTENSION) !== 'json') continue;
    
    $json = file_get_contents($baseDir . $file);
    if (!$json) {
        echo "Failed to read $file<br>";
        continue;
    }
    
    $data = json_decode($json, true);
    if (!$data || !isset($data['id'])) {
        echo "Invalid JSON in $file<br>";
        continue;
    }
    
    $id = intval($data['id']);
    
    // Insert/Update DB
    try {
        $stmt = $pdo->prepare("INSERT INTO Npc (id, data) VALUES (?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data)");
        $stmt->execute([$id, $json]);
        $count++;
    } catch (PDOException $e) {
        echo "Error importing ID $id: " . $e->getMessage() . "<br>";
    }
}

echo "<div style='color:green; font-weight:bold; margin-top:20px;'>Successfully migrated $count NPCs to MySQL.</div>";
echo "<a href='admin.php'>Go to Admin Panel</a>";
?>

<?php
require_once 'includes/db.php';

// Authentication Check
if (!isLoggedIn()) {
    redirect('login.php');
}

$currentUsername = $_SESSION['user_id'];

// Always fetch fresh data from DB to ensure permissions are up to date
$stmt = $pdo->prepare("SELECT * FROM User WHERE id = ?");
$stmt->execute([$currentUsername]);
$dbUserRaw = $stmt->fetch();

if (!$dbUserRaw) {
    session_destroy();
    redirect('login.php');
}

$currentUser = json_decode($dbUserRaw['data'], true);
$_SESSION['user_data'] = $currentUser; // Sync session

// Simple Admin Check: Username 'admin' or isAdmin flag in JSON
$isAdmin = ($currentUsername === 'admin') || (isset($currentUser['isAdmin']) && $currentUser['isAdmin'] === true);

if (!$isAdmin) {
    die('<div class="container mt-5"><div class="alert alert-danger">Access Denied: Admin privileges required.</div><a href="index.php">Back to Home</a></div>');
}

$message = '';
$error = '';
$activeTab = 'users';

// --- HANDLERS ---

// User Management
if (isset($_POST['action']) && $_POST['action'] === 'update_user') {
    $userId = $_POST['user_id'];
    $newPassword = $_POST['new_password'];
    $setAdmin = isset($_POST['is_admin']) ? true : false;
    $banned = isset($_POST['is_banned']) ? true : false; // Example flag
    $charIdsStr = $_POST['character_ids'] ?? null;
    
    $stmt = $pdo->prepare("SELECT * FROM User WHERE id = ?");
    $stmt->execute([$userId]);
    $targetUser = $stmt->fetch();
    
    if ($targetUser) {
        $data = json_decode($targetUser['data'], true);
        if (!empty($newPassword)) {
            // Replicate registration hash logic
            $processedPassword = strtolower(md5($newPassword)) . GLOBAL_SALT;
            $data['password'] = password_hash($processedPassword, PASSWORD_BCRYPT, ['cost' => 10]);
        }
        $data['isAdmin'] = $setAdmin;
        $data['banned'] = $banned;

        if ($charIdsStr !== null) {
            $ids = array_filter(array_map('intval', explode(',', $charIdsStr)));
            $data['characters'] = array_values($ids);
        }
        
        $json = json_encode($data);
        $update = $pdo->prepare("UPDATE User SET data = ? WHERE id = ?");
        if ($update->execute([$json, $userId])) {
            $message = "User $userId updated successfully.";
        } else {
            $error = "Failed to update user.";
        }
    }
    $activeTab = 'users';
}

if (isset($_POST['action']) && $_POST['action'] === 'delete_user') {
    $userId = $_POST['user_id'] ?? '';
    if ($userId !== '') {
        try {
            $pdo->beginTransaction();
            $stmt = $pdo->prepare("SELECT data FROM User WHERE id = ?");
            $stmt->execute([$userId]);
            $row = $stmt->fetch();

            if ($row) {
                $data = json_decode($row['data'], true);
                $characterIds = $data['characters'] ?? [];
                if (is_array($characterIds) && !empty($characterIds)) {
                    $delPlayer = $pdo->prepare("DELETE FROM Player WHERE id = ?");
                    foreach ($characterIds as $charId) {
                        $delPlayer->execute([intval($charId)]);
                    }
                }
            }

            $delUser = $pdo->prepare("DELETE FROM User WHERE id = ?");
            if ($delUser->execute([$userId])) {
                $pdo->commit();
                $message = "User $userId deleted.";
            } else {
                $pdo->rollBack();
                $error = "Failed to delete user.";
            }
        } catch (Exception $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            $error = "Failed to delete user.";
        }
    }
    $activeTab = 'users';
}

// Item Management
if (isset($_POST['action']) && ($_POST['action'] === 'save_item')) {
    $itemId = intval($_POST['item_id']);
    $name = $_POST['name'];
    $description = $_POST['description'];
    $file = intval($_POST['file']); // Image ID
    $type = intval($_POST['type']);
    $equipmentSlot = ($_POST['equipment_slot'] ?? '') !== '' ? intval($_POST['equipment_slot']) : null;
    $questItem = isset($_POST['quest_item']);
    $level = ($_POST['level'] ?? '') !== '' ? intval($_POST['level']) : null;
    $race = ($_POST['race'] ?? '') !== '' ? intval($_POST['race']) : null;
    $gender = ($_POST['gender'] ?? '') !== '' ? intval($_POST['gender']) : null;
    $petId = ($_POST['pet_id'] ?? '') !== '' ? intval($_POST['pet_id']) : null;
    $canConvert = isset($_POST['can_convert']);
    $supportedSlotsRaw = $_POST['supported_slots'] ?? '';
    $statsJson = trim($_POST['stats_json'] ?? '');
    $actionJson = trim($_POST['action_json'] ?? '');
    $itemPropertiesJson = trim($_POST['item_properties_json'] ?? '');
    $statKeys = $_POST['stat_key'] ?? [];
    $statValues = $_POST['stat_value'] ?? [];
    $actionKeys = $_POST['action_key'] ?? [];
    $actionValues = $_POST['action_value'] ?? [];
    $itemPropKeys = $_POST['item_prop_key'] ?? [];
    $itemPropValues = $_POST['item_prop_value'] ?? [];
    $statsHp = intval($_POST['stats_hp'] ?? 0);
    $statsMp = intval($_POST['stats_mp'] ?? 0);
    $statsStr = intval($_POST['stats_str'] ?? 0);
    // ... add more stats as needed

    $stats = null;
    if ($statsJson !== '') {
        $decodedStats = json_decode($statsJson, true);
        if ($decodedStats === null && json_last_error() !== JSON_ERROR_NONE) {
            $error = 'Invalid Stats JSON.';
            $activeTab = 'items';
        } else {
            $stats = $decodedStats;
        }
    }

    if ($statsJson === '' && (!empty($statKeys) || !empty($statValues))) {
        $statsPayload = [];
        foreach ($statKeys as $idx => $key) {
            $key = trim($key);
            if ($key === '') continue;
            $statsPayload[$key] = $statValues[$idx] ?? '';
        }
        if (!empty($statsPayload)) {
            $statsJson = json_encode($statsPayload);
        }
    }

    if ($actionJson === '' && (!empty($actionKeys) || !empty($actionValues))) {
        $actionPayload = [];
        foreach ($actionKeys as $idx => $key) {
            $key = trim($key);
            if ($key === '') continue;
            $actionPayload[$key] = $actionValues[$idx] ?? '';
        }
        if (!empty($actionPayload)) {
            $actionJson = json_encode($actionPayload);
        }
    }

    if ($itemPropertiesJson === '' && (!empty($itemPropKeys) || !empty($itemPropValues))) {
        $propsPayload = [];
        foreach ($itemPropKeys as $idx => $key) {
            $key = trim($key);
            if ($key === '') continue;
            $propsPayload[$key] = $itemPropValues[$idx] ?? '';
        }
        if (!empty($propsPayload)) {
            $itemPropertiesJson = json_encode($propsPayload);
        }
    }

    $action = null;
    if ($actionJson !== '') {
        $decodedAction = json_decode($actionJson, true);
        if ($decodedAction === null && json_last_error() !== JSON_ERROR_NONE) {
            $error = 'Invalid Action JSON.';
            $activeTab = 'items';
        } else {
            $action = $decodedAction;
        }
    }

    $itemProperties = null;
    if ($itemPropertiesJson !== '') {
        $decodedProps = json_decode($itemPropertiesJson, true);
        if ($decodedProps === null && json_last_error() !== JSON_ERROR_NONE) {
            $error = 'Invalid Item Properties JSON.';
            $activeTab = 'items';
        } else {
            $itemProperties = $decodedProps;
        }
    }

    $supportedSlots = null;
    if (is_array($supportedSlotsRaw)) {
        $supportedSlots = array_values(array_unique(array_map('intval', $supportedSlotsRaw)));
    } else {
        $supportedSlotsStr = trim($supportedSlotsRaw);
        if ($supportedSlotsStr !== '') {
            $supportedSlots = array_values(
                array_filter(array_map('intval', explode(',', $supportedSlotsStr)), fn($v) => $v !== 0 || $supportedSlotsStr === '0')
            );
        }
    }

    if ($error) {
        $activeTab = 'items';
    } else {
        if ($stats === null) {
            $stats = [
                'hp' => $statsHp,
                'mp' => $statsMp,
                'str' => $statsStr
            ];
        }
    
    // Construct JSON
        $itemData = [
            'id' => $itemId,
            'name' => $name,
            'description' => $description,
            'file' => $file,
            'type' => $type,
            'stackLimit' => intval($_POST['stack_limit'] ?? 1),
            'equipmentSlot' => $equipmentSlot,
            'questItem' => $questItem,
            'level' => $level,
            'race' => $race,
            'gender' => $gender,
            'petId' => $petId,
            'canConvert' => $canConvert,
            'supportedEquipmentSlots' => $supportedSlots,
            'action' => $action,
            'itemProperties' => $itemProperties,
            'stats' => $stats
        ];
    
        $json = json_encode($itemData);
        $sql = "INSERT INTO BaseItem (id, data) VALUES (?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data)";
        $stmt = $pdo->prepare($sql);
        if ($stmt->execute([$itemId, $json])) {
            $message = "Item $name (ID: $itemId) saved.";
        } else {
            $error = "Failed to save item.";
        }
        $activeTab = 'items';
    }

}

// Pet Management
if (isset($_POST['action']) && $_POST['action'] === 'save_pet') {
    $petKey = trim($_POST['pet_key'] ?? '');
    $petId = ($_POST['pet_id'] ?? '') !== '' ? intval($_POST['pet_id']) : null;
    $name = trim($_POST['name'] ?? '');
    $file = ($_POST['file'] ?? '') !== '' ? intval($_POST['file']) : null;
    $species = ($_POST['species'] ?? '') !== '' ? intval($_POST['species']) : null;
    $level = ($_POST['level'] ?? '') !== '' ? intval($_POST['level']) : null;
    $buildJson = trim($_POST['build_json'] ?? '');
    $statRatesJson = trim($_POST['stat_rates_json'] ?? '');
    $resistJson = trim($_POST['resist_json'] ?? '');
    $skillsJson = trim($_POST['skills_json'] ?? '');
    $buildStaRaw = $_POST['build_sta'] ?? '';
    $buildIntRaw = $_POST['build_int'] ?? '';
    $buildStrRaw = $_POST['build_str'] ?? '';
    $buildAgiRaw = $_POST['build_agi'] ?? '';
    $statGrowthMinRaw = $_POST['stat_growth_min'] ?? '';
    $statGrowthMaxRaw = $_POST['stat_growth_max'] ?? '';
    $statStaMinRaw = $_POST['stat_sta_min'] ?? '';
    $statStaMaxRaw = $_POST['stat_sta_max'] ?? '';
    $statIntMinRaw = $_POST['stat_int_min'] ?? '';
    $statIntMaxRaw = $_POST['stat_int_max'] ?? '';
    $statStrMinRaw = $_POST['stat_str_min'] ?? '';
    $statStrMaxRaw = $_POST['stat_str_max'] ?? '';
    $statAgiMinRaw = $_POST['stat_agi_min'] ?? '';
    $statAgiMaxRaw = $_POST['stat_agi_max'] ?? '';
    $resistKeys = $_POST['resist_key'] ?? [];
    $resistValues = $_POST['resist_value'] ?? [];
    $skillIds = $_POST['skill_id'] ?? [];
    $skillExps = $_POST['skill_exp'] ?? [];

    if ($petKey === '' && $petId !== null) {
        $petKey = (string)$petId;
    }

    if ($buildJson === '' && ($buildStaRaw !== '' || $buildIntRaw !== '' || $buildStrRaw !== '' || $buildAgiRaw !== '')) {
        $buildJson = json_encode([
            'sta' => floatval($buildStaRaw),
            'int' => floatval($buildIntRaw),
            'str' => floatval($buildStrRaw),
            'agi' => floatval($buildAgiRaw)
        ]);
    }

    if ($statRatesJson === '' && ($statGrowthMinRaw !== '' || $statGrowthMaxRaw !== '' || $statStaMinRaw !== '' || $statStaMaxRaw !== '' || $statIntMinRaw !== '' || $statIntMaxRaw !== '' || $statStrMinRaw !== '' || $statStrMaxRaw !== '' || $statAgiMinRaw !== '' || $statAgiMaxRaw !== '')) {
        $statRatesJson = json_encode([
            'growthRate' => [
                'min' => floatval($statGrowthMinRaw),
                'max' => floatval($statGrowthMaxRaw)
            ],
            'sta' => ['min' => floatval($statStaMinRaw), 'max' => floatval($statStaMaxRaw)],
            'int' => ['min' => floatval($statIntMinRaw), 'max' => floatval($statIntMaxRaw)],
            'str' => ['min' => floatval($statStrMinRaw), 'max' => floatval($statStrMaxRaw)],
            'agi' => ['min' => floatval($statAgiMinRaw), 'max' => floatval($statAgiMaxRaw)]
        ]);
    }

    if ($resistJson === '' && (!empty($resistKeys) || !empty($resistValues))) {
        $resist = [];
        foreach ($resistKeys as $idx => $key) {
            $key = trim($key);
            if ($key === '') continue;
            $resist[$key] = isset($resistValues[$idx]) ? floatval($resistValues[$idx]) : 0;
        }
        if (!empty($resist)) {
            $resistJson = json_encode($resist);
        }
    }

    if ($skillsJson === '' && (!empty($skillIds) || !empty($skillExps))) {
        $skills = [];
        foreach ($skillIds as $idx => $id) {
            if ($id === '' || $id === null) continue;
            $skills[] = [
                'id' => intval($id),
                'exp' => isset($skillExps[$idx]) ? floatval($skillExps[$idx]) : 0
            ];
        }
        if (!empty($skills)) {
            $skillsJson = json_encode($skills);
        }
    }

    $build = null;
    if ($buildJson === '') {
        $error = 'Build JSON is required.';
    } else {
        $decodedBuild = json_decode($buildJson, true);
        if ($decodedBuild === null && json_last_error() !== JSON_ERROR_NONE) {
            $error = 'Invalid Build JSON.';
        } else {
            $build = $decodedBuild;
        }
    }

    $statRates = null;
    if (!$error) {
        if ($statRatesJson === '') {
            $error = 'Stat Rates JSON is required.';
        } else {
            $decodedStatRates = json_decode($statRatesJson, true);
            if ($decodedStatRates === null && json_last_error() !== JSON_ERROR_NONE) {
                $error = 'Invalid Stat Rates JSON.';
            } else {
                $statRates = $decodedStatRates;
            }
        }
    }

    $resist = null;
    if (!$error && $resistJson !== '') {
        $decodedResist = json_decode($resistJson, true);
        if ($decodedResist === null && json_last_error() !== JSON_ERROR_NONE) {
            $error = 'Invalid Resist JSON.';
        } else {
            $resist = $decodedResist;
        }
    }

    $skills = null;
    if (!$error && $skillsJson !== '') {
        $decodedSkills = json_decode($skillsJson, true);
        if ($decodedSkills === null && json_last_error() !== JSON_ERROR_NONE) {
            $error = 'Invalid Skills JSON.';
        } else {
            $skills = $decodedSkills;
        }
    }

    if (!$error) {
        if ($petKey === '') {
            $error = 'Pet Key is required.';
        } elseif ($name === '' || $file === null || $species === null || $level === null) {
            $error = 'Name, File, Species, and Level are required.';
        }
    }

    if (!$error) {
        $petData = [
            'name' => $name,
            'petId' => $petId,
            'file' => $file,
            'species' => $species,
            'level' => $level,
            'build' => $build,
            'statRates' => $statRates,
            'resist' => $resist,
            'skills' => $skills
        ];

        $json = json_encode($petData);
        $sql = "INSERT INTO BasePet (id, data) VALUES (?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data)";
        $stmt = $pdo->prepare($sql);
        if ($stmt->execute([$petKey, $json])) {
            $message = "Pet $name (Key: $petKey) saved.";
        } else {
            $error = 'Failed to save pet.';
        }
    }
    $activeTab = 'pets';
}

if (isset($_POST['action']) && $_POST['action'] === 'delete_pet') {
    $petKey = $_POST['pet_key'] ?? '';
    if ($petKey !== '') {
        $stmt = $pdo->prepare("DELETE FROM BasePet WHERE id = ?");
        if ($stmt->execute([$petKey])) {
            $message = 'Pet deleted.';
        }
    }
    $activeTab = 'pets';
}

if (isset($_POST['action']) && $_POST['action'] === 'delete_item') {
    $itemId = $_POST['item_id'];
    $stmt = $pdo->prepare("DELETE FROM BaseItem WHERE id = ?");
    if ($stmt->execute([$itemId])) {
        $message = "Item deleted.";
    }
    $activeTab = 'items';
}

// NPC Management
if (isset($_POST['action']) && ($_POST['action'] === 'save_npc')) {
    $npcId = intval($_POST['npc_id']);
    $name = $_POST['name'];
    $file = intval($_POST['file']);
    $mapId = intval($_POST['map_id']);
    $x = intval($_POST['x']);
    $y = intval($_POST['y']);
    $direction = intval($_POST['direction']);
    $npcType = ($_POST['npc_type'] ?? '') !== '' ? intval($_POST['npc_type']) : null;
    $actionJson = $_POST['action_script'] ?? '';
    
    $npcData = [
        'id' => $npcId,
        'name' => $name,
        'file' => $file,
        'map' => $mapId,
        'point' => ['x' => $x, 'y' => $y],
        'direction' => $direction
    ];

    if ($npcType !== null) {
        $npcData['type'] = $npcType;
    }

    if (!empty($actionJson)) {
        $decoded = json_decode($actionJson, true);
        if ($decoded !== null) {
            $npcData['action'] = $decoded;
        }
    }
    
    $json = json_encode($npcData);
    $sql = "INSERT INTO Npc (id, data) VALUES (?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data)";
    $stmt = $pdo->prepare($sql);
    if ($stmt->execute([$npcId, $json])) {
        $message = "NPC $name (ID: $npcId) saved.";
    } else {
        $error = "Failed to save NPC.";
    }
    $activeTab = 'npcs';
}

if (isset($_POST['action']) && $_POST['action'] === 'delete_npc') {
    $npcId = $_POST['npc_id'];
    $stmt = $pdo->prepare("DELETE FROM Npc WHERE id = ?");
    if ($stmt->execute([$npcId])) {
        $message = "NPC deleted.";
    }
    $activeTab = 'npcs';
}

if (isset($_POST['action']) && $_POST['action'] === 'save_map_config') {
    $mapId = intval($_POST['map_id']);
    $groupW = intval($_POST['group_w']);
    $groupH = intval($_POST['group_h']);
    $tileW = intval($_POST['tile_w'] ?? 0);
    $tileH = intval($_POST['tile_h'] ?? 0);
    $mapCols = intval($_POST['map_cols'] ?? 0);
    $gridSize = floatval($_POST['grid_size'] ?? 0);
    $width = intval($_POST['map_w'] ?? 0);
    $height = intval($_POST['map_h'] ?? 0);
    
    $stmt = $pdo->prepare("SELECT data FROM GameData WHERE id = ?");
    $stmt->execute(['maps']);
    $row = $stmt->fetch();
    
    if ($row) {
        $mapsData = json_decode($row['data'], true);
        $found = false;
        foreach ($mapsData as &$m) {
            if ($m['id'] == $mapId) {
                $m['groupW'] = $groupW;
                $m['groupH'] = $groupH;
                $m['tileW'] = $tileW;
                $m['tileH'] = $tileH;
                $m['mapCols'] = $mapCols;
                $m['gridSize'] = $gridSize;
                $m['width'] = $width;
                $m['height'] = $height;
                $found = true;
                break;
            }
        }
        unset($m);
        
        if ($found) {
            $newData = json_encode($mapsData);
            $update = $pdo->prepare("UPDATE GameData SET data = ? WHERE id = ?");
            if ($update->execute([$newData, 'maps'])) {
                $message = "Map $mapId config saved.";
            } else {
                $error = "Failed to update GameData.";
            }
        } else {
            // Append new map config if not found
             $mapsData[] = [
                'id' => $mapId,
                'name' => "Map $mapId",
                'file' => $mapId,
                'width' => $width,
                'height' => $height,
                'groupW' => $groupW,
                'groupH' => $groupH,
                'tileW' => $tileW,
                'tileH' => $tileH,
                'mapCols' => $mapCols,
                'gridSize' => $gridSize,
                'musicFile' => 0, 'minimapFile' => null, 'fightMusicFile' => 0, 
                'fightBackgroundFile' => 0, 'randomMonsters' => [], 'fightFrequency' => 0
            ];
            $newData = json_encode($mapsData);
            $update = $pdo->prepare("UPDATE GameData SET data = ? WHERE id = ?");
            if ($update->execute([$newData, 'maps'])) {
                $message = "Map $mapId added to config.";
            }
        }
    }
    $activeTab = 'npcs';
}

// Quest Management
if (isset($_POST['action']) && $_POST['action'] === 'save_quest') {
    $questId = intval($_POST['quest_id']);
    $name = $_POST['name'];
    $description = $_POST['description'];
    $stagesJson = $_POST['stages'];
    
    $stages = json_decode($stagesJson, true) ?? [];
    if (empty($stages)) {
        $stages = [
            0 => [
                'situation' => '',
                'requirements' => '',
                'reward' => ''
            ]
        ];
    } else {
        foreach ($stages as $stageId => $stage) {
            $stages[$stageId] = [
                'situation' => $stage['situation'] ?? '',
                'requirements' => $stage['requirements'] ?? '',
                'reward' => $stage['reward'] ?? ''
            ];
        }
    }
    
    $questData = [
        'id' => $questId,
        'clientId' => $questId,
        'name' => $name,
        'description' => $description,
        'stages' => $stages
    ];
    
    $json = json_encode($questData);
    $sql = "INSERT INTO BaseQuest (id, data) VALUES (?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data)";
    $stmt = $pdo->prepare($sql);
    if ($stmt->execute([$questId, $json])) {
        $message = "Quest $questId saved.";
    } else {
        $error = "Failed to save quest.";
    }
    $activeTab = 'quests';
}

if (isset($_POST['action']) && $_POST['action'] === 'delete_quest') {
    $id = $_POST['quest_id'];
    $stmt = $pdo->prepare("DELETE FROM BaseQuest WHERE id = ?");
    $stmt->execute([$id]);
    $message = "Quest deleted.";
    $activeTab = 'quests';
}

// Map Tile Parser
if (isset($_GET['action']) && $_GET['action'] === 'get_map_tiles') {
    header('Content-Type: application/json');
    $mapId = intval($_GET['map_id']);
    // Determine Map File ID from DB (re-use logic or passed param? For now re-fetch simple)
    // We assume file structure /../mw-tools/client/map/MapXXX.map
    // However, map ID in filename might need padding.
    
    // Try to find the .map file. 
    // We need map info to know the 'file' ID if it differs from map ID.
    $fileId = $mapId;
    
    // Quick DB lookup to resolve File ID
    try {
        $stmt = $pdo->prepare("SELECT data FROM GameData WHERE id = ?");
        $stmt->execute(['maps']);
        $row = $stmt->fetch();
        if ($row) {
            $gameDataMaps = json_decode($row['data'], true);
            foreach ($gameDataMaps as $m) {
                if ($m['id'] == $mapId) {
                    $fileId = $m['file'] ?? $mapId;
                    break;
                }
            }
        }
    } catch (Exception $e) {}

    $paddedId = str_pad($fileId, 3, '0', STR_PAD_LEFT);
    // Maps can be 'Map001.map'
    $mapFile = __DIR__ . "/../mw-tools/client/map/Map{$paddedId}.map";
    if (!file_exists($mapFile)) {
        // Try alternate naming or path?
        $mapFile = __DIR__ . "/../mw-tools/client/map/Map{$fileId}.map";
    }

    $tiles = [];
    if (file_exists($mapFile)) {
        $fp = fopen($mapFile, 'rb');
        if ($fp) {
            // Header is mostly 0s, assume MAP_HEAD signature scan
            $raw = fread($fp, 512);
            $headPos = strpos($raw, 'MAP_HEAD');
            
            if ($headPos !== false) {
                fseek($fp, $headPos);
                // MAP_HEAD (approx 76+ bytes)
                // offset_img is at 64
                fseek($fp, $headPos + 64);
                $offsetImgInfo = unpack('l', fread($fp, 4))[1]; // SLONG
                
                if ($offsetImgInfo > 0) {
                    // Go to MAP_IMG_HEAD
                    // offset is relative to start of file? Assuming absolute.
                    fseek($fp, $offsetImgInfo);
                    
                    // Verify MAP_IMG signature
                    if (fread($fp, 7) == 'MAP_IMG') {
                         // MAP_IMG_HEAD
                         // total_img at 24
                         fseek($fp, $offsetImgInfo + 24);
                         $totalImg = unpack('l', fread($fp, 4))[1];
                         $imgDataOffset = unpack('l', fread($fp, 4))[1];
                         
                         // Go to Image List
                         // The list is interleaved: IMG_HEAD + Data + IMG_HEAD + Data...
                         // OR IMG_HEADs are contiguous.
                         // Given the structure "img_date_offset", it likely points to the first IMG_HEAD.
                         fseek($fp, $imgDataOffset);
                         
                         for ($i = 0; $i < $totalImg; $i++) {
                             // Read IMG_HEAD (at least 48 bytes)
                             // Scan for "IMG_HEAD" to be safe? 
                             // No, strict parsing is faster if data is clean.
                             // But let's check signature
                             $sig = fread($fp, 19); 
                             if (substr($sig, 0, 8) !== 'IMG_HEAD') {
                                 // Try to recover? 
                                 break;
                             }
                             
                             // Offset 40: orig_x, 44: orig_y
                             // IMG_HEAD is 20 (sig) + 4(offset) + 4(size) + 4(xlen) + 4(ylen) ...
                             // orig_x is at 20 + 4 + 4 + 4 + 4 = 36.
                             // Wait, struct:
                             // copyright(20), offset_img(4), size(4), xlen(4), ylen(4), orig_x(4), orig_y(4)
                             // 20+4+4+4+4 = 36. So orig_x is at 36.
                             
                             // Reset to start of this IMG_HEAD + 36
                             fseek($fp, -19, SEEK_CUR); // Backtrack sig
                             $base = ftell($fp);
                             fseek($fp, $base + 36);
                             
                             $d = unpack('l2', fread($fp, 8)); // orig_x, orig_y
                             $origX = $d[1];
                             $origY = $d[2];
                             
                             // Also need image size to skip data
                             fseek($fp, $base + 24); // Size is at 20+4 = 24
                             $size = unpack('l', fread($fp, 4))[1];
                             
                             $tiles[] = ['x' => $origX, 'y' => $origY];
                             
                             // Skip this IMG_HEAD (approx 52 bytes or closely packed 49?)
                             // Struct says 49 bytes. Assume 4 byte align -> 52?
                             // OR, assume data follows immediately.
                             // The 'offset_img' field might point to data, OR data follows.
                             // Let's assume data follows IMG_HEAD info.
                             // Standard IMG_HEAD size: 20+4+4+4+4+4+4+2+2+1 = 49.
                             // Usually aligned to 50 or 52?
                             // But wait, if data follows, we need to skip `size` bytes.
                             // If `offset_img` points elsewhere, we just skip struct size.
                             
                             // Let's use the `offset_img` value to know where the data is?
                             // If `offset_img` > current pos, maybe it points to data.
                             // If `offset_img` == 0 or relative...
                             
                             fseek($fp, $base + 20); 
                             $dataPtr = unpack('l', fread($fp, 4))[1];
                             
                             // If dataPtr is valid, the data is there.
                             // The NEXT IMG_HEAD should be at dataPtr + size.
                             if ($dataPtr > 0 && $size > 0) {
                                  // Jump to end of image data
                                  $expectedNext = $dataPtr + $size;
                                  fseek($fp, $expectedNext);
                                  
                                  // Scan forward for next IMG_HEAD signature to handle padding/alignment
                                  $bufferSize = 1024;
                                  $buffer = fread($fp, $bufferSize);
                                  $sigPos = strpos($buffer, 'IMG_HEAD');
                                  
                                  if ($sigPos !== false) {
                                      // Found it. Adjust pointer to start of this signature.
                                      fseek($fp, $expectedNext + $sigPos);
                                  } else {
                                      // If not found in buffer, maybe we reached EOF or it's further away?
                                      // Or this was the last image.
                                      // If we expect more images (i < totalImg-1), this is an issue.
                                      // Try a larger scan or just continue (the loop start will fail sig check and break).
                                      fseek($fp, $expectedNext);
                                  }
                             } else {
                                  // Fallback: This might be a header-only entry or invalid?
                                  // If offset is 0, maybe the data follows the header immediately?
                                  // break to avoid infinite loop if stuck.
                                  break;
                             }
                         }
                    }
                }
            }
            fclose($fp);
        }
    }
    
    echo json_encode(['tiles' => $tiles]);
    exit;
}



// --- DATA FETCHING ---

// Users
$users = [];
$stmt = $pdo->query("SELECT * FROM User LIMIT 100"); // Limit for performance
while ($row = $stmt->fetch()) {
    $row['data'] = json_decode($row['data'], true);
    $users[] = $row;
}

// Items
$items = [];
try {
    $stmt = $pdo->query("SELECT * FROM BaseItem");
    while ($row = $stmt->fetch()) {
        $row['data'] = json_decode($row['data'], true);
        $items[] = $row;
    }
} catch (Exception $e) { /* Table might not exist yet */ }

// Pets (full records)
$petEntries = [];
try {
    $stmt = $pdo->query("SELECT id, data FROM BasePet");
    while ($row = $stmt->fetch()) {
        $row['data'] = json_decode($row['data'], true);
        $petEntries[] = $row;
    }
} catch (Exception $e) { /* Table might not exist yet */ }

// Pets
$pets = [];
try {
    $stmt = $pdo->query("SELECT data FROM BasePet");
    while ($row = $stmt->fetch()) {
        $data = json_decode($row['data'], true);
        if (!is_array($data)) {
            continue;
        }
        $petId = $data['petId'] ?? null;
        $name = $data['name'] ?? null;
        if ($petId === null || $name === null) {
            continue;
        }
        $pets[intval($petId)] = $name;
    }
} catch (Exception $e) { /* Table might not exist yet */ }

if (empty($pets)) {
    $petListFile = __DIR__ . '/../mw-tools/pet-list.txt';
    if (file_exists($petListFile)) {
        $lines = file($petListFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $trimmed = trim($line);
            if ($trimmed === '' || strpos($trimmed, '#') === 0) {
                continue;
            }

            $parts = preg_split('/\s+/', $trimmed);
            if (!$parts || count($parts) < 2) {
                continue;
            }

            $petId = null;
            $nameParts = [];

            if (count($parts) >= 3 && is_numeric($parts[0]) && is_numeric($parts[1])) {
                $petId = intval($parts[1]);
                $nameParts = array_slice($parts, 2);
            } elseif (is_numeric($parts[0])) {
                $petId = intval($parts[0]);
                $nameParts = array_slice($parts, 1);
            }

            if ($petId === null) {
                continue;
            }

            $name = trim(implode(' ', $nameParts));
            if ($name === '') {
                $name = 'Pet ' . $petId;
            }

            if (!array_key_exists($petId, $pets)) {
                $pets[$petId] = $name;
            }
        }
    }
}

if (!empty($pets)) {
    ksort($pets);
}

// NPCs
$npcs = [];
try {
    $stmt = $pdo->query("SELECT * FROM Npc");
    while ($row = $stmt->fetch()) {
        $row['data'] = json_decode($row['data'], true);
        $npcs[] = $row;
    }
} catch (Exception $e) { /* */ }

// Quests
$quests = [];
try {
    $stmt = $pdo->query("SELECT id, data FROM BaseQuest");
    while ($row = $stmt->fetch()) {
        $d = json_decode($row['data'], true);
        $quests[] = ['id' => $row['id'], 'name' => $d['name'] ?? ('Quest ' . $row['id']), 'data' => $d];
    }
} catch (Exception $e) { }

// Map Data
$mapDataFile = __DIR__ . '/../mw-tools/output/map/mapData.json';
$maps = [];
if (file_exists($mapDataFile)) {
    $maps = json_decode(file_get_contents($mapDataFile), true);
} else {
    // Fallback if file not found
    $maps = [
        ['map' => 1, 'width' => 4000, 'height' => 2400],
        ['map' => 2, 'width' => 8000, 'height' => 6000],
    ];
}

// Scan for Available Tiles
$tilesDir = __DIR__ . '/assets/img/maps';
$availableTiles = [];
if (is_dir($tilesDir)) {
    foreach (scandir($tilesDir) as $item) {
        if (preg_match('/^Map(\d+)_Tiles$/', $item, $matches)) {
            $count = count(glob("$tilesDir/$item/*.jpg"));
            $availableTiles[intval($matches[1])] = $count > 0 ? $count : true;
        }
    }
}

// Merge Tile Info
foreach ($maps as &$m) {
    if (isset($availableTiles[$m['map']])) {
        $m['hasTiles'] = true;
        $m['tileCount'] = is_int($availableTiles[$m['map']]) ? $availableTiles[$m['map']] : 0;
    }
}
unset($m);

// Add Maps that exist in tiles but not in JSON
foreach ($availableTiles as $id => $val) {
    $found = false;
    foreach ($maps as $m) {
        if ($m['map'] == $id) { $found = true; break; }
    }
    if (!$found) {
        $count = is_int($val) ? $val : 0;
        $maps[] = ['map' => $id, 'width' => 0, 'height' => 0, 'hasTiles' => true, 'generated' => true, 'tileCount' => $count];
    }
}

// Sort by map ID
usort($maps, function($a, $b) { return $a['map'] - $b['map']; });

$selectedMapId = isset($_REQUEST['map_id']) ? intval($_REQUEST['map_id']) : (isset($maps[0]['map']) ? $maps[0]['map'] : 0);

// Fetch Map Info from DB (GameData.maps)
$mapDbInfo = [];
try {
    $stmt = $pdo->prepare("SELECT data FROM GameData WHERE id = ?");
    $stmt->execute(['maps']);
    $row = $stmt->fetch();
    if ($row) {
        $gameDataMaps = json_decode($row['data'], true);
        if (is_array($gameDataMaps)) {
            foreach ($gameDataMaps as $m) {
                if (isset($m['id'])) {
                    $mapDbInfo[$m['id']] = [
                        'name' => $m['name'] ?? null,
                        'file' => $m['file'] ?? $m['id'],
                        'width' => $m['width'] ?? 0,
                        'height' => $m['height'] ?? 0,
                        'groupW' => $m['groupW'] ?? 0,
                        'groupH' => $m['groupH'] ?? 0,
                        'tileW' => $m['tileW'] ?? 0,
                        'tileH' => $m['tileH'] ?? 0,
                        'mapCols' => $m['mapCols'] ?? 0,
                        'gridSize' => $m['gridSize'] ?? 0
                    ];
                }
            }
        }
    }
} catch (Exception $e) { }

// Merge info
foreach ($maps as &$m) {
    $id = $m['map'];
    if (isset($mapDbInfo[$id])) {
        if ($mapDbInfo[$id]['name']) $m['name'] = $mapDbInfo[$id]['name'];
        $m['file'] = $mapDbInfo[$id]['file'];
        if ($mapDbInfo[$id]['width']) $m['width'] = $mapDbInfo[$id]['width'];
        if ($mapDbInfo[$id]['height']) $m['height'] = $mapDbInfo[$id]['height'];
        
        $m['groupW'] = $mapDbInfo[$id]['groupW'] ?? 0;
        $m['groupH'] = $mapDbInfo[$id]['groupH'] ?? 0;
        $m['tileW'] = $mapDbInfo[$id]['tileW'] ?? 0;
        $m['tileH'] = $mapDbInfo[$id]['tileH'] ?? 0;
        $m['mapCols'] = $mapDbInfo[$id]['mapCols'] ?? 0;
        $m['gridSize'] = $mapDbInfo[$id]['gridSize'] ?? 0;
    } else {
        $m['file'] = $id;
    }

    // Re-check tiles with correct File ID
    $fid = $m['file'];
    if (isset($availableTiles[$fid])) {
        $m['hasTiles'] = true;
        // Keep or update tileCount based on file ID
        $m['tileCount'] = is_int($availableTiles[$fid]) ? $availableTiles[$fid] : 0;
    } else {
        // If map ID had tiles but file ID doesn't, we must respect file ID.
        // However, if we didn't find DB info, file=map, so it matches previous logic.
        // If we FOUND DB info and file!=map, we trust the file ID.
        $m['hasTiles'] = false;
        $m['tileCount'] = 0;
    }
}
unset($m);

// Scan NPC Images (MDA Files)
$npcImgDir = __DIR__ . '/assets/img/npcs';
$npcImages = [];
if (is_dir($npcImgDir)) {
    foreach (scandir($npcImgDir) as $file) {
        // Match Npc123a.mda or just 123.mda? usually named Npc{ID}{Frame}.mda
        if (preg_match('/^Npc(\d+)[a-z]*\.mda$/i', $file, $matches)) {
             $id = intval($matches[1]);
             if (!in_array($id, $npcImages)) {
                 $npcImages[] = $id;
             }
        }
    }
}
sort($npcImages);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Panel - Myth War Online</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        body { background-color: #121212; color: #e0e0e0; font-family: sans-serif; }
        .card { background-color: #1e1e1e; border: 1px solid #333; }
        .table { color: #ccc; }
        .table-dark { --bs-table-bg: #1e1e1e; }
        .form-control, .form-select { background-color: #2c2c2c; border-color: #444; color: #fff; }
        .form-control:focus { background-color: #333; color: #fff; border-color: #ffc107; box-shadow: none; }
        label, .card h5, .card h6 { color: #fff; }
        .list-group-item { color: #fff; }
        .text-muted { color: #b0b0b0 !important; }
        .nav-tabs .nav-link { color: #aaa; }
        .nav-tabs .nav-link.active { background-color: #1e1e1e; color: #ffc107; border-color: #333; border-bottom-color: #1e1e1e; }
        .map-container { position: relative; width: 100%; height: 80vh; background-color: #000; overflow: auto; border: 1px solid #444; }
        .map-layer { position: absolute; top: 0; left: 0; transform-origin: top left; overflow: hidden; }
        #npcLayer { pointer-events: none; z-index: 50; overflow: visible; }
        .map-tile { position: absolute; display: block; margin: 0; padding: 0; border: none; max-width: none; }
        .npc-marker { position: absolute; display: flex; flex-direction: column; align-items: center; pointer-events: auto; cursor: pointer; transform: translate(-50%, -50%); z-index: 100; }
        .npc-marker:hover { z-index: 1000; }
        .npc-marker img { max-width: 64px; max-height: 64px; object-fit: contain; transform: scale(2.03); }
        .npc-dot { width: 8px; height: 8px; background-color: rgba(255,0,0,0.7); border: 1px solid white; border-radius: 50%; margin-top: -4px; }
        .npc-marker:hover .npc-dot { background-color: #ffc107; transform: scale(1.5); }
        .npc-label { display: none; position: absolute; top: -20px; background: rgba(0,0,0,0.8); color: #fff; padding: 2px 4px; border-radius: 3px; font-size: 10px; white-space: nowrap; }
        .npc-marker:hover .npc-label { display: block; }
        .list-img-preview { width:32px; height:32px; background:#333; overflow:hidden; display:flex; align-items:center; justify-content:center; }
        .list-img-preview img { transform: scale(2.03); }
    </style>
</head>
<body class="p-4">
    <div class="container-fluid">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2><i data-lucide="shield"></i> Admin Panel</h2>
            <a href="index.php" class="btn btn-outline-secondary">Back to Site</a>
        </div>

        <?php if ($message): ?><div class="alert alert-success"><?php echo htmlspecialchars($message); ?></div><?php endif; ?>
        <?php if ($error): ?><div class="alert alert-danger"><?php echo htmlspecialchars($error); ?></div><?php endif; ?>

        <ul class="nav nav-tabs mb-3" id="adminTabs" role="tablist">
            <li class="nav-item"><button class="nav-link <?php echo $activeTab=='users'?'active':''; ?>" data-bs-toggle="tab" data-bs-target="#users" type="button">Users</button></li>
            <li class="nav-item"><button class="nav-link <?php echo $activeTab=='items'?'active':''; ?>" data-bs-toggle="tab" data-bs-target="#items" type="button">Items</button></li>
            <li class="nav-item"><button class="nav-link <?php echo $activeTab=='pets'?'active':''; ?>" data-bs-toggle="tab" data-bs-target="#pets" type="button">Pets</button></li>
            <li class="nav-item"><button class="nav-link <?php echo $activeTab=='quests'?'active':''; ?>" data-bs-toggle="tab" data-bs-target="#quests" type="button">Quests</button></li>
            <li class="nav-item"><button class="nav-link <?php echo $activeTab=='npcs'?'active':''; ?>" data-bs-toggle="tab" data-bs-target="#npcs" type="button">NPCs</button></li>
        </ul>

        <div class="tab-content">
            <!-- USERS TAB -->
            <div class="tab-pane fade <?php echo $activeTab=='users'?'show active':''; ?>" id="users">
                <div class="card p-3">
                    <table class="table table-dark table-striped">
                        <thead><tr><th>ID</th><th>Username</th><th>IP</th><th>Updated</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            <?php foreach ($users as $u): ?>
                            <tr>
                                <td><?php echo htmlspecialchars($u['id']); ?></td>
                                <td><?php echo htmlspecialchars($u['data']['username'] ?? $u['id']); ?></td>
                                <td><?php echo htmlspecialchars($u['data']['ip'] ?? 'Unknown'); ?></td>
                                <td><?php echo isset($u['data']['created_at']) ? date('Y-m-d H:i', $u['data']['created_at']) : '-'; ?></td>
                                <td>
                                    <?php if(isset($u['data']['isAdmin']) && $u['data']['isAdmin']): ?><span class="badge bg-danger">Admin</span><?php endif; ?>
                                    <?php if(isset($u['data']['banned']) && $u['data']['banned']): ?><span class="badge bg-secondary">Banned</span><?php endif; ?>
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-primary edit-user-btn" 
                                            data-id="<?php echo $u['id']; ?>" 
                                            data-admin="<?php echo isset($u['data']['isAdmin']) && $u['data']['isAdmin'] ? '1' : '0'; ?>"
                                            data-banned="<?php echo isset($u['data']['banned']) && $u['data']['banned'] ? '1' : '0'; ?>"
                                            data-chars="<?php echo htmlspecialchars(json_encode($u['data']['characters'] ?? [])); ?>">
                                        Edit
                                    </button>
                                    <form method="POST" style="display:inline;" onsubmit="return confirm('Delete user and all characters?');">
                                        <input type="hidden" name="action" value="delete_user">
                                        <input type="hidden" name="user_id" value="<?php echo htmlspecialchars($u['id']); ?>">
                                        <button class="btn btn-sm btn-danger">Del</button>
                                    </form>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- ITEMS TAB -->
            <div class="tab-pane fade <?php echo $activeTab=='items'?'show active':''; ?>" id="items">
                <div class="card p-3">
                    <div class="mb-3 d-flex flex-wrap gap-2">
                        <button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#itemModal" onclick="resetItemForm()">Add New Item</button>
                        <input type="text" id="itemSearch" class="form-control form-control-sm" style="max-width: 260px;" placeholder="Search items..." onkeyup="filterItems()">
                    </div>
                    <table class="table table-dark table-striped align-middle">
                        <thead><tr><th>ID</th><th>Image</th><th>Name</th><th>Type</th><th>Stack</th><th>Description</th><th>Stats</th><th>Actions</th></tr></thead>
                        <tbody id="itemsTableBody">
                            <?php foreach ($items as $item): $d=$item['data']; ?>
                            <tr>
                                <td><?php echo $d['id']; ?></td>
                                <td>
                                    <?php 
                                        $fileId = $d['file'] ?? 0;
                                        $paddedFileId = str_pad((string)$fileId, 3, '0', STR_PAD_LEFT);
                                        $img = "assets/img/items/{$paddedFileId}.png";
                                        if (file_exists($img)) {
                                            echo "<img src='$img' width='32' height='32' alt='Icon' title='ID: {$fileId}'>";
                                        } else {
                                            $fallbackImg = "assets/img/items/{$fileId}.png";
                                            if (file_exists($fallbackImg)) {
                                                echo "<img src='$fallbackImg' width='32' height='32' alt='Icon' title='ID: {$fileId}'>";
                                            } else {
                                                echo "<span class='text-muted' title='ID: {$fileId}'>{$fileId}</span>";
                                            }
                                        }
                                    ?>
                                </td>
                                <td><?php echo htmlspecialchars($d['name']); ?></td>
                                <td><?php echo $d['type']; ?></td>
                                <td><?php echo $d['stackLimit'] ?? 1; ?></td>
                                <td><small><?php echo htmlspecialchars(substr($d['description'] ?? '', 0, 60)); ?></small></td>
                                <td>
                                    <small>
                                        <?php
                                            $stats = $d['stats'] ?? [];
                                            $statParts = [];
                                            foreach ($stats as $key => $value) {
                                                if ($value === null || $value === 0 || $value === '0') continue;
                                                $statParts[] = strtoupper($key) . ':' . $value;
                                            }
                                            echo !empty($statParts) ? implode(' ', $statParts) : 'None';
                                        ?>
                                    </small>
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-primary edit-item-btn" onclick='editItem(<?php echo json_encode($d); ?>)'>Edit</button>
                                    <form method="POST" style="display:inline;" onsubmit="return confirm('Delete item?');">
                                        <input type="hidden" name="action" value="delete_item">
                                        <input type="hidden" name="item_id" value="<?php echo $d['id']; ?>">
                                        <button class="btn btn-sm btn-danger">Del</button>
                                    </form>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                    <div class="d-flex justify-content-between align-items-center mt-2">
                        <div id="itemPageInfo" class="text-muted small"></div>
                        <div class="btn-group">
                            <button type="button" class="btn btn-sm btn-outline-secondary" id="itemPrevPage" onclick="changeItemPage(-1)">Prev</button>
                            <button type="button" class="btn btn-sm btn-outline-secondary" id="itemNextPage" onclick="changeItemPage(1)">Next</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- PETS TAB -->
            <div class="tab-pane fade <?php echo $activeTab=='pets'?'show active':''; ?>" id="pets">
                <div class="card p-3">
                    <div class="mb-3 d-flex flex-wrap gap-2">
                        <button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#petModal" onclick="resetPetForm()">Add New Pet</button>
                        <input type="text" id="petSearch" class="form-control form-control-sm" style="max-width: 260px;" placeholder="Search pets..." onkeyup="filterPets()">
                    </div>
                    <table class="table table-dark table-striped align-middle">
                        <thead><tr><th>Key</th><th>Name</th><th>Pet ID</th><th>File</th><th>Species</th><th>Level</th><th>Actions</th></tr></thead>
                        <tbody id="petsTableBody">
                            <?php foreach ($petEntries as $pet): $d=$pet['data']; ?>
                            <tr>
                                <td><?php echo htmlspecialchars($pet['id']); ?></td>
                                <td><?php echo htmlspecialchars($d['name'] ?? ''); ?></td>
                                <td><?php echo htmlspecialchars($d['petId'] ?? ''); ?></td>
                                <td><?php echo htmlspecialchars($d['file'] ?? ''); ?></td>
                                <td><?php echo htmlspecialchars($d['species'] ?? ''); ?></td>
                                <td><?php echo htmlspecialchars($d['level'] ?? ''); ?></td>
                                <td>
                                    <button class="btn btn-sm btn-primary" onclick='editPet(<?php echo json_encode(['id' => $pet['id'], 'data' => $d]); ?>)'>Edit</button>
                                    <form method="POST" style="display:inline;" onsubmit="return confirm('Delete pet?');">
                                        <input type="hidden" name="action" value="delete_pet">
                                        <input type="hidden" name="pet_key" value="<?php echo htmlspecialchars($pet['id']); ?>">
                                        <button class="btn btn-sm btn-danger">Del</button>
                                    </form>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- QUESTS TAB -->
            <div class="tab-pane fade <?php echo $activeTab=='quests'?'show active':''; ?>" id="quests">
                <div class="card p-3">
                    <div class="mb-3"><button class="btn btn-success" onclick="editQuest({})">Add New Quest</button></div>
                    <table class="table table-dark table-striped">
                        <thead><tr><th>ID</th><th>Name</th><th>Description</th><th>Stages</th><th>Actions</th></tr></thead>
                        <tbody>
                            <?php foreach ($quests as $q): $d=$q['data']; ?>
                            <tr>
                                <td><?php echo $q['id']; ?></td>
                                <td><?php echo htmlspecialchars($q['name']); ?></td>
                                <td><small><?php echo htmlspecialchars(substr($d['description']??'', 0, 50)) . '...'; ?></small></td>
                                <td><?php echo count($d['stages']??[]); ?></td>
                                <td>
                                    <button class="btn btn-sm btn-primary" onclick='editQuest(<?php echo json_encode($d); ?>)'>Edit</button>
                                    <form method="POST" style="display:inline;" onsubmit="return confirm('Delete quest?');">
                                        <input type="hidden" name="action" value="delete_quest">
                                        <input type="hidden" name="quest_id" value="<?php echo $q['id']; ?>">
                                        <button class="btn btn-sm btn-danger">Del</button>
                                    </form>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- NPCs TAB -->
            <div class="tab-pane fade <?php echo $activeTab=='npcs'?'show active':''; ?>" id="npcs">
                <div class="row">
                    <div class="col-md-8">
                        <div class="card p-2 text-center mb-2">
                           Map Visualizer
                        </div>
                        <!-- Map Viewer -->
                        <div class="map-controls mb-2 d-flex gap-2 flex-wrap">
                             <select id="mapSelector" class="form-select w-auto" onchange="loadMap(true)">
                                 <?php foreach ($maps as $m): ?>
                                     <option value="<?php echo $m['map']; ?>" <?php echo ($m['map'] == $selectedMapId) ? 'selected' : ''; ?>><?php echo isset($m['name']) ? htmlspecialchars($m['name']) . " ({$m['map']})" : "Map {$m['map']}"; ?><?php echo isset($m['hasTiles'])?' [T]':''; ?> (<?php echo $m['width'].'x'.$m['height']; ?>)</option>
                                 <?php endforeach; ?>
                             </select>
                             <div class="input-group w-auto">
                                <span class="input-group-text">Tile</span>
                                <input type="number" id="tileW" class="form-control" value="800" style="width: 70px;" onchange="loadMap()">
                                <input type="number" id="tileH" class="form-control" value="600" style="width: 70px;" onchange="loadMap()">
                             </div>
                             <div class="input-group w-auto">
                                <span class="input-group-text">Map</span>
                                <input type="number" id="mapW" class="form-control" placeholder="Width" style="width: 80px;" onchange="loadMap()">
                                <input type="number" id="mapH" class="form-control" placeholder="Height" style="width: 80px;" onchange="loadMap()">
                             </div>
                             <div class="input-group w-auto">
                                <span class="input-group-text">Cols</span>
                                <input type="number" id="mapCols" class="form-control" placeholder="Auto" style="width: 60px;" onchange="loadMap()">
                             </div>
                             <div class="input-group w-auto">
                                <span class="input-group-text">Group</span>
                                <input type="number" id="tileGroupW" class="form-control" placeholder="W" style="width: 50px;" onchange="loadMap()" title="Tiles per Chunk Row">
                                <input type="number" id="tileGroupH" class="form-control" placeholder="H" style="width: 50px;" onchange="loadMap()" title="Tiles per Chunk Col">
                                <button class="btn btn-outline-warning" type="button" onclick="saveMapConfig()">Save</button>
                             </div>
                             <div class="input-group w-auto">
                                <span class="input-group-text">Grid</span>
                                <input type="number" id="gridSize" class="form-control" value="1" step="0.1" style="width: 70px;" onchange="renderNpcs(parseInt(document.getElementById('inputMapId').value))">
                             </div>
                             <div class="input-group w-auto">
                                <span class="input-group-text">Zoom</span>
                                <input type="range" id="mapZoom" class="form-range bg-dark" min="0.1" max="2" step="0.1" value="1" style="width: 100px; padding-top: 10px;" oninput="updateZoom()">
                                <span class="input-group-text" id="zoomVal">1x</span>
                             </div>
                             <div class="form-check form-switch align-self-center">
                                <input class="form-check-input" type="checkbox" id="useTiles" checked onchange="loadMap()">
                                <label class="form-check-label text-white" for="useTiles">Tiled</label>
                             </div>
                             <button class="btn btn-outline-info" onclick="loadMap()">Reload</button>
                             <div class="text-white align-self-center mx-2">Cursor: <span id="cursorCoords">0, 0</span></div>
                        </div>
                        <div class="text-secondary small mb-1" id="tileDebug"></div>
                        <div class="map-container" id="mapContainer">
                            <div id="mapLayer" class="map-layer">
                                <!-- Map tiles/images go here -->
                            </div>
                            <!-- NPCs injected here -->
                            <div id="npcLayer" class="map-layer"></div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card p-3 mt-3 mt-md-0">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <h5 class="mb-0">NPC Editor</h5>
                                <button type="button" class="btn btn-sm btn-outline-info" onclick="openAllNpcsModal()">List All NPCs</button>
                            </div>
                            <form method="POST" id="npcForm">
                                <input type="hidden" name="action" value="save_npc">
                                
                                <div class="mb-2">
                                    <label>ID</label>
                                    <input type="number" name="npc_id" class="form-control" required placeholder="New ID">
                                </div>
                                <div class="mb-2">
                                    <label>Name</label>
                                    <input type="text" name="name" class="form-control" required>
                                </div>
                                <div class="mb-2">
                                    <label>File (MDA ID)</label>
                                    <div class="input-group">
                                        <input type="number" name="file" id="npcFile" class="form-control" value="0" list="npcFiles" onchange="updateNpcPreview()">
                                        <datalist id="npcFiles">
                                            <?php foreach ($npcImages as $imgId): ?>
                                                <option value="<?php echo $imgId; ?>">
                                            <?php endforeach; ?>
                                        </datalist>
                                        <span class="input-group-text bg-dark border-secondary p-1" style="min-width: 40px; justify-content: center;">
                                            <img id="npcPreview" src="" alt="?" style="max-width: 32px; max-height: 32px; display: none;">
                                            <span id="npcPreviewText" class="small text-muted" style="display: none;">?</span>
                                        </span>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-6 mb-2">
                                        <label>Map ID</label>
                                        <input type="number" name="map_id" id="inputMapId" class="form-control" required>
                                    </div>
                                    <div class="col-6 mb-2">
                                        <label>Direction</label>
                                        <input type="number" name="direction" class="form-control" value="0" max="7">
                                    </div>
                                </div>
                                <div class="mb-2">
                                    <label>Type</label>
                                    <select name="npc_type" class="form-select">
                                        <option value="">None</option>
                                        <option value="1">Forge</option>
                                        <option value="2">Pet</option>
                                        <option value="3">Gem</option>
                                        <option value="4">Gem Converter</option>
                                    </select>
                                </div>
                                <div class="row">
                                    <div class="col-6 mb-2">
                                        <label>X</label>
                                        <input type="number" name="x" id="inputX" class="form-control" required>
                                    </div>
                                    <div class="col-6 mb-2">
                                        <label>Y</label>
                                        <input type="number" name="y" id="inputY" class="form-control" required>
                                    </div>
                                </div>
                                <div class="mb-2">
                                    <div class="d-flex justify-content-between align-items-center">
                                        <label>Action Script (JSON)</label>
                                        <button type="button" class="btn btn-sm btn-outline-info py-0 mb-1" data-bs-toggle="modal" data-bs-target="#scriptBuilderModal">Builder</button>
                                    </div>
                                    <textarea name="action_script" id="npcActionScript" class="form-control" rows="5" style="font-family: monospace; font-size: 0.8rem;"></textarea>
                                </div>
                                <button type="submit" class="btn btn-warning w-100">Save NPC</button>
                                <div class="d-flex gap-2 mt-2">
                                    <button type="button" class="btn btn-secondary flex-grow-1" onclick="resetNpcForm()">Reset</button>
                                    <button type="button" class="btn btn-danger flex-grow-1" onclick="deleteCurrentNpc()"><i data-lucide="trash-2" style="width:16px; height:16px;"></i> Del</button>
                                </div>
                            </form>
                            
                            <hr>
                            <h6>NPCs on this Map</h6>
                            <input type="text" id="mapNpcSearch" class="form-control form-control-sm mb-2" placeholder="Search Filter..." onkeyup="filterMapNpcs()">
                            <div style="max-height: 300px; overflow-y: auto;">
                                <ul class="list-group list-group-flush" id="npcList">
                                    <!-- Populated by JS -->
                                </ul>
                            </div>
                            
                            <hr>
                            <h6>Quest Reference</h6>
                            <input type="text" id="questSearch" class="form-control form-control-sm mb-2" placeholder="Search Quests..." onkeyup="filterQuests()">
                            <div style="max-height: 200px; overflow-y: auto;">
                                <ul class="list-group list-group-flush small" id="questList"></ul>
                            </div>
                        </div>
                    </div>
                        <datalist id="itemStatKeys">
                            <option value="hp"></option>
                            <option value="mp"></option>
                            <option value="str"></option>
                            <option value="attack"></option>
                            <option value="speed"></option>
                            <option value="int"></option>
                            <option value="agi"></option>
                            <option value="defense"></option>
                            <option value="hitRate"></option>
                            <option value="dodgeRate"></option>
                            <option value="critRate"></option>
                            <option value="critDamage"></option>
                        </datalist>
                        <datalist id="itemActionKeys">
                            <option value="type"></option>
                            <option value="baseItemId"></option>
                            <option value="amount"></option>
                            <option value="hp"></option>
                            <option value="mp"></option>
                            <option value="exp"></option>
                            <option value="gold"></option>
                            <option value="pet"></option>
                            <option value="growthRate"></option>
                            <option value="resist"></option>
                            <option value="sta"></option>
                            <option value="int"></option>
                            <option value="str"></option>
                            <option value="agi"></option>
                            <option value="template"></option>
                            <option value="mapId"></option>
                            <option value="x"></option>
                            <option value="y"></option>
                            <option value="message"></option>
                            <option value="options"></option>
                            <option value="onClose"></option>
                        </datalist>
                        <datalist id="itemPropertyKeys">
                            <option value="bindLocation"></option>
                            <option value="map"></option>
                            <option value="x"></option>
                            <option value="y"></option>
                            <option value="limit"></option>
                            <option value="cooldown"></option>
                            <option value="duration"></option>
                        </datalist>
                </div>
            </div>
        </div>
    </div>

    <!-- Modals -->
    <!-- User Modal -->
    <div class="modal fade" id="userModal" tabindex="-1">
        <div class="modal-dialog">
            <form class="modal-content bg-dark" method="POST">
                <input type="hidden" name="action" value="update_user">
                <input type="hidden" name="user_id" id="editUserId">
                <div class="modal-header"><h5 class="modal-title">Edit User</h5><button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button></div>
                <div class="modal-body">
                    <div class="mb-3"><label>New Password (leave blank to keep)</label><input type="password" name="new_password" class="form-control"></div>
                    <div class="mb-3"><label>Character IDs (comma separated)</label><input type="text" name="character_ids" id="editUserChars" class="form-control"></div>
                    <div class="form-check"><input type="checkbox" name="is_admin" id="editUserAdmin" class="form-check-input"><label class="form-check-label">Is Admin</label></div>
                    <div class="form-check"><input type="checkbox" name="is_banned" id="editUserBanned" class="form-check-input"><label class="form-check-label">Banned</label></div>
                </div>
                <div class="modal-footer"><button type="submit" class="btn btn-primary">Save</button></div>
            </form>
        </div>
    </div>

    <!-- Pet Modal -->
    <div class="modal fade" id="petModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <form class="modal-content bg-dark" method="POST">
                <input type="hidden" name="action" value="save_pet">
                <div class="modal-header"><h5 class="modal-title">Pet Editor</h5><button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button></div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6 mb-3"><label>Key</label><input type="text" name="pet_key" id="petKey" class="form-control" required></div>
                        <div class="col-md-6 mb-3"><label>Name</label><input type="text" name="name" id="petName" class="form-control" required></div>
                        <div class="col-md-4 mb-3"><label>Pet ID</label><input type="number" name="pet_id" id="petId" class="form-control"></div>
                        <div class="col-md-4 mb-3"><label>File</label><input type="number" name="file" id="petFile" class="form-control" required></div>
                        <div class="col-md-4 mb-3"><label>Species</label><input type="number" name="species" id="petSpecies" class="form-control" required></div>
                        <div class="col-md-4 mb-3"><label>Level</label><input type="number" name="level" id="petLevel" class="form-control" required></div>
                        <div class="col-md-12">
                            <h6 class="mt-2">Build</h6>
                        </div>
                        <div class="col-md-3 mb-2"><label>STA</label><input type="number" step="0.01" name="build_sta" id="petBuildSta" class="form-control"></div>
                        <div class="col-md-3 mb-2"><label>INT</label><input type="number" step="0.01" name="build_int" id="petBuildInt" class="form-control"></div>
                        <div class="col-md-3 mb-2"><label>STR</label><input type="number" step="0.01" name="build_str" id="petBuildStr" class="form-control"></div>
                        <div class="col-md-3 mb-2"><label>AGI</label><input type="number" step="0.01" name="build_agi" id="petBuildAgi" class="form-control"></div>

                        <div class="col-md-12">
                            <h6 class="mt-3">Stat Rates</h6>
                        </div>
                        <div class="col-md-6 mb-2"><label>Growth Min</label><input type="number" step="0.001" name="stat_growth_min" id="petGrowthMin" class="form-control"></div>
                        <div class="col-md-6 mb-2"><label>Growth Max</label><input type="number" step="0.001" name="stat_growth_max" id="petGrowthMax" class="form-control"></div>
                        <div class="col-md-3 mb-2"><label>STA Min</label><input type="number" step="0.01" name="stat_sta_min" id="petStaMin" class="form-control"></div>
                        <div class="col-md-3 mb-2"><label>STA Max</label><input type="number" step="0.01" name="stat_sta_max" id="petStaMax" class="form-control"></div>
                        <div class="col-md-3 mb-2"><label>INT Min</label><input type="number" step="0.01" name="stat_int_min" id="petIntMin" class="form-control"></div>
                        <div class="col-md-3 mb-2"><label>INT Max</label><input type="number" step="0.01" name="stat_int_max" id="petIntMax" class="form-control"></div>
                        <div class="col-md-3 mb-2"><label>STR Min</label><input type="number" step="0.01" name="stat_str_min" id="petStrMin" class="form-control"></div>
                        <div class="col-md-3 mb-2"><label>STR Max</label><input type="number" step="0.01" name="stat_str_max" id="petStrMax" class="form-control"></div>
                        <div class="col-md-3 mb-2"><label>AGI Min</label><input type="number" step="0.01" name="stat_agi_min" id="petAgiMin" class="form-control"></div>
                        <div class="col-md-3 mb-2"><label>AGI Max</label><input type="number" step="0.01" name="stat_agi_max" id="petAgiMax" class="form-control"></div>

                        <div class="col-md-12">
                            <h6 class="mt-3">Resist</h6>
                            <div class="table-responsive">
                                <table class="table table-dark table-sm align-middle mb-2" id="petResistTable">
                                    <thead><tr><th style="width:45%">Key</th><th style="width:45%">Value</th><th style="width:10%"></th></tr></thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                            <button type="button" class="btn btn-sm btn-outline-secondary" onclick="addResistRow()">Add Resist</button>
                        </div>

                        <div class="col-md-12">
                            <h6 class="mt-3">Skills</h6>
                            <div class="table-responsive">
                                <table class="table table-dark table-sm align-middle mb-2" id="petSkillsTable">
                                    <thead><tr><th style="width:45%">Skill ID</th><th style="width:45%">Exp</th><th style="width:10%"></th></tr></thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                            <button type="button" class="btn btn-sm btn-outline-secondary" onclick="addSkillRow()">Add Skill</button>
                        </div>

                        <div class="col-md-12 mt-3">
                            <div class="d-flex justify-content-between align-items-center">
                                <label class="mb-0">Advanced JSON</label>
                                <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="collapse" data-bs-target="#petJsonAdvanced">Toggle</button>
                            </div>
                            <div class="collapse mt-2" id="petJsonAdvanced">
                                <div class="mb-2">
                                    <label>Build JSON</label>
                                    <textarea name="build_json" id="petBuildJson" class="form-control" rows="2" placeholder='{"sta":1,"int":1,"str":1,"agi":1}'></textarea>
                                </div>
                                <div class="mb-2">
                                    <label>Stat Rates JSON</label>
                                    <textarea name="stat_rates_json" id="petStatRatesJson" class="form-control" rows="3" placeholder='{"growthRate":{"min":1.1,"max":1.2},"sta":{"min":100,"max":100},"int":{"min":50,"max":50},"str":{"min":20,"max":20},"agi":{"min":30,"max":30}}'></textarea>
                                </div>
                                <div class="mb-2">
                                    <label>Resist JSON (optional)</label>
                                    <textarea name="resist_json" id="petResistJson" class="form-control" rows="2" placeholder='{"hitRate":100,"dodgeRate":5}'></textarea>
                                </div>
                                <div class="mb-2">
                                    <label>Skills JSON (optional)</label>
                                    <textarea name="skills_json" id="petSkillsJson" class="form-control" rows="2" placeholder='[{"id":1,"exp":0}]'></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer"><button type="submit" class="btn btn-primary">Save Pet</button></div>
            </form>
        </div>
    </div>

    <!-- Item Modal -->
    <div class="modal fade" id="itemModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <form class="modal-content bg-dark" method="POST">
                <input type="hidden" name="action" value="save_item">
                <div class="modal-header"><h5 class="modal-title">Item Editor</h5><button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button></div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label>ID</label>
                            <input type="number" name="item_id" id="itemId" class="form-control" required>
                            <div class="form-text text-warning" id="itemIdWarning" style="display:none;"></div>
                        </div>
                        <div class="col-md-6 mb-3"><label>Name</label><input type="text" name="name" id="itemName" class="form-control" required></div>
                        <div class="col-md-12 mb-3"><label>Description</label><textarea name="description" id="itemDesc" class="form-control"></textarea></div>
                        <div class="col-md-4 mb-3"><label>File/Icon ID</label><input type="number" name="file" id="itemFile" class="form-control"></div>
                        <div class="col-md-4 mb-3">
                            <label>Type</label>
                            <select name="type" id="itemType" class="form-select">
                                <option value="0">None</option>
                                <option value="1">Equipment</option>
                                <option value="2">Consumable</option>
                                <option value="3">Usable</option>
                                <option value="4">Quest</option>
                            </select>
                        </div>
                        <div class="col-md-4 mb-3"><label>Stack Limit</label><input type="number" name="stack_limit" id="itemStack" class="form-control" value="1"></div>
                        <div class="col-md-4 mb-3">
                            <label>Equipment Slot</label>
                            <select name="equipment_slot" id="itemEquipSlot" class="form-select">
                                <option value="">None</option>
                                <option value="0">Head</option>
                                <option value="1">Armour</option>
                                <option value="2">Weapon</option>
                                <option value="3">Shoes</option>
                                <option value="4">Necklace</option>
                                <option value="5">Bracelet</option>
                                <option value="6">Ring</option>
                            </select>
                        </div>
                        <div class="col-md-4 mb-3"><label>Level Req</label><input type="number" name="level" id="itemLevel" class="form-control"></div>
                        <div class="col-md-4 mb-3">
                            <label>Pet ID</label>
                            <select name="pet_id" id="itemPetId" class="form-select">
                                <option value="">None</option>
                                <?php foreach ($pets as $petId => $petName): ?>
                                    <option value="<?php echo $petId; ?>"><?php echo $petId . ' - ' . htmlspecialchars($petName); ?></option>
                                <?php endforeach; ?>
                            </select>
                        </div>
                        <div class="col-md-4 mb-3">
                            <label>Race</label>
                            <select name="race" id="itemRace" class="form-select">
                                <option value="">Any</option>
                                <option value="0">Human</option>
                                <option value="1">Centaur</option>
                                <option value="2">Mage</option>
                                <option value="3">Borg</option>
                            </select>
                        </div>
                        <div class="col-md-4 mb-3">
                            <label>Gender</label>
                            <select name="gender" id="itemGender" class="form-select">
                                <option value="">Any</option>
                                <option value="0">Male</option>
                                <option value="1">Female</option>
                            </select>
                        </div>
                        <div class="col-md-4 mb-3">
                            <label>Supported Slots</label>
                            <select name="supported_slots[]" id="itemSupportedSlots" class="form-select" multiple>
                                <option value="">None</option>
                                <option value="0">Head</option>
                                <option value="1">Armour</option>
                                <option value="2">Weapon</option>
                                <option value="3">Shoes</option>
                                <option value="4">Necklace</option>
                                <option value="5">Bracelet</option>
                                <option value="6">Ring</option>
                            </select>
                        </div>
                        <div class="col-md-4 mb-3 form-check">
                            <input type="checkbox" name="quest_item" id="itemQuest" class="form-check-input">
                            <label class="form-check-label" for="itemQuest">Quest Item</label>
                        </div>
                        <div class="col-md-4 mb-3 form-check">
                            <input type="checkbox" name="can_convert" id="itemCanConvert" class="form-check-input">
                            <label class="form-check-label" for="itemCanConvert">Can Convert</label>
                        </div>
                        <div class="col-md-12"><h6>Stats</h6></div>
                        <div class="col-md-4 mb-2"><label>HP</label><input type="number" name="stats_hp" id="itemHp" class="form-control"></div>
                        <div class="col-md-4 mb-2"><label>MP</label><input type="number" name="stats_mp" id="itemMp" class="form-control"></div>
                        <div class="col-md-4 mb-2"><label>STR</label><input type="number" name="stats_str" id="itemStr" class="form-control"></div>
                        <div class="col-md-12">
                            <h6 class="mt-2">Stat Builder</h6>
                            <div class="table-responsive">
                                <table class="table table-dark table-sm align-middle mb-2" id="itemStatsTable">
                                    <thead><tr><th style="width:40%">Key</th><th style="width:35%">Value</th><th style="width:15%">Type</th><th style="width:10%"></th></tr></thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                            <button type="button" class="btn btn-sm btn-outline-secondary" onclick="addItemStatRow()">Add Stat Field</button>
                        </div>
                        <div class="col-md-12">
                            <h6 class="mt-2">Action Builder</h6>
                            <div class="d-flex flex-wrap gap-2 align-items-end mb-2">
                                <div>
                                    <label class="form-label">Preset</label>
                                    <select id="itemActionPreset" class="form-select form-select-sm">
                                        <option value="">Select preset</option>
                                        <option value="exp-player">Give Player EXP</option>
                                        <option value="exp-pet">Give Pet EXP</option>
                                        <option value="decrease-stats-player">Decrease Player Stats</option>
                                        <option value="decrease-stats-pet">Decrease Pet Stats</option>
                                        <option value="pet-reset-exp">Reset Pet EXP</option>
                                        <option value="pet-reset-level">Reset Pet Level</option>
                                        <option value="pet-reset-loyalty">Reset Pet Loyalty</option>
                                        <option value="pet-reset-stats">Reset Pet Stats</option>
                                        <option value="pet-reset-growth">Reset Pet Growth</option>
                                        <option value="pet-add-growth">Add Pet Growth</option>
                                        <option value="pet-add-resist">Add Pet Resist</option>
                                        <option value="pet-reset-resist">Reset Pet Resist</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="form-label">Amount</label>
                                    <input type="number" id="itemActionPresetAmount" class="form-control form-control-sm" value="1">
                                </div>
                                <div class="d-flex gap-2">
                                    <div>
                                        <label class="form-label">STA</label>
                                        <input type="number" id="itemActionPresetSta" class="form-control form-control-sm" value="0">
                                    </div>
                                    <div>
                                        <label class="form-label">INT</label>
                                        <input type="number" id="itemActionPresetInt" class="form-control form-control-sm" value="0">
                                    </div>
                                    <div>
                                        <label class="form-label">STR</label>
                                        <input type="number" id="itemActionPresetStr" class="form-control form-control-sm" value="0">
                                    </div>
                                    <div>
                                        <label class="form-label">AGI</label>
                                        <input type="number" id="itemActionPresetAgi" class="form-control form-control-sm" value="0">
                                    </div>
                                </div>
                                <div class="flex-grow-1">
                                    <label class="form-label">Stats JSON</label>
                                    <input type="text" id="itemActionPresetStats" class="form-control form-control-sm" placeholder='{"sta":1,"int":0,"str":0,"agi":0}'>
                                </div>
                                <div class="flex-grow-1">
                                    <label class="form-label">Resist JSON</label>
                                    <input type="text" id="itemActionPresetResist" class="form-control form-control-sm" placeholder='{"hitRate":5}'>
                                </div>
                                <button type="button" class="btn btn-sm btn-outline-info" onclick="applyItemActionPreset()">Apply</button>
                            </div>
                            <div class="table-responsive">
                                <table class="table table-dark table-sm align-middle mb-2" id="itemActionTable">
                                    <thead><tr><th style="width:40%">Key</th><th style="width:35%">Value</th><th style="width:15%">Type</th><th style="width:10%"></th></tr></thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                            <button type="button" class="btn btn-sm btn-outline-secondary" onclick="addItemActionRow()">Add Action Field</button>
                        </div>
                        <div class="col-md-12">
                            <h6 class="mt-3">Item Properties Builder</h6>
                            <div class="table-responsive">
                                <table class="table table-dark table-sm align-middle mb-2" id="itemPropsTable">
                                    <thead><tr><th style="width:40%">Key</th><th style="width:35%">Value</th><th style="width:15%">Type</th><th style="width:10%"></th></tr></thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                            <button type="button" class="btn btn-sm btn-outline-secondary" onclick="addItemPropRow()">Add Property Field</button>
                        </div>
                        <div class="col-md-12 mt-3">
                            <div class="d-flex justify-content-between align-items-center">
                                <label class="mb-0">Advanced JSON</label>
                                <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-toggle="collapse" data-bs-target="#itemJsonAdvanced">Toggle</button>
                            </div>
                            <div class="collapse mt-2" id="itemJsonAdvanced">
                                <div class="mb-2">
                                    <label>Stats JSON (optional)</label>
                                    <textarea name="stats_json" id="itemStatsJson" class="form-control" rows="2" placeholder='{"attack":5,"speed":1}'></textarea>
                                </div>
                                <div class="mb-2">
                                    <label>Action JSON (optional)</label>
                                    <textarea name="action_json" id="itemActionJson" class="form-control" rows="2" placeholder='{"type":"heal","hp":100}'></textarea>
                                </div>
                                <div class="mb-2">
                                    <label>Item Properties JSON (optional)</label>
                                    <textarea name="item_properties_json" id="itemPropsJson" class="form-control" rows="2" placeholder='{"bindLocation":{"map":1,"x":10,"y":10}}'></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer"><button type="submit" class="btn btn-primary">Save Item</button></div>
            </form>
        </div>
    </div>

    <!-- All NPCs Modal -->
    <div class="modal fade" id="allNpcsModal" tabindex="-1">
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
            <div class="modal-content bg-dark">
                <div class="modal-header">
                    <h5 class="modal-title">All NPCs</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <input type="text" id="allNpcSearch" class="form-control mb-3" placeholder="Search by ID, Name or Map..." onkeyup="filterAllNpcs()">
                    <table class="table table-dark table-striped table-sm align-middle">
                        <thead><tr><th>ID</th><th>Image</th><th>Name</th><th>Map</th><th>Actions</th></tr></thead>
                        <tbody id="allNpcsTableBody"></tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <!-- Script Builder Modal -->
    <div class="modal fade" id="scriptBuilderModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content bg-dark">
                <div class="modal-header"><h5 class="modal-title">Script Builder</h5><button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button></div>
                <div class="modal-body">
                    <ul class="nav nav-tabs mb-3" id="scriptTabs">
                        <li class="nav-item"><button class="nav-link active" data-bs-toggle="tab" data-bs-target="#tabSpeech" type="button">Speech</button></li>
                        <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#tabQuest" type="button">Quest</button></li>
                        <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#tabTele" type="button">Teleport</button></li>
                        <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#tabShop" type="button">Shop</button></li>
                        <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#tabItem" type="button">Item</button></li>
                        <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#tabFight" type="button">Fight</button></li>
                    </ul>
                    <div class="tab-content">
                        <div class="tab-pane fade show active" id="tabSpeech">
                            <label>Message</label>
                            <textarea id="sbMessage" class="form-control mb-1" rows="2" placeholder="Hello traveler!"></textarea>
                            <div class="form-text text-muted mb-2 small">What the NPC says. Use array <code>["Page 1", "Page 2"]</code> for multi-page.</div>
                            
                            <label>Options</label>
                            <textarea id="sbOptions" class="form-control mb-1" rows="2" placeholder='[{"text":"Yes","action":{"type":"npcSay","message":"Great!"}}]'></textarea>
                            <div class="form-text text-muted mb-2 small">JSON Array of choices. Leave empty for no choices.</div>
                            <button onclick="insertSpeech()" class="btn btn-primary w-100">Insert Speech Block</button>
                        </div>
                        <div class="tab-pane fade" id="tabQuest">
                            <div class="row mb-2">
                                <div class="col-6">
                                    <label>Quest ID</label>
                                    <input type="number" id="qbQuestId" class="form-control" placeholder="Quest ID">
                                </div>
                                <div class="col-6 d-flex align-items-end">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="qbQuestNotStarted" checked>
                                        <label class="form-check-label" for="qbQuestNotStarted">Require quest not started</label>
                                    </div>
                                </div>
                            </div>
                            <div class="mb-2">
                                <label>Else Message (quest already started)</label>
                                <textarea id="qbQuestElseMsg" class="form-control" rows="2" placeholder="Did you bring the item yet?"></textarea>
                            </div>
                            <div class="mb-2">
                                <label>Intro Message</label>
                                <textarea id="qbQuestIntro" class="form-control" rows="2" placeholder="Hi, wanna help me out with something?"></textarea>
                            </div>
                            <div class="row mb-2">
                                <div class="col-6">
                                    <label>Accept Text</label>
                                    <input type="text" id="qbQuestAcceptText" class="form-control" value="#GYeah sure#N">
                                </div>
                                <div class="col-6">
                                    <label>Decline Text</label>
                                    <input type="text" id="qbQuestDeclineText" class="form-control" value="#YNo, I'm kinda busy.#N">
                                </div>
                            </div>
                            <div class="mb-2">
                                <label>Decline Message</label>
                                <textarea id="qbQuestDeclineMsg" class="form-control" rows="1" placeholder="Well, come back if you change your mind!"></textarea>
                            </div>
                            <div class="mb-2">
                                <label>Details Pages (one per line)</label>
                                <textarea id="qbQuestPages" class="form-control" rows="3" placeholder="Page 1\nPage 2"></textarea>
                            </div>
                            <div class="row mb-2">
                                <div class="col-6">
                                    <label>Details Accept Text</label>
                                    <input type="text" id="qbQuestDetailsAcceptText" class="form-control" value="#GSure, I got nothing better to do...#N">
                                </div>
                                <div class="col-6">
                                    <label>Details Decline Text</label>
                                    <input type="text" id="qbQuestDetailsDeclineText" class="form-control" value="#YNo, I'm deadly allergic to brooms.#N">
                                </div>
                            </div>
                            <div class="mb-2">
                                <label>Details Decline Message</label>
                                <textarea id="qbQuestDetailsDeclineMsg" class="form-control" rows="1" placeholder="You are? Well okay then, I'll find someone else."></textarea>
                            </div>
                            <div class="mb-2">
                                <label>Accept Final Message</label>
                                <textarea id="qbQuestAcceptMsg" class="form-control" rows="2" placeholder="Thank you so much! You can find him outside the Herbal Shop."></textarea>
                            </div>
                            <div class="row mb-2">
                                <div class="col-6">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="qbQuestAddQuest" checked>
                                        <label class="form-check-label" for="qbQuestAddQuest">Add Quest on Accept</label>
                                    </div>
                                    <input type="number" id="qbQuestAddQuestId" class="form-control mt-1" placeholder="Quest ID (blank = main)">
                                </div>
                                <div class="col-6">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="qbQuestAddItem">
                                        <label class="form-check-label" for="qbQuestAddItem">Add Item on Accept</label>
                                    </div>
                                    <div class="row g-2 mt-1">
                                        <div class="col-7">
                                            <input type="number" id="qbQuestAddItemId" class="form-control" placeholder="Item ID">
                                        </div>
                                        <div class="col-5">
                                            <input type="number" id="qbQuestAddItemAmount" class="form-control" value="1" placeholder="Amt">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button onclick="insertQuestLogic()" class="btn btn-info w-100">Insert Quest Conversation</button>
                        </div>
                        <div class="tab-pane fade" id="tabTele">
                            <div class="row">
                                <div class="col-4">
                                    <input type="number" id="sbMap" class="form-control" placeholder="Map ID">
                                    <div class="form-text text-muted small">Dest Map</div>
                                </div>
                                <div class="col-4">
                                    <input type="number" id="sbX" class="form-control" placeholder="X">
                                    <div class="form-text text-muted small">Dest X</div>
                                </div>
                                <div class="col-4">
                                    <input type="number" id="sbY" class="form-control" placeholder="Y">
                                    <div class="form-text text-muted small">Dest Y</div>
                                </div>
                            </div>
                            <button onclick="insertTele()" class="btn btn-warning w-100 mt-2">Insert Teleport</button>
                        </div>
                        <div class="tab-pane fade" id="tabShop">
                            <label>Items List</label>
                            <textarea id="sbShopItems" class="form-control mb-1" rows="3" placeholder="1001:50, 1002:100"></textarea>
                            <div class="form-text text-muted small mb-2">Format: <code>ItemID:Price, ItemID2:Price2</code> (comma separated).</div>
                            <button onclick="insertShop()" class="btn btn-success w-100">Insert Shop Block</button>
                        </div>
                        <div class="tab-pane fade" id="tabItem">
                            <label>Operation</label>
                            <select id="sbItemAction" class="form-select mb-2">
                                <option value="addItem">Give Item to Player (Reward)</option>
                                <option value="removeItem">Remove Item from Player</option>
                                <option value="checkItem">Check if Player Has Item</option>
                            </select>
                            <div class="row mb-2">
                                <div class="col-6">
                                    <input type="number" id="sbItemId" class="form-control" placeholder="Item ID">
                                    <div class="form-text text-muted small">Item Unique ID</div>
                                </div>
                                <div class="col-6">
                                    <input type="number" id="sbItemCount" class="form-control" placeholder="Amount" value="1">
                                    <div class="form-text text-muted small">Quantity</div>
                                </div>
                            </div>
                            <button onclick="insertItemLogic()" class="btn btn-primary w-100">Insert Item Logic</button>
                        </div>
                        <div class="tab-pane fade" id="tabFight">
                            <label>Challenge Message (Optional, overrides Speech tab)</label>
                            <textarea id="sbFightMsg" class="form-control mb-1" rows="2" placeholder="Start fight message..."></textarea>
                            
                            <label>Fight Template</label>
                            <input type="text" id="sbFightTemplate" class="form-control mb-2" value="battleFelswornFight" list="fightTemplates">
                            <datalist id="fightTemplates">
                                <option value="battleFelswornFight">Felsworn Pet Fight</option>
                                <option value="drowcrusherFight">Drowcrusher Fight</option>
                                <option value="battleInstructorFight">Battle Instructor</option>
                            </datalist>

                            <button onclick="insertFight()" class="btn btn-danger w-100">Insert Fight Logic</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Quest Modal -->
    <div class="modal fade" id="questModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <form class="modal-content bg-dark" method="POST" id="questForm">
                <input type="hidden" name="action" value="save_quest">
                <input type="hidden" name="stages" id="questStagesJson">
                <div class="modal-header"><h5 class="modal-title">Quest Editor</h5><button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button></div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-4 mb-3">
                            <label>ID</label>
                            <input type="number" name="quest_id" id="questId" class="form-control" required>
                            <div class="form-text text-muted" style="font-size: 0.75rem;">Unique ID (e.g. 1001).</div>
                        </div>
                        <div class="col-md-8 mb-3">
                            <label>Name</label>
                            <input type="text" name="name" id="questName" class="form-control" required>
                            <div class="form-text text-muted" style="font-size: 0.75rem;">Quest title shown in list.</div>
                        </div>
                        <div class="col-md-12 mb-3">
                            <label>Description</label>
                            <textarea name="description" id="questDesc" class="form-control" rows="2"></textarea>
                            <div class="form-text text-muted" style="font-size: 0.75rem;">General intro text / backstory.</div>
                        </div>
                    </div>
                    <hr>
                    <div class="d-flex justify-content-between mb-2">
                        <h6>Stages</h6>
                        <button type="button" class="btn btn-sm btn-outline-success" onclick="addStage()">Add Stage</button>
                    </div>
                    <div id="questStagesContainer" style="max-height: 300px; overflow-y: auto;"></div>
                </div>
                <div class="modal-footer"><button type="button" onclick="saveQuestForm()" class="btn btn-primary">Save Quest</button></div>
            </form>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        lucide.createIcons();

        // Pass PHP data to JS
        const npcs = <?php echo json_encode($npcs); ?>;
        const quests = <?php echo json_encode($quests); ?>;
        const mapsData = <?php echo json_encode($maps); ?>;
        const itemsData = <?php echo json_encode(array_map(fn($item) => $item['data'], $items)); ?>;
        const mapsMap = {};
        mapsData.forEach(m => mapsMap[m.map] = m);
        
        // --- USERS ---
        document.querySelectorAll('.edit-user-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById('editUserId').value = btn.dataset.id;
                document.getElementById('editUserAdmin').checked = btn.dataset.admin === '1';
                document.getElementById('editUserBanned').checked = btn.dataset.banned === '1';
                
                const chars = JSON.parse(btn.dataset.chars || '[]');
                document.getElementById('editUserChars').value = chars.join(',');
                
                new bootstrap.Modal(document.getElementById('userModal')).show();
            });
        });

        // --- QUESTS ---
        let currentStages = {};
        
        function editQuest(data) {
            document.getElementById('questId').value = data.id || '';
            document.getElementById('questName').value = data.name || '';
            document.getElementById('questDesc').value = data.description || '';
            
            // Stages is object with key=id
            currentStages = data.stages || {};
            renderStages();
            
            new bootstrap.Modal(document.getElementById('questModal')).show();
        }
        
        function renderStages() {
            const cont = document.getElementById('questStagesContainer');
            cont.innerHTML = '';
            
            // Sort by stage ID
            const ids = Object.keys(currentStages).map(Number).sort((a,b)=>a-b);
            
            ids.forEach(id => {
               const s = currentStages[id];
               const div = document.createElement('div');
               div.className = 'card bg-secondary p-2 mb-2';
               div.innerHTML = `
                  <div class="d-flex justify-content-between">
                     <strong>Stage ${id}</strong>
                     <button type="button" class="btn btn-sm btn-danger py-0" onclick="removeStage(${id})">X</button>
                  </div>
                  <div class="row mt-2 g-2">
                      <div class="col-12">
                          <label class="text-light small" style="font-size: 0.75rem;">Situation (User guide/instructions for this stage)</label>
                          <input type="text" class="form-control form-control-sm" placeholder="e.g. Defeat 5 Boars in the West Forest." value="${s.situation||''}" onchange="updateStage(${id}, 'situation', this.value)">
                      </div>
                      <div class="col-6">
                          <label class="text-light small" style="font-size: 0.75rem;">Requirements (Short summary)</label>
                          <input type="text" class="form-control form-control-sm" placeholder="e.g. 5/5 Boars" value="${s.requirements||''}" onchange="updateStage(${id}, 'requirements', this.value)">
                      </div>
                      <div class="col-6">
                          <label class="text-light small" style="font-size: 0.75rem;">Reward Text (Display only)</label>
                          <input type="text" class="form-control form-control-sm" placeholder="e.g. 100 EXP" value="${s.reward||''}" onchange="updateStage(${id}, 'reward', this.value)">
                      </div>
                  </div>
               `;
               cont.appendChild(div);
            });
        }
        
        function addStage() {
            const ids = Object.keys(currentStages).map(Number);
            const nextId = ids.length > 0 ? Math.max(...ids) + 1 : 0;
            currentStages[nextId] = { situation:'', requirements:'', reward:'' };
            renderStages();
        }
        
        function removeStage(id) {
            delete currentStages[id];
            renderStages();
        }
        
        function updateStage(id, key, val) {
            if(currentStages[id]) currentStages[id][key] = val;
        }
        
        function saveQuestForm() {
            document.getElementById('questStagesJson').value = JSON.stringify(currentStages);
            document.getElementById('questForm').submit();
        }

        // --- ITEMS ---
        function resetItemForm() {
            document.getElementById('itemId').value = '';
            document.getElementById('itemName').value = '';
            document.getElementById('itemDesc').value = '';
            document.getElementById('itemFile').value = '0';
            document.getElementById('itemType').value = '0';
            document.getElementById('itemStack').value = '1';
            document.getElementById('itemEquipSlot').value = '';
            document.getElementById('itemLevel').value = '';
            document.getElementById('itemPetId').value = '';
            document.getElementById('itemRace').value = '';
            document.getElementById('itemGender').value = '';
            document.getElementById('itemSupportedSlots').selectedIndex = -1;
            document.getElementById('itemQuest').checked = false;
            document.getElementById('itemCanConvert').checked = false;
            document.getElementById('itemHp').value = '';
            document.getElementById('itemMp').value = '';
            document.getElementById('itemStr').value = '';
            document.getElementById('itemStatsJson').value = '';
            document.getElementById('itemActionJson').value = '';
            document.getElementById('itemPropsJson').value = '';
            toggleItemIdWarning(false);
            resetItemStatRows();
            resetItemActionRows();
            resetItemPropRows();
        }
        
        function editItem(data) {
            document.getElementById('itemId').value = data.id;
            document.getElementById('itemName').value = data.name;
            document.getElementById('itemDesc').value = data.description || '';
            document.getElementById('itemFile').value = data.file || 0;
            document.getElementById('itemType').value = data.type || 0;
            document.getElementById('itemStack').value = data.stackLimit || 1;
            document.getElementById('itemEquipSlot').value = data.equipmentSlot ?? '';
            document.getElementById('itemLevel').value = data.level ?? '';
            document.getElementById('itemPetId').value = data.petId ?? '';
            document.getElementById('itemRace').value = data.race ?? '';
            document.getElementById('itemGender').value = data.gender ?? '';
            const supportedSlots = data.supportedEquipmentSlots || [];
            const supportedSelect = document.getElementById('itemSupportedSlots');
            Array.from(supportedSelect.options).forEach(option => {
                option.selected = supportedSlots.includes(parseInt(option.value, 10));
            });
            document.getElementById('itemQuest').checked = !!data.questItem;
            document.getElementById('itemCanConvert').checked = !!data.canConvert;
            document.getElementById('itemHp').value = data.stats?.hp || 0;
            document.getElementById('itemMp').value = data.stats?.mp || 0;
            document.getElementById('itemStr').value = data.stats?.str || 0;
            document.getElementById('itemStatsJson').value = data.stats ? JSON.stringify(data.stats, null, 2) : '';
            document.getElementById('itemActionJson').value = data.action ? JSON.stringify(data.action, null, 2) : '';
            document.getElementById('itemPropsJson').value = data.itemProperties ? JSON.stringify(data.itemProperties, null, 2) : '';
            toggleItemIdWarning(false);
            renderItemStatRows(data.stats || {});
            renderItemKeyValueRows('#itemActionTable tbody', data.action || {});
            renderItemKeyValueRows('#itemPropsTable tbody', data.itemProperties || {});
            new bootstrap.Modal(document.getElementById('itemModal')).show();
        }

        const itemIdMap = itemsData.reduce((acc, item) => {
            if (item && typeof item.id !== 'undefined') {
                acc[item.id] = item;
            }
            return acc;
        }, {});

        function toggleItemIdWarning(show, text = '') {
            const warning = document.getElementById('itemIdWarning');
            if (!warning) return;
            warning.textContent = text;
            warning.style.display = show ? 'block' : 'none';
        }

        function checkItemIdExists() {
            const input = document.getElementById('itemId');
            if (!input) return;
            const id = parseInt(input.value, 10);
            if (Number.isNaN(id)) {
                toggleItemIdWarning(false);
                return;
            }
            if (itemIdMap[id]) {
                toggleItemIdWarning(true, `Item ID ${id} already exists. Use Edit to update it.`);
            } else {
                toggleItemIdWarning(false);
            }
        }

        function resetItemStatRows() {
            const tbody = document.querySelector('#itemStatsTable tbody');
            if (!tbody) return;
            tbody.innerHTML = '';
            addItemStatRow();
        }

        function addItemStatRow(key = '', value = '', valueType = 'string') {
            const tbody = document.querySelector('#itemStatsTable tbody');
            if (!tbody) return;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="text" name="stat_key[]" class="form-control form-control-sm" value="${key}" list="itemStatKeys"></td>
                <td><input type="text" name="stat_value[]" class="form-control form-control-sm" value="${value}"></td>
                <td>
                    <select name="stat_value_type[]" class="form-select form-select-sm">
                        <option value="string">string</option>
                        <option value="number">number</option>
                        <option value="boolean">boolean</option>
                        <option value="json">json</option>
                    </select>
                </td>
                <td><button type="button" class="btn btn-sm btn-outline-danger">X</button></td>
            `;
            const typeSelect = row.querySelector('select[name="stat_value_type[]"]');
            if (typeSelect) typeSelect.value = valueType;
            row.querySelector('button').addEventListener('click', () => row.remove());
            tbody.appendChild(row);
        }

        function renderItemStatRows(stats) {
            const tbody = document.querySelector('#itemStatsTable tbody');
            if (!tbody) return;
            tbody.innerHTML = '';
            const entries = stats && typeof stats === 'object' ? Object.entries(stats) : [];
            const filtered = entries.filter(([key]) => !['hp', 'mp', 'str'].includes(key));
            if (filtered.length === 0) {
                addItemStatRow();
                return;
            }
            filtered.forEach(([key, value]) => {
                const inferredType = inferValueType(value);
                const displayValue = inferredType === 'json' ? JSON.stringify(value) : value;
                addItemStatRow(key, displayValue, inferredType);
            });
        }

        function resetItemActionRows() {
            const tbody = document.querySelector('#itemActionTable tbody');
            if (!tbody) return;
            tbody.innerHTML = '';
            addItemActionRow();
        }

        function resetItemPropRows() {
            const tbody = document.querySelector('#itemPropsTable tbody');
            if (!tbody) return;
            tbody.innerHTML = '';
            addItemPropRow();
        }

        function addItemActionRow(key = '', value = '', valueType = 'string') {
            const tbody = document.querySelector('#itemActionTable tbody');
            if (!tbody) return;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="text" name="action_key[]" class="form-control form-control-sm" value="${key}" list="itemActionKeys"></td>
                <td><input type="text" name="action_value[]" class="form-control form-control-sm" value="${value}"></td>
                <td>
                    <select name="action_value_type[]" class="form-select form-select-sm">
                        <option value="string">string</option>
                        <option value="number">number</option>
                        <option value="boolean">boolean</option>
                        <option value="json">json</option>
                    </select>
                </td>
                <td><button type="button" class="btn btn-sm btn-outline-danger">X</button></td>
            `;
            const typeSelect = row.querySelector('select[name="action_value_type[]"]');
            if (typeSelect) typeSelect.value = valueType;
            row.querySelector('button').addEventListener('click', () => row.remove());
            tbody.appendChild(row);
        }

        function addItemPropRow(key = '', value = '', valueType = 'string') {
            const tbody = document.querySelector('#itemPropsTable tbody');
            if (!tbody) return;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="text" name="item_prop_key[]" class="form-control form-control-sm" value="${key}" list="itemPropertyKeys"></td>
                <td><input type="text" name="item_prop_value[]" class="form-control form-control-sm" value="${value}"></td>
                <td>
                    <select name="item_prop_value_type[]" class="form-select form-select-sm">
                        <option value="string">string</option>
                        <option value="number">number</option>
                        <option value="boolean">boolean</option>
                        <option value="json">json</option>
                    </select>
                </td>
                <td><button type="button" class="btn btn-sm btn-outline-danger">X</button></td>
            `;
            const typeSelect = row.querySelector('select[name="item_prop_value_type[]"]');
            if (typeSelect) typeSelect.value = valueType;
            row.querySelector('button').addEventListener('click', () => row.remove());
            tbody.appendChild(row);
        }

        function renderItemKeyValueRows(selector, data) {
            const tbody = document.querySelector(selector);
            if (!tbody) return;
            tbody.innerHTML = '';
            const entries = data && typeof data === 'object' ? Object.entries(data) : [];
            if (entries.length === 0) {
                if (selector.includes('itemActionTable')) addItemActionRow();
                else addItemPropRow();
                return;
            }
            entries.forEach(([key, value]) => {
                const inferredType = inferValueType(value);
                const displayValue = inferredType === 'json' ? JSON.stringify(value) : value;
                if (selector.includes('itemActionTable')) addItemActionRow(key, displayValue, inferredType);
                else addItemPropRow(key, displayValue, inferredType);
            });
        }

        function inferValueType(value) {
            if (typeof value === 'boolean') return 'boolean';
            if (typeof value === 'number') return 'number';
            if (value !== null && typeof value === 'object') return 'json';
            return 'string';
        }

        function parseTypedValue(rawValue, valueType) {
            const trimmed = String(rawValue ?? '').trim();
            switch (valueType) {
                case 'number':
                    return trimmed === '' ? 0 : Number(trimmed);
                case 'boolean':
                    return trimmed === 'true' || trimmed === '1';
                case 'json':
                    if (trimmed === '') return {};
                    return JSON.parse(trimmed);
                default:
                    return trimmed;
            }
        }

        function applyItemActionPreset() {
            const preset = document.getElementById('itemActionPreset')?.value;
            if (!preset) return;

            const amountRaw = document.getElementById('itemActionPresetAmount')?.value ?? '0';
            const amount = parseFloat(amountRaw);
            const resistRaw = document.getElementById('itemActionPresetResist')?.value?.trim() || '';
            const statsRaw = document.getElementById('itemActionPresetStats')?.value?.trim() || '';
            const staRaw = document.getElementById('itemActionPresetSta')?.value ?? '0';
            const intRaw = document.getElementById('itemActionPresetInt')?.value ?? '0';
            const strRaw = document.getElementById('itemActionPresetStr')?.value ?? '0';
            const agiRaw = document.getElementById('itemActionPresetAgi')?.value ?? '0';
            let action = null;

            switch (preset) {
                case 'exp-player':
                    action = { type: 'exp', amount: Number.isNaN(amount) ? 0 : amount };
                    break;
                case 'exp-pet':
                    action = { type: 'petExp', amount: Number.isNaN(amount) ? 0 : amount };
                    break;
                case 'decrease-stats-player':
                case 'decrease-stats-pet':
                    try {
                        const stats = statsRaw
                            ? JSON.parse(statsRaw)
                            : {
                                sta: Number(staRaw) || 0,
                                int: Number(intRaw) || 0,
                                str: Number(strRaw) || 0,
                                agi: Number(agiRaw) || 0,
                            };
                        action = {
                            type: 'decreaseStats',
                            ...(stats || {}),
                            ...(preset === 'decrease-stats-pet' ? { pet: true } : {}),
                        };
                    } catch (e) {
                        alert('Invalid Stats JSON.');
                        return;
                    }
                    break;
                case 'pet-reset-exp':
                    action = { type: 'petResetExp' };
                    break;
                case 'pet-reset-level':
                    action = { type: 'petResetLevel' };
                    break;
                case 'pet-reset-loyalty':
                    action = { type: 'petResetLoyalty' };
                    break;
                case 'pet-reset-stats':
                    action = { type: 'petResetStats' };
                    break;
                case 'pet-reset-growth':
                    action = { type: 'petResetGrowth' };
                    break;
                case 'pet-add-growth':
                    action = { type: 'petAddGrowth', amount: Number.isNaN(amount) ? 0 : amount };
                    break;
                case 'pet-add-resist':
                    try {
                        action = { type: 'petAddResist', resist: resistRaw ? JSON.parse(resistRaw) : {} };
                    } catch (e) {
                        alert('Invalid Resist JSON.');
                        return;
                    }
                    break;
                case 'pet-reset-resist':
                    action = { type: 'petResetResist' };
                    break;
                default:
                    return;
            }

            const actionJsonEl = document.getElementById('itemActionJson');
            if (actionJsonEl) {
                actionJsonEl.value = JSON.stringify(action, null, 2);
            }
            resetItemActionRows();
        }

        function serializeItemStructuredFields() {
            const statsJsonEl = document.getElementById('itemStatsJson');
            if (statsJsonEl) {
                const stats = {};
                let hasStats = false;
                const hpVal = document.getElementById('itemHp').value;
                const mpVal = document.getElementById('itemMp').value;
                const strVal = document.getElementById('itemStr').value;
                if (hpVal !== '') {
                    stats.hp = parseFloat(hpVal);
                    hasStats = true;
                }
                if (mpVal !== '') {
                    stats.mp = parseFloat(mpVal);
                    hasStats = true;
                }
                if (strVal !== '') {
                    stats.str = parseFloat(strVal);
                    hasStats = true;
                }
                document.querySelectorAll('#itemStatsTable tbody tr').forEach(row => {
                    const key = row.querySelector('input[name="stat_key[]"]')?.value?.trim();
                    if (!key) return;
                    const value = row.querySelector('input[name="stat_value[]"]')?.value ?? '';
                    const valueType = row.querySelector('select[name="stat_value_type[]"]')?.value || 'string';
                    try {
                        stats[key] = parseTypedValue(value, valueType);
                        hasStats = true;
                    } catch (e) {
                        alert('Invalid stat value for ' + key + '.');
                    }
                });
                if (hasStats) {
                    statsJsonEl.value = JSON.stringify(stats, null, 2);
                }
            }
            const action = {};
            document.querySelectorAll('#itemActionTable tbody tr').forEach(row => {
                const key = row.querySelector('input[name="action_key[]"]')?.value?.trim();
                if (!key) return;
                const value = row.querySelector('input[name="action_value[]"]')?.value ?? '';
                const valueType = row.querySelector('select[name="action_value_type[]"]')?.value || 'string';
                try {
                    action[key] = parseTypedValue(value, valueType);
                } catch (e) {
                    alert('Invalid action value for ' + key + '.');
                }
            });

            const props = {};
            document.querySelectorAll('#itemPropsTable tbody tr').forEach(row => {
                const key = row.querySelector('input[name="item_prop_key[]"]')?.value?.trim();
                if (!key) return;
                const value = row.querySelector('input[name="item_prop_value[]"]')?.value ?? '';
                const valueType = row.querySelector('select[name="item_prop_value_type[]"]')?.value || 'string';
                try {
                    props[key] = parseTypedValue(value, valueType);
                } catch (e) {
                    alert('Invalid item property value for ' + key + '.');
                }
            });

            if (Object.keys(action).length > 0) {
                document.getElementById('itemActionJson').value = JSON.stringify(action, null, 2);
            }
            if (Object.keys(props).length > 0) {
                document.getElementById('itemPropsJson').value = JSON.stringify(props, null, 2);
            }
        }

        function filterItems() {
            const rawTerm = document.getElementById('itemSearch').value;
            renderItemPage(1, rawTerm);

            if (rawTerm.trim() === '') {
                localStorage.removeItem('itemSearch');
            } else {
                localStorage.setItem('itemSearch', rawTerm);
            }
        }

        const itemPageSize = 25;
        let itemCurrentPage = 1;

        function changeItemPage(delta) {
            renderItemPage(itemCurrentPage + delta);
        }

        function renderItemPage(page = 1, searchOverride = null) {
            const searchInput = document.getElementById('itemSearch');
            const rawTerm = searchOverride !== null ? searchOverride : (searchInput?.value || '');
            const term = rawTerm.toLowerCase();
            const rows = Array.from(document.querySelectorAll('#itemsTableBody tr'));
            const filteredRows = rows.filter(row => row.innerText.toLowerCase().includes(term));

            const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemPageSize));
            itemCurrentPage = Math.min(Math.max(page, 1), totalPages);

            rows.forEach(row => {
                row.style.display = 'none';
            });

            const start = (itemCurrentPage - 1) * itemPageSize;
            const end = start + itemPageSize;
            filteredRows.slice(start, end).forEach(row => {
                row.style.display = '';
            });

            const info = document.getElementById('itemPageInfo');
            if (info) {
                info.textContent = `Page ${itemCurrentPage} of ${totalPages} (${filteredRows.length} items)`;
            }

            const prevBtn = document.getElementById('itemPrevPage');
            const nextBtn = document.getElementById('itemNextPage');
            if (prevBtn) prevBtn.disabled = itemCurrentPage <= 1;
            if (nextBtn) nextBtn.disabled = itemCurrentPage >= totalPages;
        }

        // --- PETS ---
        function resetPetForm() {
            document.getElementById('petKey').value = '';
            document.getElementById('petName').value = '';
            document.getElementById('petId').value = '';
            document.getElementById('petFile').value = '';
            document.getElementById('petSpecies').value = '';
            document.getElementById('petLevel').value = '';
            document.getElementById('petBuildSta').value = '';
            document.getElementById('petBuildInt').value = '';
            document.getElementById('petBuildStr').value = '';
            document.getElementById('petBuildAgi').value = '';
            document.getElementById('petGrowthMin').value = '';
            document.getElementById('petGrowthMax').value = '';
            document.getElementById('petStaMin').value = '';
            document.getElementById('petStaMax').value = '';
            document.getElementById('petIntMin').value = '';
            document.getElementById('petIntMax').value = '';
            document.getElementById('petStrMin').value = '';
            document.getElementById('petStrMax').value = '';
            document.getElementById('petAgiMin').value = '';
            document.getElementById('petAgiMax').value = '';
            document.getElementById('petBuildJson').value = '';
            document.getElementById('petStatRatesJson').value = '';
            document.getElementById('petResistJson').value = '';
            document.getElementById('petSkillsJson').value = '';
            resetResistRows();
            resetSkillRows();
        }

        function editPet(payload) {
            const data = payload.data || {};
            document.getElementById('petKey').value = payload.id || data.key || data.petId || '';
            document.getElementById('petName').value = data.name || '';
            document.getElementById('petId').value = data.petId ?? '';
            document.getElementById('petFile').value = data.file ?? '';
            document.getElementById('petSpecies').value = data.species ?? '';
            document.getElementById('petLevel').value = data.level ?? '';
            document.getElementById('petBuildSta').value = data.build?.sta ?? '';
            document.getElementById('petBuildInt').value = data.build?.int ?? '';
            document.getElementById('petBuildStr').value = data.build?.str ?? '';
            document.getElementById('petBuildAgi').value = data.build?.agi ?? '';
            document.getElementById('petGrowthMin').value = data.statRates?.growthRate?.min ?? '';
            document.getElementById('petGrowthMax').value = data.statRates?.growthRate?.max ?? '';
            document.getElementById('petStaMin').value = data.statRates?.sta?.min ?? '';
            document.getElementById('petStaMax').value = data.statRates?.sta?.max ?? '';
            document.getElementById('petIntMin').value = data.statRates?.int?.min ?? '';
            document.getElementById('petIntMax').value = data.statRates?.int?.max ?? '';
            document.getElementById('petStrMin').value = data.statRates?.str?.min ?? '';
            document.getElementById('petStrMax').value = data.statRates?.str?.max ?? '';
            document.getElementById('petAgiMin').value = data.statRates?.agi?.min ?? '';
            document.getElementById('petAgiMax').value = data.statRates?.agi?.max ?? '';
            document.getElementById('petBuildJson').value = data.build ? JSON.stringify(data.build, null, 2) : '';
            document.getElementById('petStatRatesJson').value = data.statRates ? JSON.stringify(data.statRates, null, 2) : '';
            document.getElementById('petResistJson').value = data.resist ? JSON.stringify(data.resist, null, 2) : '';
            document.getElementById('petSkillsJson').value = data.skills ? JSON.stringify(data.skills, null, 2) : '';
            renderResistRows(data.resist || {});
            renderSkillRows(data.skills || []);
            new bootstrap.Modal(document.getElementById('petModal')).show();
        }

        function resetResistRows() {
            const tbody = document.querySelector('#petResistTable tbody');
            if (!tbody) return;
            tbody.innerHTML = '';
            addResistRow();
        }

        function resetSkillRows() {
            const tbody = document.querySelector('#petSkillsTable tbody');
            if (!tbody) return;
            tbody.innerHTML = '';
            addSkillRow();
        }

        function addResistRow(key = '', value = '') {
            const tbody = document.querySelector('#petResistTable tbody');
            if (!tbody) return;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="text" name="resist_key[]" class="form-control form-control-sm" value="${key}"></td>
                <td><input type="number" step="0.01" name="resist_value[]" class="form-control form-control-sm" value="${value}"></td>
                <td><button type="button" class="btn btn-sm btn-outline-danger">X</button></td>
            `;
            row.querySelector('button').addEventListener('click', () => row.remove());
            tbody.appendChild(row);
        }

        function addSkillRow(id = '', exp = '') {
            const tbody = document.querySelector('#petSkillsTable tbody');
            if (!tbody) return;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="number" name="skill_id[]" class="form-control form-control-sm" value="${id}"></td>
                <td><input type="number" step="0.01" name="skill_exp[]" class="form-control form-control-sm" value="${exp}"></td>
                <td><button type="button" class="btn btn-sm btn-outline-danger">X</button></td>
            `;
            row.querySelector('button').addEventListener('click', () => row.remove());
            tbody.appendChild(row);
        }

        function renderResistRows(resist) {
            const tbody = document.querySelector('#petResistTable tbody');
            if (!tbody) return;
            tbody.innerHTML = '';
            const keys = Object.keys(resist || {});
            if (keys.length === 0) {
                addResistRow();
                return;
            }
            keys.forEach(key => addResistRow(key, resist[key]));
        }

        function renderSkillRows(skills) {
            const tbody = document.querySelector('#petSkillsTable tbody');
            if (!tbody) return;
            tbody.innerHTML = '';
            if (!Array.isArray(skills) || skills.length === 0) {
                addSkillRow();
                return;
            }
            skills.forEach(skill => addSkillRow(skill.id ?? '', skill.exp ?? ''));
        }

        function serializePetStructuredFields() {
            const build = {
                sta: parseFloat(document.getElementById('petBuildSta').value || '0'),
                int: parseFloat(document.getElementById('petBuildInt').value || '0'),
                str: parseFloat(document.getElementById('petBuildStr').value || '0'),
                agi: parseFloat(document.getElementById('petBuildAgi').value || '0')
            };
            const statRates = {
                growthRate: {
                    min: parseFloat(document.getElementById('petGrowthMin').value || '0'),
                    max: parseFloat(document.getElementById('petGrowthMax').value || '0')
                },
                sta: {
                    min: parseFloat(document.getElementById('petStaMin').value || '0'),
                    max: parseFloat(document.getElementById('petStaMax').value || '0')
                },
                int: {
                    min: parseFloat(document.getElementById('petIntMin').value || '0'),
                    max: parseFloat(document.getElementById('petIntMax').value || '0')
                },
                str: {
                    min: parseFloat(document.getElementById('petStrMin').value || '0'),
                    max: parseFloat(document.getElementById('petStrMax').value || '0')
                },
                agi: {
                    min: parseFloat(document.getElementById('petAgiMin').value || '0'),
                    max: parseFloat(document.getElementById('petAgiMax').value || '0')
                }
            };

            const resist = {};
            document.querySelectorAll('#petResistTable tbody tr').forEach(row => {
                const key = row.querySelector('input[name="resist_key[]"]')?.value?.trim();
                if (!key) return;
                const value = row.querySelector('input[name="resist_value[]"]')?.value;
                resist[key] = value === '' || value === null ? 0 : parseFloat(value);
            });

            const skills = [];
            document.querySelectorAll('#petSkillsTable tbody tr').forEach(row => {
                const id = row.querySelector('input[name="skill_id[]"]')?.value;
                if (id === '' || id === null) return;
                const exp = row.querySelector('input[name="skill_exp[]"]')?.value;
                skills.push({
                    id: parseInt(id, 10),
                    exp: exp === '' || exp === null ? 0 : parseFloat(exp)
                });
            });

            document.getElementById('petBuildJson').value = JSON.stringify(build, null, 2);
            document.getElementById('petStatRatesJson').value = JSON.stringify(statRates, null, 2);
            document.getElementById('petResistJson').value = Object.keys(resist).length ? JSON.stringify(resist, null, 2) : '';
            document.getElementById('petSkillsJson').value = skills.length ? JSON.stringify(skills, null, 2) : '';
        }

        function filterPets() {
            const term = document.getElementById('petSearch').value.toLowerCase();
            const rows = document.querySelectorAll('#petsTableBody tr');
            rows.forEach(row => {
                const text = row.innerText.toLowerCase();
                row.style.display = text.includes(term) ? '' : 'none';
            });
        }

        // --- NPCs & MAP ---
        function resetNpcForm() {
            document.querySelector('#npcForm input[name="npc_id"]').value = '';
            document.querySelector('#npcForm input[name="name"]').value = '';
            document.querySelector('#npcForm input[name="file"]').value = 0;
            document.querySelector('#npcForm input[name="x"]').value = 0;
            document.querySelector('#npcForm input[name="y"]').value = 0;
            const npcTypeSelect = document.querySelector('#npcForm select[name="npc_type"]');
            if (npcTypeSelect) npcTypeSelect.value = '';
            document.querySelector('#npcActionScript').value = '';
            updateNpcPreview();
        }

        function detectTileSize(mapId, callback) {
             const mapInfo = mapsMap[mapId] || {};
             const fileId = mapInfo.file || mapInfo.map || mapId;
             const paddedMapId = String(fileId).padStart(3, '0');
             const src = `assets/img/maps/Map${paddedMapId}_Tiles/File0001.jpg`;
             const img = new Image();
             img.onload = function() {
                 if (this.width > 0 && this.height > 0) {
                     document.getElementById('tileW').value = this.width;
                     document.getElementById('tileH').value = this.height;
                 }
                 if (callback) callback();
             };
             img.onerror = function() {
                 // Ignore error, keep existing values
                 if (callback) callback();
             };
             img.src = src;
        }

        function updateZoom() {
            const zoom = document.getElementById('mapZoom').value;
            document.getElementById('zoomVal').innerText = zoom + 'x';
            // Apply zoom to the inner contents of mapLayer and npcLayer
            // Actually, zooming the CONTAINER contents is better
            const mapLayer = document.getElementById('mapLayer');
            const npcLayer = document.getElementById('npcLayer');
            
            // We use transform scale
            // But we need to make sure origin is top-left
            mapLayer.style.transform = `scale(${zoom})`;
            npcLayer.style.transform = `scale(${zoom})`;
            
            // Adjust container scroll? 
            // If we scale up, the div grows visually, but scrollWidth might not update if using transform?
            // "transform" doesn't affect flow layout.
            // Better to zoom by setting css width/height on the content?
            // Or use zoom property (non-standard but works)?
            // Let's use CSS Zoom if supported, or Transform with origin
            
            mapLayer.style.transformOrigin = '0 0';
            npcLayer.style.transformOrigin = '0 0';
            
            // To ensure scrollbars work, we might need a wrapper or set dimensions of container layer
            // If we scale the layers, they take up X space visually.
            // The mapContainer (overflow:auto) needs to know the new size.
            // We can set a spacer div? Or just set properties.
        }

        function loadMap(fromSelect = false, doAutoGrid = false) {
            const mapId = parseInt(document.getElementById('mapSelector').value);
            const mapInfo = mapsMap[mapId] || { width: 0, height: 0, hasTiles: false, tileCount: 0 };
            
            const useTilesCheck = document.getElementById('useTiles');
            const tileWInput = document.getElementById('tileW');
            const tileHInput = document.getElementById('tileH');
            const mapWInput = document.getElementById('mapW');
            const mapHInput = document.getElementById('mapH');
            const mapColsInput = document.getElementById('mapCols');
            const gridSizeInput = document.getElementById('gridSize');
            const debugEl = document.getElementById('tileDebug');

            if (fromSelect) doAutoGrid = true;

            // Auto-switch & Init Logic
            if (fromSelect) {
                const hasTiles = !!mapInfo.hasTiles || !!mapInfo.generated;
                useTilesCheck.checked = hasTiles;
                
                // Reset manual overrides to map defaults
                mapWInput.value = mapInfo.width || '';
                mapHInput.value = mapInfo.height || '';
                
                // Load Saved Configs
                mapColsInput.value = mapInfo.mapCols || ''; 
                document.getElementById('tileGroupW').value = mapInfo.groupW || '';
                document.getElementById('tileGroupH').value = mapInfo.groupH || '';
                if(mapInfo.tileW) tileWInput.value = mapInfo.tileW;
                if(mapInfo.tileH) tileHInput.value = mapInfo.tileH;
                
                if(mapInfo.gridSize && parseFloat(mapInfo.gridSize) > 0) {
                    gridSizeInput.value = mapInfo.gridSize;
                    doAutoGrid = false; // Disable auto-grid if we have a saved value
                }
                
                // Detect Tile Size if we have tiles AND no saved tile info
                if (hasTiles && !mapInfo.tileW) {
                    detectTileSize(mapId, () => loadMap(false, true));
                    return; 
                }
            }

            const useTiles = useTilesCheck.checked;
            const tileW = parseInt(tileWInput.value) || 800;
            const tileH = parseInt(tileHInput.value) || 600;
            
            // Determine Width/Height
            // Priority: Manual Input > Map Info > Heuristic (Tile Count) > Fallback
            let width = parseInt(mapWInput.value) || mapInfo.width || 0;
            let height = parseInt(mapHInput.value) || mapInfo.height || 0;

            debugEl.innerHTML = '';
            
            // Heuristic for unknown dimensions if we have tile count
            if (useTiles && (!width || !height) && mapInfo.tileCount > 0) {
                 // Try to guess a square-ish layout or single row?
                 // Most maps are roughly rectangular. 
                 // If tileCount is small (e.g. 1), it's 1x1.
                 if (mapInfo.tileCount === 1) {
                     width = tileW;
                     height = tileH;
                     debugEl.innerHTML = '<span class="text-info">(Auto-detected 1x1 1-tile map)</span>';
                 } else {
                     // Default to a virtual size, but let user know they can adjust
                     width = width || 8000;
                     height = height || 6000;
                     debugEl.innerHTML = `<span class="text-warning">Map dimensions unknown. Tile Count: ${mapInfo.tileCount}. Please adjust Map W/H manually.</span>`;
                 }
                 // Update inputs to show what we are using
                 mapWInput.value = width;
                 mapHInput.value = height;
            } else if (!width || !height) {
                 // Just fallback
                 width = width || 8000;
                 height = height || 6000;
                 if (fromSelect) debugEl.innerHTML = '<span class="text-info">(Using default canvas size)</span>';
            }

            const mapLayer = document.getElementById('mapLayer');
            mapLayer.style.width = width + 'px';
            mapLayer.style.height = height + 'px';
            mapLayer.innerHTML = '';
            
            document.getElementById('inputMapId').value = mapId;

            let deferRender = false;
            if (!useTiles) {
                // ... Existing single image mode code ...
                // Single Image Mode
                const mapFileId = mapInfo.file || mapInfo.map || mapId;
                const img = document.createElement('img');
                const p1 = `assets/img/maps/${mapFileId}.jpg`;
                const p2 = `assets/img/maps/${mapFileId}.png`;
                
                img.src = p1;
                img.style.position = 'absolute';
                img.style.top = '0';
                img.style.left = '0';
                deferRender = true;

                img.onload = () => {
                    const w = img.naturalWidth || img.width;
                    const h = img.naturalHeight || img.height;
                    if (w && h) {
                        mapLayer.style.width = w + 'px';
                        mapLayer.style.height = h + 'px';
                        mapWInput.value = w;
                        mapHInput.value = h;
                    }
                    updateZoom();
                    if (typeof doAutoGrid !== 'undefined' && doAutoGrid) {
                         const finalW = w || width;
                         // For single image, tileW is just grid scale reference? 
                         // Or use default?
                         autoCalculateGrid(mapId, finalW, tileW); 
                    }
                    renderNpcs(mapId);
                };
                
                img.onerror = () => { 
                    if (img.src.endsWith('.jpg')) img.src = p2;
                    else {
                         img.style.display = 'none'; 
                         mapLayer.style.backgroundColor = '#222';
                         mapLayer.innerHTML = `<div class="text-secondary p-4">
                            Full map image not found.<br>
                            Tried: ${p1}, ${p2}<br>
                         </div>`;
                    }
                };
                mapLayer.appendChild(img);
            } else {
                // Tiled View via API
                // Try to get exact coords first
                fetch(`admin.php?action=get_map_tiles&map_id=${mapId}`)
                    .then(r => r.json())
                    .then(data => {
                        const exactTiles = data.tiles || [];
                        const mapFileId = mapInfo.file || mapInfo.map || mapId;
                        const paddedMapId = String(mapFileId).padStart(3, '0');
                        
                        // Clear layer
                        mapLayer.innerHTML = '';
                        mapLayer.style.width = width + 'px';
                        mapLayer.style.height = height + 'px';
                        
                        if (exactTiles.length > 0) {
                             debugEl.innerHTML += ` <span class="text-success">(Found .map coord data: ${exactTiles.length} tiles)</span>`;
                             
                             let maxX = 0;
                             let maxY = 0;

                             exactTiles.forEach((t, i) => {
                                 const idx = i + 1;
                                 const paddedName = 'File' + String(idx).padStart(4, '0') + '.jpg';
                                 const src = `assets/img/maps/Map${paddedMapId}_Tiles/${paddedName}`;
                                 
                                 const tile = document.createElement('img');
                                 tile.src = src;
                                 tile.className = 'map-tile';
                                 tile.style.left = t.x + 'px';
                                 tile.style.top = t.y + 'px';
                                 
                                 // Track max dimensions
                                 // We don't know tile size until loaded, but usually they are screen chunks?
                                 // Assuming 800x600 or reading natural size?
                                 // Let's just append.
                                 mapLayer.appendChild(tile);
                             });
                             
                             // Cannot determine accurate map size without tile sizes.
                             // Trust the inputs?
                        } else {
                             // Fallback to Grid Logic
                             renderGridTiles();
                        }
                        
                        // Post-render updates
                        updateZoom();
                        if (doAutoGrid) autoCalculateGrid(mapId, width, tileW);
                        renderNpcs(mapId);
                    })
                    .catch(e => {
                        console.error(e);
                        renderGridTiles(); // Fallback on error
                        
                        // Post-render updates (fallback)
                        updateZoom();
                        if (doAutoGrid) autoCalculateGrid(mapId, width, tileW);
                        renderNpcs(mapId);
                    });
                
                // Definition of fallback grid renderer (the old logic)
                const renderGridTiles = () => {
                    const tileCount = mapInfo.tileCount || 0;
                    let cols = parseInt(mapColsInput.value) || 0;
                    let rows = 0;
                    
                    // Grouping Logic inputs (keep previous logic)
                    let groupW = parseInt(document.getElementById('tileGroupW').value);
                    let groupH = parseInt(document.getElementById('tileGroupH').value);
                    
                    // Defaults for grouping (if 0 or NaN, assume flow)
                    // (Re-using logic from previous step, condensed)
                    if (cols <= 0) {
                         if (width > 0) cols = Math.max(1, Math.ceil(width / tileW));
                         else if (tileCount > 0) cols = Math.max(1, Math.ceil(Math.sqrt(tileCount)));
                         else cols = 1;
                         // Don't auto-update input if we are just guessing, unless mapCols was empty.
                         // mapColsInput.value = cols; 
                    }
                    if (height > 0) rows = Math.max(1, Math.ceil(height / tileH));
                    else if (tileCount > 0) rows = Math.max(1, Math.ceil(tileCount / cols));
                    else rows = 1;

                    if (!groupW || groupW <= 0) groupW = cols; 
                    if (!groupH || groupH <= 0) groupH = rows;

                    if (!mapHInput.value || parseInt(mapHInput.value) === 0) {
                         height = rows * tileH;
                         mapHInput.value = height;
                    }
                    mapLayer.style.width = width + 'px';
                    mapLayer.style.height = height + 'px';
                    
                    const maxTiles = 500;
                    let rendered = 0;
                    const paddedMapId = String(mapInfo.file || mapInfo.map || mapId).padStart(3, '0');

                    for (let i = 0; i < tileCount; i++) {
                        if (rendered >= maxTiles) break;
                        const idx = i + 1;
                        
                        // Grid logic
                        const tilesPerChunk = groupW * groupH;
                        const chunkIdx = Math.floor(i / tilesPerChunk);
                        const tileInChunk = i % tilesPerChunk;
                        const chunksPerRow = Math.max(1, Math.ceil(cols / groupW));
                        const chunkRow = Math.floor(chunkIdx / chunksPerRow);
                        const chunkCol = chunkIdx % chunksPerRow;
                        const rowInChunk = Math.floor(tileInChunk / groupW);
                        const colInChunk = tileInChunk % groupW;
                        const c = chunkCol * groupW + colInChunk;
                        const r = chunkRow * groupH + rowInChunk;
                        
                        if (c >= cols || r >= rows) continue; 
                        rendered++;

                        const paddedName = 'File' + String(idx).padStart(4, '0') + '.jpg';
                        const src = `assets/img/maps/Map${paddedMapId}_Tiles/${paddedName}`;
                        const tile = document.createElement('img');
                        tile.src = src;
                        tile.className = 'map-tile';
                        tile.style.left = (c * tileW) + 'px';
                        tile.style.top = (r * tileH) + 'px';
                        tile.onerror = () => tile.style.visibility = 'hidden';
                        mapLayer.appendChild(tile);
                    }
                };
                
                deferRender = true; // Async fetch
            }
            
            if (!deferRender) {
                // Ensure container size handles zoom
                updateZoom();
                
                if (doAutoGrid) {
                    autoCalculateGrid(mapId, width, tileW);
                }
                
                renderNpcs(mapId);
            }
        }

        /* 
        function autoGrid(mapId) {
             const mapW = parseInt(document.getElementById('mapLayer').style.width);
             if (mapW < 2000) return; // Small map, likely 1:1
             
             // Check max NPC coordinate
             let maxX = 0;
             let count = 0;
             npcs.forEach(n => {
                 if (n.data.map == mapId) {
                     if (n.data.point.x > maxX) maxX = n.data.point.x;
                     count++;
                 }
             });
             
             if (count === 0) return;
             
             // If maxX is small (e.g. 400) and map is big (8000)
             // Ratio = 20.
             if (maxX < (mapW / 10)) {
                 // Try 20 (standard for many engines)
                 if (maxX * 20 < mapW) {
                      document.getElementById('gridSize').value = 20;
                      renderNpcs(mapId);
                      document.getElementById('tileDebug').innerHTML += ` <span class="text-success">(Auto-scaled Grid: 20)</span>`;
                 }
             }
        }
        */
        
        function getGridScale() {
            const gridSize = parseFloat(document.getElementById('gridSize').value) || 1;
            return { x: gridSize, y: gridSize };
        }

        function autoCalculateGrid(mapId, mapWidth, tileWidth) {
             let maxX = 0;
             let count = 0;
             npcs.forEach(n => {
                 if (n.data.map == mapId) {
                     if (n.data.point.x > maxX) maxX = n.data.point.x;
                     count++;
                 }
             });
             
             if (count === 0) return;
             
             const gs = document.getElementById('gridSize');
             // Heuristic: If coords are small (<= 300) and fit when scaled by TileW, use TileW.
             // Otherwise use 1 (Pixels).
             if (maxX <= 300 && (maxX * tileWidth) <= (mapWidth * 1.5)) {
                 gs.value = tileWidth;
             } else {
                 gs.value = 1;
             }
             document.getElementById('tileDebug').innerHTML += ` <span class="text-info">(Auto-Grid: ${gs.value})</span>`;
        }

        function renderNpcs(mapId) {
            // Clear existing markers
            document.querySelectorAll('.npc-marker').forEach(el => el.remove());
            activeNpcAnims = []; // Clear animation list
            const list = document.getElementById('npcList');
            const npcLayer = document.getElementById('npcLayer');
            list.innerHTML = '';
            
            const gridScale = getGridScale();
            const mapLayer = document.getElementById('mapLayer');
            npcLayer.style.width = mapLayer.style.width;
            npcLayer.style.height = mapLayer.style.height;

            let count = 0;
            npcs.forEach(npc => {
                const d = npc.data;
                if (d.map == mapId) {
                    count++;
                    const fileId = d.file || d.id;
                    const finalX = d.point.x * gridScale.x;
                    const finalY = d.point.y * gridScale.y;

                    // List Item
                    const li = document.createElement('li');
                    li.className = 'list-group-item bg-dark text-light border-secondary d-flex align-items-center';
                    li.innerHTML = `
                        <div class="me-2 list-img-preview">
                            <img src="npc_image.php?file=${fileId}" alt="${fileId}" style="max-width:100%; max-height:100%;">
                        </div>
                        <div class="flex-grow-1">
                            <div>${d.name} (${d.id})</div>
                            <small class="text-muted">L:(${d.point.x}, ${d.point.y})</small>
                        </div>
                        <button class="btn btn-sm btn-outline-info" onclick='editNpc(${JSON.stringify(d)})'>Edit</button>
                    `;
                    list.appendChild(li);

                    // Marker
                    const marker = document.createElement('div');
                    marker.className = 'npc-marker';
                    marker.style.left = finalX + 'px';
                    marker.style.top = finalY + 'px';
                    marker.innerHTML = `
                        <div class="npc-label">${d.name}</div>
                        <img src="npc_image.php?file=${fileId}" class="npc-anim" data-file="${fileId}" data-frame="0" onerror="this.style.display='none'">
                        <div class="npc-dot"></div>
                    `;
                    marker.onclick = () => editNpc(d);
                    npcLayer.appendChild(marker);
                    
                    // Init Animation Meta
                    fetch(`npc_image.php?file=${fileId}&mode=meta`)
                        .then(r => r.json())
                        .then(meta => {
                             if(meta.frames > 1) {
                                 const img = marker.querySelector('.npc-anim');
                                 img.dataset.maxFrames = meta.frames;
                                 activeNpcAnims.push(img);
                             }
                        });
                }
            });
            document.getElementById('tileDebug').innerHTML += ` <span class="text-info">(${count} NPCs)</span>`;
        }

        function openAllNpcsModal() {
            const tbody = document.getElementById('allNpcsTableBody');
            tbody.innerHTML = '';
            
            // Allow sorting by ID
            const sortedNpcs = [...npcs].sort((a,b) => a.data.id - b.data.id);
            
            sortedNpcs.forEach(npc => {
                const d = npc.data;
                const fileId = d.file || d.id;
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${d.id}</td>
                    <td>
                        <div class="list-img-preview" style="width:24px;height:24px;">
                            <img src="npc_image.php?file=${fileId}" style="max-width:100%;max-height:100%;">
                        </div>
                    </td>
                    <td>${d.name}</td>
                    <td>${d.map}</td>
                    <td>
                        <button class="btn btn-sm btn-primary py-0" onclick='jumpToNpc(${JSON.stringify(d)})'>Go</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
            
            new bootstrap.Modal(document.getElementById('allNpcsModal')).show();
        }

        function filterAllNpcs() {
             const term = document.getElementById('allNpcSearch').value.toLowerCase();
             const rows = document.querySelectorAll('#allNpcsTableBody tr');
             rows.forEach(row => {
                 const text = row.innerText.toLowerCase();
                 row.style.display = text.includes(term) ? '' : 'none';
             });
        }

        function jumpToNpc(d) {
             bootstrap.Modal.getInstance(document.getElementById('allNpcsModal')).hide();
             const mapId = d.map;
             
             // Check if we need to switch map
             const sel = document.getElementById('mapSelector');
             if (sel.value != mapId) {
                 sel.value = mapId;
                 loadMap(true); 
                 // Wait a bit
                 setTimeout(() => {
                     locateNpcOnMap(d);
                 }, 800);
             } else {
                 locateNpcOnMap(d);
             }
        }

        function locateNpcOnMap(d) {
             editNpc(d);
             const gridScale = getGridScale();
             const px = d.point.x * gridScale.x;
             const py = d.point.y * gridScale.y;
             
             const cont = document.getElementById('mapContainer');
             cont.scrollTo({
                top: py - cont.clientHeight / 2,
                left: px - cont.clientWidth / 2,
                behavior: 'smooth'
             });
        }
        
        // Animation Loop
        let activeNpcAnims = [];
        setInterval(() => {
            activeNpcAnims.forEach(img => {
                let frame = parseInt(img.dataset.frame) || 0;
                const max = parseInt(img.dataset.maxFrames) || 1;
                frame = (frame + 1) % max;
                img.dataset.frame = frame;
                img.src = `npc_image.php?file=${img.dataset.file}&frame=${frame}`;
            });
        }, 200); // 5 FPS
        
        function filterMapNpcs() {
             const term = document.getElementById('mapNpcSearch').value.toLowerCase();
             const items = document.querySelectorAll('#npcList li');
             items.forEach(li => {
                 const text = li.innerText.toLowerCase();
                 li.style.display = text.includes(term) ? '' : 'none';
             });
        }

        function editNpc(d) {
             document.querySelector('#npcForm input[name="npc_id"]').value = d.id;
             document.querySelector('#npcForm input[name="name"]').value = d.name;
             document.querySelector('#npcForm input[name="file"]').value = d.file;
             document.querySelector('#npcForm input[name="map_id"]').value = d.map;
             document.querySelector('#npcForm input[name="x"]').value = d.point.x;
             document.querySelector('#npcForm input[name="y"]').value = d.point.y;
             document.querySelector('#npcForm input[name="direction"]').value = d.direction || 0;
             const npcTypeSelect = document.querySelector('#npcForm select[name="npc_type"]');
             if (npcTypeSelect) npcTypeSelect.value = d.type ?? '';
             document.querySelector('#npcActionScript').value = d.action ? JSON.stringify(d.action, null, 2) : '';
             updateNpcPreview();
        }

        function updateNpcPreview() {
            const fileId = document.getElementById('npcFile').value;
            const img = document.getElementById('npcPreview');
            const txt = document.getElementById('npcPreviewText');
            
            img.onload = () => {
                img.style.display = 'block';
                txt.style.display = 'none';
            };
            img.onerror = () => { 
                img.style.display = 'none'; 
                txt.style.display = 'block';
                txt.innerText = fileId; 
            };
            img.src = `npc_image.php?file=${fileId}`;
        }

        // Map Click Event
        function getMapCoords(e) {
            const mapLayer = document.getElementById('mapLayer');
            const rect = mapLayer.getBoundingClientRect();
            const zoom = parseFloat(document.getElementById('mapZoom').value) || 1;
            
            // Calculate relative to the scaled element, then unscale
            const rawX = (e.clientX - rect.left) / zoom;
            const rawY = (e.clientY - rect.top) / zoom;
            return { x: rawX, y: rawY };
        }

        document.getElementById('mapLayer').addEventListener('click', function(e) {
             const gridScale = getGridScale();
             const coords = getMapCoords(e);
             const logicX = Math.round(coords.x / gridScale.x);
             const logicY = Math.round(coords.y / gridScale.y);
             
             document.querySelector('#npcForm input[name="x"]').value = logicX;
             document.querySelector('#npcForm input[name="y"]').value = logicY;
        });

        document.getElementById('mapLayer').addEventListener('mousemove', function(e) {
             const gridScale = getGridScale();
             const coords = getMapCoords(e);
             const logicX = Math.round(coords.x / gridScale.x);
             const logicY = Math.round(coords.y / gridScale.y);
             
             document.getElementById('cursorCoords').textContent = `${logicX}, ${logicY} (Px: ${Math.round(coords.x)}, ${Math.round(coords.y)})`;
        });

        function saveMapConfig() {
            const mapId = document.getElementById('mapSelector').value;
            const gw = document.getElementById('tileGroupW').value || 0;
            const gh = document.getElementById('tileGroupH').value || 0;
            const tw = document.getElementById('tileW').value || 0;
            const th = document.getElementById('tileH').value || 0;
            const mc = document.getElementById('mapCols').value || 0;
            const gs = document.getElementById('gridSize').value || 1;
            const mw = document.getElementById('mapW').value || 0;
            const mh = document.getElementById('mapH').value || 0;
            
            if(!confirm(`Save Map ${mapId} config?`)) return;

            const form = document.createElement('form');
            form.method = 'POST';
            form.innerHTML = `
                <input type="hidden" name="action" value="save_map_config">
                <input type="hidden" name="map_id" value="${mapId}">
                <input type="hidden" name="group_w" value="${gw}">
                <input type="hidden" name="group_h" value="${gh}">
                <input type="hidden" name="tile_w" value="${tw}">
                <input type="hidden" name="tile_h" value="${th}">
                <input type="hidden" name="map_cols" value="${mc}">
                <input type="hidden" name="grid_size" value="${gs}">
                <input type="hidden" name="map_w" value="${mw}">
                <input type="hidden" name="map_h" value="${mh}">
            `;
            document.body.appendChild(form);
            form.submit();
        }

        function deleteCurrentNpc() {
            const id = document.querySelector('#npcForm input[name="npc_id"]').value;
            if(!id) return alert('No NPC selected or ID is missing.');
            if(!confirm('Delete NPC ' + id + '?')) return;
            
            const form = document.createElement('form');
            form.method = 'POST';
            form.innerHTML = `<input type="hidden" name="action" value="delete_npc"><input type="hidden" name="npc_id" value="${id}">`;
            document.body.appendChild(form);
            form.submit();
        }

        // Quest Reference Logic
        function findQuestNpc(questId) {
            let found = [];
            // Simple string search in JSON data of NPCs
            npcs.forEach(n => {
                const d = n.data;
                const str = JSON.stringify(d);
                // Look for ID in quotes or as number
                if (str.includes(`"${questId}"`) || str.includes(`:${questId}`) || str.includes(`,${questId}`) || str.includes(`[${questId}`)) {
                     found.push(d);
                }
            });
            
            if (found.length === 0) return alert('No NPCs found referencing Quest ' + questId);
            
            // Prefer current map
            const curMap = parseInt(document.getElementById('mapSelector').value);
            let target = found.find(n => n.map == curMap);
            let switched = false;
            
            if (!target) {
                target = found[0];
                document.getElementById('mapSelector').value = target.map;
                loadMap(true); 
                switched = true;
            }
            
            // Delay to allow render
            setTimeout(() => {
                editNpc(target);
                
                const gridScale = getGridScale();
                const px = target.point.x * gridScale.x;
                const py = target.point.y * gridScale.y;
                
                const cont = document.getElementById('mapContainer');
                cont.scrollTo({
                    top: py - cont.clientHeight / 2,
                    left: px - cont.clientWidth / 2,
                    behavior: 'smooth'
                });
                
                // alert(`Found NPC ${target.name} (${target.id}) on Map ${target.map}`);
            }, switched ? 1000 : 100);
        }

        function renderQuests() {
            const list = document.getElementById('questList');
            if(!list) return;
            list.innerHTML = '';
            quests.forEach(q => {
                const li = document.createElement('li');
                li.className = 'list-group-item bg-dark text-light border-secondary d-flex justify-content-between align-items-center p-1';
                li.innerHTML = `
                   <div class="text-truncate flex-grow-1" style="cursor: pointer; color: #a0cfff;" onclick="findQuestNpc('${q.id}')" title="Find NPC">${q.name}</div>
                   <div>
                       <span class="badge bg-secondary me-1" style="cursor:pointer" title="Copy ID" onclick="copyToClip('${q.id}')">${q.id}</span>
                       <button class="btn btn-sm btn-outline-primary py-0 px-1" onclick='editQuest(${JSON.stringify(q.data)})' title="Edit Quest"><i data-lucide="edit-2" style="width:12px;height:12px;"></i></button>
                   </div>`;
                list.appendChild(li);
            });
            lucide.createIcons();
        }

        function filterQuests() {
            const term = document.getElementById('questSearch').value.toLowerCase();
            const items = document.querySelectorAll('#questList li');
            items.forEach(li => {
                const text = li.innerText.toLowerCase();
                li.style.display = text.includes(term) ? '' : 'none';
            });
        }

        function copyToClip(str) {
            navigator.clipboard.writeText(str);
        }

        // Script Builder Logic
        function insertSpeech() {
            const msg = document.getElementById('sbMessage').value;
            let opts = document.getElementById('sbOptions').value;
            if(!opts) opts = 'null';
            try { if(opts !== 'null') JSON.parse(opts); } catch(e) { alert('Invalid JSON in options'); return; }

            const json = `
{
  "type": "npcSay",
  "message": ${JSON.stringify(msg)},
  "options": ${opts}
}`;
            appendToScript(json);
            bootstrap.Modal.getInstance(document.getElementById('scriptBuilderModal')).hide();
        }

        function toggleQuestBuilderFields() {
            const type = document.getElementById('sbQuestType').value;
            document.getElementById('sbQuestStartFields').style.display = type === 'start' ? 'block' : 'none';
            document.getElementById('sbQuestChainContainer').style.display = type === 'start' ? 'block' : 'none';
            document.getElementById('sbQuestItemFields').style.display = type === 'item' ? 'block' : 'none';
            document.getElementById('sbQuestSimpleMsg').style.display = (type === 'set' || type === 'remove') ? 'block' : 'none';
            // Hide Stage input for Remove/Start (Start implies 0, Remove needs none)
            const stageCont = document.getElementById('sbQuestStageContainer');
            if(stageCont) stageCont.style.display = (type === 'start' || type === 'remove') ? 'none' : 'block';
        }

        function addQuestChain() {
            const select = document.getElementById('sbQuestChainSelect');
            const list = document.getElementById('sbQuestChainList');
            if (!select || !list || !select.value) return;

            const questId = select.value;
            if (list.querySelector(`[data-quest-id="${questId}"]`)) return;

            const name = select.options[select.selectedIndex].text;
            const item = document.createElement('div');
            item.className = 'd-flex align-items-center gap-2';
            item.dataset.questId = questId;
            const defaultStage = getQuestDefaultStage(questId);
            item.innerHTML = `
                <span class="text-truncate flex-grow-1">${name}</span>
                <input type="number" class="form-control form-control-sm" value="${defaultStage}" style="max-width: 80px;">
                <button type="button" class="btn btn-sm btn-outline-danger">Remove</button>
            `;
            item.querySelector('button').addEventListener('click', () => item.remove());
            list.appendChild(item);
        }

        function getQuestDefaultStage(questId) {
            const quest = quests.find(q => parseInt(q.id, 10) === parseInt(questId, 10));
            const stages = quest?.data?.stages;
            if (!stages) return 0;
            const keys = Object.keys(stages).map(Number).filter(k => !isNaN(k));
            if (keys.length === 0) return 0;
            return Math.min(...keys);
        }

        function insertQuestLogic() {
            const questId = parseInt(document.getElementById('qbQuestId').value, 10);
            if (isNaN(questId)) {
                alert('Quest ID is required.');
                return;
            }

            const introMsg = document.getElementById('qbQuestIntro').value.trim();
            if (!introMsg) {
                alert('Intro message is required.');
                return;
            }

            const requireNotStarted = document.getElementById('qbQuestNotStarted').checked;
            const elseMsg = document.getElementById('qbQuestElseMsg').value.trim();
            const acceptText = document.getElementById('qbQuestAcceptText').value.trim() || 'Accept';
            const declineText = document.getElementById('qbQuestDeclineText').value.trim() || 'Decline';
            const declineMsg = document.getElementById('qbQuestDeclineMsg').value.trim();
            const detailsPagesRaw = document.getElementById('qbQuestPages').value;
            const detailsLines = detailsPagesRaw
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);
            const detailsMessage = detailsLines.length > 1
                ? detailsLines
                : (detailsLines.length === 1 ? detailsLines[0] : '');
            const detailsAcceptText = document.getElementById('qbQuestDetailsAcceptText').value.trim() || 'Accept';
            const detailsDeclineText = document.getElementById('qbQuestDetailsDeclineText').value.trim() || 'Decline';
            const detailsDeclineMsg = document.getElementById('qbQuestDetailsDeclineMsg').value.trim();
            const acceptMsg = document.getElementById('qbQuestAcceptMsg').value.trim();

            const onCloseActions = [];
            if (document.getElementById('qbQuestAddQuest').checked) {
                const addQuestIdRaw = document.getElementById('qbQuestAddQuestId').value;
                const addQuestId = addQuestIdRaw === '' ? questId : parseInt(addQuestIdRaw, 10);
                if (!isNaN(addQuestId)) {
                    onCloseActions.push({
                        type: 'quest',
                        add: addQuestId
                    });
                }
            }

            if (document.getElementById('qbQuestAddItem').checked) {
                const addItemId = parseInt(document.getElementById('qbQuestAddItemId').value, 10);
                const addItemAmount = parseInt(document.getElementById('qbQuestAddItemAmount').value, 10);
                if (!isNaN(addItemId)) {
                    const action = { type: 'addItem', baseItemId: addItemId };
                    if (!isNaN(addItemAmount) && addItemAmount > 0) {
                        action.amount = addItemAmount;
                    }
                    onCloseActions.push(action);
                }
            }

            const acceptAction = {
                type: 'npcSay',
                message: acceptMsg || 'Quest accepted.'
            };
            if (onCloseActions.length > 0) {
                acceptAction.onClose = onCloseActions;
            }

            const detailsOptions = [
                {
                    text: detailsAcceptText,
                    action: acceptAction
                }
            ];
            if (detailsDeclineMsg) {
                detailsOptions.push({
                    text: detailsDeclineText,
                    action: {
                        type: 'npcSay',
                        message: detailsDeclineMsg
                    }
                });
            }

            const acceptFlow = detailsMessage
                ? {
                    type: 'npcSay',
                    message: detailsMessage,
                    options: detailsOptions
                }
                : acceptAction;

            const topOptions = [
                {
                    text: acceptText,
                    action: acceptFlow
                }
            ];

            if (declineMsg) {
                topOptions.push({
                    text: declineText,
                    action: {
                        type: 'npcSay',
                        message: declineMsg
                    }
                });
            }

            const script = {
                type: 'npcSay',
                message: introMsg,
                options: topOptions
            };

            if (requireNotStarted) {
                script.condition = {
                    type: 'quest',
                    quest: questId,
                    not: true
                };
            }

            if (elseMsg) {
                script.else = {
                    type: 'npcSay',
                    message: elseMsg
                };
            }

            appendToScript(JSON.stringify(script, null, 2));
            bootstrap.Modal.getInstance(document.getElementById('scriptBuilderModal')).hide();
        }

        function insertTele() {
            const m = document.getElementById('sbMap').value;
            const x = document.getElementById('sbX').value;
            const y = document.getElementById('sbY').value;
            const json = `
{
  "type": "teleport",
  "mapId": ${m},
  "x": ${x},
  "y": ${y}
}`;
             appendToScript(json);
             bootstrap.Modal.getInstance(document.getElementById('scriptBuilderModal')).hide();
        }

        function insertShop() {
            const raw = document.getElementById('sbShopItems').value;
            const items = raw.split(',').map(s => {
                const parts = s.split(':');
                return { itemId: parseInt(parts[0].trim()), price: parseInt(parts[1].trim()) };
            }).filter(i => !isNaN(i.itemId) && !isNaN(i.price));

            const json = `
{
  "type": "shop",
  "items": ${JSON.stringify(items, null, 2)}
}`;
            appendToScript(json);
            bootstrap.Modal.getInstance(document.getElementById('scriptBuilderModal')).hide();
        }

        function insertItemLogic() {
            const type = document.getElementById('sbItemAction').value;
            const id = document.getElementById('sbItemId').value;
            const count = document.getElementById('sbItemCount').value;

            let json = '';
            if (type === 'checkItem') {
                json = `
{
  "condition": {
    "type": "hasItem",
    "baseItemId": ${id},
    "amount": ${count}
  },
  "action": {
    "type": "npcSay",
    "message": "You have the required items."
  },
  "else": {
    "type": "npcSay",
    "message": "You do not have the required items."
  }
}`;
            } else {
                json = `
{
  "type": "${type}",
  "baseItemId": ${id},
  "amount": ${count}
}`;
            }
            appendToScript(json);
            bootstrap.Modal.getInstance(document.getElementById('scriptBuilderModal')).hide();
        }
        
        function insertFight() {
             // Use specific msg, or fallback to main speech msg, or default
             const fightMsg = document.getElementById('sbFightMsg').value;
             const mainMsg = document.getElementById('sbMessage').value;
             const msg = fightMsg || mainMsg || "Do you want to fight?";
             
             const template = document.getElementById('sbFightTemplate').value;
             
             const json = `{
  "type": "npcSay",
  "message": ${JSON.stringify(msg)},
  "options": [
      {
          "text": "Yes, I will fight!",
          "action": {
              "type": "template",
              "template": "${template}"
          }
      },
      {
          "text": "No, not right now.",
          "action": {
              "type": "npcSay",
              "message": "Come back when you are ready."
          }
      }
  ]
}`;
             appendToScript(json);
             bootstrap.Modal.getInstance(document.getElementById('scriptBuilderModal')).hide();
        }

        function appendToScript(snippet) {
            const el = document.getElementById('npcActionScript');
            let val = el.value.trim();
            if(val.startsWith('[') && val.endsWith(']')) {
                 val = val.substring(0, val.length - 1);
                 if(val.length > 1) val += ',';
                 val += snippet + ']';
            } else if (val === '') {
                 val = '[' + snippet + ']';
            } else {
                 val = '[' + val + ',' + snippet + ']';
            }
            el.value = val;
        }

        // Init
        const petForm = document.querySelector('#petModal form');
        if (petForm) {
            petForm.addEventListener('submit', () => {
                serializePetStructuredFields();
            });
        }
        const itemForm = document.querySelector('#itemModal form');
        if (itemForm) {
            itemForm.addEventListener('submit', () => {
                serializeItemStructuredFields();
            });
        }
        const itemIdInput = document.getElementById('itemId');
        if (itemIdInput) {
            itemIdInput.addEventListener('input', checkItemIdExists);
            itemIdInput.addEventListener('blur', checkItemIdExists);
        }
        resetResistRows();
        resetSkillRows();
        resetItemStatRows();
        resetItemActionRows();
        resetItemPropRows();
        const savedItemSearch = localStorage.getItem('itemSearch');
        if (savedItemSearch) {
            const searchInput = document.getElementById('itemSearch');
            if (searchInput) {
                searchInput.value = savedItemSearch;
                filterItems();
            }
        }
        if (!savedItemSearch) {
            renderItemPage(1);
        }
        loadMap(true);
        renderQuests();
    </script>
</body>
</html>

<?php
$fileId = intval($_GET['file'] ?? 0);
$frameIdx = intval($_GET['frame'] ?? 0);
$mode = $_GET['mode'] ?? 'image'; // 'image' or 'meta'

if ($fileId <= 0) exit;

$baseDir = __DIR__ . '/assets/img/npcs';

function getPngFrames(string $baseDir, int $fileId): array {
    $folders = glob($baseDir . "/Npc{$fileId}*", GLOB_ONLYDIR);
    if (empty($folders)) {
        $folders = glob($baseDir . "/npc{$fileId}*", GLOB_ONLYDIR);
    }

    if (empty($folders)) return [];

    sort($folders, SORT_NATURAL | SORT_FLAG_CASE);
    $folder = $folders[0];
    $frames = glob($folder . '/*.png');
    if (!$frames) return [];
    sort($frames, SORT_NATURAL | SORT_FLAG_CASE);
    return $frames;
}

$pngFrames = getPngFrames($baseDir, $fileId);
if (!empty($pngFrames)) {
    if ($mode === 'meta') {
        header('Content-Type: application/json');
        echo json_encode(['frames' => count($pngFrames), 'anim' => basename(dirname($pngFrames[0]))]);
        exit;
    }

    $frameIdx = $frameIdx % count($pngFrames);
    $pngPath = $pngFrames[$frameIdx];
    header('Content-Type: image/png');
    header("Cache-Control: public, max-age=3600");
    readfile($pngPath);
    exit;
}

if (!function_exists('imagecreatetruecolor')) {
    header("HTTP/1.0 500 Internal Server Error");
    die("GD Library is missing. Please enable php_gd extension.");
}
// Find file (Npc{ID}a.mda, ID.mda, etc)
$files = glob("$baseDir/Npc{$fileId}*.mda");
if (empty($files)) $files = glob("$baseDir/{$fileId}*.mda");
if (empty($files)) $files = glob("$baseDir/Npc{$fileId}*.MDA");

if (empty($files)) {
    if ($mode === 'meta') echo json_encode(['error' => 'File not found']);
    else { header("HTTP/1.0 404 Not Found"); }
    exit;
}

$mdaFile = $files[0];
$handle = fopen($mdaFile, 'rb');
if (!$handle) exit;

function readInt($h, $pos) {
    fseek($h, $pos);
    $d = fread($h, 4);
    if (strlen($d) < 4) return 0;
    return unpack('V', $d)[1];
}

// Verify Signature
fseek($handle, 0);
$sig = fread($handle, 15);
if ($sig !== 'RAYS MEDIA FILE') exit;

// Parse AnimData
$animDataStart = readInt($handle, 36);
// The length is at start of block?
// mda.ts: let animDataLength = mda.readUInt32LE(animDataStart);
// So at $animDataStart is the length (4 bytes).
$animDataLen = readInt($handle, $animDataStart);; 

fseek($handle, $animDataStart + 4);
if ($animDataLen > 0) {
    $rawAnim = fread($handle, $animDataLen);
} else {
    $rawAnim = '';
}

$anims = [];
$currentAnim = null;
$pos = 0;
$len = strlen($rawAnim);

while ($pos < $len - 1) { // Ensure at least 2 bytes exist
    $type = ord($rawAnim[$pos]);
    $size = ord($rawAnim[$pos+1]);
    
    if ($size < 3) { $pos += 2; continue; } // Safety
    
    // Name is at pos+2, len = size-3
    $nameLen = max(0, $size - 3);
    $text = substr($rawAnim, $pos + 2, $nameLen);
    // Remove null bytes
    $text = str_replace("\0", "", $text);
    
    if ($type === 1) { // New Anim
        $currentAnim = $text;
        $anims[$currentAnim] = [];
    } elseif ($type === 2 && $currentAnim !== null) { // Frame
        $anims[$currentAnim][] = $text;
    }
    
    $pos += $size;
}

// Select Animation
// Prefer option B (idle) before walking/stand
$selectedFrames = [];
$candidates = ['B1', 'B', 'Idle', 'Stand', 'S1', 'W1', 'Rest'];
foreach ($candidates as $c) {
    foreach ($anims as $name => $frames) {
        if (stripos($name, $c) !== false && !empty($frames)) {
            $selectedFrames = $frames;
            break 2;
        }
    }
}
if (empty($selectedFrames) && !empty($anims)) {
    // Pick first non-empty
    foreach ($anims as $frames) {
        if (!empty($frames)) {
            $selectedFrames = $frames;
            break;
        }
    }
}

// If no anim data found, fallback to scanning files?
// MDA usually has AnimData. If not, it might be just images.
// We'll proceed with selectedFrames.

if ($mode === 'meta') {
    header('Content-Type: application/json');
    echo json_encode([
        'frames' => count($selectedFrames),
        'anim' => array_key_first($anims) // approximate
    ]);
    fclose($handle);
    exit;
}

// Image Extraction
if (empty($selectedFrames)) {
    // Fallback: Just grab first RAYS file
    // Code from previous version...
    $targetName = null; // null means ANY
} else {
    // Wrap frame index
    $frameIdx = $frameIdx % count($selectedFrames);
    $targetName = $selectedFrames[$frameIdx];
}

// Scan file table to find $targetName
$fileCount = readInt($handle, 24);
$imgData = null;
$foundName = null;

for ($i = 0; $i < $fileCount; $i++) {
    $offset = 40 + $i * 40;
    fseek($handle, $offset);
    $entry = fread($handle, 40);
    
    // Name is first 32 bytes
    $fNameRaw = substr($entry, 0, 32);
    $nullPos = strpos($fNameRaw, "\0");
    $fName = $nullPos !== false ? substr($fNameRaw, 0, $nullPos) : $fNameRaw;
    $fName = trim($fName); // Trim whitespace
    
    // Check match (Case-insensitive)
    $isMatch = false;
    if ($targetName === null) {
        $isMatch = true; 
    } else {
        $targetNameClean = trim($targetName);
        if (strcasecmp($fName, $targetNameClean) === 0) {
            $isMatch = true;
        }
    }

    if (!$isMatch) continue;
    
    $loc = unpack('V', substr($entry, 32, 4))[1];
    $size = unpack('V', substr($entry, 36, 4))[1];

    // Optimization: Check for extracted PNG first
    $mdaBaseName = pathinfo($mdaFile, PATHINFO_FILENAME);
    $pngPath = "$baseDir/$mdaBaseName/$fName.png";
    
    if (file_exists($pngPath)) {
        // We found an extracted PNG. We still need CenterX/Y from MDA header.
        fseek($handle, $loc);
        $header = fread($handle, 32);
        if (substr($header, 0, 16) === 'RAYS IMG256 FILE') {
            $centerX = unpack('s', substr($header, 28, 2))[1];
            $centerY = unpack('s', substr($header, 30, 2))[1];
            
            $srcImg = @imagecreatefrompng($pngPath);
            if ($srcImg) {
                // Compose on Canvas
                // Use larger canvas
                $canvasW = 512; $canvasH = 512;
                $img = imagecreatetruecolor($canvasW, $canvasH);
                imagesavealpha($img, true);
                $trans = imagecolorallocatealpha($img, 0, 0, 0, 127);
                imagefill($img, 0, 0, $trans);
                
                $midX = $canvasW / 2;
                $midY = $canvasH / 2;
                $targetX = $midX - $centerX;
                $targetY = $midY - $centerY;
                
                imagecopy($img, $srcImg, $targetX, $targetY, 0, 0, imagesx($srcImg), imagesy($srcImg));
                
                header('Content-Type: image/png');
                header("Cache-Control: public, max-age=3600");
                imagepng($img);
                
                imagedestroy($img);
                imagedestroy($srcImg);
                fclose($handle);
                exit;
            }
        }
    }

    // Fallback: Read from MDA
    fseek($handle, $loc);
    $contents = fread($handle, $size);
    
    if (substr($contents, 0, 16) === 'RAYS IMG256 FILE') {
        $imgData = $contents;
        break;
    }
    
    // If we were looking for ANY image ($targetName == null), we persist until we find one.
    // If we were looking for SPECIFIC image and failed (e.g. invalid RAYS header), we continue? 
    // Usually if name matches, it should be the one.
    if ($targetName !== null) break;
}

// If we failed to find specific frame, FALLBACK to finding ANY valid image
if (!$imgData && $targetName !== null) {
    fseek($handle, 24); // Reset to count
    // Just re-scan for first valid image
    for ($i = 0; $i < $fileCount; $i++) {
        $offset = 40 + $i * 40;
        fseek($handle, $offset);
        $entry = fread($handle, 40);
        $loc = unpack('V', substr($entry, 32, 4))[1];
        $size = unpack('V', substr($entry, 36, 4))[1];
        fseek($handle, $loc);
        $contents = fread($handle, $size);
        if (substr($contents, 0, 16) === 'RAYS IMG256 FILE') {
             $imgData = $contents;
             break;
        }
    }
}

fclose($handle);

if (!$imgData) {
    // Return transparent 1x1
    $img = imagecreatetruecolor(1, 1);
    imagesavealpha($img, true);
    imagefill($img, 0, 0, imagecolorallocatealpha($img, 0,0,0,127));
    header('Content-Type: image/png');
    imagepng($img);
    exit;
}

// Parse Image Data
$width = unpack('v', substr($imgData, 20, 2))[1];
$height = unpack('v', substr($imgData, 22, 2))[1];
$centerX = unpack('s', substr($imgData, 28, 2))[1]; // signed short
$centerY = unpack('s', substr($imgData, 30, 2))[1]; 

// Create a centered canvas (standard size like 128x128 or larger)
// We want the anchor point to be at center of the output image.
$canvasW = 512;
$canvasH = 512;
$midX = $canvasW / 2;
$midY = $canvasH / 2;

$img = imagecreatetruecolor($canvasW, $canvasH);
imagesavealpha($img, true);
$trans = imagecolorallocatealpha($img, 0, 0, 0, 127);
imagefill($img, 0, 0, $trans);

$palette = substr($imgData, 0x24, 768);

// Draw pixels
// Target Pos = (midX - centerX) + x
//            = (midY - centerY) + y
$offsetX = $midX - $centerX;
$offsetY = $midY - $centerY;

$ptr = 0x328;
$len = strlen($imgData);
$pixelIdx = 0;

while ($ptr < $len && $pixelIdx < $width * $height) {
    $type = ord($imgData[$ptr++]);
    
    if ($type === 0xFE) { // Skip
        $count = ord($imgData[$ptr]) + (ord($imgData[$ptr+1]) << 8);
        $ptr += 2;
        $pixelIdx += $count;
    } elseif ($type === 0xFF) { // Copy
        $count = (ord($imgData[$ptr]) + (ord($imgData[$ptr+1]) << 8)) * 2;
        $ptr += 2;
        
        for ($k = 0; $k < $count; $k += 2) {
             if ($ptr + $k + 1 >= $len) break;
             $idx = ord($imgData[$ptr + $k]);
             $alpha = ord($imgData[$ptr + $k + 1]);
             

             // Coords
             $y = floor($pixelIdx / $width);
             $x = $pixelIdx % $width;
             
             $targetX = $x + $offsetX;
             $targetY = $y + $offsetY;
             
             if ($targetX >= 0 && $targetX < $canvasW && $targetY >= 0 && $targetY < $canvasH) {
                 $pal = $idx * 3;
                 $r = ord($palette[$pal]);
                 $g = ord($palette[$pal+1]);
                 $b = ord($palette[$pal+2]);
                 $a = 127 - floor($alpha / 2);
                 
                 $col = imagecolorallocatealpha($img, $r, $g, $b, $a);
                 imagesetpixel($img, $targetX, $targetY, $col);
             }
             $pixelIdx++;
        }
        $ptr += $count;
    } else {
        break; 
    }
}

header('Content-Type: image/png');
header("Cache-Control: public, max-age=3600"); // Cache for 1 hour
imagepng($img);
imagedestroy($img);
?>

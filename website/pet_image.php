<?php
$fileId = intval($_GET['file'] ?? 0);
$frameIdx = intval($_GET['frame'] ?? 0);
$mode = $_GET['mode'] ?? 'image'; // 'image' or 'meta'

if ($fileId <= 0) exit;

$baseDir = __DIR__ . '/assets/img/pets';

function serveImage(string $path): void {
    $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
    if ($ext === 'jpg' || $ext === 'jpeg') {
        header('Content-Type: image/jpeg');
    } else {
        header('Content-Type: image/png');
    }
    header("Cache-Control: public, max-age=3600");
    readfile($path);
    exit;
}

$padded3 = str_pad((string)$fileId, 3, '0', STR_PAD_LEFT);
$padded4 = str_pad((string)$fileId, 4, '0', STR_PAD_LEFT);
$simpleCandidates = [
    "$baseDir/{$fileId}.png",
    "$baseDir/{$fileId}.jpg",
    "$baseDir/Pet{$fileId}.png",
    "$baseDir/Pet{$fileId}.jpg",
    "$baseDir/pet{$fileId}.png",
    "$baseDir/pet{$fileId}.jpg",
    "$baseDir/{$padded3}.png",
    "$baseDir/{$padded3}.jpg",
    "$baseDir/Pet{$padded3}.png",
    "$baseDir/Pet{$padded3}.jpg",
    "$baseDir/pet{$padded3}.png",
    "$baseDir/pet{$padded3}.jpg",
    "$baseDir/{$padded4}.png",
    "$baseDir/{$padded4}.jpg",
    "$baseDir/Pet{$padded4}.png",
    "$baseDir/Pet{$padded4}.jpg",
    "$baseDir/pet{$padded4}.png",
    "$baseDir/pet{$padded4}.jpg",
];

foreach ($simpleCandidates as $candidate) {
    if (file_exists($candidate)) {
        if ($mode === 'meta') {
            header('Content-Type: application/json');
            echo json_encode(['frames' => 1, 'anim' => basename($candidate)]);
            exit;
        }
        serveImage($candidate);
    }
}

function getPngFrames(string $baseDir, int $fileId): array {
    $folders = glob($baseDir . "/Pet{$fileId}*", GLOB_ONLYDIR);
    if (empty($folders)) {
        $folders = glob($baseDir . "/pet{$fileId}*", GLOB_ONLYDIR);
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

$files = glob("$baseDir/Pet{$fileId}*.mda");
if (empty($files)) $files = glob("$baseDir/{$fileId}*.mda");
if (empty($files)) $files = glob("$baseDir/Pet{$fileId}*.MDA");

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

fseek($handle, 0);
$sig = fread($handle, 15);
if ($sig !== 'RAYS MEDIA FILE') exit;

$animDataStart = readInt($handle, 36);
$animDataLen = readInt($handle, $animDataStart);

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

while ($pos < $len - 1) {
    $type = ord($rawAnim[$pos]);
    $size = ord($rawAnim[$pos+1]);

    if ($size < 3) { $pos += 2; continue; }

    $nameLen = max(0, $size - 3);
    $text = substr($rawAnim, $pos + 2, $nameLen);
    $text = str_replace("\0", "", $text);

    if ($type === 1) {
        $currentAnim = $text;
        $anims[$currentAnim] = [];
    } elseif ($type === 2 && $currentAnim !== null) {
        $anims[$currentAnim][] = $text;
    }

    $pos += $size;
}

$selectedFrames = [];
$candidates = ['Stand', 'S1', 'W1', 'Rest', 'Idle'];
foreach ($candidates as $c) {
    foreach ($anims as $name => $frames) {
        if (stripos($name, $c) !== false && !empty($frames)) {
            $selectedFrames = $frames;
            break 2;
        }
    }
}
if (empty($selectedFrames) && !empty($anims)) {
    foreach ($anims as $frames) {
        if (!empty($frames)) {
            $selectedFrames = $frames;
            break;
        }
    }
}

if ($mode === 'meta') {
    header('Content-Type: application/json');
    echo json_encode([
        'frames' => count($selectedFrames),
        'anim' => array_key_first($anims)
    ]);
    fclose($handle);
    exit;
}

if (empty($selectedFrames)) {
    $targetName = null;
} else {
    $frameIdx = $frameIdx % count($selectedFrames);
    $targetName = $selectedFrames[$frameIdx];
}

$fileCount = readInt($handle, 24);
$imgData = null;
$foundName = null;

for ($i = 0; $i < $fileCount; $i++) {
    $offset = 40 + $i * 40;
    fseek($handle, $offset);
    $entry = fread($handle, 40);

    $fNameRaw = substr($entry, 0, 32);
    $nullPos = strpos($fNameRaw, "\0");
    $fName = $nullPos !== false ? substr($fNameRaw, 0, $nullPos) : $fNameRaw;
    $fName = trim($fName);

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

    $mdaBaseName = pathinfo($mdaFile, PATHINFO_FILENAME);
    $pngPath = "$baseDir/$mdaBaseName/$fName.png";

    if (file_exists($pngPath)) {
        fseek($handle, $loc);
        $header = fread($handle, 32);
        $centerX = unpack('V', substr($header, 20, 4))[1];
        $centerY = unpack('V', substr($header, 24, 4))[1];
        $imgWidth = unpack('V', substr($header, 8, 4))[1];
        $imgHeight = unpack('V', substr($header, 12, 4))[1];
        $imgData = ['path' => $pngPath, 'width' => $imgWidth, 'height' => $imgHeight, 'centerX' => $centerX, 'centerY' => $centerY];
        break;
    }

    fseek($handle, $loc);
    $header = fread($handle, 32);
    $imgWidth = unpack('V', substr($header, 8, 4))[1];
    $imgHeight = unpack('V', substr($header, 12, 4))[1];
    $centerX = unpack('V', substr($header, 20, 4))[1];
    $centerY = unpack('V', substr($header, 24, 4))[1];

    $rawSize = $size - 32;
    $rawData = fread($handle, $rawSize);

    $imgData = [
        'raw' => $rawData,
        'width' => $imgWidth,
        'height' => $imgHeight,
        'centerX' => $centerX,
        'centerY' => $centerY
    ];
    $foundName = $fName;
    break;
}

fclose($handle);

if (!$imgData) {
    header("HTTP/1.0 404 Not Found");
    exit;
}

if (isset($imgData['path'])) {
    header('Content-Type: image/png');
    header("Cache-Control: public, max-age=3600");
    readfile($imgData['path']);
    exit;
}

$img = imagecreatetruecolor($imgData['width'], $imgData['height']);
imagesavealpha($img, true);
$trans = imagecolorallocatealpha($img, 0, 0, 0, 127);
imagefill($img, 0, 0, $trans);

$pixelData = $imgData['raw'];
$pos = 0;
for ($y = 0; $y < $imgData['height']; $y++) {
    for ($x = 0; $x < $imgData['width']; $x++) {
        if ($pos + 3 >= strlen($pixelData)) break;
        $r = ord($pixelData[$pos]);
        $g = ord($pixelData[$pos + 1]);
        $b = ord($pixelData[$pos + 2]);
        $a = 127 - intdiv(ord($pixelData[$pos + 3]), 2);
        $color = imagecolorallocatealpha($img, $r, $g, $b, $a);
        imagesetpixel($img, $x, $y, $color);
        $pos += 4;
    }
}

header('Content-Type: image/png');
imagepng($img);
imagedestroy($img);

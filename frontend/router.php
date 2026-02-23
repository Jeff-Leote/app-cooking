<?php

declare(strict_types=1);

$publicDir = __DIR__ . DIRECTORY_SEPARATOR . 'public';
$requestPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$decodedPath = rawurldecode($requestPath);

// Handle simple health checks without booting Symfony.
if ($decodedPath === '/health' || $decodedPath === '/healthz') {
    http_response_code(200);
    header('Content-Type: text/plain; charset=utf-8');
    echo 'ok';
    return true;
}

// Normalize path and guard against traversal.
$relativePath = ltrim($decodedPath, '/');
$candidatePath = $publicDir . DIRECTORY_SEPARATOR . str_replace(['/', '\\'], DIRECTORY_SEPARATOR, $relativePath);
$realPath = realpath($candidatePath);

if ($realPath !== false && str_starts_with($realPath, $publicDir)) {
    if (is_file($realPath)) {
        // Let PHP built-in server serve static files (css/js/images/build assets).
        return false;
    }

    // If request targets a directory with index files, serve them directly.
    if (is_dir($realPath)) {
        foreach (['index.php', 'index.html'] as $indexFile) {
            $indexPath = $realPath . DIRECTORY_SEPARATOR . $indexFile;
            if (is_file($indexPath)) {
                $_SERVER['SCRIPT_NAME'] = '/' . trim($relativePath . '/' . $indexFile, '/');
                require $indexPath;
                return true;
            }
        }
    }
}

// Route all non-static requests through Symfony front controller.
$_SERVER['SCRIPT_NAME'] = '/index.php';
$_SERVER['PHP_SELF'] = '/index.php';
$_SERVER['SCRIPT_FILENAME'] = $publicDir . DIRECTORY_SEPARATOR . 'index.php';

require $publicDir . DIRECTORY_SEPARATOR . 'index.php';
return true;

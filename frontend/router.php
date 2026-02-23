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

// Proxy all /api/* calls to the backend service (same behavior as local nginx reverse-proxy).
if (str_starts_with($decodedPath, '/api/')) {
    $backendBaseUrl = rtrim(
        $_ENV['APP_BACKEND_URL'] ?? $_SERVER['APP_BACKEND_URL'] ?? 'http://backend:3000',
        '/'
    );
    $queryString = $_SERVER['QUERY_STRING'] ?? '';
    $targetUrl = $backendBaseUrl . $decodedPath . ($queryString !== '' ? '?' . $queryString : '');

    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    $body = file_get_contents('php://input') ?: '';

    // Build request headers from $_SERVER to stay compatible with php built-in server.
    $forwardHeaders = [];
    foreach ($_SERVER as $key => $value) {
        if (!str_starts_with($key, 'HTTP_') || !is_string($value)) {
            continue;
        }

        $headerName = str_replace('_', '-', substr($key, 5));
        if ($headerName === 'HOST' || $headerName === 'CONNECTION' || $headerName === 'CONTENT-LENGTH') {
            continue;
        }
        $forwardHeaders[] = $headerName . ': ' . $value;
    }

    if (($contentType = $_SERVER['CONTENT_TYPE'] ?? null) && is_string($contentType) && $contentType !== '') {
        $forwardHeaders[] = 'CONTENT-TYPE: ' . $contentType;
    }

    $context = stream_context_create([
        'http' => [
            'method' => $method,
            'header' => implode("\r\n", $forwardHeaders),
            'content' => $body,
            'ignore_errors' => true,
            'timeout' => 30,
        ],
    ]);

    $responseBody = @file_get_contents($targetUrl, false, $context);
    $responseHeaders = $http_response_header ?? [];

    $statusCode = 502;
    foreach ($responseHeaders as $headerLine) {
        if (preg_match('#^HTTP/\S+\s+(\d{3})#', $headerLine, $matches)) {
            $statusCode = (int) $matches[1];
            break;
        }
    }
    http_response_code($statusCode);

    foreach ($responseHeaders as $headerLine) {
        if (stripos($headerLine, 'HTTP/') === 0) {
            continue;
        }
        // Skip hop-by-hop headers.
        if (stripos($headerLine, 'Transfer-Encoding:') === 0 ||
            stripos($headerLine, 'Connection:') === 0 ||
            stripos($headerLine, 'Content-Length:') === 0) {
            continue;
        }
        header($headerLine, false);
    }

    if ($responseBody !== false) {
        echo $responseBody;
    }
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

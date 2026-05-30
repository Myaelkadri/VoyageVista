<?php

declare(strict_types=1);

function sendJson(mixed $data, int $statusCode = 200): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function sendError(string $message, int $statusCode = 400): void
{
    sendJson([
        'success' => false,
        'message' => $message,
    ], $statusCode);
}

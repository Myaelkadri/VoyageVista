<?php

declare(strict_types=1);

function startUserSession(): void
{
    if (session_status() === PHP_SESSION_NONE) {
        session_set_cookie_params([
            'lifetime' => 0,
            'path' => '/VoyageVista',
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
        session_start();
    }
}

function getCurrentUser(): ?array
{
    startUserSession();
    return $_SESSION['user'] ?? null;
}

function requireUser(): array
{
    $user = getCurrentUser();

    if (!$user) {
        sendError('Connexion requise.', 401);
    }

    return $user;
}

function requireRole(string|array $roles): array
{
    $user = requireUser();
    $allowedRoles = is_array($roles) ? $roles : [$roles];

    if (!in_array($user['role'], $allowedRoles, true)) {
        sendError('Accès refusé.', 403);
    }

    return $user;
}

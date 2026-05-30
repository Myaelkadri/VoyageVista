<?php

declare(strict_types=1);

function startUserSession(): void
{
    if (session_status() === PHP_SESSION_NONE) {
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

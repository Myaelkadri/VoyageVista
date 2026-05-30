<?php

declare(strict_types=1);

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/session.php';

startUserSession();
$_SESSION = [];
session_destroy();

sendJson([
    'success' => true,
    'message' => 'Déconnexion réussie.',
]);

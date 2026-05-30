<?php

declare(strict_types=1);

require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/session.php';

$user = getCurrentUser();

sendJson([
    'success' => true,
    'user' => $user,
    'isLoggedIn' => $user !== null,
]);

<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';

try {
    $pdo = getDatabaseConnection();
    $statement = $pdo->query(
        'SELECT id_destination, nom_destination, pays, continent, description, image, budget_min, budget_max
         FROM destination
         ORDER BY nom_destination'
    );

    sendJson([
        'success' => true,
        'data' => $statement->fetchAll(),
    ]);
} catch (Throwable $error) {
    sendError('Impossible de charger les destinations.', 500);
}

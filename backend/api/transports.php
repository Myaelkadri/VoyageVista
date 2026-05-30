<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';

try {
    $pdo = getDatabaseConnection();
    $statement = $pdo->query(
        'SELECT t.id_transport, t.type_transport, t.compagnie, t.ville_depart, t.ville_arrivee,
                t.date_depart, t.date_arrivee, t.prix, t.classe, t.places_disponibles,
                d.nom_destination, d.pays
         FROM transport t
         INNER JOIN destination d ON d.id_destination = t.id_destination
         ORDER BY t.date_depart'
    );

    sendJson([
        'success' => true,
        'data' => $statement->fetchAll(),
    ]);
} catch (Throwable $error) {
    sendError('Impossible de charger les transports.', 500);
}

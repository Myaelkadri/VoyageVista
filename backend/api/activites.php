<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';

try {
    $pdo = getDatabaseConnection();
    $statement = $pdo->query(
        'SELECT a.id_activite, a.nom_activite, a.categorie, a.description, a.prix, a.duree,
                a.capacite_max, a.places_disponibles, a.date_activite,
                a.id_destination,
                d.nom_destination, d.pays
         FROM activite a
         INNER JOIN destination d ON d.id_destination = a.id_destination
         ORDER BY a.date_activite'
    );

    sendJson([
        'success' => true,
        'data' => $statement->fetchAll(),
    ]);
} catch (Throwable $error) {
    sendError('Impossible de charger les activites.', 500);
}

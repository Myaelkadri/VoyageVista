<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';

try {
    $pdo = getDatabaseConnection();
    $statement = $pdo->query(
        'SELECT h.id_hebergement, h.nom_hebergement, h.type_hebergement, h.description, h.adresse,
                h.prix_nuit, h.capacite, h.nombre_etoiles, h.equipements, h.disponibilite,
                h.id_destination,
                d.nom_destination, d.pays
         FROM hebergement h
         INNER JOIN destination d ON d.id_destination = h.id_destination
         ORDER BY h.prix_nuit'
    );

    sendJson([
        'success' => true,
        'data' => $statement->fetchAll(),
    ]);
} catch (Throwable $error) {
    sendError('Impossible de charger les hebergements.', 500);
}

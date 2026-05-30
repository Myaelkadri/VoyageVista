<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';

$id = (int) ($_GET['id'] ?? 1);

try {
    $pdo = getDatabaseConnection();

    $destinationStatement = $pdo->prepare(
        'SELECT id_destination, nom_destination, pays, continent, description, image, budget_min, budget_max
         FROM destination
         WHERE id_destination = :id
         LIMIT 1'
    );
    $destinationStatement->execute(['id' => $id]);
    $destination = $destinationStatement->fetch();

    if (!$destination) {
        sendError('Destination introuvable.', 404);
    }

    $hebergements = $pdo->prepare(
        'SELECT id_hebergement, nom_hebergement, type_hebergement, description, prix_nuit, capacite, nombre_etoiles
         FROM hebergement
         WHERE id_destination = :id
         ORDER BY prix_nuit
         LIMIT 3'
    );
    $hebergements->execute(['id' => $id]);

    $transports = $pdo->prepare(
        'SELECT id_transport, type_transport, compagnie, ville_depart, ville_arrivee, prix, classe
         FROM transport
         WHERE id_destination = :id
         ORDER BY prix
         LIMIT 3'
    );
    $transports->execute(['id' => $id]);

    $activites = $pdo->prepare(
        'SELECT id_activite, nom_activite, categorie, description, prix, duree
         FROM activite
         WHERE id_destination = :id
         ORDER BY prix
         LIMIT 3'
    );
    $activites->execute(['id' => $id]);

    sendJson([
        'success' => true,
        'data' => [
            'destination' => $destination,
            'hebergements' => $hebergements->fetchAll(),
            'transports' => $transports->fetchAll(),
            'activites' => $activites->fetchAll(),
        ],
    ]);
} catch (Throwable $error) {
    sendError('Impossible de charger la destination.', 500);
}

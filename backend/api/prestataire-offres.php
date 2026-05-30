<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/session.php';

$user = requireRole('prestataire');

try {
    $pdo = getDatabaseConnection();

    $hebergements = $pdo->prepare(
        'SELECT h.id_hebergement AS id, "hebergement" AS type, h.nom_hebergement AS titre,
                h.prix_nuit AS prix, d.nom_destination
         FROM hebergement h
         INNER JOIN destination d ON d.id_destination = h.id_destination
         WHERE h.id_prestataire = :id'
    );
    $hebergements->execute(['id' => $user['id']]);

    $transports = $pdo->prepare(
        'SELECT t.id_transport AS id, "transport" AS type,
                CONCAT(t.ville_depart, " → ", t.ville_arrivee) AS titre,
                t.prix, d.nom_destination
         FROM transport t
         INNER JOIN destination d ON d.id_destination = t.id_destination
         WHERE t.id_prestataire = :id'
    );
    $transports->execute(['id' => $user['id']]);

    $activites = $pdo->prepare(
        'SELECT a.id_activite AS id, "activite" AS type, a.nom_activite AS titre,
                a.prix, d.nom_destination
         FROM activite a
         INNER JOIN destination d ON d.id_destination = a.id_destination
         WHERE a.id_prestataire = :id'
    );
    $activites->execute(['id' => $user['id']]);

    sendJson([
        'success' => true,
        'data' => array_merge($hebergements->fetchAll(), $transports->fetchAll(), $activites->fetchAll()),
    ]);
} catch (Throwable $error) {
    sendError('Impossible de charger les offres prestataire.', 500);
}

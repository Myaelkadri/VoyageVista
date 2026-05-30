<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/session.php';

$user = requireRole('voyageur');

try {
    $pdo = getDatabaseConnection();
    $statement = $pdo->prepare(
        'SELECT r.id_reservation, r.reference_reservation, r.date_reservation,
                r.statut_reservation, r.montant_total,
                i.id_itineraire, i.titre, i.date_debut, i.date_fin, i.statut
         FROM reservation r
         INNER JOIN itineraire i ON i.id_itineraire = r.id_itineraire
         WHERE r.id_voyageur = :id_voyageur
         ORDER BY r.date_reservation DESC'
    );
    $statement->execute(['id_voyageur' => $user['id']]);

    sendJson([
        'success' => true,
        'data' => $statement->fetchAll(),
    ]);
} catch (Throwable $error) {
    sendError('Impossible de charger le panier.', 500);
}

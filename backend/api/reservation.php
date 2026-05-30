<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/session.php';

$user = requireRole('voyageur');
$reservationId = (int) ($_GET['id'] ?? 0);

if ($reservationId <= 0) {
    sendError('Réservation invalide.');
}

try {
    $pdo = getDatabaseConnection();
    $statement = $pdo->prepare(
        'SELECT r.id_reservation, r.reference_reservation, r.date_reservation,
                r.statut_reservation, r.montant_total,
                i.titre, i.date_debut, i.date_fin
         FROM reservation r
         INNER JOIN itineraire i ON i.id_itineraire = r.id_itineraire
         WHERE r.id_reservation = :id_reservation
           AND r.id_voyageur = :id_voyageur
         LIMIT 1'
    );
    $statement->execute([
        'id_reservation' => $reservationId,
        'id_voyageur' => $user['id'],
    ]);
    $reservation = $statement->fetch();

    if (!$reservation) {
        sendError('Réservation introuvable.', 404);
    }

    sendJson([
        'success' => true,
        'data' => $reservation,
    ]);
} catch (Throwable $error) {
    sendError('Impossible de charger la confirmation.', 500);
}

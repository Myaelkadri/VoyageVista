<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Méthode non autorisée.', 405);
}

$user = requireRole('voyageur');
$reservationId = (int) ($_POST['id_reservation'] ?? 0);

if ($reservationId <= 0) {
    sendError('Réservation invalide.');
}

try {
    $pdo = getDatabaseConnection();
    $pdo->beginTransaction();

    $statement = $pdo->prepare(
        'SELECT id_itineraire
         FROM reservation
         WHERE id_reservation = :id_reservation
           AND id_voyageur = :id_voyageur
           AND statut_reservation = "en_attente"
         LIMIT 1'
    );
    $statement->execute([
        'id_reservation' => $reservationId,
        'id_voyageur' => $user['id'],
    ]);
    $reservation = $statement->fetch();

    if (!$reservation) {
        sendError('Réservation introuvable ou déjà confirmée.', 404);
    }

    $deleteReservation = $pdo->prepare('DELETE FROM reservation WHERE id_reservation = :id');
    $deleteReservation->execute(['id' => $reservationId]);

    $deleteItineraire = $pdo->prepare('DELETE FROM itineraire WHERE id_itineraire = :id');
    $deleteItineraire->execute(['id' => $reservation['id_itineraire']]);

    $pdo->commit();

    sendJson([
        'success' => true,
        'message' => 'Voyage retiré du panier.',
    ]);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    sendError('Impossible de supprimer la réservation.', 500);
}

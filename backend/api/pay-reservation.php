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
$cardName = trim((string) ($_POST['card_name'] ?? ''));
$cardNumber = preg_replace('/\D+/', '', (string) ($_POST['card_number'] ?? ''));
$expiry = trim((string) ($_POST['expiry'] ?? ''));
$cvc = preg_replace('/\D+/', '', (string) ($_POST['cvc'] ?? ''));

if ($reservationId <= 0 || $cardName === '' || strlen($cardNumber) < 12 || $expiry === '' || strlen($cvc) < 3) {
    sendError('Informations de paiement invalides.');
}

try {
    $pdo = getDatabaseConnection();
    $pdo->beginTransaction();

    $statement = $pdo->prepare(
        'SELECT id_reservation, montant_total, id_itineraire
         FROM reservation
         WHERE id_reservation = :id_reservation
           AND id_voyageur = :id_voyageur
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

    $payment = $pdo->prepare(
        'INSERT INTO paiement (montant, mode_paiement, statut_paiement, id_reservation)
         VALUES (:montant, :mode_paiement, :statut_paiement, :id_reservation)'
    );
    $payment->execute([
        'montant' => $reservation['montant_total'],
        'mode_paiement' => 'carte bancaire',
        'statut_paiement' => 'accepte',
        'id_reservation' => $reservationId,
    ]);

    $updateReservation = $pdo->prepare(
        'UPDATE reservation
         SET statut_reservation = "confirmee"
         WHERE id_reservation = :id'
    );
    $updateReservation->execute(['id' => $reservationId]);

    $updateItineraire = $pdo->prepare(
        'UPDATE itineraire
         SET statut = "valide"
         WHERE id_itineraire = :id'
    );
    $updateItineraire->execute(['id' => $reservation['id_itineraire']]);

    $notification = $pdo->prepare(
        'INSERT INTO notification (titre, message, type_notification, id_utilisateur)
         VALUES (:titre, :message, :type_notification, :id_utilisateur)'
    );
    $notification->execute([
        'titre' => 'Paiement confirmé',
        'message' => 'Votre paiement a été accepté et votre réservation est confirmée.',
        'type_notification' => 'paiement',
        'id_utilisateur' => $user['id'],
    ]);

    $pdo->commit();

    sendJson([
        'success' => true,
        'message' => 'Paiement accepté. Réservation confirmée.',
    ]);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    sendError('Impossible de valider le paiement.', 500);
}

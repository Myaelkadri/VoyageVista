<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Methode non autorisee.', 405);
}

$user = requireRole('voyageur');
$reservationId = (int) ($_POST['id_reservation'] ?? 0);

if ($reservationId <= 0) {
    sendError('Reservation invalide.');
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
        sendError('Reservation introuvable ou deja confirmee.', 404);
    }

    $transports = $pdo->prepare('SELECT id_transport FROM itineraire_transport WHERE id_itineraire = :id');
    $transports->execute(['id' => $reservation['id_itineraire']]);
    foreach ($transports->fetchAll() as $transport) {
        $pdo->prepare('UPDATE transport SET places_disponibles = places_disponibles + 1 WHERE id_transport = :id')
            ->execute(['id' => $transport['id_transport']]);
    }

    $hebergements = $pdo->prepare('SELECT id_hebergement FROM itineraire_hebergement WHERE id_itineraire = :id');
    $hebergements->execute(['id' => $reservation['id_itineraire']]);
    foreach ($hebergements->fetchAll() as $hebergement) {
        $pdo->prepare('UPDATE hebergement SET disponibilite = 1 WHERE id_hebergement = :id')
            ->execute(['id' => $hebergement['id_hebergement']]);
    }

    $activites = $pdo->prepare('SELECT id_activite, nombre_participants FROM itineraire_activite WHERE id_itineraire = :id');
    $activites->execute(['id' => $reservation['id_itineraire']]);
    foreach ($activites->fetchAll() as $activite) {
        $pdo->prepare('UPDATE activite SET places_disponibles = places_disponibles + :participants WHERE id_activite = :id')
            ->execute([
                'participants' => $activite['nombre_participants'],
                'id' => $activite['id_activite'],
            ]);
    }

    $deleteReservation = $pdo->prepare('DELETE FROM reservation WHERE id_reservation = :id');
    $deleteReservation->execute(['id' => $reservationId]);

    $deleteItineraire = $pdo->prepare('DELETE FROM itineraire WHERE id_itineraire = :id');
    $deleteItineraire->execute(['id' => $reservation['id_itineraire']]);

    $pdo->commit();

    sendJson([
        'success' => true,
        'message' => 'Voyage retire du panier.',
    ]);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    sendError('Impossible de supprimer la reservation.', 500);
}

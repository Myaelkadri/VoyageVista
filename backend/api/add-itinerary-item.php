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
$type = (string) ($_POST['type'] ?? '');
$itemId = (int) ($_POST['id_item'] ?? 0);

if ($reservationId <= 0 || $itemId <= 0 || !in_array($type, ['transport', 'hebergement', 'activite'], true)) {
    sendError('Choix invalide.');
}

try {
    $pdo = getDatabaseConnection();
    $pdo->beginTransaction();

    $reservationStatement = $pdo->prepare(
        'SELECT r.id_reservation, r.id_itineraire, i.date_debut, i.date_fin
         FROM reservation r
         INNER JOIN itineraire i ON i.id_itineraire = r.id_itineraire
         WHERE r.id_reservation = :reservation
           AND r.id_voyageur = :voyageur
           AND r.statut_reservation = "en_attente"
         LIMIT 1'
    );
    $reservationStatement->execute([
        'reservation' => $reservationId,
        'voyageur' => $user['id'],
    ]);
    $reservation = $reservationStatement->fetch();

    if (!$reservation) {
        sendError('Réservation introuvable ou déjà confirmée.', 404);
    }

    $price = 0.0;

    if ($type === 'transport') {
        $item = $pdo->prepare('SELECT prix FROM transport WHERE id_transport = :id LIMIT 1');
        $item->execute(['id' => $itemId]);
        $price = (float) $item->fetchColumn();

        $insert = $pdo->prepare(
            'INSERT IGNORE INTO itineraire_transport (id_itineraire, id_transport)
             VALUES (:itineraire, :transport)'
        );
        $insert->execute([
            'itineraire' => $reservation['id_itineraire'],
            'transport' => $itemId,
        ]);
    }

    if ($type === 'hebergement') {
        $item = $pdo->prepare('SELECT prix_nuit FROM hebergement WHERE id_hebergement = :id LIMIT 1');
        $item->execute(['id' => $itemId]);
        $price = (float) $item->fetchColumn();

        $insert = $pdo->prepare(
            'INSERT IGNORE INTO itineraire_hebergement (id_itineraire, id_hebergement, date_debut, date_fin)
             VALUES (:itineraire, :hebergement, :date_debut, :date_fin)'
        );
        $insert->execute([
            'itineraire' => $reservation['id_itineraire'],
            'hebergement' => $itemId,
            'date_debut' => $reservation['date_debut'],
            'date_fin' => $reservation['date_fin'],
        ]);
    }

    if ($type === 'activite') {
        $item = $pdo->prepare('SELECT prix FROM activite WHERE id_activite = :id LIMIT 1');
        $item->execute(['id' => $itemId]);
        $price = (float) $item->fetchColumn();

        $insert = $pdo->prepare(
            'INSERT IGNORE INTO itineraire_activite (id_itineraire, id_activite, nombre_participants)
             VALUES (:itineraire, :activite, :participants)'
        );
        $insert->execute([
            'itineraire' => $reservation['id_itineraire'],
            'activite' => $itemId,
            'participants' => 1,
        ]);
    }

    if ($price <= 0) {
        sendError('Option introuvable.', 404);
    }

    if ($insert->rowCount() > 0) {
        $updateItineraire = $pdo->prepare(
            'UPDATE itineraire SET prix_total = prix_total + :price WHERE id_itineraire = :id'
        );
        $updateItineraire->execute([
            'price' => $price,
            'id' => $reservation['id_itineraire'],
        ]);

        $updateReservation = $pdo->prepare(
            'UPDATE reservation SET montant_total = montant_total + :price WHERE id_reservation = :id'
        );
        $updateReservation->execute([
            'price' => $price,
            'id' => $reservationId,
        ]);
    }

    $pdo->commit();

    sendJson([
        'success' => true,
        'message' => 'Option ajoutée au séjour.',
        'price' => $price,
    ]);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    sendError("Impossible d'ajouter cette option.", 500);
}

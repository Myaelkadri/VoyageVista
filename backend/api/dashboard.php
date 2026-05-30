<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/session.php';

$user = requireUser();

try {
    $pdo = getDatabaseConnection();

    $reservations = $pdo->prepare(
        'SELECT r.reference_reservation, r.statut_reservation, r.montant_total,
                i.titre, i.date_debut, i.date_fin
         FROM reservation r
         INNER JOIN itineraire i ON i.id_itineraire = r.id_itineraire
         WHERE r.id_voyageur = :id
         ORDER BY r.date_reservation DESC'
    );
    $reservations->execute(['id' => $user['id']]);

    $notifications = $pdo->prepare(
        'SELECT titre, message, type_notification, statut_lecture, date_envoi
         FROM notification
         WHERE id_utilisateur = :id
         ORDER BY date_envoi DESC'
    );
    $notifications->execute(['id' => $user['id']]);

    $favoris = $pdo->prepare(
        'SELECT type_element, id_element, date_ajout
         FROM favori
         WHERE id_voyageur = :id
         ORDER BY date_ajout DESC'
    );
    $favoris->execute(['id' => $user['id']]);

    sendJson([
        'success' => true,
        'data' => [
            'user' => $user,
            'reservations' => $reservations->fetchAll(),
            'notifications' => $notifications->fetchAll(),
            'favoris' => $favoris->fetchAll(),
        ],
    ]);
} catch (Throwable $error) {
    sendError('Impossible de charger le tableau de bord.', 500);
}

<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/session.php';

requireRole('admin');

try {
    $pdo = getDatabaseConnection();

    $counts = [];
    foreach (['utilisateur', 'destination', 'hebergement', 'transport', 'activite', 'reservation'] as $table) {
        $counts[$table] = (int) $pdo->query("SELECT COUNT(*) FROM {$table}")->fetchColumn();
    }

    $users = $pdo->query(
        'SELECT id_utilisateur, nom, prenom, email, role, statut_compte, date_creation
         FROM utilisateur
         ORDER BY date_creation DESC'
    )->fetchAll();

    $reservations = $pdo->query(
        'SELECT r.reference_reservation, r.statut_reservation, r.montant_total,
                u.email, i.titre
         FROM reservation r
         INNER JOIN utilisateur u ON u.id_utilisateur = r.id_voyageur
         INNER JOIN itineraire i ON i.id_itineraire = r.id_itineraire
         ORDER BY r.date_reservation DESC'
    )->fetchAll();

    sendJson([
        'success' => true,
        'data' => [
            'counts' => $counts,
            'users' => $users,
            'reservations' => $reservations,
        ],
    ]);
} catch (Throwable $error) {
    sendError("Impossible de charger l'administration.", 500);
}

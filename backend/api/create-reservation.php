<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Méthode non autorisée.', 405);
}

$user = requireUser();
$destinationId = (int) ($_POST['id_destination'] ?? 0);
$dateDebut = $_POST['depart'] ?? null;
$dateFin = $_POST['retour'] ?? null;

if ($destinationId <= 0 || !$dateDebut || !$dateFin) {
    sendError('Destination et dates obligatoires.');
}

try {
    $pdo = getDatabaseConnection();
    $pdo->beginTransaction();

    $destination = $pdo->prepare(
        'SELECT nom_destination, budget_min
         FROM destination
         WHERE id_destination = :id
         LIMIT 1'
    );
    $destination->execute(['id' => $destinationId]);
    $destinationData = $destination->fetch();

    if (!$destinationData) {
        sendError('Destination introuvable.', 404);
    }

    $titre = 'Séjour ' . $destinationData['nom_destination'];
    $montant = (float) $destinationData['budget_min'];

    $itineraire = $pdo->prepare(
        'INSERT INTO itineraire (titre, date_debut, date_fin, statut, prix_total, id_voyageur)
         VALUES (:titre, :date_debut, :date_fin, :statut, :prix_total, :id_voyageur)'
    );
    $itineraire->execute([
        'titre' => $titre,
        'date_debut' => $dateDebut,
        'date_fin' => $dateFin,
        'statut' => 'brouillon',
        'prix_total' => $montant,
        'id_voyageur' => $user['id'],
    ]);

    $itineraireId = (int) $pdo->lastInsertId();
    $reference = 'VV-' . date('Ymd') . '-' . str_pad((string) $itineraireId, 4, '0', STR_PAD_LEFT);

    $reservation = $pdo->prepare(
        'INSERT INTO reservation (reference_reservation, statut_reservation, montant_total, id_voyageur, id_itineraire)
         VALUES (:reference, :statut, :montant, :id_voyageur, :id_itineraire)'
    );
    $reservation->execute([
        'reference' => $reference,
        'statut' => 'en_attente',
        'montant' => $montant,
        'id_voyageur' => $user['id'],
        'id_itineraire' => $itineraireId,
    ]);

    $pdo->commit();

    sendJson([
        'success' => true,
        'message' => 'Voyage ajouté au panier.',
        'reference' => $reference,
    ], 201);
} catch (Throwable $error) {
    if (isset($pdo) && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    sendError('Impossible de créer la réservation.', 500);
}

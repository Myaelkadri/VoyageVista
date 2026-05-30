<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Méthode non autorisée.', 405);
}

$user = requireRole('prestataire');
$nom = trim((string) ($_POST['nom_activite'] ?? ''));
$categorie = trim((string) ($_POST['categorie'] ?? ''));
$description = trim((string) ($_POST['description'] ?? ''));
$prix = (float) ($_POST['prix'] ?? 0);
$duree = trim((string) ($_POST['duree'] ?? ''));
$destinationId = (int) ($_POST['id_destination'] ?? 0);

if ($nom === '' || $description === '' || $prix <= 0 || $destinationId <= 0) {
    sendError('Nom, description, prix et destination obligatoires.');
}

try {
    $pdo = getDatabaseConnection();
    $statement = $pdo->prepare(
        'INSERT INTO activite
            (nom_activite, categorie, description, prix, duree, capacite_max, places_disponibles, date_activite, id_destination, id_prestataire)
         VALUES
            (:nom, :categorie, :description, :prix, :duree, :capacite, :places, :date_activite, :destination, :prestataire)'
    );
    $statement->execute([
        'nom' => $nom,
        'categorie' => $categorie ?: 'Premium',
        'description' => $description,
        'prix' => $prix,
        'duree' => $duree ?: '2h',
        'capacite' => 4,
        'places' => 4,
        'date_activite' => date('Y-m-d H:i:s', strtotime('+30 days')),
        'destination' => $destinationId,
        'prestataire' => $user['id'],
    ]);

    sendJson([
        'success' => true,
        'message' => 'Activité ajoutée.',
        'id' => (int) $pdo->lastInsertId(),
    ], 201);
} catch (Throwable $error) {
    sendError("Impossible d'ajouter l'activité.", 500);
}

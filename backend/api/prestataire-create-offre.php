<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Methode non autorisee.', 405);
}

$user = requireRole('prestataire');
$type = (string) ($_POST['type_offre'] ?? 'activite');
$destinationId = (int) ($_POST['id_destination'] ?? 0);
$nom = trim((string) ($_POST['nom'] ?? ''));
$prix = (float) ($_POST['prix'] ?? 0);
$dateActivite = trim((string) ($_POST['date_activite'] ?? ''));
$dateDepart = trim((string) ($_POST['date_depart'] ?? ''));
$dateArrivee = trim((string) ($_POST['date_arrivee'] ?? ''));

if (!in_array($type, ['activite', 'hebergement', 'transport'], true) || $destinationId <= 0) {
    sendError('Type d offre ou destination invalide.');
}

if ($nom === '' || $prix <= 0) {
    sendError('Nom et prix obligatoires.');
}

try {
    $pdo = getDatabaseConnection();

    if ($type === 'activite') {
        $statement = $pdo->prepare(
            'INSERT INTO activite
                (nom_activite, categorie, description, prix, duree, capacite_max, places_disponibles, date_activite, id_destination, id_prestataire)
             VALUES
                (:nom, :categorie, :description, :prix, :duree, :capacite, :places, :date_activite, :destination, :prestataire)'
        );
        $statement->execute([
            'nom' => $nom,
            'categorie' => trim((string) ($_POST['categorie'] ?? 'Premium')) ?: 'Premium',
            'description' => trim((string) ($_POST['description'] ?? '')),
            'prix' => $prix,
            'duree' => trim((string) ($_POST['duree'] ?? '2h')) ?: '2h',
            'capacite' => max(1, (int) ($_POST['capacite'] ?? 4)),
            'places' => max(1, (int) ($_POST['places'] ?? 4)),
            'date_activite' => $dateActivite ? str_replace('T', ' ', $dateActivite) : date('Y-m-d H:i:s', strtotime('+30 days')),
            'destination' => $destinationId,
            'prestataire' => $user['id'],
        ]);
    }

    if ($type === 'hebergement') {
        $statement = $pdo->prepare(
            'INSERT INTO hebergement
                (nom_hebergement, type_hebergement, description, adresse, prix_nuit, capacite, nombre_etoiles, equipements, disponibilite, id_destination, id_prestataire)
             VALUES
                (:nom, :type, :description, :adresse, :prix, :capacite, :etoiles, :equipements, 1, :destination, :prestataire)'
        );
        $statement->execute([
            'nom' => $nom,
            'type' => trim((string) ($_POST['categorie'] ?? 'Hotel')) ?: 'Hotel',
            'description' => trim((string) ($_POST['description'] ?? '')),
            'adresse' => trim((string) ($_POST['adresse'] ?? 'Adresse premium')),
            'prix' => $prix,
            'capacite' => max(1, (int) ($_POST['capacite'] ?? 2)),
            'etoiles' => min(5, max(1, (int) ($_POST['etoiles'] ?? 5))),
            'equipements' => trim((string) ($_POST['equipements'] ?? 'Piscine, spa, transfert')),
            'destination' => $destinationId,
            'prestataire' => $user['id'],
        ]);
    }

    if ($type === 'transport') {
        $statement = $pdo->prepare(
            'INSERT INTO transport
                (type_transport, compagnie, ville_depart, ville_arrivee, date_depart, date_arrivee, prix, classe, places_disponibles, id_destination, id_prestataire)
             VALUES
                (:type_transport, :compagnie, :depart, :arrivee, :date_depart, :date_arrivee, :prix, :classe, :places, :destination, :prestataire)'
        );
        $statement->execute([
            'type_transport' => trim((string) ($_POST['categorie'] ?? 'Vol')) ?: 'Vol',
            'compagnie' => $nom,
            'depart' => trim((string) ($_POST['ville_depart'] ?? 'Paris')),
            'arrivee' => trim((string) ($_POST['ville_arrivee'] ?? 'Destination')),
            'date_depart' => $dateDepart ? str_replace('T', ' ', $dateDepart) : date('Y-m-d H:i:s', strtotime('+20 days')),
            'date_arrivee' => $dateArrivee ? str_replace('T', ' ', $dateArrivee) : date('Y-m-d H:i:s', strtotime('+20 days +3 hours')),
            'prix' => $prix,
            'classe' => trim((string) ($_POST['classe'] ?? 'Business')) ?: 'Business',
            'places' => max(1, (int) ($_POST['places'] ?? 8)),
            'destination' => $destinationId,
            'prestataire' => $user['id'],
        ]);
    }
    sendJson([
        'success' => true,
        'message' => 'Offre publiee.',
        'id' => (int) $pdo->lastInsertId(),
    ], 201);
} catch (Throwable $error) {
    sendError("Impossible d'ajouter l'offre.", 500);
}

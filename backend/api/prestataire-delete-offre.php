<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Methode non autorisee.', 405);
}

$user = requireRole('prestataire');
$type = (string) ($_POST['type'] ?? '');
$id = (int) ($_POST['id'] ?? 0);

if ($id <= 0 || !in_array($type, ['transport', 'hebergement', 'activite'], true)) {
    sendError('Offre invalide.');
}

$config = [
    'transport' => ['table' => 'transport', 'id' => 'id_transport'],
    'hebergement' => ['table' => 'hebergement', 'id' => 'id_hebergement'],
    'activite' => ['table' => 'activite', 'id' => 'id_activite'],
];

try {
    $pdo = getDatabaseConnection();
    $statement = $pdo->prepare(
        "DELETE FROM {$config[$type]['table']}
         WHERE {$config[$type]['id']} = :id
           AND id_prestataire = :prestataire"
    );
    $statement->execute([
        'id' => $id,
        'prestataire' => $user['id'],
    ]);

    sendJson([
        'success' => true,
        'message' => $statement->rowCount() > 0 ? 'Offre supprimee.' : 'Offre introuvable.',
    ]);
} catch (Throwable $error) {
    sendError("Impossible de supprimer l'offre.", 500);
}

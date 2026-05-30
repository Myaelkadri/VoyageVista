<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Méthode non autorisée.', 405);
}

requireRole('admin');

$userId = (int) ($_POST['id_utilisateur'] ?? 0);
$status = $_POST['statut_compte'] ?? '';

if ($userId <= 0 || !in_array($status, ['actif', 'bloque', 'en_attente'], true)) {
    sendError('Utilisateur ou statut invalide.');
}

try {
    $pdo = getDatabaseConnection();
    $statement = $pdo->prepare(
        'UPDATE utilisateur
         SET statut_compte = :status
         WHERE id_utilisateur = :id'
    );
    $statement->execute([
        'status' => $status,
        'id' => $userId,
    ]);

    sendJson([
        'success' => true,
        'message' => 'Statut utilisateur mis à jour.',
    ]);
} catch (Throwable $error) {
    sendError("Impossible de modifier l'utilisateur.", 500);
}

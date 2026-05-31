<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Methode non autorisee.', 405);
}

requireRole('admin');

$userId = (int) ($_POST['id_utilisateur'] ?? 0);
$status = (string) ($_POST['statut_compte'] ?? '');
$role = (string) ($_POST['role'] ?? '');

if ($userId <= 0) {
    sendError('Utilisateur invalide.');
}

if ($status !== '' && !in_array($status, ['actif', 'bloque', 'en_attente'], true)) {
    sendError('Statut invalide.');
}

if ($role !== '' && !in_array($role, ['voyageur', 'prestataire', 'admin'], true)) {
    sendError('Role invalide.');
}

if ($status === '' && $role === '') {
    sendError('Aucune modification envoyee.');
}

try {
    $pdo = getDatabaseConnection();
    $fields = [];
    $params = ['id' => $userId];

    if ($status !== '') {
        $fields[] = 'statut_compte = :status';
        $params['status'] = $status;
    }

    if ($role !== '') {
        $fields[] = 'role = :role';
        $params['role'] = $role;
    }

    $statement = $pdo->prepare('UPDATE utilisateur SET ' . implode(', ', $fields) . ' WHERE id_utilisateur = :id');
    $statement->execute($params);

    sendJson([
        'success' => true,
        'message' => 'Utilisateur mis a jour.',
    ]);
} catch (Throwable $error) {
    sendError("Impossible de modifier l'utilisateur.", 500);
}

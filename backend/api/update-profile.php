<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Methode non autorisee.', 405);
}

$user = requireUser();
$nom = trim((string) ($_POST['nom'] ?? ''));
$prenom = trim((string) ($_POST['prenom'] ?? ''));
$telephone = trim((string) ($_POST['telephone'] ?? ''));

if ($nom === '' || $prenom === '') {
    sendError('Nom et prenom obligatoires.');
}

try {
    $pdo = getDatabaseConnection();
    $statement = $pdo->prepare(
        'UPDATE utilisateur
         SET nom = :nom, prenom = :prenom, telephone = :telephone
         WHERE id_utilisateur = :id'
    );
    $statement->execute([
        'nom' => $nom,
        'prenom' => $prenom,
        'telephone' => $telephone ?: null,
        'id' => $user['id'],
    ]);

    $updatedUser = [
        'id' => $user['id'],
        'nom' => $nom,
        'prenom' => $prenom,
        'email' => $user['email'],
        'role' => $user['role'],
        'telephone' => $telephone,
    ];
    startUserSession();
    $_SESSION['user'] = $updatedUser;

    sendJson([
        'success' => true,
        'message' => 'Profil mis a jour.',
        'user' => $updatedUser,
    ]);
} catch (Throwable $error) {
    sendError('Impossible de modifier le profil.', 500);
}

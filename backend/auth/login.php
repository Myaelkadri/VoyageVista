<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Méthode non autorisée.', 405);
}

$email = trim((string) ($_POST['email'] ?? ''));
$password = (string) ($_POST['password'] ?? '');
$role = trim((string) ($_POST['role'] ?? ''));

if ($email === '' || $password === '') {
    sendError('Email et mot de passe obligatoires.');
}

try {
    $pdo = getDatabaseConnection();
    $statement = $pdo->prepare(
        'SELECT id_utilisateur, nom, prenom, email, mot_de_passe, role, statut_compte
         FROM utilisateur
         WHERE email = :email
         LIMIT 1'
    );
    $statement->execute(['email' => $email]);
    $user = $statement->fetch();

    if (!$user || $user['mot_de_passe'] !== $password) {
        sendError('Identifiants incorrects.', 401);
    }

    if ($role !== '' && $user['role'] !== $role) {
        sendError('Ce compte ne correspond pas au rôle sélectionné.', 403);
    }

    if ($user['statut_compte'] !== 'actif') {
        sendError("Ce compte n'est pas actif.", 403);
    }

    startUserSession();
    $_SESSION['user'] = [
        'id' => (int) $user['id_utilisateur'],
        'nom' => $user['nom'],
        'prenom' => $user['prenom'],
        'email' => $user['email'],
        'role' => $user['role'],
    ];

    sendJson([
        'success' => true,
        'message' => 'Connexion réussie.',
        'user' => $_SESSION['user'],
    ]);
} catch (Throwable $error) {
    sendError('Impossible de se connecter.', 500);
}

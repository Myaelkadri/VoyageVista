<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Méthode non autorisée.', 405);
}

$nom = trim((string) ($_POST['nom'] ?? ''));
$prenom = trim((string) ($_POST['prenom'] ?? ''));
$email = trim((string) ($_POST['email'] ?? ''));
$password = (string) ($_POST['password'] ?? '');
$telephone = trim((string) ($_POST['telephone'] ?? ''));
$role = $_POST['role'] ?? 'voyageur';

if ($nom === '' || $prenom === '' || $email === '' || $password === '') {
    sendError('Nom, prénom, email et mot de passe obligatoires.');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendError('Email invalide.');
}

if (strlen($password) < 6) {
    sendError('Le mot de passe doit contenir au moins 6 caractères.');
}

if (!in_array($role, ['voyageur', 'prestataire', 'admin'], true)) {
    sendError('Rôle invalide.');
}

try {
    $pdo = getDatabaseConnection();
    $statement = $pdo->prepare(
        'INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, telephone, role)
         VALUES (:nom, :prenom, :email, :mot_de_passe, :telephone, :role)'
    );
    $statement->execute([
        'nom' => $nom,
        'prenom' => $prenom,
        'email' => $email,
        'mot_de_passe' => password_hash($password, PASSWORD_DEFAULT),
        'telephone' => $telephone ?: null,
        'role' => $role,
    ]);

    sendJson([
        'success' => true,
        'message' => 'Compte créé.',
        'id' => (int) $pdo->lastInsertId(),
    ], 201);
} catch (PDOException $error) {
    if ($error->getCode() === '23000') {
        sendError('Cet email est déjà utilisé.', 409);
    }

    sendError('Impossible de créer le compte.', 500);
}

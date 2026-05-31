<?php

declare(strict_types=1);

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendError('Methode non autorisee.', 405);
}

$user = requireUser();
$notificationId = (int) ($_POST['id_notification'] ?? 0);

try {
    $pdo = getDatabaseConnection();

    if ($notificationId > 0) {
        $statement = $pdo->prepare(
            'UPDATE notification
             SET statut_lecture = "lue"
             WHERE id_notification = :id
               AND id_utilisateur = :user'
        );
        $statement->execute([
            'id' => $notificationId,
            'user' => $user['id'],
        ]);
    } else {
        $statement = $pdo->prepare(
            'UPDATE notification
             SET statut_lecture = "lue"
             WHERE id_utilisateur = :user'
        );
        $statement->execute(['user' => $user['id']]);
    }

    sendJson([
        'success' => true,
        'message' => 'Notification marquee comme lue.',
    ]);
} catch (Throwable $error) {
    sendError('Impossible de modifier la notification.', 500);
}

# Backend VoyageVista

## Partie 1 - Base PHP

Cette partie ajoute les fondations du backend :

- connexion MySQL avec PDO ;
- reponses JSON communes ;
- sessions PHP ;
- endpoints de lecture pour destinations, hebergements, transports et activites ;
- endpoints de connexion, utilisateur courant et deconnexion.

## Configuration locale

Par defaut, le backend utilise :

- serveur : `localhost`
- port : `3306`
- base : `voyagevista`
- utilisateur : `root`
- mot de passe : vide

Si besoin, ces valeurs peuvent etre changees avec les variables d'environnement :

```bash
DB_HOST=localhost
DB_PORT=3306
DB_NAME=voyagevista
DB_USER=root
DB_PASS=
```

## URLs utiles

Avec un serveur PHP lance a la racine du projet :

```bash
php -S 127.0.0.1:8000
```

Tester les endpoints :

- `http://127.0.0.1:8000/backend/api/destinations.php`
- `http://127.0.0.1:8000/backend/api/hebergements.php`
- `http://127.0.0.1:8000/backend/api/transports.php`
- `http://127.0.0.1:8000/backend/api/activites.php`
- `http://127.0.0.1:8000/backend/auth/me.php`

Comptes de test presents dans `base_de_donnees.sql` :

- voyageur : `lucas@voyagevista.fr` / `123456`
- prestataire : `claire@prestataire.fr` / `123456`
- admin : `admin@voyagevista.fr` / `admin`

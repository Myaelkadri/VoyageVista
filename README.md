# VoyageVista

VoyageVista est une application web dynamique de planification de voyages. Elle permet de consulter des destinations, choisir un transport, un hebergement, des activites, composer un itineraire, gerer un panier et simuler une reservation.

## Technologies utilisees

- HTML
- CSS
- JavaScript
- PHP
- MySQL
- WAMP / MAMP

## Installation locale

1. Copier le dossier `VoyageVista` dans le dossier serveur local :
   - avec WAMP : `C:\wamp64\www\VoyageVista`
   - avec MAMP : dossier `htdocs`

2. Lancer WAMP ou MAMP.

3. Ouvrir phpMyAdmin :
   - WAMP : `http://localhost/phpmyadmin`
   - MAMP : `http://localhost/phpMyAdmin`

4. Importer le fichier SQL :
   - fichier : `base_de_données.sql`
   - la base creee doit s'appeler `voyagevista`.

5. Verifier la configuration MySQL dans :
   - `backend/config/database.php`

   Configuration par defaut :
   - serveur : `localhost`
   - port : `3306`
   - base : `voyagevista`
   - utilisateur : `root`
   - mot de passe : vide

6. Ouvrir le site :

```text
http://localhost/VoyageVista/index.html
```

## Comptes de test

Voyageur :

```text
email : lucas@voyagevista.fr
mot de passe : 123456
```

Prestataire :

```text
email : claire@prestataire.fr
mot de passe : 123456
```

Admin :

```text
email : admin@voyagevista.fr
mot de passe : admin
```

## Comment naviguer dans le site

1. Ouvrir la page d'accueil :

```text
http://localhost/VoyageVista/index.html
```

2. Aller dans `Mon compte`, choisir un type d'utilisateur, puis se connecter.

3. Pour tester le parcours voyageur :
   - se connecter avec le compte voyageur ;
   - ouvrir le catalogue des destinations ;
   - choisir une destination ;
   - cliquer sur `Ajouter au panier`.

4. Le site redirige automatiquement vers les transports associes a la destination choisie. L'utilisateur selectionne une option de transport.

5. Le site redirige ensuite vers les hebergements associes a cette destination. L'utilisateur choisit un hebergement.

6. Le site redirige ensuite vers les activites associees a cette destination. L'utilisateur choisit une activite.

7. Une fois ces elements choisis, le sejour complet apparait dans le panier avec le prix total calcule automatiquement.

8. L'utilisateur peut ensuite passer au paiement simule. Apres validation, la reservation est confirmee et une notification est ajoutee au tableau de bord.

9. Pour tester les autres roles :
   - le prestataire peut ajouter ou supprimer des offres ;
   - l'admin peut consulter les statistiques et modifier le role ou le statut des utilisateurs.

## Fonctionnalites principales

- consultation des destinations ;
- recherche, filtres et tri ;
- detail d'une destination ;
- creation de compte et connexion ;
- roles voyageur, prestataire et admin ;
- ajout d'une destination au panier ;
- choix d'un transport, d'un hebergement et d'une activite ;
- calcul automatique du total ;
- paiement simule ;
- notifications utilisateur ;
- modification du profil voyageur ;
- espace prestataire pour ajouter ou supprimer des offres ;
- espace admin pour gerer les utilisateurs.

## Organisation du projet

- `index.html` : page d'accueil ;
- `pages/` : pages principales du site ;
- `css/style.css` : styles du site ;
- `js/script.js` : logique frontend et appels aux API ;
- `backend/` : API PHP, authentification et configuration ;
- `images/` : ressources visuelles locales ;
- `base_de_données.sql` : script de creation et remplissage de la base.

## Lien GitHub

```text
https://github.com/Myaelkadri/VoyageVista
```

## Remarques

Le paiement est simule dans le cadre du projet. La gestion des disponibilites est simplifiee mais permet de montrer le principe de reservation et de mise a jour des places disponibles.

CREATE DATABASE IF NOT EXISTS voyagevista
CHARACTER SET utf8mb4
COLLATE utf8mb4_general_ci;

USE voyagevista; 
 
CREATE TABLE utilisateur (
    id_utilisateur INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    telephone VARCHAR(30),
    role ENUM('voyageur', 'prestataire', 'admin') NOT NULL DEFAULT 'voyageur',
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    statut_compte ENUM('actif', 'bloque', 'en_attente') DEFAULT 'actif'
);

CREATE TABLE destination (
    id_destination INT AUTO_INCREMENT PRIMARY KEY,
    nom_destination VARCHAR(150) NOT NULL,
    pays VARCHAR(100) NOT NULL,
    continent VARCHAR(100) NOT NULL,
    description TEXT,
    image VARCHAR(255),
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2)
);
 
CREATE TABLE hebergement (
    id_hebergement INT AUTO_INCREMENT PRIMARY KEY,
    nom_hebergement VARCHAR(150) NOT NULL,
    type_hebergement VARCHAR(100),
    description TEXT,
    adresse VARCHAR(255),
    prix_nuit DECIMAL(10,2) NOT NULL,
    capacite INT NOT NULL,
    nombre_etoiles INT,
    equipements TEXT,
    disponibilite BOOLEAN DEFAULT TRUE,
    id_destination INT NOT NULL,
    id_prestataire INT NOT NULL,
    FOREIGN KEY (id_destination) REFERENCES destination(id_destination),
    FOREIGN KEY (id_prestataire) REFERENCES utilisateur(id_utilisateur)
);

CREATE TABLE transport (
    id_transport INT AUTO_INCREMENT PRIMARY KEY,
    type_transport ENUM('avion', 'train', 'ferry', 'voiture_privee') NOT NULL,
    compagnie VARCHAR(150),
    ville_depart VARCHAR(100) NOT NULL,
    ville_arrivee VARCHAR(100) NOT NULL,
    date_depart DATETIME,
    date_arrivee DATETIME,
    prix DECIMAL(10,2) NOT NULL,
    classe VARCHAR(100),
    places_disponibles INT DEFAULT 0,
    id_destination INT NOT NULL,
    id_prestataire INT NOT NULL,
    FOREIGN KEY (id_destination) REFERENCES destination(id_destination),
    FOREIGN KEY (id_prestataire) REFERENCES utilisateur(id_utilisateur)
);

CREATE TABLE activite (
    id_activite INT AUTO_INCREMENT PRIMARY KEY,
    nom_activite VARCHAR(150) NOT NULL,
    categorie VARCHAR(100),
    description TEXT,
    prix DECIMAL(10,2) NOT NULL,
    duree VARCHAR(50),
    capacite_max INT,
    places_disponibles INT,
    date_activite DATETIME,
    id_destination INT NOT NULL,
    id_prestataire INT NOT NULL,
    FOREIGN KEY (id_destination) REFERENCES destination(id_destination),
    FOREIGN KEY (id_prestataire) REFERENCES utilisateur(id_utilisateur)
);

CREATE TABLE itineraire (
    id_itineraire INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(150) NOT NULL,
    date_creation DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_debut DATE,
    date_fin DATE,
    statut ENUM('brouillon', 'valide', 'annule') DEFAULT 'brouillon',
    prix_total DECIMAL(10,2) DEFAULT 0,
    id_voyageur INT NOT NULL,
    FOREIGN KEY (id_voyageur) REFERENCES utilisateur(id_utilisateur)
);

CREATE TABLE itineraire_transport (
    id_itineraire INT NOT NULL,
    id_transport INT NOT NULL,
    PRIMARY KEY (id_itineraire, id_transport),
    FOREIGN KEY (id_itineraire) REFERENCES itineraire(id_itineraire),
    FOREIGN KEY (id_transport) REFERENCES transport(id_transport)
);

CREATE TABLE itineraire_hebergement (
    id_itineraire INT NOT NULL,
    id_hebergement INT NOT NULL,
    date_debut DATE,
    date_fin DATE,
    PRIMARY KEY (id_itineraire, id_hebergement),
    FOREIGN KEY (id_itineraire) REFERENCES itineraire(id_itineraire),
    FOREIGN KEY (id_hebergement) REFERENCES hebergement(id_hebergement)
);

CREATE TABLE itineraire_activite (
    id_itineraire INT NOT NULL,
    id_activite INT NOT NULL,
    nombre_participants INT DEFAULT 1,
    PRIMARY KEY (id_itineraire, id_activite),
    FOREIGN KEY (id_itineraire) REFERENCES itineraire(id_itineraire),
    FOREIGN KEY (id_activite) REFERENCES activite(id_activite)
);

CREATE TABLE reservation (
    id_reservation INT AUTO_INCREMENT PRIMARY KEY,
    reference_reservation VARCHAR(50) NOT NULL UNIQUE,
    date_reservation DATETIME DEFAULT CURRENT_TIMESTAMP,
    statut_reservation ENUM('en_attente', 'confirmee', 'annulee') DEFAULT 'en_attente',
    montant_total DECIMAL(10,2) NOT NULL,
    id_voyageur INT NOT NULL,
    id_itineraire INT NOT NULL,
    FOREIGN KEY (id_voyageur) REFERENCES utilisateur(id_utilisateur),
    FOREIGN KEY (id_itineraire) REFERENCES itineraire(id_itineraire)
);

CREATE TABLE paiement (
    id_paiement INT AUTO_INCREMENT PRIMARY KEY,
    date_paiement DATETIME DEFAULT CURRENT_TIMESTAMP,
    montant DECIMAL(10,2) NOT NULL,
    mode_paiement VARCHAR(50) DEFAULT 'carte bancaire',
    statut_paiement ENUM('accepte', 'refuse', 'en_attente') DEFAULT 'en_attente',
    id_reservation INT NOT NULL,
    FOREIGN KEY (id_reservation) REFERENCES reservation(id_reservation)
);

CREATE TABLE notification (
    id_notification INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type_notification VARCHAR(100),
    date_envoi DATETIME DEFAULT CURRENT_TIMESTAMP,
    statut_lecture ENUM('non_lue', 'lue') DEFAULT 'non_lue',
    id_utilisateur INT NOT NULL,
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur)
);

CREATE TABLE favori (
    id_favori INT AUTO_INCREMENT PRIMARY KEY,
    date_ajout DATETIME DEFAULT CURRENT_TIMESTAMP,
    type_element ENUM('destination', 'hebergement', 'transport', 'activite', 'itineraire') NOT NULL,
    id_element INT NOT NULL,
    id_voyageur INT NOT NULL,
    FOREIGN KEY (id_voyageur) REFERENCES utilisateur(id_utilisateur)
);

INSERT INTO utilisateur (nom, prenom, email, mot_de_passe, telephone, role)
VALUES
('Dupont', 'Lucas', 'lucas@voyagevista.fr', '123456', '0600000001', 'voyageur'),
('Martin', 'Claire', 'claire@prestataire.fr', '123456', '0600000002', 'prestataire'),
('Admin', 'VoyageVista', 'admin@voyagevista.fr', 'admin', '0600000003', 'admin');

INSERT INTO destination (nom_destination, pays, continent, description, image, budget_min, budget_max)
VALUES
('Maldives', 'Maldives', 'Asie', 'Séjour premium dans un lagon turquoise avec villas sur pilotis.', 'maldives.jpg', 2490, 10000),
('Kyoto', 'Japon', 'Asie', 'Expérience culturelle haut de gamme avec ryokan et visites privées.', 'kyoto.jpg', 3200, 9000),
('Santorini', 'Grèce', 'Europe', 'Séjour romantique avec suite vue mer et croisière privée.', 'santorini.jpg', 2850, 8500),
('Marrakech', 'Maroc', 'Afrique', 'Riad de luxe, hammam privé et gastronomie marocaine.', 'marrakech.jpg', 1950, 7000);

INSERT INTO hebergement 
(nom_hebergement, type_hebergement, description, adresse, prix_nuit, capacite, nombre_etoiles, equipements, disponibilite, id_destination, id_prestataire)
VALUES
('Ocean Pearl Resort', 'Villa sur pilotis', 'Villa premium avec piscine privée et accès direct au lagon.', 'Maldives', 890, 2, 5, 'Piscine, spa, vue mer, conciergerie', TRUE, 1, 2),
('Kyoto Garden Ryokan', 'Ryokan premium', 'Ryokan avec jardin privé, onsen et dîner kaiseki.', 'Kyoto', 540, 2, 5, 'Onsen, jardin privé, dîner inclus', TRUE, 2, 2),
('Riad Almas', 'Riad luxe', 'Riad 5 étoiles avec patio, hammam privé et table gastronomique.', 'Marrakech', 420, 2, 5, 'Hammam, piscine, restaurant', TRUE, 4, 2);

INSERT INTO transport
(type_transport, compagnie, ville_depart, ville_arrivee, date_depart, date_arrivee, prix, classe, places_disponibles, id_destination, id_prestataire)
VALUES
('avion', 'Qatar Airways', 'Paris CDG', 'Male MLE', '2026-06-15 10:00:00', '2026-06-16 00:20:00', 1840, 'Business', 12, 1, 2),
('avion', 'Emirates', 'Paris CDG', 'Dubai DXB', '2026-06-15 14:00:00', '2026-06-15 20:45:00', 2950, 'Première', 8, 1, 2),
('train', 'Venice Express', 'Paris Gare de Lyon', 'Venise', '2026-07-01 19:30:00', '2026-07-02 08:40:00', 620, 'Cabine privée', 20, 3, 2);

INSERT INTO activite
(nom_activite, categorie, description, prix, duree, capacite_max, places_disponibles, date_activite, id_destination, id_prestataire)
VALUES
('Dîner sous les étoiles', 'Gastronomie', 'Table privée sur la plage avec menu dégustation.', 220, '2h', 2, 2, '2026-06-17 20:00:00', 1, 2),
('Snorkeling privé', 'Aventure', 'Sortie snorkeling avec guide local et bateau réservé.', 480, '4h', 6, 4, '2026-06-18 09:00:00', 1, 2),
('Rituel spa duo', 'Bien-être', 'Massage, hammam privé et soin signature.', 310, '3h', 2, 2, '2026-06-19 15:00:00', 1, 2);

INSERT INTO itineraire (titre, date_debut, date_fin, statut, prix_total, id_voyageur)
VALUES
('Séjour Maldives premium', '2026-06-15', '2026-06-22', 'brouillon', 6960, 1);

INSERT INTO itineraire_transport (id_itineraire, id_transport)
VALUES (1, 1);

INSERT INTO itineraire_hebergement (id_itineraire, id_hebergement, date_debut, date_fin)
VALUES (1, 1, '2026-06-15', '2026-06-22');

INSERT INTO itineraire_activite (id_itineraire, id_activite, nombre_participants)
VALUES
(1, 1, 2),
(1, 2, 2);

INSERT INTO reservation (reference_reservation, statut_reservation, montant_total, id_voyageur, id_itineraire)
VALUES
('VV-2026-001', 'confirmee', 6960, 1, 1);

INSERT INTO paiement (montant, mode_paiement, statut_paiement, id_reservation)
VALUES
(6960, 'carte bancaire', 'accepte', 1);

INSERT INTO notification (titre, message, type_notification, id_utilisateur)
VALUES
('Réservation confirmée', 'Votre séjour Maldives premium a bien été confirmé.', 'reservation', 1),
('Rappel J-7', 'Votre voyage approche. Pensez à vérifier vos documents.', 'rappel', 1),
('Modification activité', 'Une activité de votre itinéraire a été mise à jour.', 'activite', 1);

INSERT INTO favori (type_element, id_element, id_voyageur)
VALUES
('destination', 1, 1),
('destination', 2, 1),
('hebergement', 1, 1),
('activite', 1, 1);

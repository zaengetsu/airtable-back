# Airtable Backend

## Description
Backend de l'application de gestion de projets ESGI, développé avec Node.js, Express et TypeScript. Cette API permet de gérer les projets, les utilisateurs et les commentaires, avec une authentification JWT.

## Liens du projet
- Backend (ce repository) : https://github.com/zaengetsu/airtable-back
- Frontend : https://github.com/zaengetsu/airtable-front

## Fonctionnalités
- Authentification JWT
- Gestion des projets (CRUD)
- Système de rôles (admin/user)
- Intégration avec Airtable

## Technologies utilisées
- Node.js
- Express
- TypeScript
- JWT pour l'authentification
- Airtable comme base de données
- bcrypt pour le hachage des mots de passe
- cors pour la gestion des CORS

## Installation

1. Cloner le repository :
```bash
git clone https://github.com/zaengetsu/airtable-back.git
cd airtable-back
```

2. Installer les dépendances :
```bash
npm install
```

3. Lancer le serveur en mode développement :
```bash
npm run dev
```

Le serveur démarrera sur le port 4000.

## Structure de l'API

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription

### Projets
- `GET /api/projects` - Liste des projets
- `GET /api/projects/:id` - Détails d'un projet
- `POST /api/projects` - Création d'un projet
- `PUT /api/projects/:id` - Modification d'un projet
- `DELETE /api/projects/:id` - Suppression d'un projet

### Commentaires
- `GET /api/comments/project/:projectID` - Commentaires d'un projet
- `POST /api/comments` - Création d'un commentaire
- `PUT /api/comments/:id` - Modification d'un commentaire
- `DELETE /api/comments/:id` - Suppression d'un commentaire

## Compte test
Pour tester l'application, vous pouvez utiliser le compte admin suivant :
- Username : zango
- Password : mespotes

## Membres du projet
- Leonce Yopa

## Sécurité
- Authentification JWT
- Hachage des mots de passe avec bcrypt
- Protection des routes avec middleware
- Validation des données
- Gestion des CORS

## Limitations actuelles
- Seuls les admins et les auteurs peuvent modifier/supprimer les projets
- Les commentaires sont en cours de développement


#!/bin/bash
set -e

echo "=== Création du backend (my-portfolio-backend) ==="
mkdir -p my-portfolio-backend
cd my-portfolio-backend

# Initialisation du projet Node.js
npm init -y

# Installation des dépendances nécessaires
npm install express airtable bcryptjs cors dotenv
npm install -D typescript @types/express @types/node @types/bcryptjs ts-node nodemon

# Initialisation de TypeScript
npx tsc --init

# Création de la structure des dossiers
mkdir -p src/routes src/types src/lib

# 1. Fichier d'entrée : src/index.ts
cat << 'EOF' > src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import projectsRouter from './routes/projects';
import authRouter from './routes/auth';
import commentsRouter from './routes/comments';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/projects', projectsRouter);
app.use('/api/auth', authRouter);
app.use('/api/comments', commentsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(\`Backend server is running on port \${PORT}\`);
});
EOF

# 2. Configuration d'Airtable : src/lib/airtable.ts
cat << 'EOF' > src/lib/airtable.ts
import Airtable from 'airtable';
import dotenv from 'dotenv';

dotenv.config();

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID!);

// Tables à créer dans Airtable :
// - Projects : Projets étudiants
// - Users : Utilisateurs (admin et autres)
// - Comments : Commentaires internes
export const projectsTable = base('Projects');
export const usersTable = base('Users');
export const commentsTable = base('Comments');

export default base;
EOF

# 3. Définition des types TypeScript : src/types/index.ts
cat << 'EOF' > src/types/index.ts
export interface Project {
  id?: string;
  Name: string;
  Description: string;
  Technologies: string[];
  Link?: string;
  Visuals?: any[];
  Promotion?: string;
  Students?: string[];
  Category?: string;
  Visible: boolean;
  Likes: number;
}

export interface User {
  id?: string;
  Username: string;
  Email: string;
  PasswordHash: string;
  Role: 'admin' | 'user';
}

export interface Comment {
  id?: string;
  Project: string; // ID du projet lié
  Comment: string;
  Auteur: string;
  CreatedAt?: string;
}
EOF

# 4. Routes pour la gestion des projets : src/routes/projects.ts
cat << 'EOF' > src/routes/projects.ts
import { Router, Request, Response } from 'express';
import { projectsTable } from '../lib/airtable';
import { Project } from '../types';

const router = Router();

// GET : Récupérer tous les projets visibles
router.get('/', async (req: Request, res: Response) => {
  try {
    const records = await projectsTable.select({
      filterByFormula: "{Visible} = TRUE()"
    }).all();

    const projects: Project[] = records.map(record => ({
      id: record.id,
      Name: record.get('Name') as string,
      Description: record.get('Description') as string,
      Technologies: record.get('Technologies') ? (record.get('Technologies') as string).split(',') : [],
      Link: record.get('Link') as string,
      Visuals: record.get('Visuals'),
      Promotion: record.get('Promotion') as string,
      Students: record.get('Students') ? (record.get('Students') as string).split(',') : [],
      Category: record.get('Category') as string,
      Visible: record.get('Visible') as boolean,
      Likes: record.get('Likes') as number
    }));

    res.json({ projects });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des projets' });
  }
});

// POST : Création d'un projet (accessible aux admins)
router.post('/', async (req: Request, res: Response) => {
  try {
    const newProject: Partial<Project> = req.body;
    const createdRecord = await projectsTable.create({
      'Name': newProject.Name,
      'Description': newProject.Description,
      'Technologies': newProject.Technologies?.join(','),
      'Link': newProject.Link,
      'Promotion': newProject.Promotion,
      'Students': newProject.Students?.join(','),
      'Category': newProject.Category,
      'Visible': true,
      'Likes': 0
    });
    res.status(201).json({ id: createdRecord.id });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création du projet' });
  }
});

// GET : Récupérer un projet par son id
router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const record = await projectsTable.find(id);
    const project: Project = {
      id: record.id,
      Name: record.get('Name') as string,
      Description: record.get('Description') as string,
      Technologies: record.get('Technologies') ? (record.get('Technologies') as string).split(',') : [],
      Link: record.get('Link') as string,
      Visuals: record.get('Visuals'),
      Promotion: record.get('Promotion') as string,
      Students: record.get('Students') ? (record.get('Students') as string).split(',') : [],
      Category: record.get('Category') as string,
      Visible: record.get('Visible') as boolean,
      Likes: record.get('Likes') as number
    };
    res.json({ project });
  } catch (error) {
    res.status(500).json({ error: 'Projet non trouvé' });
  }
});

// PUT : Mise à jour d'un projet ou incrémenter les likes
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const { action } = req.body;
    if (action === 'like') {
      const record = await projectsTable.find(id);
      const currentLikes = record.get('Likes') as number || 0;
      const updatedRecord = await projectsTable.update(id, {
        'Likes': currentLikes + 1
      });
      res.json({ Likes: updatedRecord.get('Likes') });
    } else {
      const updates: Partial<Project> = req.body;
      const updateFields: any = {
        'Name': updates.Name,
        'Description': updates.Description,
        'Technologies': updates.Technologies?.join(','),
        'Link': updates.Link,
        'Promotion': updates.Promotion,
        'Students': updates.Students?.join(','),
        'Category': updates.Category,
        'Visible': updates.Visible,
        'Likes': updates.Likes
      };
      const updatedRecord = await projectsTable.update(id, updateFields);
      res.json({ id: updatedRecord.id });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du projet' });
  }
});

export default router;
EOF

# 5. Routes d'authentification : src/routes/auth.ts
cat << 'EOF' > src/routes/auth.ts
import { Router, Request, Response } from 'express';
import { usersTable } from '../lib/airtable';
import bcrypt from 'bcryptjs';
import { User } from '../types';

const router = Router();

// POST /register : Inscription d'un nouvel utilisateur (admin ou user)
router.post('/register', async (req: Request, res: Response) => {
  const { Username, Email, Password, Role } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const PasswordHash = await bcrypt.hash(Password, salt);
    
    const createdRecord = await usersTable.create({
      'Username': Username,
      'Email': Email,
      'PasswordHash': PasswordHash,
      'Role': Role
    });
    res.status(201).json({ id: createdRecord.id });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l’inscription' });
  }
});

// POST /login : Authentification
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const records = await usersTable.select({
      filterByFormula: \`{Email} = "\${email}"\`
    }).firstPage();

    if (records.length === 0) {
      return res.status(401).json({ error: 'Email ou mot de passe invalide' });
    }

    const user = records[0].fields as User;
    const isValid = await bcrypt.compare(password, user.PasswordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Email ou mot de passe invalide' });
    }

    // Vous pouvez ici générer un token de session si besoin
    res.json({ 
      message: 'Authentification réussie', 
      user: { id: records[0].id, Username: user.Username, Role: user.Role } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l’authentification' });
  }
});

export default router;
EOF

# 6. Routes pour gérer les commentaires (accessible aux admins) : src/routes/comments.ts
cat << 'EOF' > src/routes/comments.ts
import { Router, Request, Response } from 'express';
import { commentsTable } from '../lib/airtable';
import { Comment } from '../types';

const router = Router();

// POST : Créer un commentaire pour un projet
router.post('/', async (req: Request, res: Response) => {
  const { Project, Comment: commentText, Auteur } = req.body;
  try {
    const createdRecord = await commentsTable.create({
      'Project': [Project], // Champ lié à la table Projects
      'Comment': commentText,
      'Auteur': Auteur
    });
    res.status(201).json({ id: createdRecord.id });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création du commentaire' });
  }
});

// GET : Récupérer les commentaires d'un projet (via query projectId)
router.get('/', async (req: Request, res: Response) => {
  const { projectId } = req.query;
  try {
    const records = await commentsTable.select({
      filterByFormula: \`SEARCH("\${projectId}", {Project})\`
    }).all();

    const comments: Comment[] = records.map(record => ({
      id: record.id,
      Project: (record.get('Project') as string[])[0],
      Comment: record.get('Comment') as string,
      Auteur: record.get('Auteur') as string,
      CreatedAt: record.get('Created time') as string
    }));

    res.json({ comments });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des commentaires' });
  }
});

export default router;
EOF

# 7. Fichier de configuration pour Nodemon : nodemon.json
cat << 'EOF' > nodemon.json
{
  "watch": ["src"],
  "ext": "ts",
  "exec": "ts-node src/index.ts"
}
EOF

echo "=== Backend setup complete in 'my-portfolio-backend' ==="
echo "N'oubliez pas de créer un fichier .env dans ce dossier avec au minimum :"
echo "  AIRTABLE_API_KEY=Votre_API_Key"
echo "  AIRTABLE_BASE_ID=Votre_Base_ID"
echo "  PORT=5000"
echo "Démarrez le backend avec 'npx nodemon' ou en configurant un script 'dev' dans package.json."

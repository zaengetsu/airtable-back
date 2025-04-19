import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { airtableService } from '../lib/airtable.service';

// Étendre l'interface Request d'Express
declare global {
  namespace Express {
    interface Request {
      user?: {
        userID: string;
        username: string;
        role: 'admin' | 'user';
      };
    }
  }
}

const router = express.Router();

interface User {
  userID: string;
  username: string;
  password: string;
  role: 'admin' | 'user';
}

// Middleware d'authentification
export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Tentative d\'authentification:', {
    hasAuthHeader: !!authHeader,
    hasToken: !!token,
    headers: req.headers
  });

  if (!token) {
    console.log('Token manquant');
    res.status(401).json({ error: 'Token manquant' });
    return;
  }

  try {
    console.log('Vérification du token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { userID: string };
    console.log('Token décodé:', decoded);

    console.log('Recherche de l\'utilisateur:', decoded.userID);
    const user = await airtableService.getUserById(decoded.userID);
    if (!user) {
      console.log('Utilisateur non trouvé');
      res.status(401).json({ error: 'Utilisateur non trouvé' });
      return;
    }

    console.log('Utilisateur trouvé:', user);
    req.user = {
      userID: user.userID,
      username: user.username,
      role: user.role
    };
    next();
  } catch (error) {
    console.error('Erreur lors de l\'authentification:', error);
    res.status(403).json({ error: 'Token invalide' });
  }
};

// Middleware de vérification des droits admin
export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Accès non autorisé' });
  }
};

// Route de connexion
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  try {
    const user = await airtableService.getUserByUsername(username);
    if (!user) {
      res.status(401).json({ error: 'Identifiants invalides' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Identifiants invalides' });
      return;
    }

    const token = jwt.sign({ userID: user.userID }, process.env.JWT_SECRET || '', { expiresIn: '24h' });
    res.json({ token, username: user.username, role: user.role });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// Route de création d'utilisateur
router.post('/register', async (req, res) => {
  try {
    console.log('Tentative d\'inscription avec:', req.body);
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Nom d\'utilisateur et mot de passe requis' });
    }

    // Vérifier la longueur du mot de passe
    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
    }
    
    // Vérifier s'il existe déjà des utilisateurs
    let existingUsers: User[] = [];
    try {
      existingUsers = await airtableService.getAllUsers();
      console.log('Nombre d\'utilisateurs existants:', existingUsers.length);
    } catch (error) {
      console.error('Erreur lors de la vérification des utilisateurs:', error);
      return res.status(500).json({ error: 'Erreur lors de la vérification des utilisateurs' });
    }
    
    // Déterminer le rôle de l'utilisateur
    const role = existingUsers.length === 0 ? 'admin' : 'user';
    console.log(`Création d'un nouvel utilisateur avec le rôle: ${role}`);
    
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await airtableService.createUser({
        username,
        password: hashedPassword,
        role
      });
      
      console.log('Utilisateur créé avec succès:', { username, role });
      return res.status(201).json({ 
        userID: user.userID, 
        username: user.username, 
        role: user.role,
        message: `Utilisateur créé avec succès (${role})`
      });
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      return res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur' });
    }
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur' });
  }
});

export default router;

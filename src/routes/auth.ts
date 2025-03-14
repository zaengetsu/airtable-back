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

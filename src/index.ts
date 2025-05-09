import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import projectsRouter from './routes/projects';
import commentsRouter from './routes/comments';
import authRouter from './routes/auth';

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/projects', projectsRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/auth', authRouter);

// Gestionnaire d'erreurs global
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erreur globale:', err);
  res.status(500).json({ 
    error: 'Erreur serveur',
    message: err.message || 'Une erreur est survenue'
  });
});

// Route 404
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
  console.log('Configuration Airtable:', {
    apiKey: process.env.AIRTABLE_API_KEY ? 'Présente' : 'Manquante',
    baseId: process.env.AIRTABLE_BASE_ID ? 'Présent' : 'Manquant'
  });
});

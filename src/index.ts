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

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Backend server is running on port ${PORT}`);
});

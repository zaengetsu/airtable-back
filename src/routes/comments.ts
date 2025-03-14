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

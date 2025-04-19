import express from 'express';
import { airtableService } from '../lib/airtable.service';
import { authenticateToken } from './auth';
import { isAuthorOrAdmin } from '../middleware/isAuthorOrAdmin';

const router = express.Router();

// Interface pour les commentaires
interface Comment {
  commentID: string;
  projectID: string;
  content: string;
  author: string;
  createdAt: string;
}

// Récupérer tous les commentaires d'un projet
router.get('/project/:projectID', async (req, res) => {
  try {
    const comments = await airtableService.getComments(req.params.projectID);
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching comments' });
  }
});

// Routes protégées nécessitant l'authentification
router.use(authenticateToken);

// Routes nécessitant d'être l'auteur ou admin
router.put('/:id', isAuthorOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const commentData = req.body;
    const updatedComment = await airtableService.updateComment(id, commentData);
    res.json(updatedComment);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du commentaire:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.delete('/:id', isAuthorOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await airtableService.deleteComment(id);
    res.json({ message: 'Commentaire supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du commentaire:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Ajouter un commentaire
router.post('/', async (req, res) => {
  try {
    const { projectId, content, author } = req.body;
    const comment = await airtableService.addComment(projectId, content, author);
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Error adding comment' });
  }
});

export default router;

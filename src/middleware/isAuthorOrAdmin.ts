import { Request, Response, NextFunction } from 'express';
import { airtableService } from '../lib/airtable.service';

export const isAuthorOrAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as { userID: string; role: string };
    const { id } = req.params;

    // Si l'utilisateur est admin, on laisse passer
    if (user.role === 'admin') {
      return next();
    }

    // Pour les projets
    if (req.baseUrl.includes('/projects')) {
      const project = await airtableService.getProjectById(id);
      if (!project) {
        return res.status(404).json({ error: 'Projet non trouvé' });
      }
      if (project.students.includes(user.userID)) {
        return next();
      }
    }

    // Pour les commentaires
    if (req.baseUrl.includes('/comments')) {
      const comment = await airtableService.getCommentById(id);
      if (!comment) {
        return res.status(404).json({ error: 'Commentaire non trouvé' });
      }
      if (comment.author === user.userID) {
        return next();
      }
    }

    return res.status(403).json({ error: 'Accès non autorisé' });
  } catch (error) {
    console.error('Erreur dans isAuthorOrAdmin:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}; 
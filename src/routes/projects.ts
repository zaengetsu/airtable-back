import express from 'express';
import { airtableService } from '../lib/airtable.service';
import { authenticateToken } from './auth';
import { isAuthorOrAdmin } from '../middleware/isAuthorOrAdmin';

const router = express.Router();

// Routes publiques
router.get('/', async (req, res) => {
  try {
    const projects = await airtableService.getAllProjects();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour la page de création de projet (doit être avant /:id)
router.get('/new', authenticateToken, async (req, res) => {
  try {
    // Vérifier si l'utilisateur est connecté
    if (!req.user) {
      return res.status(401).json({ error: 'Non autorisé' });
    }
    
    // Retourner les données nécessaires pour le formulaire
    res.json({
      user: req.user,
      categories: ['Web', 'Mobile', 'Desktop', 'API', 'Autre'],
      difficulties: ['Débutant', 'Intermédiaire', 'Avancé'],
      statuses: ['En cours', 'Terminé', 'En pause']
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour récupérer un projet par son ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Tentative de récupération du projet:', id);
    
    const project = await airtableService.getProjectById(id);
    if (!project) {
      console.log('Projet non trouvé:', id);
      return res.status(404).json({ error: 'Projet non trouvé' });
    }
    
    console.log('Projet trouvé:', project);
    res.json(project);
  } catch (error) {
    console.error('Erreur lors de la récupération du projet:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Routes nécessitant d'être connecté
router.post('/', authenticateToken, async (req, res) => {
  try {
    console.log('Tentative de création de projet avec les données:', req.body);

    // Validation des champs requis
    const requiredFields = ['name', 'description', 'category', 'promotion'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.error('Champs manquants:', missingFields);
      return res.status(400).json({
        error: `Les champs suivants sont requis: ${missingFields.join(', ')}`
      });
    }

    // Formatage des données
    const projectData = {
      ...req.body,
      technologies: req.body.technologies || '',
      students: req.body.students || '',
      tags: req.body.tags || '',
      startDate: req.body.startDate || new Date().toISOString(),
      isHidden: req.body.isHidden || false,
      likes: 0
    };

    console.log('Données formatées:', projectData);

    const project = await airtableService.createProject(projectData);
    console.log('Projet créé avec succès:', project);
    
    res.status(201).json(project);
  } catch (error) {
    console.error('Erreur détaillée lors de la création du projet:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Erreur serveur'
    });
  }
});

router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const likes = await airtableService.addLike(req.params.id);
    res.json({ likes });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Routes nécessitant d'être l'auteur ou admin
router.put('/:id', authenticateToken, isAuthorOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const projectData = req.body;
    const updatedProject = await airtableService.updateProject(id, projectData);
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

router.delete('/:id', authenticateToken, isAuthorOrAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await airtableService.deleteProject(id);
    res.json({ message: 'Projet supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Rechercher des projets
router.get('/search/:query', async (req, res) => {
  try {
    const projects = await airtableService.searchProjects(req.params.query);
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Error searching projects' });
  }
});

// Récupérer les statistiques
router.get('/stats/all', async (req, res) => {
  try {
    const stats = await airtableService.getStatistics();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching statistics' });
  }
});

export default router;

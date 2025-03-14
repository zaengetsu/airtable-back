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

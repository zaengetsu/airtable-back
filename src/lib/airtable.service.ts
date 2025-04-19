import Airtable from 'airtable';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' });

console.log('Initialisation Airtable avec :');
console.log('API Key:', process.env.AIRTABLE_API_KEY ? 'Présente' : 'Manquante');
console.log('Base ID:', process.env.AIRTABLE_BASE_ID ? 'Présent' : 'Manquant');

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID || '');

export interface Project {
  projectID: string;
  name: string;
  description: string;
  technologies: string[];
  projectLink?: string;
  githubLink?: string;
  demoLink?: string;
  images: string[];
  thumbnail?: string;
  promotion: string;
  students: string[];
  category: string;
  tags: string[];
  status: 'En cours' | 'Terminé' | 'En pause';
  difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé';
  startDate: string;
  endDate?: string;
  mentor?: string;
  achievements?: string;
  isHidden: boolean;
  likes: number;
}

export interface Comment {
  commentID: string;
  projectID: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface User {
  userID: string;
  username: string;
  password: string;
  role: 'admin' | 'user';
}

export const airtableService = {
  // Récupérer tous les projets
  async getAllProjects(): Promise<Project[]> {
    try {
      console.log('Tentative de récupération des projets...');
      console.log('Configuration Airtable:', {
        apiKey: process.env.AIRTABLE_API_KEY ? 'Présente' : 'Manquante',
        baseId: process.env.AIRTABLE_BASE_ID ? 'Présent' : 'Manquant'
      });

      const records = await base('Projects').select({
        filterByFormula: '{isHidden} = FALSE()'
      }).all();
      
      console.log(`Nombre de projets trouvés: ${records.length}`);
      
      const projects = records.map(record => {
        try {
          console.log('Traitement du projet:', record.id);
          const project = {
            projectID: record.id,
            name: record.get('name') as string || '',
            description: record.get('description') as string || '',
            technologies: record.get('technologies') as string[] || [],
            projectLink: record.get('projectLink') as string || '',
            githubLink: record.get('githubLink') as string || '',
            demoLink: record.get('demoLink') as string || '',
            images: record.get('images') as string[] || [],
            thumbnail: record.get('thumbnail') as string || '',
            promotion: record.get('promotion') as string || '',
            students: record.get('students') as string[] || [],
            category: record.get('category') as string || '',
            tags: record.get('tags') as string[] || [],
            status: (record.get('status') as 'En cours' | 'Terminé' | 'En pause') || 'En cours',
            difficulty: (record.get('difficulty') as 'Débutant' | 'Intermédiaire' | 'Avancé') || 'Intermédiaire',
            startDate: record.get('startDate') as string || new Date().toISOString(),
            endDate: record.get('endDate') as string || '',
            mentor: record.get('mentor') as string || '',
            achievements: record.get('achievements') as string || '',
            isHidden: record.get('isHidden') as boolean || false,
            likes: record.get('likes') as number || 0
          };
          console.log('Projet traité avec succès:', project.name);
          return project;
        } catch (error) {
          console.error('Erreur lors du traitement du projet:', record.id, error);
          throw error;
        }
      });
      
      return projects;
    } catch (error) {
      console.error('Erreur détaillée lors de la récupération des projets:', error);
      throw error;
    }
  },

  // Récupérer un projet par son ID
  async getProjectById(id: string): Promise<Project | null> {
    try {
      const record = await base('Projects').find(id);
      return {
        projectID: record.id,
        name: record.get('name') as string,
        description: record.get('description') as string,
        technologies: record.get('technologies') as string[] || [],
        projectLink: record.get('projectLink') as string,
        githubLink: record.get('githubLink') as string,
        demoLink: record.get('demoLink') as string,
        images: record.get('images') as string[] || [],
        thumbnail: record.get('thumbnail') as string,
        promotion: record.get('promotion') as string,
        students: record.get('students') as string[] || [],
        category: record.get('category') as string,
        tags: record.get('tags') as string[] || [],
        status: (record.get('status') as 'En cours' | 'Terminé' | 'En pause') || 'En cours',
        difficulty: (record.get('difficulty') as 'Débutant' | 'Intermédiaire' | 'Avancé') || 'Intermédiaire',
        startDate: record.get('startDate') as string || new Date().toISOString(),
        endDate: record.get('endDate') as string,
        mentor: record.get('mentor') as string,
        achievements: record.get('achievements') as string,
        isHidden: record.get('isHidden') as boolean || false,
        likes: record.get('likes') as number || 0
      };
    } catch (error) {
      console.error('Error fetching project:', error);
      return null;
    }
  },

  // Créer un nouveau projet
  async createProject(project: Omit<Project, 'projectID'>): Promise<Project> {
    try {
      const record = await base('Projects').create({
        name: project.name,
        description: project.description,
        technologies: project.technologies,
        projectLink: project.projectLink,
        githubLink: project.githubLink,
        demoLink: project.demoLink,
        images: project.images,
        thumbnail: project.thumbnail,
        promotion: project.promotion,
        students: project.students,
        category: project.category,
        tags: project.tags,
        status: project.status,
        difficulty: project.difficulty,
        startDate: project.startDate,
        endDate: project.endDate,
        mentor: project.mentor,
        achievements: project.achievements,
        isHidden: project.isHidden,
        likes: 0
      });

      return {
        projectID: record.id,
        ...project,
        likes: 0
      };
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  },

  // Mettre à jour un projet
  async updateProject(id: string, project: Partial<Project>): Promise<Project | null> {
    try {
      const record = await base('Projects').update(id, {
        name: project.name,
        description: project.description,
        technologies: project.technologies,
        projectLink: project.projectLink,
        githubLink: project.githubLink,
        demoLink: project.demoLink,
        images: project.images,
        thumbnail: project.thumbnail,
        promotion: project.promotion,
        students: project.students,
        category: project.category,
        tags: project.tags,
        status: project.status,
        difficulty: project.difficulty,
        startDate: project.startDate,
        endDate: project.endDate,
        mentor: project.mentor,
        achievements: project.achievements,
        isHidden: project.isHidden,
        likes: project.likes
      });

      return {
        projectID: record.id,
        name: record.get('name') as string,
        description: record.get('description') as string,
        technologies: record.get('technologies') as string[] || [],
        projectLink: record.get('projectLink') as string,
        githubLink: record.get('githubLink') as string,
        demoLink: record.get('demoLink') as string,
        images: record.get('images') as string[] || [],
        thumbnail: record.get('thumbnail') as string,
        promotion: record.get('promotion') as string,
        students: record.get('students') as string[] || [],
        category: record.get('category') as string,
        tags: record.get('tags') as string[] || [],
        status: (record.get('status') as 'En cours' | 'Terminé' | 'En pause') || 'En cours',
        difficulty: (record.get('difficulty') as 'Débutant' | 'Intermédiaire' | 'Avancé') || 'Intermédiaire',
        startDate: record.get('startDate') as string || new Date().toISOString(),
        endDate: record.get('endDate') as string,
        mentor: record.get('mentor') as string,
        achievements: record.get('achievements') as string,
        isHidden: record.get('isHidden') as boolean || false,
        likes: record.get('likes') as number || 0
      };
    } catch (error) {
      console.error('Error updating project:', error);
      return null;
    }
  },

  // Ajouter un like à un projet
  async addLike(id: string): Promise<number> {
    try {
      const project = await this.getProjectById(id);
      if (!project) throw new Error('Project not found');

      const newLikes = (project.likes || 0) + 1;
      await base('Projects').update(id, {
        likes: newLikes
      });

      return newLikes;
    } catch (error) {
      console.error('Error adding like:', error);
      throw error;
    }
  },

  // Rechercher des projets
  async searchProjects(query: string): Promise<Project[]> {
    try {
      const records = await base('Projects').select({
        filterByFormula: `OR(
          FIND('${query}', {name}) > 0,
          FIND('${query}', {description}) > 0,
          FIND('${query}', {technologies}) > 0,
          FIND('${query}', {category}) > 0,
          FIND('${query}', {tags}) > 0
        )`
      }).all();

      return records.map(record => ({
        projectID: record.id,
        name: record.get('name') as string,
        description: record.get('description') as string,
        technologies: record.get('technologies') as string[] || [],
        projectLink: record.get('projectLink') as string,
        githubLink: record.get('githubLink') as string,
        demoLink: record.get('demoLink') as string,
        images: record.get('images') as string[] || [],
        thumbnail: record.get('thumbnail') as string,
        promotion: record.get('promotion') as string,
        students: record.get('students') as string[] || [],
        category: record.get('category') as string,
        tags: record.get('tags') as string[] || [],
        status: (record.get('status') as 'En cours' | 'Terminé' | 'En pause') || 'En cours',
        difficulty: (record.get('difficulty') as 'Débutant' | 'Intermédiaire' | 'Avancé') || 'Intermédiaire',
        startDate: record.get('startDate') as string || new Date().toISOString(),
        endDate: record.get('endDate') as string,
        mentor: record.get('mentor') as string,
        achievements: record.get('achievements') as string,
        isHidden: record.get('isHidden') as boolean || false,
        likes: record.get('likes') as number || 0
      }));
    } catch (error) {
      console.error('Error searching projects:', error);
      throw error;
    }
  },

  // Récupérer les statistiques
  async getStatistics() {
    try {
      const projects = await this.getAllProjects();
      const totalProjects = projects.length;
      const totalLikes = projects.reduce((sum, project) => sum + (project.likes || 0), 0);
      
      const categories = projects.reduce((acc, project) => {
        acc[project.category] = (acc[project.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalProjects,
        totalLikes,
        categories
      };
    } catch (error) {
      console.error('Error getting statistics:', error);
      throw error;
    }
  },

  // Récupérer les commentaires d'un projet
  async getComments(projectID: string): Promise<Comment[]> {
    try {
      const records = await base('Comments').select({
        filterByFormula: `{projectID} = '${projectID}'`
      }).all();

      return records.map(record => ({
        commentID: record.id,
        projectID: record.get('projectID') as string,
        content: record.get('content') as string,
        author: record.get('author') as string,
        createdAt: record.get('createdAt') as string
      }));
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  },

  // Ajouter un commentaire
  async addComment(projectID: string, content: string, author: string): Promise<Comment> {
    try {
      const record = await base('Comments').create({
        projectID,
        content,
        author,
        createdAt: new Date().toISOString()
      });

      return {
        commentID: record.id,
        projectID: record.get('projectID') as string,
        content: record.get('content') as string,
        author: record.get('author') as string,
        createdAt: record.get('createdAt') as string
      };
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  // Supprimer un commentaire
  async deleteComment(id: string): Promise<void> {
    try {
      await base('Comments').destroy(id);
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },

  // Récupérer un utilisateur par son nom d'utilisateur
  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const records = await base('Users').select({
        filterByFormula: `{username} = '${username}'`
      }).firstPage();

      if (records.length === 0) {
        return null;
      }

      const record = records[0];
      return {
        userID: record.id,
        username: record.get('username') as string,
        password: record.get('password') as string,
        role: record.get('role') as 'admin' | 'user'
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Créer un nouvel utilisateur
  async createUser(user: Omit<User, 'userID'>): Promise<User> {
    try {
      console.log('Tentative de création d\'utilisateur dans Airtable:', {
        username: user.username,
        role: user.role,
        passwordLength: user.password.length
      });

      // Vérifier si la table Users existe et est accessible
      try {
        console.log('Vérification de la table Users...');
        const tables = await base('Users').select({
          maxRecords: 1,
          fields: ['username', 'password', 'role']
        }).firstPage();
        console.log('Structure de la table Users:', tables[0]?.fields);
      } catch (error) {
        console.error('Erreur lors de l\'accès à la table Users:', error);
        throw new Error('La table Users n\'existe pas ou n\'est pas accessible. Veuillez vérifier que la table existe dans votre base Airtable avec les champs: username, password, role');
      }

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await this.getUserByUsername(user.username);
      if (existingUser) {
        console.log('Un utilisateur avec ce nom existe déjà');
        throw new Error('Un utilisateur avec ce nom existe déjà');
      }

      const record = await base('Users').create({
        username: user.username,
        password: user.password,
        role: user.role
      });

      console.log('Utilisateur créé dans Airtable avec succès:', record.id);

      return {
        userID: record.id,
        username: record.get('username') as string,
        password: record.get('password') as string,
        role: record.get('role') as 'admin' | 'user'
      };
    } catch (error) {
      console.error('Erreur détaillée lors de la création de l\'utilisateur:', error);
      if (error instanceof Error) {
        throw new Error(`Erreur lors de la création de l'utilisateur: ${error.message}`);
      }
      throw error;
    }
  },

  async getUserById(id: string): Promise<User | null> {
    try {
      const record = await base('Users').find(id);
      return {
        userID: record.id,
        username: record.get('username') as string,
        password: record.get('password') as string,
        role: record.get('role') as 'admin' | 'user'
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  },

  // Récupérer tous les utilisateurs
  async getAllUsers(): Promise<User[]> {
    try {
      const records = await base('Users').select().all();
      return records.map(record => ({
        userID: record.id,
        username: record.get('username') as string,
        password: record.get('password') as string,
        role: record.get('role') as 'admin' | 'user'
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  async deleteProject(id: string): Promise<void> {
    try {
      await base('Projects').destroy(id);
    } catch (error) {
      console.error('Erreur lors de la suppression du projet:', error);
      throw error;
    }
  },

  async getCommentById(id: string): Promise<Comment | null> {
    try {
      const record = await base('Comments').find(id);
      return {
        commentID: record.id,
        projectID: record.get('projectID') as string,
        content: record.get('content') as string,
        author: record.get('author') as string,
        createdAt: record.get('createdAt') as string
      };
    } catch (error) {
      console.error('Error fetching comment:', error);
      return null;
    }
  },

  async updateComment(id: string, commentData: Partial<Comment>): Promise<Comment | null> {
    try {
      const record = await base('Comments').update(id, {
        content: commentData.content,
        projectID: commentData.projectID,
        author: commentData.author
      });
      return {
        commentID: record.id,
        projectID: record.get('projectID') as string,
        content: record.get('content') as string,
        author: record.get('author') as string,
        createdAt: record.get('createdAt') as string
      };
    } catch (error) {
      console.error('Error updating comment:', error);
      return null;
    }
  }
}; 
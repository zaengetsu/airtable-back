export interface Project {
  id?: string;
  Name: string;
  Description: string;
  Technologies: string[];
  Link?: string;
  Visuals?: any[];
  Promotion?: string;
  Students?: string[];
  Category?: string;
  Visible: boolean;
  Likes: number;
}

export interface User {
  id?: string;
  Username: string;
  Email: string;
  PasswordHash: string;
  Role: 'admin' | 'user';
}

export interface Comment {
  id?: string;
  Project: string; // ID du projet lié
  Comment: string;
  Auteur: string;
  CreatedAt?: string;
}

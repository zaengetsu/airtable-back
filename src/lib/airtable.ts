import Airtable from 'airtable';
import dotenv from 'dotenv';

dotenv.config();

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID!);

// Tables à créer dans Airtable :
// - Projects : Projets étudiants
// - Users : Utilisateurs (admin et autres)
// - Comments : Commentaires internes
export const projectsTable = base('Projects');
export const usersTable = base('Users');
export const commentsTable = base('Comments');

export default base;

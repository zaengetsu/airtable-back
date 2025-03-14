import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import projectsRouter from './routes/projects';
import authRouter from './routes/auth';
import commentsRouter from './routes/comments';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/projects', projectsRouter);
app.use('/api/auth', authRouter);
app.use('/api/comments', commentsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(\`Backend server is running on port \${PORT}\`);
});

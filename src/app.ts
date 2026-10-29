import cors from 'cors';
import express, { type Express } from 'express';

import { errorHandler, notFound } from './middlewares/errorHandler.js';
import healthRoutes from './routes/health.js';
import projectsRoutes from './routes/projects.js';
import { requestLogger } from './utils/logger.js';

const app: Express = express();

app.disable('x-powered-by');
app.use(requestLogger);
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }));
app.use(express.json({ limit: '1mb' }));

app.use('/api/health', healthRoutes);
app.use('/api/projects', projectsRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;

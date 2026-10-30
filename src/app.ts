import cors from 'cors';
import express, { type Express } from 'express';

import { errorHandler, notFound } from './middlewares/errorHandler.js';
import healthRoutes from './routes/health.js';
import projectsRoutes from './routes/projects.js';
import authRoutes from './routes/auth.js';
import { requestLogger } from './utils/logger.js';

const app: Express = express();

const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [
  'http://localhost:5173',
  'http://localhost:3000',
];

app.disable('x-powered-by');
app.use(requestLogger);
app.use(
  cors({
    origin: (origin, callback) => {
      // 允许没有 origin 的请求（比如 postman 或服务端调用）
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // 核心修复：传入 false 而不是 Error。
        // 这会让请求直接失败，并且不带 CORS 响应头，浏览器端会抛出跨域错误。
        // 同时，服务端不会报 500，而是正常处理（或返回 403，视你的后续路由而定）。
        callback(null, false);
      }
    },
  })
);
app.use(express.json({ limit: '1mb' }));

app.use('/api/health', healthRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/auth', authRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;

const express = require('express');
const cors = require('cors');

const healthRouter = require('./routes/health');
const usersRouter  = require('./routes/users');
const { notFound, errorHandler } = require('./middleware/errors');

const app = express();

app.disable('x-powered-by');  // 禁止返回 X-Powered-By: Express 头，避免泄露信息

// 1) 全局中间件：顺序很重要
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
});

app.use(cors());                            // 加 CORS 头；OPTIONS 预检在这里直接 204 结束
app.use(express.json({ limit: '1mb' }));    // 解析 JSON body -> req.body

// 2) 路由挂载
app.use('/api/health', healthRouter);
app.use('/api/users',  usersRouter);

// 3) 兜底（必须放在所有路由之后）
app.use(notFound);       // 404
app.use(errorHandler);   // 错误处理

module.exports = app;
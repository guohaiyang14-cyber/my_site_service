// 兜底 404：所有路由都没命中才走到这里
function notFound(req, res) {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: `Cannot ${req.method} ${req.originalUrl}` },
  });
}

// 统一错误处理：必须 4 个参数，Express 才认它是错误中间件
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err); // 响应已开始，交给默认处理

  // express.json() 解析失败（body 不是合法 JSON）
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: { code: 'INVALID_JSON', message: 'Request body is not valid JSON' },
    });
  }

  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error('[500]', err); // 只有 5xx 才打服务端日志

  res.status(status).json({
    error: {
      code: err.code || (status >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR'),
      // 5xx 不向客户端泄露内部细节
      message: status >= 500 ? 'Internal Server Error' : err.message,
    },
  });
}

module.exports = { notFound, errorHandler };
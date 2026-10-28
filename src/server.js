const app = require('./app');

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});

// 优雅关闭（可选，Ctrl+C 时等连接结束）
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  server.close(() => process.exit(0));
});
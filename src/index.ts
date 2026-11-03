import 'dotenv/config'; // 确保引入了 dotenv
import app from './app.js';

// 统一启动时的环境变量校验
const requiredEnvs = ['JWT_SECRET', 'DATABASE_URL'];
const missingEnvs = requiredEnvs.filter((env) => !process.env[env]);

if (missingEnvs.length > 0) {
  console.error(`❌ 启动失败：缺少必要的环境变量: ${missingEnvs.join(', ')}`);
  console.error('请在 .env 文件中配置上述变量后重试。');
  process.exit(1); // 直接退出进程
}

const PORT = Number(process.env.PORT ?? 7777);

const server = app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
  console.log('\nShutting down...');
  server.close(() => process.exit(0));
});

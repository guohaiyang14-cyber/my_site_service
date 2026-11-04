# 🚀 Personal Portfolio & Lightweight API (个人作品集与轻量 API)

一个基于现代 Web 技术栈构建的全栈个人作品集，包含前端展示页面与带鉴权、分页、数据落库的后端 API。

🔗 **在线演示**: [https://guohy.online](https://guohy.online)

## 🛠️ 技术栈

- Node.js + Express (分层架构: Router -> Controller -> Service -> Data)
- TypeScript + Zod (严格的数据校验)
- Prisma ORM + SQLite (生产环境) / 本地开发隔离
- JWT (鉴权) + Bcrypt (密码哈希) + Express Rate Limit (防暴破)

**部署**:

- 阿里云/腾讯云 ECS (Ubuntu)
- Nginx (反向代理 + HTTPS 证书)
- PM2 (进程守护与开机自启)

## 🏗️ 架构设计

- **前后端分离**：前端纯静态打包，后端提供无状态的 RESTful API。
- **安全控制**：全局统一错误格式 `{ error: { code, message } }`，前后端双重校验，JWT 令牌鉴权，接口限流。
- **数据持久化**：使用 Prisma 管理数据库迁移，定时任务备份 SQLite 生产文件。

## 🚀 本地启动指南

### 1. 后端服务 (Backend)

```bash
pnpm install
# 配置环境变量
cp .env.example .env  # 填入 DATABASE_URL, JWT_SECRET 等
# 初始化数据库
pnpm exec prisma migrate dev
# 启动开发服务器
pnpm dev
```

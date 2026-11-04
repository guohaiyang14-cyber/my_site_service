# My Site Service

<p align="center">
  <a href="https://guohy.online" target="_blank">
    <img alt="My Site Service" src="https://img.shields.io/badge/Project-My%20Site%20Service-0A84FF?style=for-the-badge&logo=github" />
  </a>
</p>

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![JWT](https://img.shields.io/badge/Auth-JWT-EB5424?logo=jwt&logoColor=white)](https://jwt.io/)

</div>

一个基于 Node.js + Express + Prisma 的轻量级个人站点后端服务，适用于作品集展示、项目管理、用户登录与鉴权场景。

- 访问地址：<https://guohy.online>
- 文档入口：[API 接口文档](docs/API.md)
- 部署说明：[部署文档](docs/DEPLOYMENT.md)

## ✨ 功能概览

- 用户注册与登录
- JWT 令牌鉴权
- 项目列表、详情、创建、更新、删除
- Zod 参数校验与统一错误处理
- Express Rate Limit 接口限流
- Prisma 数据库迁移管理
- SQLite 作为本地开发 / 轻量部署数据库

## 🧱 技术栈

- Node.js 20+
- TypeScript
- Express 5
- Prisma ORM
- SQLite
- Zod
- JWT + bcryptjs
- CORS + Rate Limiting

## 🏗️ 项目结构

```text
my_site_service/
├─ docs/
│  ├─ API.md
│  └─ DEPLOYMENT.md
├─ prisma/
│  ├─ schema.prisma
│  └─ migrations/
├─ src/
│  ├─ app.ts
│  ├─ controllers/
│  ├─ middlewares/
│  ├─ routes/
│  ├─ schemas/
│  ├─ services/
│  ├─ types/
│  └─ utils/
├─ tests/
├─ .env.example
├─ eslint.config.mjs
├─ package.json
├─ prisma.config.ts
├─ README.md
├─ tsconfig.json
└─ pnpm-lock.yaml
```

## 🚀 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

示例内容：

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your-super-secret-key"
NODE_ENV="development"
PORT=3000
CORS_ORIGINS="http://localhost:5173,http://localhost:3000"
```

### 3. 初始化数据库

```bash
pnpm exec prisma migrate dev
```

### 4. 启动开发服务器

```bash
pnpm dev
```

服务默认启动在：

```text
http://localhost:3000
```

## 🧪 常用命令

```bash
pnpm run build
pnpm run start
pnpm run lint
pnpm run test
```

## 📡 API 概览

| 模块     | 方法   | 路径                | 说明           |
| -------- | ------ | ------------------- | -------------- |
| 健康检查 | GET    | /api/health         | 服务状态检查   |
| 注册     | POST   | /api/auth/register  | 创建账号       |
| 登录     | POST   | /api/auth/login     | 获取 JWT       |
| 项目列表 | GET    | /api/projects       | 分页、筛选     |
| 项目详情 | GET    | /api/projects/:slug | 根据 slug 查询 |
| 创建项目 | POST   | /api/projects       | 需要鉴权       |
| 更新项目 | PUT    | /api/projects/:slug | 需要鉴权       |
| 删除项目 | DELETE | /api/projects/:slug | 需要鉴权       |

## 🔐 鉴权方式

登录成功后，返回的 JWT 需要放到请求头中：

```http
Authorization: Bearer <token>
```

## 📚 文档导航

- [API 接口文档](docs/API.md)
- [部署文档](docs/DEPLOYMENT.md)

## 📝 说明

该项目以“清晰分层与良好扩展性”为核心，后端使用经典的 Router -> Controller -> Service -> Prisma 的结构，便于后续为前端、CMS 或管理后台扩展更多能力。

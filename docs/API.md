# API 接口文档

## 1. 概览

本服务提供一组面向个人站点与内容管理的 RESTful API，基于 Express + Prisma 构建。所有接口统一使用 JSON 格式返回数据。

- Base URL: `http://localhost:3000`
- 生产环境: `https://yourdomain.com`

## 2. 通用约定

### 2.1 响应格式

成功响应通常为：

```json
{
  "data": {}
}
```

错误响应通常为：

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "请求体无效",
    "details": ["email: 请输入正确的邮箱格式"]
  }
}
```

### 2.2 鉴权

登录后，需将 JWT 放入请求头：

```http
Authorization: Bearer <token>
```

## 3. 健康检查

### GET /api/health

检查服务状态。

#### 示例

```bash
curl http://localhost:3000/api/health
```

#### 成功响应

```json
{
  "status": "ok",
  "timestamp": "2026-11-04T12:00:00.000Z"
}
```

## 4. 用户认证

### POST /api/auth/register

注册新用户。

#### 请求体

```json
{
  "email": "user@example.com",
  "password": "123456",
  "name": "Alice"
}
```

#### 成功响应

```json
{
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "Alice",
    "createdAt": "2026-11-04T12:00:00.000Z"
  }
}
```

### POST /api/auth/login

登录并返回 JWT。

#### 请求体

```json
{
  "email": "user@example.com",
  "password": "123456"
}
```

#### 成功响应

```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "Alice"
    }
  }
}
```

## 5. 项目管理

### GET /api/projects

获取项目列表，支持分页和 featured 过滤。

#### 查询参数

| 参数     | 类型    | 说明               |
| -------- | ------- | ------------------ |
| page     | number  | 当前页码，默认 1   |
| pageSize | number  | 每页数量，默认 10  |
| featured | boolean | 是否只返回精选项目 |

#### 示例

```bash
curl "http://localhost:3000/api/projects?page=1&pageSize=10&featured=true"
```

#### 成功响应

```json
{
  "data": [
    {
      "id": 1,
      "slug": "my-project",
      "title": "My Project",
      "summary": "A full-stack portfolio project",
      "techStack": ["Node.js", "TypeScript", "Prisma"],
      "repoUrl": "https://github.com/example/my-project",
      "demoUrl": "https://example.com",
      "featured": true,
      "authorId": 1,
      "createdAt": "2026-11-04T12:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "pageSize": 10,
    "totalPages": 1
  }
}
```

### GET /api/projects/:slug

根据 slug 获取单个项目。

#### 示例

```bash
curl http://localhost:3000/api/projects/my-project
```

### POST /api/projects

创建新项目，需要登录认证。

#### 请求头

```http
Authorization: Bearer <token>
```

#### 请求体

```json
{
  "slug": "my-project",
  "title": "My Project",
  "summary": "A portfolio project built with Express and Prisma",
  "techStack": ["Node.js", "TypeScript", "Prisma"],
  "repoUrl": "https://github.com/example/my-project",
  "demoUrl": "https://example.com",
  "featured": true
}
```

#### 成功响应

```json
{
  "data": {
    "id": 1,
    "slug": "my-project",
    "title": "My Project",
    "summary": "A portfolio project built with Express and Prisma",
    "techStack": ["Node.js", "TypeScript", "Prisma"],
    "repoUrl": "https://github.com/example/my-project",
    "demoUrl": "https://example.com",
    "featured": true,
    "authorId": 1,
    "createdAt": "2026-11-04T12:00:00.000Z"
  }
}
```

### PUT /api/projects/:slug

更新项目内容，需要登录认证，并且仅允许修改自己的项目。

#### 示例

```bash
curl -X PUT http://localhost:3000/api/projects/my-project \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Project",
    "featured": false
  }'
```

### DELETE /api/projects/:slug

删除项目，需要登录认证，并且仅允许删除自己的项目。

#### 示例

```bash
curl -X DELETE http://localhost:3000/api/projects/my-project \
  -H "Authorization: Bearer <token>"
```

## 6. 常见错误代码

| 代码              | 含义             |
| ----------------- | ---------------- |
| VALIDATION_ERROR  | 参数校验失败     |
| UNAUTHORIZED      | 未登录或凭证无效 |
| FORBIDDEN         | 无权限执行此操作 |
| NOT_FOUND         | 资源不存在       |
| TOO_MANY_REQUESTS | 请求过于频繁     |

## 7. 备注

- `slug` 必须为 kebab-case，且至少包含一个字母。
- `repoUrl` / `demoUrl` 需为合法的 `http` 或 `https` 地址。
- `techStack` 为非空字符串数组。
- `featured` 字段用于标记首页展示项目。

## 8. 相关文档

- [README](../README.md)
- [部署指南](DEPLOYMENT.md)

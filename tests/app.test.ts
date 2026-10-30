import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';

import app from '../src/app.ts'; // 如果用 tsx 跑，保留 .js 或 .ts 都可以，看你的 tsconfig
import { prisma } from '../src/utils/prisma.ts';

const server = app.listen(0);
await new Promise<void>((resolve) => {
  server.once('listening', resolve);
});

const { port } = server.address() as AddressInfo;
const baseUrl = `http://127.0.0.1:${port}`;

// 用于保存测试登录后的 Token
let authToken = '';

// 在所有测试开始前：清理数据库，注册并登录测试用户
before(async () => {
  // 1. 清理测试数据（注意清理顺序：先删关联表，再删主表）
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // 2. 注册测试账号
  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    }),
  });

  if (!regRes.ok) {
    console.error('测试账号注册失败:', await regRes.json());
  }

  // 3. 登录获取 Token
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'password123',
    }),
  });

  const loginData = await loginRes.json();
  authToken = loginData.data.token;
});

// 所有测试结束后：关闭服务器，断开数据库连接
after(async () => {
  server.close();
  await prisma.$disconnect();
});

// ==========================================
// 开始正式测试
// ==========================================

test('GET /api/health returns ok', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.equal(res.status, 200);
  const data = (await res.json()) as { status: string };
  assert.equal(data.status, 'ok');
});

test('GET /api/projects returns project list', async () => {
  const res = await fetch(`${baseUrl}/api/projects`);
  assert.equal(res.status, 200);
  const data = (await res.json()) as { data: unknown[] };
  assert.ok(Array.isArray(data.data));
});

test('POST /api/projects rejects unauthenticated requests', async () => {
  // 新增测试：未携带 Token 应该返回 401
  const res = await fetch(`${baseUrl}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slug: 'demo-project', title: 'Demo' }),
  });
  assert.equal(res.status, 401);
});

test('POST /api/projects validates payload', async () => {
  // 带上 Token 发送合法请求
  const res = await fetch(`${baseUrl}/api/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`, // <-- 注入 Token
    },
    body: JSON.stringify({
      slug: 'demo-project',
      title: 'Demo Project',
      techStack: ['TypeScript'],
      repoUrl: 'https://example.com/repo',
    }),
  });

  assert.equal(res.status, 201);
});

test('POST /api/projects rejects numeric-only slug', async () => {
  const res = await fetch(`${baseUrl}/api/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`, // <-- 注入 Token
    },
    body: JSON.stringify({
      slug: '222333',
      title: 'Invalid Slug',
      techStack: ['TypeScript'],
    }),
  });

  assert.equal(res.status, 400);
  const data = (await res.json()) as { error?: { details?: string[] } };
  assert.ok(Array.isArray(data.error?.details));
  assert.match(String(data.error?.details?.join('\n') ?? ''), /slug/i);
});

test('GET /api/projects/:slug returns one project', async () => {
  const res = await fetch(`${baseUrl}/api/projects/demo-project`);
  assert.equal(res.status, 200);
  const data = (await res.json()) as { data: { slug: string } };
  assert.equal(data.data.slug, 'demo-project');
});

test('PUT /api/projects/:slug updates a project', async () => {
  const res = await fetch(`${baseUrl}/api/projects/demo-project`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`, // <-- 注入 Token
    },
    body: JSON.stringify({
      title: 'Updated Demo Project',
      summary: 'Updated summary',
      techStack: ['TypeScript', 'Express'],
      featured: true,
    }),
  });

  assert.equal(res.status, 200);
  const data = (await res.json()) as { data: { title: string; featured: boolean } };
  assert.equal(data.data.title, 'Updated Demo Project');
  assert.equal(data.data.featured, true);
});

test('DELETE /api/projects/:slug removes a project', async () => {
  const res = await fetch(`${baseUrl}/api/projects/demo-project`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${authToken}`, // <-- 注入 Token
    },
  });

  assert.equal(res.status, 200);
  const data = (await res.json()) as { data: { slug: string } };
  assert.equal(data.data.slug, 'demo-project');
});

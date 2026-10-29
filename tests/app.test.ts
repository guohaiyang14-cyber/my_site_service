import test from 'node:test';
import assert from 'node:assert/strict';
import type { AddressInfo } from 'node:net';

import app from '../src/app.js';

const server = app.listen(0);

await new Promise<void>((resolve) => {
  server.once('listening', resolve);
});

const { port } = server.address() as AddressInfo;
const baseUrl = `http://127.0.0.1:${port}`;

test.after(() => {
  server.close();
});

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

test('POST /api/projects validates payload', async () => {
  const res = await fetch(`${baseUrl}/api/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
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
  });

  assert.equal(res.status, 200);
  const data = (await res.json()) as { data: { slug: string } };
  assert.equal(data.data.slug, 'demo-project');
});

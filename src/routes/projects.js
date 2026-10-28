const { Router } = require('express');
const store = require('../data/projects');

const router = Router();

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const URL_RE  = /^https?:\/\/[^\s]+$/;

// GET /api/projects?featured=true -> 200
router.get('/', (req, res) => {
  const { featured } = req.query;
  const filter = featured === 'true' ? true : featured === 'false' ? false : undefined;
  res.status(200).json({ data: store.findAll({ featured: filter }) });
});

// POST /api/projects -> 201
router.post('/', (req, res) => {
  const b = req.body ?? {};

  const slug      = typeof b.slug      === 'string' ? b.slug.trim().toLowerCase() : '';
  const title     = typeof b.title     === 'string' ? b.title.trim() : '';
  const summary   = typeof b.summary   === 'string' ? b.summary.trim() : '';
  const techStack = Array.isArray(b.techStack) ? b.techStack.filter((t) => typeof t === 'string' && t.trim()) : [];
  const repoUrl   = b.repoUrl ?? null;
  const demoUrl   = b.demoUrl ?? null;
  const featured  = b.featured === true;

  const details = [];
  if (!SLUG_RE.test(slug)) details.push('slug must be kebab-case (e.g. "my-project")');
  if (!title) details.push('title is required');
  if (techStack.length === 0) details.push('techStack must be a non-empty array');
  if (repoUrl !== null && !URL_RE.test(repoUrl)) details.push('repoUrl must be a valid http(s) URL');
  if (demoUrl !== null && !URL_RE.test(demoUrl)) details.push('demoUrl must be a valid http(s) URL');
  if (store.findBySlug(slug)) details.push('slug already exists');

  if (details.length > 0) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Invalid request body', details },
    });
  }

  const project = store.insert({ slug, title, summary, techStack, repoUrl, demoUrl, featured });
  res.status(201)
    .location(`/api/projects/${project.slug}`)   // 顺手补 Location 头
    .json({ data: project });
});

module.exports = router;
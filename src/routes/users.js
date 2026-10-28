const { Router } = require('express');
const usersStore = require('../data/users');

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// GET /api/users -> 200
router.get('/', (req, res) => {
  res.status(200).json({ data: usersStore.findAll() });
});

// POST /api/users -> 201，校验失败 -> 400 JSON
router.post('/', (req, res) => {
  const body = req.body ?? {};           // Express 5 默认 req.body 可能是 undefined
  const name  = typeof body.name  === 'string' ? body.name.trim()  : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

  const details = [];
  if (!name) details.push('name is required');
  if (!EMAIL_RE.test(email)) details.push('email is invalid');

  if (details.length > 0) {
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Invalid request body', details },
    });
  }

  const user = usersStore.insert({ name, email });
  res.status(201).json({ data: user });
});

module.exports = router;
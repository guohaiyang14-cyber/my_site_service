const { Router } = require('express');
const router = Router();

// GET /api/health -> 200
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: Number(process.uptime().toFixed(2)),
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
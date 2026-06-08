const { Router } = require('express');
const auth = require('../middlewares/auth.middleware');
const db = require('../../config/database');

const router = Router();

router.get('/', auth, async (req, res, next) => {
  try {
    const clients = await db('clients')
      .select('*')
      .orderBy('creado_en', 'desc');
    res.json({ data: clients });
  } catch (err) { next(err); }
});

module.exports = router;

const { Router } = require('express');
const auth = require('../middlewares/auth.middleware');
const db = require('../../config/database');

const router = Router();

router.get('/resumen', auth, async (req, res, next) => {
  try {
    const [leads] = await db('quotes').count('* as total');
    const [pqrs] = await db('pqrs').count('* as total');
    const [clientes] = await db('clients').count('* as total');
    const leadsHoy = await db('quotes')
      .whereRaw("creado_en::date = CURRENT_DATE")
      .count('* as total');

    res.json({
      total_leads: Number(leads.total),
      total_pqrs: Number(pqrs.total),
      total_clientes: Number(clientes.total),
      leads_hoy: Number(leadsHoy[0].total),
    });
  } catch (err) { next(err); }
});

module.exports = router;
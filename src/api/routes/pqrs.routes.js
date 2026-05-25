const { Router } = require('express');
const auth = require('../middlewares/auth.middleware');
const { listar, actualizarEstado } = require('../controllers/pqrs.controller');

const router = Router();

router.get('/', auth, listar);
router.patch('/:id/estado', auth, actualizarEstado);

module.exports = router;
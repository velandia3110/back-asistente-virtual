const { Router } = require('express');
const auth = require('../middlewares/auth.middleware');
const { listar, actualizarEstado, eliminar } = require('../controllers/lead.controller');

const router = Router();

router.get('/', auth, listar);
router.patch('/:id/estado', auth, actualizarEstado);
router.delete('/:id', auth, eliminar);

module.exports = router;
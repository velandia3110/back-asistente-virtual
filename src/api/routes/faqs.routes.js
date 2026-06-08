const { Router } = require('express');
const auth = require('../middlewares/auth.middleware');
const { listar, actualizar, toggleActivo } = require('../controllers/faq.controller');

const router = Router();

router.get('/', auth, listar);
router.patch('/:id', auth, actualizar);
router.patch('/:id/activo', auth, toggleActivo);

module.exports = router;

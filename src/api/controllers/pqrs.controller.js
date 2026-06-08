const pqrsService = require('../../services/pqrs.service');

async function listar(req, res, next) {
  try {
    const { page, limit, estado } = req.query;
    const pqrs = await pqrsService.listar({ page: Number(page) || 1, limit: Number(limit) || 20, estado });
    res.json({ data: pqrs });
  } catch (err) { next(err); }
}

async function actualizarEstado(req, res, next) {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    await pqrsService.actualizarEstado(id, estado);
    res.json({ mensaje: 'Estado de PQRS actualizado' });
  } catch (err) { next(err); }
}

async function eliminar(req, res, next) {
  try {
    const { id } = req.params;
    await pqrsService.eliminar(id);
    res.json({ mensaje: 'PQRS eliminada' });
  } catch (err) { next(err); }
}

module.exports = { listar, actualizarEstado, eliminar };
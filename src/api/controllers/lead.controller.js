const leadService = require('../../services/lead.service');

async function listar(req, res, next) {
  try {
    const { page, limit, estado } = req.query;
    const leads = await leadService.listar({ page: Number(page) || 1, limit: Number(limit) || 20, estado });
    res.json({ data: leads });
  } catch (err) { next(err); }
}

async function actualizarEstado(req, res, next) {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    await leadService.actualizarEstado(id, estado);
    res.json({ mensaje: 'Estado actualizado' });
  } catch (err) { next(err); }
}

async function eliminar(req, res, next) {
  try {
    const { id } = req.params;
    await leadService.eliminar(id);
    res.json({ mensaje: 'Lead eliminado' });
  } catch (err) { next(err); }
}

module.exports = { listar, actualizarEstado, eliminar };
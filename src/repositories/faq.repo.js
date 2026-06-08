const db = require('../config/database');

async function getAll() {
  return db('faqs').where({ activo: true }).orderBy('orden', 'asc');
}

async function getById(id) {
  return db('faqs').where({ id_faq: id, activo: true }).first();
}

async function listarTodos() {
  return db('faqs').orderBy('orden', 'asc');
}

async function actualizar(id, { pregunta, respuesta }) {
  const [faq] = await db('faqs')
    .where({ id_faq: id })
    .update({ pregunta, respuesta })
    .returning('*');
  return faq;
}

async function toggleActivo(id, activo) {
  const [faq] = await db('faqs')
    .where({ id_faq: id })
    .update({ activo })
    .returning('*');
  return faq;
}

module.exports = { getAll, getById, listarTodos, actualizar, toggleActivo };
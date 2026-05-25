const db = require('../config/database');

async function getAll() {
  return db('faqs').where({ activo: true }).orderBy('orden', 'asc');
}

async function getById(id) {
  return db('faqs').where({ id_faq: id, activo: true }).first();
}

module.exports = { getAll, getById };
const faqRepo = require('../repositories/faq.repo');

async function listar() {
  return faqRepo.listarTodos();
}

async function actualizar(id, datos) {
  return faqRepo.actualizar(id, datos);
}

async function toggleActivo(id, activo) {
  return faqRepo.toggleActivo(id, activo);
}

module.exports = { listar, actualizar, toggleActivo };

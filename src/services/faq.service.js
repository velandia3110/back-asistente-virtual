const faqRepo = require('../repositories/faq.repo');

async function getAll() {
  return faqRepo.getAll();
}

async function getById(id) {
  return faqRepo.getById(id);
}

module.exports = { getAll, getById };
const faqService = require('../../services/faq.service');

async function listar(req, res, next) {
  try {
    const faqs = await faqService.listar();
    res.json({ data: faqs });
  } catch (err) { next(err); }
}

async function actualizar(req, res, next) {
  try {
    const { id } = req.params;
    const { pregunta, respuesta } = req.body;
    const faq = await faqService.actualizar(id, { pregunta, respuesta });
    res.json({ data: faq });
  } catch (err) { next(err); }
}

async function toggleActivo(req, res, next) {
  try {
    const { id } = req.params;
    const { activo } = req.body;
    const faq = await faqService.toggleActivo(id, activo);
    res.json({ data: faq });
  } catch (err) { next(err); }
}

module.exports = { listar, actualizar, toggleActivo };

const faqService = require('../../services/faq.service');

async function faqMenuHandler(ctx) {
  await ctx.answerCallbackQuery();
  const faqs = await faqService.getAll();

  const keyboard = {
    inline_keyboard: faqs.map(f => [{ text: f.pregunta, callback_data: `faq_${f.id}` }]),
  };

  await ctx.reply(
    '❓ *Preguntas frecuentes*\n\nSelecciona tu consulta:',
    { parse_mode: 'Markdown', reply_markup: keyboard }
  );
}

async function faqRespuestaHandler(ctx) {
  await ctx.answerCallbackQuery();
  const faqId = ctx.callbackQuery.data.replace('faq_', '');
  const faq = await faqService.getById(faqId);

  if (!faq) {
    return ctx.reply('No encontré esa pregunta. Escribe /inicio para volver al menú.');
  }

  await ctx.reply(`❓ *${faq.pregunta}*\n\n${faq.respuesta}`, { parse_mode: 'Markdown' });
}

module.exports = { faqMenuHandler, faqRespuestaHandler };
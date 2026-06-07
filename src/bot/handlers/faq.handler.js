const faqService = require('../../services/faq.service');
const { mainKeyboard } = require('../keyboards/main.keyboard');

/**
 * Muestra el listado de preguntas frecuentes.
 * Disparado por: callback_query menu_faq
 */
async function faqHandler(ctx) {
  await ctx.answerCallbackQuery();

  let faqs;
  try {
    faqs = await faqService.getAll();
  } catch (err) {
    await ctx.reply('❌ No se pudieron cargar las preguntas. Intenta más tarde.');
    return;
  }

  if (!faqs || faqs.length === 0) {
    await ctx.reply(
      'No hay preguntas frecuentes disponibles por el momento.\n\n' +
      '¿En qué más te puedo ayudar?',
      { reply_markup: mainKeyboard }
    );
    return;
  }

  // Construimos teclado dinámico desde BD — máx 10 preguntas para no saturar
  const keyboard = {
    inline_keyboard: [
      ...faqs.slice(0, 10).map(f => [{
        text: f.pregunta,
        callback_data: `faq_${f.id_faq}`,
      }]),
      [{ text: '🏠 Volver al menú', callback_data: 'menu_inicio' }],
    ],
  };

  await ctx.reply(
    '❓ *Preguntas frecuentes*\n\nSelecciona tu consulta:',
    { parse_mode: 'Markdown', reply_markup: keyboard }
  );
}

/**
 * Muestra la respuesta a una pregunta específica.
 * Disparado por: callback_query faq_<id>
 */
async function faqRespuestaHandler(ctx) {
  await ctx.answerCallbackQuery();

  const faqId = ctx.callbackQuery.data.replace('faq_', '');

  let faq;
  try {
    faq = await faqService.getById(faqId);
  } catch (err) {
    await ctx.reply('❌ Error al cargar la respuesta. Intenta más tarde.');
    return;
  }

  if (!faq) {
    await ctx.reply(
      'No encontré esa pregunta.\n\nEscribe /inicio para volver al menú.'
    );
    return;
  }

  const volverKeyboard = {
    inline_keyboard: [[
      { text: '↩️ Ver más preguntas', callback_data: 'menu_faq' },
      { text: '🏠 Menú principal',    callback_data: 'menu_inicio' },
    ]],
  };

  await ctx.reply(
    `❓ *${faq.pregunta}*\n\n${faq.respuesta}`,
    { parse_mode: 'Markdown', reply_markup: volverKeyboard }
  );
}

module.exports = { faqHandler, faqRespuestaHandler };
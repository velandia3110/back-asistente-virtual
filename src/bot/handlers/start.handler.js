const { mainKeyboard } = require('../keyboards/main.keyboard');

/**
 * Responde a /start e /inicio mostrando el menú principal.
 */
async function startHandler(ctx) {
  const nombre = ctx.from?.first_name || 'cliente';
  await ctx.reply(
    `¡Hola ${nombre}! 👋 Bienvenido al asistente virtual de *Gruizajes*.\n\n` +
    `Somos especialistas en alquiler de grúas telescópicas para izajes de carga industrial.\n\n` +
    `¿En qué te puedo ayudar hoy?`,
    { parse_mode: 'Markdown', reply_markup: mainKeyboard }
  );
}

/**
 * Vuelve al menú principal desde cualquier punto.
 * Disparado por: callback_query menu_inicio
 */
async function menuPrincipalHandler(ctx) {
  if (ctx.callbackQuery) await ctx.answerCallbackQuery();
  await ctx.reply(
    '🏠 *Menú principal*\n\n¿En qué te puedo ayudar?',
    { parse_mode: 'Markdown', reply_markup: mainKeyboard }
  );
}

module.exports = { startHandler, menuPrincipalHandler };
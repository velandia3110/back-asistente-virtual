const { mainKeyboard } = require('../keyboards/main.keyboard');

async function startHandler(ctx) {
  const nombre = ctx.from.first_name || 'cliente';
  await ctx.reply(
    `¡Hola ${nombre}! 👋 Bienvenido al asistente virtual de *Gruizajes*.\n\n` +
    `Somos especialistas en alquiler de grúas telescópicas para izajes de carga industrial.\n\n` +
    `¿En qué te puedo ayudar hoy?`,
    { parse_mode: 'Markdown', reply_markup: mainKeyboard }
  );
}

module.exports = startHandler;
const { tipoPqrsKeyboard } = require('../keyboards/pqrs.keyboard');

async function pqrsMenuHandler(ctx) {
  await ctx.answerCallbackQuery();
  await ctx.reply(
    '📝 *Sistema PQRS*\n\n' +
    'Selecciona el tipo de solicitud:',
    { parse_mode: 'Markdown', reply_markup: tipoPqrsKeyboard }
  );
}

async function pqrsInicioHandler(ctx) {
  await ctx.answerCallbackQuery();
  await ctx.conversation.enter('pqrsScene');
}

module.exports = { pqrsMenuHandler, pqrsInicioHandler };
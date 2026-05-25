const pqrsService = require('../../services/pqrs.service');
const { confirmPqrsKeyboard } = require('../keyboards/pqrs.keyboard');
const { formatPqrs } = require('../../utils/formatters');

async function pqrsScene(conversation, ctx) {
  const data = {};

  data.tipo = ctx.session.pqrsData.tipo || 'peticion';

  await ctx.reply('📝 Describe detalladamente tu ' + data.tipo + ':');
  const descMsg = await conversation.waitFor('message:text');
  data.descripcion = descMsg.message.text;

  await ctx.reply(
    `📋 *Resumen de tu PQRS:*\n\n` +
    `🏷️ Tipo: ${data.tipo.toUpperCase()}\n` +
    `📄 Descripción: ${data.descripcion}\n\n` +
    `¿Deseas enviarla?`,
    { parse_mode: 'Markdown', reply_markup: confirmPqrsKeyboard }
  );

  const confirmCtx = await conversation.waitFor('callback_query:data');
  await confirmCtx.answerCallbackQuery();

  if (confirmCtx.callbackQuery.data === 'pqrs_confirmar') {
    data.telegram_id = String(ctx.from.id);
    const pqrs = await pqrsService.crear(data);
    await ctx.reply(
      `✅ Tu PQRS fue radicada exitosamente.\n\n` +
      `📌 Número de radicado: *${pqrs.radicado}*\n\n` +
      `Te notificaremos cuando tengamos una respuesta.`,
      { parse_mode: 'Markdown' }
    );
  } else {
    await ctx.reply('PQRS cancelada. Escribe /inicio para volver al menú.');
  }
}

module.exports = pqrsScene;
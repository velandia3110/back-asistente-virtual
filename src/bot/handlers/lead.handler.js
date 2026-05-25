const { conversations, createConversation } = require('@grammyjs/conversations');
const leadScene = require('../scenes/lead.scene');

async function leadMenuHandler(ctx) {
  await ctx.answerCallbackQuery();
  await ctx.reply(
    '🏗️ *Solicitud de cotización*\n\n' +
    'Voy a hacerte algunas preguntas sobre tu proyecto para enviarte una cotización precisa.\n\n' +
    '¿Listo para comenzar?',
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[{ text: '✅ Sí, comenzar', callback_data: 'lead_inicio' }]],
      },
    }
  );
}

async function leadInicioHandler(ctx) {
  await ctx.answerCallbackQuery();
  await ctx.conversation.enter('leadScene');
}

module.exports = { leadMenuHandler, leadInicioHandler };
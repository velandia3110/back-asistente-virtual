const { conversations, createConversation } = require('@grammyjs/conversations');
const bot = require('../config/telegram');
const loggerMiddleware = require('./middlewares/logger');
const sessionMiddleware = require('./middlewares/session');
const startHandler = require('./handlers/start.handler');
const { leadMenuHandler, leadInicioHandler } = require('./handlers/lead.handler');
const { pqrsMenuHandler, pqrsInicioHandler } = require('./handlers/pqrs.handler');
const { faqMenuHandler, faqRespuestaHandler } = require('./handlers/faq.handler');
const leadScene = require('./scenes/lead.scene');
const pqrsScene = require('./scenes/pqrs.scene');

bot.use(loggerMiddleware);
bot.use(sessionMiddleware);
bot.use(conversations());
bot.use(createConversation(leadScene, 'leadScene'));
bot.use(createConversation(pqrsScene, 'pqrsScene'));

bot.command(['start', 'inicio'], startHandler);

bot.callbackQuery('menu_cotizacion', leadMenuHandler);
bot.callbackQuery('lead_inicio', leadInicioHandler);

bot.callbackQuery('menu_pqrs', pqrsMenuHandler);
bot.callbackQuery(/^pqrs_(peticion|queja|reclamo|sugerencia)$/, async (ctx) => {
  ctx.session.pqrsData.tipo = ctx.callbackQuery.data.replace('pqrs_', '');
  await pqrsInicioHandler(ctx);
});

bot.callbackQuery('menu_faq', faqMenuHandler);
bot.callbackQuery(/^faq_\d+$/, faqRespuestaHandler);

bot.callbackQuery('menu_asesor', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply('📞 Para hablar con un asesor llámanos al *+57 300 000 0000* o escríbenos al correo *comercial@gruizajes.com*', { parse_mode: 'Markdown' });
});

bot.catch((err) => {
  const logger = require('../utils/logger');
  logger.error(`Error en el bot: ${err.message}`, { stack: err.stack });
});

module.exports = bot;
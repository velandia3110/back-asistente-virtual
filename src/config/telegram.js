const { Bot, session } = require('grammy');
const { conversations, createConversation } = require('@grammyjs/conversations');
const env    = require('./env');
const logger = require('../utils/logger');

// ── Scenes ────────────────────────────────────────────────────────────────────
const leadScene         = require('../bot/scenes/lead.scene');
const pqrsScene         = require('../bot/scenes/pqrs.scene');
const pqrsConsultaScene = require('../bot/scenes/pqrs_consulta.scene');
const asesorScene       = require('../bot/scenes/asesor.scene');

// ── Handlers ──────────────────────────────────────────────────────────────────
const { startHandler, menuPrincipalHandler }          = require('../bot/handlers/start.handler');
const { faqHandler, faqRespuestaHandler }             = require('../bot/handlers/faq.handler');
const { pqrsMenuHandler, pqrsTipoHandler,
        pqrsConsultarHandler }                        = require('../bot/handlers/pqrs.handler');
const { mainKeyboard }                               = require('../bot/keyboards/main.keyboard');

// ── Bot ───────────────────────────────────────────────────────────────────────
const bot = new Bot(env.TELEGRAM_BOT_TOKEN);

// ── 1. Sesión — DEBE ir antes de conversations ────────────────────────────────
bot.use(session({
  initial: () => ({ pqrsData: {} }),
}));

// ── 2. Conversations middleware ───────────────────────────────────────────────
bot.use(conversations());

// ── 3. Registrar escenas — DEBE ir antes de los handlers ─────────────────────
bot.use(createConversation(leadScene,         'leadScene'));
bot.use(createConversation(pqrsScene,         'pqrsScene'));
bot.use(createConversation(pqrsConsultaScene, 'pqrsConsultaScene'));
bot.use(createConversation(asesorScene,       'asesorScene'));

// ── 4. Comandos ───────────────────────────────────────────────────────────────
bot.command(['start', 'inicio'], startHandler);

// ── 5. Callback queries — menú principal ──────────────────────────────────────
bot.callbackQuery('menu_cotizacion', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.conversation.enter('leadScene');
});

bot.callbackQuery('menu_pqrs',           pqrsMenuHandler);
bot.callbackQuery('menu_consultar_pqrs', pqrsConsultarHandler);
bot.callbackQuery('menu_faq',            faqHandler);

bot.callbackQuery('menu_asesor', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.conversation.enter('asesorScene');
});

// ── 6. Callback queries — tipos PQRS ─────────────────────────────────────────
bot.callbackQuery(
  ['pqrs_tipo_peticion', 'pqrs_tipo_queja', 'pqrs_tipo_reclamo', 'pqrs_tipo_sugerencia'],
  pqrsTipoHandler
);

// ── 7. Callback queries — FAQ (id dinámico desde BD) ─────────────────────────
bot.callbackQuery(/^faq_/, faqRespuestaHandler);

// ── 8. Callback global — volver al menú principal ──────────────────────────────
bot.callbackQuery('menu_principal', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply(
    '¿En qué te puedo ayudar?',
    { reply_markup: mainKeyboard }
  );
});

// ── 8. Mensajes de texto SIN escena activa ────────────────────────────────────
// IMPORTANTE: este handler solo se ejecuta cuando no hay ninguna conversación
// activa. Grammy conversations intercepta primero los mensajes dentro de escenas.
bot.on('message:text', async (ctx) => {
  await ctx.reply(
    '¿En qué te puedo ayudar? Usa el menú:',
    { reply_markup: mainKeyboard }
  );
});

// ── 9. Ubicación sin escena activa ────────────────────────────────────────────
bot.on('message:location', async (ctx) => {
  await ctx.reply(
    '📍 Ubicación recibida. Usa el menú para iniciar una solicitud:',
    { reply_markup: mainKeyboard }
  );
});

// ── 10. Manejo global de errores ──────────────────────────────────────────────
bot.catch((err) => {
  const { ctx, error } = err;
  logger.error(`Error en bot [${ctx?.updateType}]: ${error?.message || error}`);
  ctx?.reply('❌ Ocurrió un error inesperado.\n\n¿Qué deseas hacer ahora?', {
    reply_markup: mainKeyboard,
  }).catch(() => {});
});

module.exports = bot;
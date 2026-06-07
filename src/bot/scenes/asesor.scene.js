const leadRepo = require('../../repositories/lead.repo');
const notificationService = require('../../services/notification.service');
const conversationService = require('../../services/conversation.service');
const { parseText, parsePhone } = require('../../utils/validators');
const { mainKeyboard } = require('../keyboards/main.keyboard');
const { InlineKeyboard } = require('grammy');
const logger = require('../../utils/logger');

const MAX_INTENTOS = 3;

async function asesorScene(conversation, ctx) {
  // ── Nombre ─────────────────────────────────────────────────────────────────
  await ctx.reply(
    '📞 *Hablar con un asesor*\n\n' +
    'Con gusto te conectamos. ¿Cuál es tu nombre completo?',
    { parse_mode: 'Markdown' }
  );

  let nombre = null;
  for (let i = 0; i < MAX_INTENTOS; i++) {
    const msg = await conversation.waitFor('message:text');
    nombre = parseText(msg.message.text, 2, 100);
    if (nombre) break;
    const restantes = MAX_INTENTOS - i - 1;
    if (restantes > 0) {
      await ctx.reply(
        `❌ Nombre inválido. Ingresa tu nombre completo.\n_Intentos restantes: ${restantes}_`,
        { parse_mode: 'Markdown' }
      );
    }
  }
  if (!nombre) {
    await ctx.reply('❌ Demasiados intentos. Escribe /inicio para comenzar de nuevo.');
    return;
  }

  // ── Teléfono ───────────────────────────────────────────────────────────────
  await ctx.reply(
    `Hola *${nombre}*, ¿cuál es tu número de teléfono?\n_Ejemplo: 3001234567_`,
    { parse_mode: 'Markdown' }
  );

  let telefono = null;
  for (let i = 0; i < MAX_INTENTOS; i++) {
    const msg = await conversation.waitFor('message:text');
    telefono = parsePhone(msg.message.text);
    if (telefono) break;
    const restantes = MAX_INTENTOS - i - 1;
    if (restantes > 0) {
      await ctx.reply(
        `❌ Teléfono inválido. Ingresa 10 dígitos, ejemplo: *3001234567*\n_Intentos restantes: ${restantes}_`,
        { parse_mode: 'Markdown' }
      );
    }
  }
  if (!telefono) {
    await ctx.reply('❌ Demasiados intentos. Escribe /inicio para comenzar de nuevo.');
    return;
  }

  // ── Consulta ───────────────────────────────────────────────────────────────
  await ctx.reply('¿En qué te podemos ayudar? Cuéntanos brevemente tu consulta:');

  let consulta = null;
  for (let i = 0; i < MAX_INTENTOS; i++) {
    const msg = await conversation.waitFor('message:text');
    consulta = parseText(msg.message.text, 5, 500);
    if (consulta) break;
    const restantes = MAX_INTENTOS - i - 1;
    if (restantes > 0) {
      await ctx.reply(
        `❌ Descripción muy corta. Por favor detalla tu consulta.\n_Intentos restantes: ${restantes}_`,
        { parse_mode: 'Markdown' }
      );
    }
  }
  if (!consulta) {
    await ctx.reply('❌ Demasiados intentos. Escribe /inicio para comenzar de nuevo.');
    return;
  }

  // ── Guardar y notificar ────────────────────────────────────────────────────
  try {
    const telegramId = String(ctx.from.id);

    // Crear o actualizar cliente
    let cliente = await leadRepo.buscarClientePorTelegram(telegramId);
    if (!cliente) {
      cliente = await leadRepo.crearCliente({ nombre, telefono, telegram_id: telegramId });
    }

    // Registrar en historial
    const conv = await conversationService.iniciar(cliente.id_client);
    if (conv) {
      await conversationService.registrarMensaje(
        conv.id_conversations,
        `Solicitud de asesor: ${consulta}`,
        'cliente'
      );
      await conversationService.cerrar(conv.id_conversations);
    }

    // Notificar al equipo comercial
    await notificationService.notificarNuevoLead_Asesor({ nombre, telefono, consulta });

    logger.info(`Solicitud de asesor registrada: ${nombre} — ${telefono}`);

    const volverKeyboard = new InlineKeyboard()
      .text('🏠 Volver al menú', 'menu_inicio');

    await ctx.reply(
      `✅ *Solicitud registrada exitosamente*\n\n` +
      `Hola *${nombre}*, uno de nuestros asesores te contactará al número *${telefono}* a la brevedad posible.\n\n` +
      `🕐 _Horario de atención: lunes a viernes, 7am – 6pm_`,
      { parse_mode: 'Markdown', reply_markup: volverKeyboard }
    );
  } catch (err) {
    logger.error(`asesorScene error: ${err.message}`);
    await ctx.reply(
      '❌ Ocurrió un error al registrar tu solicitud. Por favor intenta más tarde.',
      { reply_markup: mainKeyboard }
    );
  }
}

module.exports = asesorScene;
const leadRepo = require('../../repositories/lead.repo');
const notificationService = require('../../services/notification.service');
const conversationService = require('../../services/conversation.service');
const { parseText, parsePhone } = require('../../utils/validators');
const { mainKeyboard } = require('../keyboards/main.keyboard');
const { InlineKeyboard } = require('grammy');
const logger = require('../../utils/logger');

const MAX_INTENTOS = 3;

async function asesorScene(conversation, ctx) {
  const telegramId = String(ctx.from.id);
  const cliente = await leadRepo.buscarClientePorTelegram(telegramId);
  let nombre = null;
  let telefono = null;

  if (cliente) {
    const opcionesCliente = new InlineKeyboard()
      .text('✅ Continuar', 'client_use_data')
      .text('✏️ Actualizar datos', 'client_update_data');

    await ctx.reply(
      `👤 Tenemos registrados los siguientes datos:\n\nNombre: ${cliente.nombre}\nTeléfono: ${cliente.telefono}\n\n¿Deseas utilizarlos?`,
      { reply_markup: opcionesCliente }
    );

    const opcionCtx = await conversation.waitFor('callback_query:data');
    await opcionCtx.answerCallbackQuery();

    if (opcionCtx.callbackQuery.data === 'client_use_data') {
      nombre = cliente.nombre;
      telefono = cliente.telefono;
    }
  }

  if (!nombre) {
    await ctx.reply(
      '📞 *Hablar con un asesor*\n\n' +
      'Con gusto te conectamos. ¿Cuál es tu nombre completo?',
      { parse_mode: 'Markdown' }
    );

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
      await ctx.reply(
        '❌ Demasiados intentos fallidos.\n\n¿Qué deseas hacer ahora?',
        { reply_markup: mainKeyboard }
      );
      return;
    }
  }

  // ── Teléfono ───────────────────────────────────────────────────────────────
  if (!telefono) {
    await ctx.reply(
      `Hola *${nombre}*, ¿cuál es tu número de teléfono?\n_Ejemplo: 3001234567_`,
      { parse_mode: 'Markdown' }
    );

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
      await ctx.reply(
        '❌ Demasiados intentos fallidos.\n\n¿Qué deseas hacer ahora?',
        { reply_markup: mainKeyboard }
      );
      return;
    }
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
    await ctx.reply(
      '❌ Demasiados intentos fallidos.\n\n¿Qué deseas hacer ahora?',
      { reply_markup: mainKeyboard }
    );
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

    await ctx.reply(
      `✅ *Solicitud registrada exitosamente*\n\n` +
      `Hola *${nombre}*, uno de nuestros asesores te contactará al número *${telefono}* a la brevedad posible.\n\n` +
      `🕐 _Horario de atención: lunes a viernes, 7am – 6pm_\n\n` +
      `¿Hay algo más en lo que te pueda ayudar?`,
      { parse_mode: 'Markdown', reply_markup: mainKeyboard }
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
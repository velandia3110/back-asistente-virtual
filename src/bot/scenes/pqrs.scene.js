const pqrsService = require('../../services/pqrs.service');
const { confirmPqrsKeyboard } = require('../keyboards/pqrs.keyboard');
const { formatPqrs } = require('../../utils/formatters');
const { parseText, parsePhone, parseEmail } = require('../../utils/validators');

const MAX_INTENTOS = 3;

const TIPOS_LEGIBLES = {
  peticion:   'Petición',
  queja:      'Queja',
  reclamo:    'Reclamo',
  sugerencia: 'Sugerencia',
};

async function pqrsScene(conversation, ctx) {
  const data = {};

  // El tipo ya viene del handler que entró a la escena
  data.tipo = ctx.session.pqrsData?.tipo || 'peticion';

  // ── Nombre ────────────────────────────────────────────────────────────────
  await ctx.reply('👤 ¿Cuál es tu nombre completo?');
  data.nombre = await pedirTexto(conversation, ctx, {
    min: 2, max: 100,
    error: '❌ Nombre inválido. Ingresa tu nombre completo (mínimo 2 caracteres).',
  });
  if (!data.nombre) return;

  // ── Teléfono ──────────────────────────────────────────────────────────────
  await ctx.reply('📞 ¿Cuál es tu número de teléfono?\n_Ejemplo: 3001234567_', {
    parse_mode: 'Markdown',
  });
  data.telefono = await pedirCampo(conversation, ctx, {
    parser: parsePhone,
    error: '❌ Teléfono inválido. Ingresa 10 dígitos, ejemplo: *3001234567*',
  });
  if (!data.telefono) return;

  // ── Email (opcional) ──────────────────────────────────────────────────────
  await ctx.reply(
    '📧 ¿Cuál es tu correo electrónico?\n\n_Escribe tu email o envía *omitir* para saltar este paso._',
    { parse_mode: 'Markdown' }
  );
  const emailMsg = await conversation.waitFor('message:text');
  const emailInput = emailMsg.message.text.trim().toLowerCase();
  if (emailInput !== 'omitir') {
    const email = parseEmail(emailInput);
    if (email) {
      data.email = email;
    } else {
      // Un solo reintento para email antes de continuar sin él
      await ctx.reply('❌ Email inválido. Intenta de nuevo o escribe *omitir*:', {
        parse_mode: 'Markdown',
      });
      const emailRetry = await conversation.waitFor('message:text');
      const emailRetryInput = emailRetry.message.text.trim().toLowerCase();
      if (emailRetryInput !== 'omitir') {
        const emailParsed = parseEmail(emailRetryInput);
        if (emailParsed) data.email = emailParsed;
        // Si falla de nuevo, continuamos sin email — no bloqueamos el flujo
      }
    }
  }

  // ── Descripción ───────────────────────────────────────────────────────────
  const tipoLegible = TIPOS_LEGIBLES[data.tipo] || data.tipo;
  await ctx.reply(`📝 Describe detalladamente tu ${tipoLegible.toLowerCase()}:`);
  data.descripcion = await pedirTexto(conversation, ctx, {
    min: 10, max: 1000,
    error: '❌ Descripción muy corta. Por favor detalla tu caso (mínimo 10 caracteres).',
  });
  if (!data.descripcion) return;

  // ── Confirmación ──────────────────────────────────────────────────────────
  const resumen = [
    `🏷️ *Tipo:* ${tipoLegible}`,
    `👤 *Nombre:* ${data.nombre}`,
    `📞 *Teléfono:* ${data.telefono}`,
    data.email ? `📧 *Email:* ${data.email}` : null,
    `📄 *Descripción:* ${data.descripcion}`,
  ].filter(Boolean).join('\n');

  await ctx.reply(
    `📋 *Resumen de tu PQRS:*\n\n${resumen}\n\n¿Deseas enviarla?`,
    { parse_mode: 'Markdown', reply_markup: confirmPqrsKeyboard }
  );

  const confirmCtx = await conversation.waitFor('callback_query:data');
  await confirmCtx.answerCallbackQuery();

  if (confirmCtx.callbackQuery.data === 'pqrs_confirmar') {
    data.telegram_id = String(ctx.from.id);

    try {
      const pqrs = await pqrsService.crear(data);
      await ctx.reply(
        `✅ *Tu PQRS fue radicada exitosamente.*\n\n` +
        `📌 *Número de radicado:* \`${pqrs.radicado}\`\n\n` +
        `Guarda este número para consultar el estado de tu solicitud.\n` +
        `Usa la opción _Consultar PQRS_ del menú principal.\n\n` +
        `Te notificaremos cuando tengamos una respuesta.`,
        { parse_mode: 'Markdown' }
      );
    } catch (err) {
      await ctx.reply(
        '❌ Ocurrió un error al radicar tu PQRS. Por favor intenta de nuevo más tarde.\n\n' +
        'Escribe /inicio para volver al menú.'
      );
    }
  } else {
    await ctx.reply('PQRS cancelada. Escribe /inicio para volver al menú.');
  }
}

// ── Helpers internos ──────────────────────────────────────────────────────────

async function pedirTexto(conversation, ctx, { min, max, error }) {
  for (let i = 0; i < MAX_INTENTOS; i++) {
    const msg = await conversation.waitFor('message:text');
    const texto = require('../../utils/validators').parseText(msg.message.text, min, max);
    if (texto !== null) return texto;

    const intentosRestantes = MAX_INTENTOS - i - 1;
    if (intentosRestantes > 0) {
      await ctx.reply(`${error}\n_Intentos restantes: ${intentosRestantes}_`, {
        parse_mode: 'Markdown',
      });
    }
  }
  await ctx.reply('❌ Demasiados intentos fallidos. Escribe /inicio para empezar de nuevo.');
  return null;
}

async function pedirCampo(conversation, ctx, { parser, error }) {
  for (let i = 0; i < MAX_INTENTOS; i++) {
    const msg = await conversation.waitFor('message:text');
    const valor = parser(msg.message.text);
    if (valor !== null) return valor;

    const intentosRestantes = MAX_INTENTOS - i - 1;
    if (intentosRestantes > 0) {
      await ctx.reply(`${error}\n_Intentos restantes: ${intentosRestantes}_`, {
        parse_mode: 'Markdown',
      });
    }
  }
  await ctx.reply('❌ Demasiados intentos fallidos. Escribe /inicio para empezar de nuevo.');
  return null;
}

module.exports = pqrsScene;
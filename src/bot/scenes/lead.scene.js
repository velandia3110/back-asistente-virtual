const leadService = require('../../services/lead.service');
const { tipoCargaKeyboard, confirmLeadKeyboard } = require('../keyboards/lead.keyboard');
const { formatLead } = require('../../utils/formatters');
const { parsePositiveNumber, parsePhone, parseText } = require('../../utils/validators');

// Intentos máximos por campo antes de abandonar el flujo
const MAX_INTENTOS = 3;

async function leadScene(conversation, ctx) {
  const data = {};

  // ── Nombre ────────────────────────────────────────────────────────────────
  await ctx.reply('👤 ¿Cuál es tu nombre completo?');
  data.nombre = await pedirTexto(conversation, ctx, {
    min: 2,
    max: 100,
    error: '❌ Nombre inválido. Por favor ingresa tu nombre completo (mínimo 2 caracteres).',
  });
  if (!data.nombre) return;

  // ── Teléfono ──────────────────────────────────────────────────────────────
  await ctx.reply(
    '📞 ¿Cuál es tu número de teléfono o WhatsApp?\n_Ejemplo: 3001234567_',
    { parse_mode: 'Markdown' }
  );

  data.telefono = await pedirCampo(conversation, ctx, {
    parser: parsePhone,
    error: '❌ Teléfono inválido. Ingresa 10 dígitos, ejemplo: *3001234567*',
  });

  if (!data.telefono) return;

  // ── Tipo de carga ─────────────────────────────────────────────────────────
  await ctx.reply('📦 ¿Qué tipo de carga necesitas izar?', {
    reply_markup: tipoCargaKeyboard,
  });

  const cargaCtx = await conversation.waitFor('callback_query:data');
  await cargaCtx.answerCallbackQuery();

  data.tipo_carga = cargaCtx.callbackQuery.data.replace('carga_', '');

  // ── Peso ──────────────────────────────────────────────────────────────────
  await ctx.reply(
    '⚖️ ¿Cuánto pesa la carga?\n_Ingresa solo el número en kg. Ejemplo: 5000_',
    { parse_mode: 'Markdown' }
  );

  data.peso_kg = await pedirNumero(conversation, ctx, {
    error: '❌ Peso inválido. Ingresa un número positivo en kg. Ejemplo: *5000*',
  });

  if (!data.peso_kg) return;

  // ── Altura ────────────────────────────────────────────────────────────────
  await ctx.reply(
    '📏 ¿A qué altura necesitas izar la carga?\n_Ingresa solo el número en metros. Ejemplo: 25_',
    { parse_mode: 'Markdown' }
  );

  data.altura_m = await pedirNumero(conversation, ctx, {
    error: '❌ Altura inválida. Ingresa un número positivo en metros. Ejemplo: *25*',
  });

  if (!data.altura_m) return;

  // ── Radio ─────────────────────────────────────────────────────────────────
  await ctx.reply(
    '🔄 ¿Cuál es el radio de operación requerido?\n_Ingresa solo el número en metros. Ejemplo: 15_',
    { parse_mode: 'Markdown' }
  );

  data.radio_m = await pedirNumero(conversation, ctx, {
    error: '❌ Radio inválido. Ingresa un número positivo en metros. Ejemplo: *15*',
  });

  if (!data.radio_m) return;

  // ── Ubicación (GPS o texto) ───────────────────────────────────────────────
  const locationKeyboard = {
    keyboard: [[
      { text: '📍 Compartir ubicación GPS', request_location: true }
    ]],
    resize_keyboard: true,
    one_time_keyboard: true,
  };

  await ctx.reply(
    '📍 ¿En qué ciudad o municipio se realizará el trabajo?\n\n' +
    'Puedes compartir tu ubicación GPS o escribir la dirección:',
    { reply_markup: locationKeyboard }
  );

  const ubicacion = await pedirUbicacion(conversation, ctx);

  if (!ubicacion) return;

  data.ubicacion = ubicacion.ubicacion;
  data.latitud = ubicacion.latitud;
  data.longitud = ubicacion.longitud;

  // ── Confirmación ──────────────────────────────────────────────────────────
  await ctx.reply(
    `📋 *Resumen de tu solicitud:*\n\n${formatLead(data)}\n\n¿La información es correcta?`,
    {
      parse_mode: 'Markdown',
      reply_markup: confirmLeadKeyboard,
    }
  );

  const confirmCtx = await conversation.waitFor('callback_query:data');
  await confirmCtx.answerCallbackQuery();

  if (confirmCtx.callbackQuery.data === 'lead_confirmar') {
    data.telegram_id = String(ctx.from.id);

    try {
      await leadService.crear(data);

      await ctx.reply(
        '✅ *¡Solicitud enviada con éxito!*\n\n' +
        'Nuestro equipo comercial se pondrá en contacto contigo pronto.\n\n' +
        'Escribe /inicio si necesitas algo más.',
        {
          parse_mode: 'Markdown',
          reply_markup: { remove_keyboard: true },
        }
      );
    } catch (err) {
      console.error(err);

      await ctx.reply(
        '❌ Ocurrió un error al enviar tu solicitud.\n\n' +
        'Escribe /inicio para volver al menú.',
        {
          reply_markup: { remove_keyboard: true },
        }
      );
    }
  } else {
    await ctx.reply(
      'Entendido, tu solicitud fue cancelada.\n\nEscribe /inicio para comenzar de nuevo.',
      {
        reply_markup: { remove_keyboard: true },
      }
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

async function pedirNumero(conversation, ctx, { error }) {
  for (let i = 0; i < MAX_INTENTOS; i++) {
    const msg = await conversation.waitFor('message:text');

    const num = parsePositiveNumber(msg.message.text);

    if (num !== null) {
      return num;
    }

    const restantes = MAX_INTENTOS - i - 1;

    if (restantes > 0) {
      await ctx.reply(
        `${error}\n_Intentos restantes: ${restantes}_`,
        { parse_mode: 'Markdown' }
      );
    }
  }

  await ctx.reply(
    '❌ Demasiados intentos fallidos. Escribe /inicio para empezar de nuevo.'
  );

  return null;
}

async function pedirCampo(conversation, ctx, { parser, error }) {
  for (let i = 0; i < MAX_INTENTOS; i++) {
    const msg = await conversation.waitFor('message:text');

    const valor = parser(msg.message.text);

    if (valor !== null) {
      return valor;
    }

    const restantes = MAX_INTENTOS - i - 1;

    if (restantes > 0) {
      await ctx.reply(
        `${error}\n_Intentos restantes: ${restantes}_`,
        { parse_mode: 'Markdown' }
      );
    }
  }

  await ctx.reply(
    '❌ Demasiados intentos fallidos. Escribe /inicio para empezar de nuevo.'
  );

  return null;
}

async function pedirTexto(conversation, ctx, { min, max, error }) {
  for (let i = 0; i < MAX_INTENTOS; i++) {
    const msg = await conversation.waitFor('message:text');

    const texto = parseText(msg.message.text, min, max);

    if (texto !== null) {
      return texto;
    }

    const restantes = MAX_INTENTOS - i - 1;

    if (restantes > 0) {
      await ctx.reply(
        `${error}\n_Intentos restantes: ${restantes}_`,
        { parse_mode: 'Markdown' }
      );
    }
  }

  await ctx.reply(
    '❌ Demasiados intentos fallidos. Escribe /inicio para empezar de nuevo.'
  );

  return null;
}

async function pedirUbicacion(conversation, ctx) {
  for (let i = 0; i < MAX_INTENTOS; i++) {
    const update = await conversation.wait();

    if (update.message?.location) {
      return {
        ubicacion: `GPS: ${update.message.location.latitude}, ${update.message.location.longitude}`,
        latitud: update.message.location.latitude,
        longitud: update.message.location.longitude,
      };
    }

    if (update.message?.text) {
      const texto = parseText(update.message.text, 5, 200);

      if (texto) {
        return {
          ubicacion: texto,
          latitud: null,
          longitud: null,
        };
      }
    }

    const restantes = MAX_INTENTOS - i - 1;

    if (restantes > 0) {
      await ctx.reply(
        `❌ Ubicación inválida.\nIntentos restantes: ${restantes}`
      );
    }
  }

  await ctx.reply(
    '❌ Demasiados intentos fallidos. Escribe /inicio para empezar de nuevo.'
  );

  return null;
}

module.exports = leadScene;
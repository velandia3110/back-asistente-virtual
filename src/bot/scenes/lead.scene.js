const leadService = require('../../services/lead.service');
const leadRepo = require('../../repositories/lead.repo');
const { tipoCargaKeyboard, confirmLeadKeyboard, correctionFieldsKeyboard } = require('../keyboards/lead.keyboard');
const { mainKeyboard } = require('../keyboards/main.keyboard');
const { formatLead } = require('../../utils/formatters');
const { parsePositiveNumber, parsePhone, parseText } = require('../../utils/validators');
const { InlineKeyboard } = require('grammy');

// Intentos máximos por campo antes de abandonar el flujo
const MAX_INTENTOS = 3;

async function leadScene(conversation, ctx) {
  const data = {};
  const telegramId = String(ctx.from.id);
  const cliente = await leadRepo.buscarClientePorTelegram(telegramId);

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
      data.nombre = cliente.nombre;
      data.telefono = cliente.telefono;
    }
  }

  // ── Nombre ────────────────────────────────────────────────────────────────
  if (!data.nombre) {
    await ctx.reply('👤 ¿Cuál es tu nombre completo?');
    data.nombre = await pedirTexto(conversation, ctx, {
      min: 2,
      max: 100,
      error: '❌ Nombre inválido. Por favor ingresa tu nombre completo (mínimo 2 caracteres).',
    });
    if (!data.nombre) return;
  }

  // ── Teléfono ──────────────────────────────────────────────────────────────
  if (!data.telefono) {
    await ctx.reply(
      '📞 ¿Cuál es tu número de teléfono o WhatsApp?\n_Ejemplo: 3001234567_',
      { parse_mode: 'Markdown' }
    );

    data.telefono = await pedirCampo(conversation, ctx, {
      parser: parsePhone,
      error: '❌ Teléfono inválido. Ingresa 10 dígitos, ejemplo: *3001234567*',
    });

    if (!data.telefono) return;
  }

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

  // ── Confirmación y correcciones ──────────────────────────────────────────
  while (true) {
    await ctx.reply(
      `📋 *Resumen de tu solicitud:*\n\n${formatLead(data)}\n\n¿La información es correcta?`,
      {
        parse_mode: 'Markdown',
        reply_markup: confirmLeadKeyboard,
      }
    );

    const confirmCtx = await conversation.waitFor('callback_query:data');
    await confirmCtx.answerCallbackQuery();

    const action = confirmCtx.callbackQuery.data;

    if (action === 'lead_confirmar') {
      data.telegram_id = String(ctx.from.id);

      try {
        await leadService.crear(data);

        await ctx.reply(
          '✅ *¡Solicitud enviada con éxito!*\n\n' +
          'Nuestro equipo comercial se pondrá en contacto contigo pronto.\n\n' +
          '¿Qué deseas hacer ahora?',
          {
            parse_mode: 'Markdown',
            reply_markup: { ...mainKeyboard },
          }
        );
      } catch (err) {
        console.error(err);

        await ctx.reply(
          '❌ Ocurrió un error al enviar tu solicitud.\n\n¿Qué deseas hacer ahora?',
          {
            reply_markup: mainKeyboard,
          }
        );
      }

      return;
    }

    if (action === 'lead_cancelar') {
      await ctx.reply(
        'Entendido, tu solicitud fue cancelada.\n\n¿Qué deseas hacer ahora?',
        {
          reply_markup: mainKeyboard,
        }
      );

      return;
    }

    if (action === 'lead_corregir') {
      await ctx.reply('Selecciona el dato que deseas corregir:', {
        reply_markup: correctionFieldsKeyboard,
      });

      const fieldCtx = await conversation.waitFor('callback_query:data');
      await fieldCtx.answerCallbackQuery();

      const field = fieldCtx.callbackQuery.data;

      if (field === 'lead_volver_resumen') {
        continue;
      }

      if (field === 'edit_nombre') {
        await ctx.reply('👤 Ingresa tu nombre completo:');
        const nuevoNombre = await pedirTexto(conversation, ctx, {
          min: 2,
          max: 100,
          error: '❌ Nombre inválido. Ingresa tu nombre completo (mínimo 2 caracteres).',
        });
        if (nuevoNombre) data.nombre = nuevoNombre;
        continue;
      }

      if (field === 'edit_telefono') {
        await ctx.reply('📞 Ingresa tu número de teléfono o WhatsApp:\n_Ejemplo: 3001234567_', {
          parse_mode: 'Markdown',
        });
        const nuevoTelefono = await pedirCampo(conversation, ctx, {
          parser: parsePhone,
          error: '❌ Teléfono inválido. Ingresa 10 dígitos, ejemplo: *3001234567*',
        });
        if (nuevoTelefono) data.telefono = nuevoTelefono;
        continue;
      }

      if (field === 'edit_tipo_carga') {
        await ctx.reply('📦 Selecciona el tipo de carga:', {
          reply_markup: tipoCargaKeyboard,
        });
        const cargaCtx = await conversation.waitFor('callback_query:data');
        await cargaCtx.answerCallbackQuery();
        data.tipo_carga = cargaCtx.callbackQuery.data.replace('carga_', '');
        continue;
      }

      if (field === 'edit_peso') {
        await ctx.reply('⚖️ Ingresa el peso de la carga en kg (solo número):', {
          parse_mode: 'Markdown',
        });
        const nuevoPeso = await pedirNumero(conversation, ctx, {
          error: '❌ Peso inválido. Ingresa un número positivo en kg. Ejemplo: *5000*',
        });
        if (nuevoPeso !== null) data.peso_kg = nuevoPeso;
        continue;
      }

      if (field === 'edit_altura') {
        await ctx.reply('📏 Ingresa la altura en metros (solo número):', {
          parse_mode: 'Markdown',
        });
        const nuevaAltura = await pedirNumero(conversation, ctx, {
          error: '❌ Altura inválida. Ingresa un número positivo en metros. Ejemplo: *25*',
        });
        if (nuevaAltura !== null) data.altura_m = nuevaAltura;
        continue;
      }

      if (field === 'edit_radio') {
        await ctx.reply('🔄 Ingresa el radio de operación en metros (solo número):', {
          parse_mode: 'Markdown',
        });
        const nuevoRadio = await pedirNumero(conversation, ctx, {
          error: '❌ Radio inválido. Ingresa un número positivo en metros. Ejemplo: *15*',
        });
        if (nuevoRadio !== null) data.radio_m = nuevoRadio;
        continue;
      }

      if (field === 'edit_ubicacion') {
        const locationKeyboard = {
          keyboard: [[
            { text: '📍 Compartir ubicación GPS', request_location: true }
          ]],
          resize_keyboard: true,
          one_time_keyboard: true,
        };

        await ctx.reply(
          '📍 Comparte tu ubicación GPS o escribe la dirección:',
          { reply_markup: locationKeyboard }
        );

        const nuevaUbicacion = await pedirUbicacion(conversation, ctx);
        if (nuevaUbicacion) {
          data.ubicacion = nuevaUbicacion.ubicacion;
          data.latitud = nuevaUbicacion.latitud;
          data.longitud = nuevaUbicacion.longitud;
        }
        continue;
      }
    }
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
    '❌ Demasiados intentos fallidos.\n\n¿Qué deseas hacer ahora?',
    { reply_markup: mainKeyboard }
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
    '❌ Demasiados intentos fallidos.\n\n¿Qué deseas hacer ahora?',
    { reply_markup: mainKeyboard }
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
    '❌ Demasiados intentos fallidos.\n\n¿Qué deseas hacer ahora?',
    { reply_markup: mainKeyboard }
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
    '❌ Demasiados intentos fallidos.\n\n¿Qué deseas hacer ahora?',
    { reply_markup: mainKeyboard }
  );

  return null;
}

module.exports = leadScene;
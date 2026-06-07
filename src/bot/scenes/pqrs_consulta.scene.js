const pqrsService = require('../../services/pqrs.service');
const { formatPqrs } = require('../../utils/formatters');
const { mainKeyboard } = require('../keyboards/main.keyboard');

async function pqrsConsultaScene(conversation, ctx) {
  await ctx.reply(
    '🔍 *Consultar estado de PQRS*\n\n' +
    'Ingresa tu número de radicado:\n' +
    '_Ejemplo: PQRS-20250607-4821_',
    { parse_mode: 'Markdown' }
  );

  // ── Hasta 3 intentos para ingresar un radicado válido ─────────────────────
  const MAX_INTENTOS = 3;

  for (let i = 0; i < MAX_INTENTOS; i++) {
    const msg = await conversation.waitFor('message:text');
    const radicado = msg.message.text.trim().toUpperCase();

    if (radicado.length < 6) {
      const restantes = MAX_INTENTOS - i - 1;
      if (restantes > 0) {
        await ctx.reply(
          `❌ Radicado inválido. Verifica el número e intenta de nuevo.\n` +
          `_Intentos restantes: ${restantes}_`,
          { parse_mode: 'Markdown' }
        );
      }
      continue;
    }

    let pqrs;
    try {
      pqrs = await pqrsService.consultarPorRadicado(radicado);
    } catch (err) {
      await ctx.reply(
        '❌ Error al consultar. Por favor intenta más tarde.',
        { reply_markup: mainKeyboard }
      );
      return;
    }

    if (!pqrs) {
      const restantes = MAX_INTENTOS - i - 1;
      if (restantes > 0) {
        await ctx.reply(
          `❌ No encontramos una PQRS con el radicado *${radicado}*.\n\n` +
          `Verifica el número e intenta de nuevo.\n` +
          `_Intentos restantes: ${restantes}_`,
          { parse_mode: 'Markdown' }
        );
        continue;
      } else {
        await ctx.reply(
          `❌ No encontramos la PQRS *${radicado}*.\n\n` +
          `Si crees que es un error, contáctanos directamente.`,
          { parse_mode: 'Markdown', reply_markup: mainKeyboard }
        );
        return;
      }
    }

    // ── PQRS encontrada ──────────────────────────────────────────────────────
    const volverKeyboard = {
      inline_keyboard: [[
        { text: '🔍 Consultar otro radicado', callback_data: 'menu_consultar_pqrs' },
        { text: '🏠 Menú principal',          callback_data: 'menu_inicio' },
      ]],
    };

    await ctx.reply(
      formatPqrs(pqrs),
      { parse_mode: 'Markdown', reply_markup: volverKeyboard }
    );
    return;
  }
}

module.exports = pqrsConsultaScene;
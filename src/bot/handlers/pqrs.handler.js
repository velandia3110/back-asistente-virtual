const { tipoPqrsKeyboard } = require('../keyboards/pqrs.keyboard');

// Mapa de callback_data → valor interno
const TIPOS_PQRS = {
  pqrs_tipo_peticion:   'peticion',
  pqrs_tipo_queja:      'queja',
  pqrs_tipo_reclamo:    'reclamo',
  pqrs_tipo_sugerencia: 'sugerencia',
};

/**
 * Muestra el menú de tipos de PQRS.
 * Disparado por: callback_query menu_pqrs
 */
async function pqrsMenuHandler(ctx) {
  await ctx.answerCallbackQuery();
  await ctx.reply(
    '📝 *Sistema PQRS*\n\n' +
    'Selecciona el tipo de solicitud:',
    { parse_mode: 'Markdown', reply_markup: tipoPqrsKeyboard }
  );
}

/**
 * Captura el tipo seleccionado y entra a la escena de PQRS.
 * Disparado por: callback_query pqrs_tipo_*
 */
async function pqrsTipoHandler(ctx) {
  await ctx.answerCallbackQuery();

  const tipo = TIPOS_PQRS[ctx.callbackQuery.data];
  if (!tipo) return;

  // Guardamos el tipo en sesión para que la escena lo lea
  ctx.session.pqrsData = { tipo };

  await ctx.conversation.enter('pqrsScene');
}

/**
 * Inicia la escena de consulta de PQRS por radicado.
 * Disparado por: callback_query menu_consultar_pqrs
 */
async function pqrsConsultarHandler(ctx) {
  await ctx.answerCallbackQuery();
  await ctx.conversation.enter('pqrsConsultaScene');
}

module.exports = { pqrsMenuHandler, pqrsTipoHandler, pqrsConsultarHandler };
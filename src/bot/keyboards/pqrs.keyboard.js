const { InlineKeyboard } = require('grammy');

const tipoPqrsKeyboard = new InlineKeyboard()
  .text('📩 Petición',   'pqrs_tipo_peticion').row()
  .text('😤 Queja',      'pqrs_tipo_queja').row()
  .text('⚠️ Reclamo',   'pqrs_tipo_reclamo').row()
  .text('💡 Sugerencia', 'pqrs_tipo_sugerencia');

const confirmPqrsKeyboard = new InlineKeyboard()
  .text('✅ Enviar PQRS', 'pqrs_confirmar')
  .text('❌ Cancelar',    'pqrs_cancelar');

module.exports = { tipoPqrsKeyboard, confirmPqrsKeyboard };
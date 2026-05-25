const { InlineKeyboard } = require('grammy');

const tipoPqrsKeyboard = new InlineKeyboard()
  .text('📩 Petición', 'pqrs_peticion').row()
  .text('😤 Queja', 'pqrs_queja').row()
  .text('⚠️ Reclamo', 'pqrs_reclamo').row()
  .text('💡 Sugerencia', 'pqrs_sugerencia');

const confirmPqrsKeyboard = new InlineKeyboard()
  .text('✅ Enviar PQRS', 'pqrs_confirmar')
  .text('❌ Cancelar', 'pqrs_cancelar');

module.exports = { tipoPqrsKeyboard, confirmPqrsKeyboard };
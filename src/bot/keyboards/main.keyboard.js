const { InlineKeyboard } = require('grammy');

const mainKeyboard = new InlineKeyboard()
  .text('🏗️ Solicitar cotización', 'menu_cotizacion').row()
  .text('📝 PQRS', 'menu_pqrs').row()
  .text('❓ Preguntas frecuentes', 'menu_faq').row()
  .text('📞 Hablar con un asesor', 'menu_asesor');

module.exports = { mainKeyboard };
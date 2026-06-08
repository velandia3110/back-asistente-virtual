const { InlineKeyboard } = require('grammy');

const mainKeyboard = new InlineKeyboard()
  .text('🏗️ Solicitar cotización',  'menu_cotizacion').row()
  .text('📝 Radicar PQRS',          'menu_pqrs').row()
  .text('🔍 Consultar PQRS',        'menu_consultar_pqrs').row()
  .text('📞 Hablar con un asesor',  'menu_asesor').row()
  .text('❓ Preguntas frecuentes',  'menu_faq');

module.exports = { mainKeyboard };
const { InlineKeyboard } = require('grammy');

const tipoCargaKeyboard = new InlineKeyboard()
  .text('🏭 Industrial', 'carga_industrial').row()
  .text('🏢 Comercial', 'carga_comercial').row()
  .text('🏠 Residencial', 'carga_residencial').row()
  .text('📦 Otro', 'carga_otro');

const confirmLeadKeyboard = new InlineKeyboard()
  .text('✅ Confirmar', 'lead_confirmar')
  .text('✏️ Corregir', 'lead_corregir').row()
  .text('🏠 Menú principal', 'menu_principal');

const unidadPesoKeyboard = new InlineKeyboard()
  .text('Kilogramos (kg)', 'peso_kg')
  .text('Toneladas (ton)', 'peso_ton');

module.exports = { tipoCargaKeyboard, confirmLeadKeyboard, unidadPesoKeyboard };
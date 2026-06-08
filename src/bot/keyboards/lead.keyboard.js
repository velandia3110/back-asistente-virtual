const { InlineKeyboard } = require('grammy');

const tipoCargaKeyboard = new InlineKeyboard()
  .text('🏭 Industrial', 'carga_industrial').row()
  .text('🏢 Comercial', 'carga_comercial').row()
  .text('🏠 Residencial', 'carga_residencial').row()
  .text('📦 Otro', 'carga_otro');

const confirmLeadKeyboard = new InlineKeyboard()
  .text('✅ Confirmar', 'lead_confirmar')
  .text('✏️ Corregir información', 'lead_corregir').row()
  .text('❌ Cancelar', 'lead_cancelar');

const correctionFieldsKeyboard = new InlineKeyboard()
  .text('👤 Nombre', 'edit_nombre').row()
  .text('📞 Teléfono', 'edit_telefono').row()
  .text('📦 Tipo de carga', 'edit_tipo_carga').row()
  .text('⚖️ Peso', 'edit_peso').row()
  .text('📏 Altura', 'edit_altura').row()
  .text('🔄 Radio', 'edit_radio').row()
  .text('📍 Ubicación', 'edit_ubicacion').row()
  .text('↩️ Volver al resumen', 'lead_volver_resumen');

const unidadPesoKeyboard = new InlineKeyboard()
  .text('Kilogramos (kg)', 'peso_kg')
  .text('Toneladas (ton)', 'peso_ton');

module.exports = { tipoCargaKeyboard, confirmLeadKeyboard, unidadPesoKeyboard, correctionFieldsKeyboard };
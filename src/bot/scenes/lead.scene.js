const leadService = require('../../services/lead.service');
const { tipoCargaKeyboard, confirmLeadKeyboard } = require('../keyboards/lead.keyboard');
const { formatLead } = require('../../utils/formatters');

async function leadScene(conversation, ctx) {
  const data = {};

  await ctx.reply('👤 ¿Cuál es tu nombre completo?');
  const nombreMsg = await conversation.waitFor('message:text');
  data.nombre = nombreMsg.message.text;

  await ctx.reply('📞 ¿Cuál es tu número de teléfono o WhatsApp?');
  const telefonoMsg = await conversation.waitFor('message:text');
  data.telefono = telefonoMsg.message.text;

  await ctx.reply('📦 ¿Qué tipo de carga necesitas izar?', { reply_markup: tipoCargaKeyboard });
  const cargaCtx = await conversation.waitFor('callback_query:data');
  await cargaCtx.answerCallbackQuery();
  data.tipo_carga = cargaCtx.callbackQuery.data.replace('carga_', '');

  await ctx.reply('⚖️ ¿Cuánto pesa la carga? (ingresa solo el número en kg)');
  const pesoMsg = await conversation.waitFor('message:text');
  data.peso_kg = parseFloat(pesoMsg.message.text);

  await ctx.reply('📏 ¿A qué altura necesitas izar la carga? (en metros)');
  const alturaMsg = await conversation.waitFor('message:text');
  data.altura_m = parseFloat(alturaMsg.message.text);

  await ctx.reply('🔄 ¿Cuál es el radio de operación requerido? (en metros)');
  const radioMsg = await conversation.waitFor('message:text');
  data.radio_m = parseFloat(radioMsg.message.text);

  await ctx.reply('📍 ¿En qué ciudad o municipio se realizará el trabajo?');
  const ubicacionMsg = await conversation.waitFor('message:text');
  data.ubicacion = ubicacionMsg.message.text;

  await ctx.reply(
    `📋 *Resumen de tu solicitud:*\n\n${formatLead(data)}\n\n¿La información es correcta?`,
    { parse_mode: 'Markdown', reply_markup: confirmLeadKeyboard }
  );

  const confirmCtx = await conversation.waitFor('callback_query:data');
  await confirmCtx.answerCallbackQuery();

  if (confirmCtx.callbackQuery.data === 'lead_confirmar') {
    data.telegram_id = String(ctx.from.id);
    await leadService.crear(data);
    await ctx.reply(
      '✅ ¡Solicitud enviada con éxito!\n\n' +
      'Nuestro equipo comercial se pondrá en contacto contigo pronto.\n\n' +
      'Escribe /inicio si necesitas algo más.'
    );
  } else {
    await ctx.reply('Entendido, escribe /inicio para comenzar de nuevo.');
  }
}

module.exports = leadScene;
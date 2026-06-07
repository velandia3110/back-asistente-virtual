const conversationRepo = require('../repositories/conversation.repo');
const logger = require('../utils/logger');

/**
 * Inicia o recupera la conversación activa de un cliente.
 * Debe llamarse al inicio de cada escena.
 */
async function iniciar(clientId, canal = 'telegram') {
  try {
    return await conversationRepo.crearConversacion({ client_id: clientId, canal });
  } catch (err) {
    // No rompemos el flujo del bot si falla el registro
    logger.error(`conversation.service.iniciar: ${err.message}`);
    return null;
  }
}

/**
 * Registra un mensaje del usuario o del bot.
 * origen: 'cliente' | 'bot'
 */
async function registrarMensaje(conversationId, texto, origen = 'cliente') {
  if (!conversationId || !texto) return;
  try {
    return await conversationRepo.guardarMensaje({ conversation_id: conversationId, texto, origen });
  } catch (err) {
    logger.error(`conversation.service.registrarMensaje: ${err.message}`);
  }
}

/**
 * Cierra la conversación al terminar una escena.
 */
async function cerrar(conversationId) {
  if (!conversationId) return;
  try {
    return await conversationRepo.cerrarConversacion(conversationId);
  } catch (err) {
    logger.error(`conversation.service.cerrar: ${err.message}`);
  }
}

module.exports = { iniciar, registrarMensaje, cerrar };
const conversationRepo = require('../repositories/conversation.repo');

async function iniciar(telegramId, clientId) {
  return conversationRepo.crearConversacion({ telegram_id: telegramId, client_id: clientId });
}

async function registrarMensaje(conversationId, texto, origen = 'cliente') {
  return conversationRepo.guardarMensaje({ conversation_id: conversationId, texto, origen });
}

async function cerrar(conversationId) {
  return conversationRepo.cerrarConversacion(conversationId);
}

module.exports = { iniciar, registrarMensaje, cerrar };
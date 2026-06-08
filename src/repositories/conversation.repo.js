const db = require('../config/database');

async function crearConversacion({ client_id, canal = 'telegram' }) {
  // Si ya hay una conversación abierta para este cliente, la reutilizamos
  const existente = await db('conversations')
    .where({ client_id, estado: 'activa' })
    .first();

  if (existente) return existente;

  const [conv] = await db('conversations').insert({
    id_conversations: db.raw('gen_random_uuid()'),
    client_id,
    canal,
    estado:       'activa',
    iniciado_en:  new Date(),
  }).returning('*');
  return conv;
}

async function guardarMensaje({ conversation_id, texto, origen = 'cliente' }) {
  if (!texto) return null;

  const [mensaje] = await db('messages').insert({
    id_message:       db.raw('gen_random_uuid()'),
    conversation_id,
    origen,
    texto:            String(texto).slice(0, 4000), // límite de seguridad
    creado_en:        new Date(),
  }).returning('*');
  return mensaje;
}

async function cerrarConversacion(conversationId) {
  return db('conversations')
    .where({ id_conversations: conversationId })
    .update({ estado: 'finalizada', finalizado_en: new Date() });
}

async function listarPorCliente(clientId, limit = 10) {
  return db('conversations')
    .where({ client_id: clientId })
    .orderBy('iniciado_en', 'desc')
    .limit(limit);
}

module.exports = {
  crearConversacion,
  guardarMensaje,
  cerrarConversacion,
  listarPorCliente,
};
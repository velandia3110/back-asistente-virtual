const db = require('../config/database');

async function crearConversacion(data) {
  const [conv] = await db('conversations').insert({
    id_conversations: db.raw('gen_random_uuid()'),
    client_id: data.client_id,
    origen_id: data.telegram_id,
    canal: 'telegram',
    estado: 'activa',
    iniciado_en: new Date(),
  }).returning('*');
  return conv;
}

async function guardarMensaje(data) {
  const [msg] = await db('messages').insert({
    id_message: db.raw('gen_random_uuid()'),
    conversation_id: data.conversation_id,
    origen: data.origen,
    texto: data.texto,
    creado_en: new Date(),
  }).returning('*');
  return msg;
}

async function cerrarConversacion(conversationId) {
  return db('conversations').where({ id_conversations: conversationId })
    .update({ estado: 'finalizada', finalizado_en: new Date() });
}

module.exports = { crearConversacion, guardarMensaje, cerrarConversacion };
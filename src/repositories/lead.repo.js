const db = require('../config/database');

async function crearCliente(data) {
  const [cliente] = await db('clients').insert({
    id_client: db.raw('gen_random_uuid()'),
    nombre: data.nombre,
    telefono: data.telefono,
    telegram_id: data.telegram_id,
    creado_en: new Date(),
  }).returning('*');
  return cliente;
}

async function crearCotizacion(data) {
  const [cotizacion] = await db('quotes').insert({
    id_quote: db.raw('gen_random_uuid()'),
    client_id: data.client_id,
    tipo_carga: data.tipo_carga,
    peso_kg: data.peso_kg,
    altura_m: data.altura_m,
    radio_m: data.radio_m,
    ubicacion: data.ubicacion,
    estado_comercial: 'nuevo',
    creado_en: new Date(),
  }).returning('*');
  return cotizacion;
}

async function buscarClientePorTelegram(telegramId) {
  return db('clients').where({ telegram_id: telegramId }).first();
}

async function listarLeads({ page = 1, limit = 20, estado } = {}) {
  const query = db('quotes')
    .join('clients', 'quotes.client_id', 'clients.id_client')
    .select('quotes.*', 'clients.nombre', 'clients.telefono', 'clients.telegram_id')
    .orderBy('quotes.creado_en', 'desc')
    .limit(limit)
    .offset((page - 1) * limit);

  if (estado) query.where('quotes.estado_comercial', estado);
  return query;
}

async function actualizarEstado(quoteId, estado) {
  return db('quotes').where({ id_quote: quoteId }).update({ estado_comercial: estado });
}

module.exports = { crearCliente, crearCotizacion, buscarClientePorTelegram, listarLeads, actualizarEstado };
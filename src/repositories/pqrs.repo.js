const db = require('../config/database');

async function crear(data) {
  const radicado = `PQRS-${Date.now()}`;
  const [pqrs] = await db('pqrs').insert({
    id_pqrs: db.raw('gen_random_uuid()'),
    client_id: data.client_id,
    tipo: data.tipo,
    descripcion: data.descripcion,
    radicado,
    estado: 'abierto',
    creado_en: new Date(),
  }).returning('*');
  return pqrs;
}

async function listar({ page = 1, limit = 20, estado } = {}) {
  const query = db('pqrs')
    .join('clients', 'pqrs.client_id', 'clients.id_client')
    .select('pqrs.*', 'clients.nombre', 'clients.telefono')
    .orderBy('pqrs.creado_en', 'desc')
    .limit(limit)
    .offset((page - 1) * limit);

  if (estado) query.where('pqrs.estado', estado);
  return query;
}

async function actualizarEstado(pqrsId, estado) {
  return db('pqrs').where({ id_pqrs: pqrsId }).update({ estado });
}

module.exports = { crear, listar, actualizarEstado };
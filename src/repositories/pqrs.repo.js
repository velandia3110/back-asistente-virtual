const db = require('../config/database');

// Genera radicado legible: PQRS-20250607-4821
function generarRadicado() {
  const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const sufijo = Math.floor(1000 + Math.random() * 9000);
  return `PQRS-${fecha}-${sufijo}`;
}

async function crear(data) {
  const [pqrs] = await db('pqrs').insert({
    id_pqrs:           db.raw('gen_random_uuid()'),
    client_id:         data.client_id,
    tipo:              data.tipo,
    descripcion:       data.descripcion,
    radicado:          generarRadicado(),
    estado:            'pendiente',
    // Columnas agregadas en migración 005
    nombre_contacto:   data.nombre   || null,
    telefono_contacto: data.telefono || null,
    email:             data.email    || null,
    creado_en:         new Date(),
  }).returning('*');
  return pqrs;
}

async function buscarPorRadicado(radicado) {
  return db('pqrs')
    .where({ radicado: radicado.toUpperCase() })
    .first();
}

async function buscarPorClienteId(clientId) {
  return db('pqrs')
    .where({ client_id: clientId })
    .orderBy('creado_en', 'desc');
}

async function listar({ page = 1, limit = 20, estado } = {}) {
  const query = db('pqrs')
    .join('clients', 'pqrs.client_id', 'clients.id_client')
    .select(
      'pqrs.*',
      'clients.nombre as cliente_nombre',
      'clients.telefono as cliente_telefono'
    )
    .orderBy('pqrs.creado_en', 'desc')
    .limit(limit)
    .offset((page - 1) * limit);

  if (estado) query.where('pqrs.estado', estado);
  return query;
}

async function actualizarEstado(pqrsId, estado, observaciones = null) {
  const update = { estado };
  if (observaciones) update.observaciones = observaciones;
  return db('pqrs').where({ id_pqrs: pqrsId }).update(update);
}

module.exports = {
  crear,
  buscarPorRadicado,
  buscarPorClienteId,
  listar,
  actualizarEstado,
};
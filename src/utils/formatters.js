function formatLead(lead) {
  return (
    `📋 *Nuevo lead calificado*\n\n` +
    `👤 *Nombre:* ${lead.nombre}\n` +
    `📞 *Teléfono:* ${lead.telefono}\n` +
    `📦 *Tipo de carga:* ${lead.tipo_carga}\n` +
    `⚖️ *Peso:* ${lead.peso_kg} kg\n` +
    `📏 *Altura:* ${lead.altura_m} m\n` +
    `🔄 *Radio:* ${lead.radio_m} m\n` +
    `📍 *Ubicación:* ${lead.ubicacion}`
  );
}

function formatPqrs(pqrs) {
  return (
    `📝 *PQRS #${pqrs.radicado}*\n\n` +
    `🏷️ *Tipo:* ${pqrs.tipo.toUpperCase()}\n` +
    `📄 *Descripción:* ${pqrs.descripcion}\n` +
    `📅 *Fecha:* ${new Date(pqrs.created_at).toLocaleDateString('es-CO')}`
  );
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('es-CO', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

module.exports = { formatLead, formatPqrs, formatDate };
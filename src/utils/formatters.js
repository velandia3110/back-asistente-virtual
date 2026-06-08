// ── Mapas de etiquetas ────────────────────────────────────────────────────────

const ESTADOS_PQRS = {
  pendiente:   '⏳ Pendiente',
  en_proceso:  '🔄 En proceso',
  resuelto:    '✅ Resuelto',
  cerrado:     '📁 Cerrado',
};

const ESTADOS_COTIZACION = {
  nueva:           '🆕 Nueva',
  contactada:      '📞 Contactada',
  en_negociacion:  '🤝 En negociación',
  ganada:          '✅ Ganada',
  perdida:         '❌ Perdida',
};

// ── Formateadores ─────────────────────────────────────────────────────────────

function formatLead(lead) {
  const lines = [
    `👤 *Nombre:* ${lead.nombre}`,
    `📞 *Teléfono:* ${lead.telefono}`,
    `📦 *Tipo de carga:* ${lead.tipo_carga}`,
    `⚖️ *Peso:* ${lead.peso_kg} kg`,
    `📏 *Altura:* ${lead.altura_m} m`,
    `🔄 *Radio:* ${lead.radio_m} m`,
  ];

  if (lead.latitud && lead.longitud) {
    lines.push(`📍 *Ubicación GPS:* ${lead.latitud}, ${lead.longitud}`);
  } else if (lead.ubicacion) {
    lines.push(`📍 *Ubicación:* ${lead.ubicacion}`);
  }

  return lines.join('\n');
}

function formatLeadNotificacion(lead) {
  return `📋 *Nuevo lead calificado*\n\n${formatLead(lead)}`;
}

function formatPqrs(pqrs) {
  const lines = [
    `📝 *PQRS #${pqrs.radicado}*`,
    ``,
    `🏷️ *Tipo:* ${pqrs.tipo.toUpperCase()}`,
    `👤 *Nombre:* ${pqrs.nombre_contacto || 'No registrado'}`,
    `📞 *Teléfono:* ${pqrs.telefono_contacto || 'No registrado'}`,
  ];

  if (pqrs.email) lines.push(`📧 *Email:* ${pqrs.email}`);

  lines.push(`📄 *Descripción:* ${pqrs.descripcion}`);
  lines.push(`🔖 *Estado:* ${ESTADOS_PQRS[pqrs.estado] || pqrs.estado}`);
  lines.push(`📅 *Fecha:* ${formatDate(pqrs.creado_en)}`);

  if (pqrs.observaciones) {
    lines.push(`💬 *Observaciones:* ${pqrs.observaciones}`);
  }

  return lines.join('\n');
}

function formatCotizacion(quote) {
  const lines = [
    `🏗️ *Cotización #${quote.id_quote}*`,
    ``,
    `📦 *Tipo de carga:* ${quote.tipo_carga}`,
    `⚖️ *Peso:* ${quote.peso_kg} kg`,
    `📏 *Altura:* ${quote.altura_m} m`,
    `🔄 *Radio:* ${quote.radio_m} m`,
    `📍 *Ubicación:* ${quote.ubicacion}`,
    `🔖 *Estado:* ${ESTADOS_COTIZACION[quote.estado_comercial] || quote.estado_comercial}`,
    `📅 *Fecha:* ${formatDate(quote.creado_en)}`,
  ];

  return lines.join('\n');
}

function formatDate(date) {
  if (!date) return 'Fecha no disponible';
  return new Date(date).toLocaleDateString('es-CO', {
    year:   'numeric',
    month:  'long',
    day:    'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  });
}

module.exports = {
  formatLead,
  formatLeadNotificacion,
  formatPqrs,
  formatCotizacion,
  formatDate,
  ESTADOS_PQRS,
  ESTADOS_COTIZACION,
};
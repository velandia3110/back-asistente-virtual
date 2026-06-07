const leadRepo = require('../repositories/lead.repo');
const conversationService = require('./conversation.service');
const notificationService = require('./notification.service');
const { validateLead } = require('../utils/validators');
const logger = require('../utils/logger');

async function crear(data) {
  // ── Validación final del objeto completo ───────────────────────────────────
  const validation = validateLead(data);
  if (!validation.success) {
    const errores = validation.error.errors.map(e => e.message).join(', ');
    throw new Error(`Datos de lead inválidos: ${errores}`);
  }

  // ── Cliente: crear o actualizar ────────────────────────────────────────────
  let cliente = await leadRepo.buscarClientePorTelegram(data.telegram_id);
  if (!cliente) {
    cliente = await leadRepo.crearCliente(data);
    logger.info(`Nuevo cliente creado: ${cliente.id_client}`);
  } else {
    // Actualizamos nombre y teléfono con los datos más recientes
    cliente = await leadRepo.actualizarCliente(data.telegram_id, data);
    logger.info(`Cliente actualizado: ${cliente.id_client}`);
  }

  // ── Cotización ─────────────────────────────────────────────────────────────
  const cotizacion = await leadRepo.crearCotizacion({
    ...data,
    client_id: cliente.id_client,
  });

  // ── Historial ──────────────────────────────────────────────────────────────
  const conv = await conversationService.iniciar(cliente.id_client);
  if (conv) {
    await conversationService.registrarMensaje(
      conv.id_conversations,
      `Cotización creada: ${cotizacion.id_quote} | Carga: ${data.tipo_carga} | Peso: ${data.peso_kg}kg`,
      'sistema'
    );
    await conversationService.cerrar(conv.id_conversations);
  }

  // ── Notificación ───────────────────────────────────────────────────────────
  await notificationService.notificarNuevoLead({
    ...cotizacion,
    nombre:   data.nombre,
    telefono: data.telefono,
  });

  logger.info(`Lead creado: quote=${cotizacion.id_quote} client=${cliente.id_client}`);
  return cotizacion;
}

async function listar(filtros) {
  return leadRepo.listarLeads(filtros);
}

async function actualizarEstado(quoteId, estado) {
  return leadRepo.actualizarEstado(quoteId, estado);
}

/**
 * Devuelve todas las cotizaciones de un usuario por telegram_id.
 * Usado para "Consultar estado de cotización" en el bot.
 */
async function consultarPorTelegram(telegramId) {
  return leadRepo.buscarCotizacionesPorTelegram(telegramId);
}

module.exports = { crear, listar, actualizarEstado, consultarPorTelegram };
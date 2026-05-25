const leadRepo = require('../repositories/lead.repo');
const notificationService = require('./notification.service');
const { validateLead } = require('../utils/validators');
const logger = require('../utils/logger');

async function crear(data) {
  const validation = validateLead(data);
  if (!validation.success) {
    const errores = validation.error.errors.map(e => e.message).join(', ');
    throw new Error(`Datos de lead inválidos: ${errores}`);
  }

  let cliente = await leadRepo.buscarClientePorTelegram(data.telegram_id);
  if (!cliente) {
    cliente = await leadRepo.crearCliente(data);
    logger.info(`Nuevo cliente creado: ${cliente.id_client}`);
  }

  const cotizacion = await leadRepo.crearCotizacion({
    ...data,
    client_id: cliente.id_client,
  });

  await notificationService.notificarNuevoLead({ ...cotizacion, nombre: data.nombre, telefono: data.telefono });

  logger.info(`Lead creado: quote=${cotizacion.id_quote} client=${cliente.id_client}`);
  return cotizacion;
}

async function listar(filtros) {
  return leadRepo.listarLeads(filtros);
}

async function actualizarEstado(quoteId, estado) {
  return leadRepo.actualizarEstado(quoteId, estado);
}

module.exports = { crear, listar, actualizarEstado };
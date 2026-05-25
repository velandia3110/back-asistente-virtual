const pqrsRepo = require('../repositories/pqrs.repo');
const leadRepo = require('../repositories/lead.repo');
const notificationService = require('./notification.service');
const logger = require('../utils/logger');

async function crear(data) {
  let cliente = await leadRepo.buscarClientePorTelegram(data.telegram_id);
  if (!cliente) {
    cliente = await leadRepo.crearCliente({ nombre: 'Sin nombre', telefono: 'Sin teléfono', telegram_id: data.telegram_id });
  }

  const pqrs = await pqrsRepo.crear({ ...data, client_id: cliente.id_client });

  await notificationService.notificarNuevaPqrs(pqrs);

  logger.info(`PQRS creada: ${pqrs.id_pqrs} radicado=${pqrs.radicado}`);
  return pqrs;
}

async function listar(filtros) {
  return pqrsRepo.listar(filtros);
}

async function actualizarEstado(pqrsId, estado) {
  return pqrsRepo.actualizarEstado(pqrsId, estado);
}

module.exports = { crear, listar, actualizarEstado };
const pqrsRepo = require('../repositories/pqrs.repo');
const leadRepo = require('../repositories/lead.repo');
const conversationService = require('./conversation.service');
const notificationService = require('./notification.service');
const logger = require('../utils/logger');

async function crear(data) {
  // ── Cliente: crear o actualizar con los datos reales del usuario ───────────
  let cliente = await leadRepo.buscarClientePorTelegram(data.telegram_id);
  if (!cliente) {
    cliente = await leadRepo.crearCliente({
      nombre:      data.nombre,
      telefono:    data.telefono,
      telegram_id: data.telegram_id,
    });
    logger.info(`Nuevo cliente creado desde PQRS: ${cliente.id_client}`);
  } else {
    // Actualizamos con los datos frescos que acaba de ingresar
    cliente = await leadRepo.actualizarCliente(data.telegram_id, {
      nombre:   data.nombre,
      telefono: data.telefono,
    });
  }

  // ── PQRS ───────────────────────────────────────────────────────────────────
  const pqrs = await pqrsRepo.crear({
    ...data,
    client_id: cliente.id_client,
  });

  // ── Historial ──────────────────────────────────────────────────────────────
  const conv = await conversationService.iniciar(cliente.id_client);
  if (conv) {
    await conversationService.registrarMensaje(
      conv.id_conversations,
      `PQRS radicada: ${pqrs.radicado} | Tipo: ${pqrs.tipo}`,
      'sistema'
    );
    await conversationService.cerrar(conv.id_conversations);
  }

  // ── Notificación ───────────────────────────────────────────────────────────
  await notificationService.notificarNuevaPqrs(pqrs);

  logger.info(`PQRS creada: ${pqrs.id_pqrs} radicado=${pqrs.radicado}`);
  return pqrs;
}

/**
 * Consulta pública por radicado — usada desde el bot.
 */
async function consultarPorRadicado(radicado) {
  return pqrsRepo.buscarPorRadicado(radicado);
}

async function listar(filtros) {
  return pqrsRepo.listar(filtros);
}

async function actualizarEstado(pqrsId, estado, observaciones) {
  return pqrsRepo.actualizarEstado(pqrsId, estado, observaciones);
}

async function eliminar(pqrsId) {
  return pqrsRepo.eliminar(pqrsId);
}

module.exports = { crear, consultarPorRadicado, listar, actualizarEstado, eliminar };
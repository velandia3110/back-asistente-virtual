const nodemailer = require('nodemailer');
const env = require('../config/env');
const { formatLead, formatLeadNotificacion, formatPqrs, formatDate } = require('../utils/formatters');
const logger = require('../utils/logger');

// Solo crear transporter si tenemos credenciales SMTP configuradas
let transporter = null;
if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT),
    secure: false,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
} else {
  logger.warn('⚠️  SMTP no configurado. Los emails no se enviarán (solo registrados en logs)');
}

// ── Helpers internos ──────────────────────────────────────────────────────────

function stripMarkdown(text) {
  return text.replace(/[*_`]/g, '');
}

function htmlWrap(text) {
  return `<pre style="font-family:sans-serif;font-size:14px;">${stripMarkdown(text)}</pre>`;
}

// ── Notificaciones ────────────────────────────────────────────────────────────

async function notificarNuevoLead(lead) {
  if (!transporter || !env.EMAIL_COMERCIAL) {
    logger.warn('📧 Email de nuevo lead no enviado (SMTP no configurado)');
    return;
  }
  try {
    const cuerpo = formatLeadNotificacion(lead);
    await transporter.sendMail({
      from:    `"Bot Gruizajes" <${env.SMTP_USER}>`,
      to:      env.EMAIL_COMERCIAL,
      subject: `🏗️ Nuevo lead: ${lead.nombre} — ${lead.tipo_carga}`,
      text:    stripMarkdown(cuerpo),
      html:    htmlWrap(cuerpo),
    });
    logger.info(`Email de nuevo lead enviado a ${env.EMAIL_COMERCIAL}`);
  } catch (err) {
    // No lanzamos — el bot no debe caerse por un email fallido
    logger.error(`Error enviando email de lead: ${err.message}`);
  }
}

async function notificarNuevaPqrs(pqrs) {
  if (!transporter || !env.EMAIL_COMERCIAL) {
    logger.warn('📧 Email de PQRS no enviado (SMTP no configurado)');
    return;
  }
  try {
    const lineas = [
      `Radicado : ${pqrs.radicado}`,
      `Tipo     : ${pqrs.tipo.toUpperCase()}`,
      `Nombre   : ${pqrs.nombre_contacto   || 'No registrado'}`,
      `Teléfono : ${pqrs.telefono_contacto || 'No registrado'}`,
      pqrs.email ? `Email    : ${pqrs.email}` : null,
      `Fecha    : ${formatDate(pqrs.creado_en)}`,
      ``,
      `Descripción:`,
      pqrs.descripcion,
    ].filter(Boolean).join('\n');

    await transporter.sendMail({
      from:    `"Bot Gruizajes" <${env.SMTP_USER}>`,
      to:      env.EMAIL_COMERCIAL,
      subject: `📝 Nueva PQRS ${pqrs.radicado} — ${pqrs.tipo.toUpperCase()}`,
      text:    lineas,
      html:    `<pre style="font-family:sans-serif;font-size:14px;">${lineas}</pre>`,
    });
    logger.info(`Email de PQRS enviado a ${env.EMAIL_COMERCIAL}`);
  } catch (err) {
    logger.error(`Error enviando email de PQRS: ${err.message}`);
  }
}

async function notificarNuevoLead_Asesor({ nombre, telefono, consulta }) {
  if (!transporter || !env.EMAIL_COMERCIAL) {
    logger.warn('📧 Email de asesor no enviado (SMTP no configurado)');
    return;
  }
  try {
    const lineas = [
      `SOLICITUD DE ASESOR — ATENCIÓN INMEDIATA`,
      ``,
      `Nombre   : ${nombre}`,
      `Teléfono : ${telefono}`,
      `Consulta : ${consulta}`,
      `Fecha    : ${formatDate(new Date())}`,
    ].join('\n');

    await transporter.sendMail({
      from:    `"Bot Gruizajes" <${env.SMTP_USER}>`,
      to:      env.EMAIL_COMERCIAL,
      subject: `📞 Solicitud de asesor: ${nombre}`,
      text:    lineas,
      html:    `<pre style="font-family:sans-serif;font-size:14px;">${lineas}</pre>`,
    });
    logger.info(`Email de solicitud de asesor enviado para ${nombre}`);
  } catch (err) {
    logger.error(`Error enviando email de asesor: ${err.message}`);
  }
}

module.exports = {
  notificarNuevoLead,
  notificarNuevaPqrs,
  notificarNuevoLead_Asesor,
};
const nodemailer = require('nodemailer');
const env = require('../config/env');
const { formatLead, formatPqrs } = require('../utils/formatters');
const logger = require('../utils/logger');

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT),
  secure: false,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
});

async function notificarNuevoLead(lead) {
  if (!env.EMAIL_COMERCIAL) return;
  try {
    await transporter.sendMail({
      from: `"Bot Gruizajes" <${env.SMTP_USER}>`,
      to: env.EMAIL_COMERCIAL,
      subject: `🏗️ Nuevo lead: ${lead.nombre}`,
      text: formatLead(lead).replace(/\*/g, ''),
      html: `<pre>${formatLead(lead).replace(/\*/g, '')}</pre>`,
    });
    logger.info(`Email de nuevo lead enviado a ${env.EMAIL_COMERCIAL}`);
  } catch (err) {
    logger.error(`Error enviando email de lead: ${err.message}`);
  }
}

async function notificarNuevaPqrs(pqrs) {
  if (!env.EMAIL_COMERCIAL) return;
  try {
    await transporter.sendMail({
      from: `"Bot Gruizajes" <${env.SMTP_USER}>`,
      to: env.EMAIL_COMERCIAL,
      subject: `📝 Nueva PQRS: ${pqrs.radicado}`,
      text: `Tipo: ${pqrs.tipo}\nDescripción: ${pqrs.descripcion}\nRadicado: ${pqrs.radicado}`,
    });
    logger.info(`Email de PQRS enviado a ${env.EMAIL_COMERCIAL}`);
  } catch (err) {
    logger.error(`Error enviando email de PQRS: ${err.message}`);
  }
}

module.exports = { notificarNuevoLead, notificarNuevaPqrs };
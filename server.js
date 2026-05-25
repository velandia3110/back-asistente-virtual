require('dotenv').config();  
require('./src/bot');

const env = require('./src/config/env');
const db = require('./src/config/database');
const bot = require('./src/config/telegram');
const app = require('./src/app');
const logger = require('./src/utils/logger');
const { webhookCallback } = require('grammy');

const PORT = env.PORT;
const WEBHOOK_PATH = `/webhook/${env.TELEGRAM_BOT_TOKEN}`;

async function start() {
  try {
    await db.raw('SELECT 1');
    logger.info('Conexión a la base de datos exitosa');

    if (env.WEBHOOK_URL) {
      app.use(webhookCallback(bot, { path: WEBHOOK_PATH }));
      await bot.api.setWebhook(`${env.WEBHOOK_URL}${WEBHOOK_PATH}`);
      logger.info(`Webhook registrado en ${env.WEBHOOK_URL}${WEBHOOK_PATH}`);
    } else {
      await bot.api.deleteWebhook();
      bot.start();
      logger.info('Bot usando polling (modo desarrollo)');
    }

    app.listen(PORT, () => {
      logger.info(`Servidor corriendo en el puerto ${PORT}`);
    });
  } catch (err) {
    logger.error(`Error al iniciar: ${err.message}`);
    process.exit(1);
  }
}

start();
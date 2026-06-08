require('dotenv').config();

const env    = require('./src/config/env');
const db     = require('./src/config/database');
const bot    = require('./src/config/telegram'); // único punto de configuración del bot
const app    = require('./src/app');
const logger = require('./src/utils/logger');

const PORT = env.PORT || 3000;

async function start() {
  try {
    // ── Base de datos ─────────────────────────────────────────────────────────
    await db.raw('SELECT 1');
    logger.info('✅ Conexión a la base de datos exitosa');

    // ── Bot: webhook (producción) o polling (desarrollo) ──────────────────────
    if (env.NODE_ENV === 'production' && env.WEBHOOK_URL) {
      const { webhookCallback } = require('grammy');
      const WEBHOOK_PATH = `/webhook/${env.TELEGRAM_BOT_TOKEN}`;

      app.use(WEBHOOK_PATH, webhookCallback(bot, 'express'));
      await bot.api.setWebhook(`${env.WEBHOOK_URL}${WEBHOOK_PATH}`);
      logger.info(`✅ Bot en modo webhook: ${env.WEBHOOK_URL}${WEBHOOK_PATH}`);
    } else {
      await bot.api.deleteWebhook();
      bot.start({
        onStart: (info) => logger.info(`✅ Bot en modo polling: @${info.username}`),
      });
    }

    // ── API REST ──────────────────────────────────────────────────────────────
    app.listen(PORT, () => {
      logger.info(`✅ API escuchando en puerto ${PORT}`);
    });

  } catch (err) {
    logger.error(`❌ Error al iniciar: ${err.message}`);
    process.exit(1);
  }
}

start();
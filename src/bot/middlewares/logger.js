const logger = require('../../utils/logger');

async function loggerMiddleware(ctx, next) {
  const user = ctx.from;
  const text = ctx.message?.text || ctx.callbackQuery?.data || '[sin texto]';
  logger.info(`[TG] user=${user?.id} username=@${user?.username} msg="${text}"`);
  await next();
}

module.exports = loggerMiddleware;
const { createLogger, format, transports } = require('winston');
const env = require('../config/env');

const logger = createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    env.NODE_ENV === 'production'
      ? format.json()
      : format.printf(({ timestamp, level, message, stack }) =>
          `${timestamp} [${level.toUpperCase()}]: ${stack || message}`
        )
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
  ],
});

module.exports = logger;
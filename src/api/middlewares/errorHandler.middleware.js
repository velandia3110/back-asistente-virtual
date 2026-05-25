const logger = require('../../utils/logger');

function errorHandler(err, req, res, next) {
  logger.error(`${req.method} ${req.path} → ${err.message}`, { stack: err.stack });

  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 ? 'Error interno del servidor' : err.message,
  });
}

module.exports = errorHandler;
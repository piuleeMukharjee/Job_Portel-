const winston = require('winston');
const { v4: uuidv4 } = require('uuid');

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'job-portal-api' },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, correlationId, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
          const corrId = correlationId ? `[${correlationId}]` : '';
          return `${timestamp} ${level} ${corrId}: ${message} ${metaStr}`;
        })
      )
    }),
    // Write errors to file
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Write all logs to file
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5
    })
  ]
});

// Middleware to add correlation ID to requests
const correlationMiddleware = (req, res, next) => {
  req.correlationId = req.headers['x-correlation-id'] || uuidv4();
  res.setHeader('x-correlation-id', req.correlationId);
  
  // Log request
  logger.info(`${req.method} ${req.path}`, {
    correlationId: req.correlationId,
    userId: req.user?.userId,
    ip: req.ip
  });
  
  next();
};

module.exports = logger;
module.exports.correlationMiddleware = correlationMiddleware;

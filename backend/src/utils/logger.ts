import { createLogger, format, transports } from 'winston';

// Define log levels and colors
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Create logger instance
const logger = createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  levels: logLevels,
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.json(),
    format.printf(({ level, message, timestamp, stack, ...meta }) => {
      let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
      
      // Add metadata if present
      if (Object.keys(meta).length > 0) {
        log += ` | ${JSON.stringify(meta)}`;
      }
      
      // Add stack trace for errors
      if (stack) {
        log += `\n${stack}`;
      }
      
      return log;
    })
  ),
  transports: [
    // Console transport for development
    new transports.Console({
      format: format.combine(
        format.colorize({ colors: logColors }),
        format.simple()
      )
    }),
    
    // File transport for production
    ...(process.env.NODE_ENV === 'production' ? [
      new transports.File({
        filename: 'logs/error.log',
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
      new transports.File({
        filename: 'logs/combined.log',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      })
    ] : [])
  ],
});

// Create structured logging interface
export const log = {
  error: (message: string, meta?: any) => logger.error(message, meta),
  warn: (message: string, meta?: any) => logger.warn(message, meta),
  info: (message: string, meta?: any) => logger.info(message, meta),
  http: (message: string, meta?: any) => logger.http(message, meta),
  debug: (message: string, meta?: any) => logger.debug(message, meta),
  
  // Specific logging methods for common use cases
  apiRequest: (method: string, url: string, userId?: string, meta?: any) => {
    logger.http(`${method} ${url}`, { userId, ...meta });
  },
  
  apiError: (method: string, url: string, error: Error, userId?: string, meta?: any) => {
    logger.error(`API Error: ${method} ${url}`, { 
      error: error.message, 
      stack: error.stack, 
      userId, 
      ...meta 
    });
  },
  
  authAttempt: (email: string, success: boolean, ip?: string) => {
    logger.info(`Auth attempt: ${email}`, { success, ip });
  },
  
  databaseQuery: (query: string, duration?: number, error?: Error) => {
    if (error) {
      logger.error(`Database query failed: ${query}`, { error: error.message, duration });
    } else {
      logger.debug(`Database query: ${query}`, { duration });
    }
  },
  
  externalApiCall: (service: string, method: string, success: boolean, duration?: number, error?: Error) => {
    const level = success ? 'info' : 'warn';
    logger[level](`External API call: ${service} ${method}`, { 
      success, 
      duration, 
      error: error?.message 
    });
  },
  
  userAction: (userId: string, action: string, resourceId?: string, meta?: any) => {
    logger.info(`User action: ${action}`, { userId, resourceId, ...meta });
  }
};

export default log; 
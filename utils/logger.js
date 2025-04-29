const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize } = format;

// Custom format for console output
const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

// Create the logger
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp(),
    myFormat
  ),
  transports: [
    // Console transport with colors
    new transports.Console({
      format: combine(
        colorize(),
        timestamp(),
        myFormat
      )
    }),
    // File transport for errors
    new transports.File({ 
      filename: 'error.log', 
      level: 'error' 
    }),
    // File transport for all logs
    new transports.File({ 
      filename: 'combined.log' 
    })
  ]
});

module.exports = logger;

'use strict';

const appRoot = require('app-root-path');
const winston = require('winston');
const process = require('process');

const { combine, timestamp, label, printf } = winston.format;

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp}[${label}] ${level}: ${message}`;
});

const options = {
  info_file: {
    level: 'info',
    filename: `${appRoot}/logs/info.log`,
    handleExceptions: true,
    json: false,
    maxsize: 5242880,
    maxFiles: 5,
    colorize: false,
    format: combine(
      label({ label: 'WST' }),
      timestamp(),
      myFormat
    )
  },

  error_file: {
    level: 'error',
    filename: `${appRoot}/logs/error.log`,
    handleExceptions: true,
    json: false,
    maxsize: 5242880,
    maxFiles: 5,
    colorize: false,
    format: combine(
      label({ label: 'WST' }),
      timestamp(),
      myFormat
    )
  },

  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
    format: combine(
      label({ label: 'WINSTON' }),
      timestamp(),
      myFormat
    )
  }
};
const logger = process.env.NODE_ENV === 'production'
? winston.createLogger({
  transports: [
    new winston.transports.File(options.info_file),
    new winston.transports.File(options.error_file)
  ],
  exitOnError: false,
})
: winston.createLogger({
  transports: [new winston.transports.Console(options.console)]
});

module.exports = logger;

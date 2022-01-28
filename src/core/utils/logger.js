const { isPrimary } = require('cluster');
const winston = require('winston');
const baseConfig = require('./baseConfig');


/**
 * Logger instance
 */
const logger = winston.createLogger({
        level: baseConfig.logger.level,
        format: winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:SSS' }),
                winston.format.colorize({ level: true }),
                winston.format.printf(info => `[${info.timestamp}] [${info.level}] ${info.message}`),
        ),
        transports: [
                new winston.transports.Console(),
        ],
});

if (isPrimary) logger.info(`[Logger] Level "${baseConfig.logger.level}".`);


module.exports = logger;
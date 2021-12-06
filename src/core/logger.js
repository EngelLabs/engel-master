const winston = require('winston');
const baseConfig = require('./baseConfig');


const logger = winston.createLogger({
    level: baseConfig.logLevel,
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:MM:SS' }),
        winston.format.colorize({ level: true }),
        winston.format.printf(info => `[${info.timestamp}] [${info.level}] ${info.message}`),
    ),
    transports: [
        new winston.transports.Console(),
    ],
});

logger.info(`[Logger] Level "${baseConfig.logLevel}".`);



module.exports = logger;
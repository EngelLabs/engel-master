const winston = require('winston');
const baseConfig = require('./baseConfig');


const options = {
        format: winston.format.combine(
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:SSS' }),
                winston.format.colorize({ level: true }),
                winston.format.printf(info => `[${info.timestamp}] [${info.level}] ${info.message}`),
        ),
        transports: [
                new winston.transports.Console(),
        ],
};

const logger = winston.createLogger(options);

logger.on('error', err => {
        try { logger.error('[Logger] Something went wrong.') } catch { }
        console.error(err);
});

logger.info(`[Logger] Level "${baseConfig.logger.level}".`);

logger.level = baseConfig.logger.level;

module.exports = logger;
import * as winston from 'winston';
import Core from '../structures/Core';

export default function Logger (core: Core): winston.Logger {
        const options = {
                format: winston.format.combine(
                        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:SSS' }),
                        winston.format.colorize({ level: true }),
                        winston.format.printf((info: any) => `[${info.timestamp}] [${info.level}] ${info.message}`)
                ),
                transports: [
                        new winston.transports.Console()
                ]
        };

        const logger = winston.createLogger(options);

        logger.on('error', err => {
                try { logger.error('[Logger] Something went wrong.'); } catch { }
                console.error(err);
        });

        logger.info(`[Logger] Loaded (level=${core.baseConfig.logger.level}).`);

        logger.level = core.baseConfig.logger.level;

        return logger;
}

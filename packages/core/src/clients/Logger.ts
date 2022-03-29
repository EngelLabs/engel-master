import * as path from 'path';
import * as moment from 'moment';
import * as winston from 'winston';
import type Core from '../structures/Core';

export default function Logger(core: Core): winston.Logger {
        const ts = moment().format('l').replaceAll('/', '.');

        const options = {
                level: core.baseConfig.logger.level,
                format: winston.format.combine(
                        winston.format.errors({ stack: true }),
                        winston.format.colorize({ level: true }),
                        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:SSS' }),
                        winston.format.printf(info => `[${info.timestamp}] [${info.level.padEnd(15)}] ${info.message}`)
                ),
                transports: [
                        new winston.transports.Console(),
                        new winston.transports.File({
                                level: 'info',
                                filename: path.join(core.baseConfig.logger.dir, `${ts}.log`)
                        }),
                        new winston.transports.File({
                                level: 'error',
                                filename: path.join(core.baseConfig.logger.dir, `${ts}.error.log`)
                        })
                ]
        };

        const logger = winston.createLogger(options);

        logger.on('error', err => {
                try {
                        logger.error(err);
                } catch {
                        console.error(err);
                }
        });

        logger.debug(`[Logger] Loaded (level=${core.baseConfig.logger.level}).`);

        return logger;
}

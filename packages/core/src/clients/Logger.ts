import * as path from 'path';
import * as moment from 'moment';
import * as winston from 'winston';
import type App from '../structures/App';

export default function Logger(app: App): winston.Logger {
        const ts = moment().format('l').replaceAll('/', '.');

        const options = {
                level: app.baseConfig.logger.level,
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
                                filename: path.join(app.baseConfig.logger.dir, `${ts}.log`)
                        }),
                        new winston.transports.File({
                                level: 'error',
                                filename: path.join(app.baseConfig.logger.dir, `${ts}.error.log`)
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

        logger.debug(`[Logger] Loaded (level=${app.baseConfig.logger.level}).`);

        return logger;
}

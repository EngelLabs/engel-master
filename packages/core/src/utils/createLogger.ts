import * as path from 'path';
import * as moment from 'moment';
import * as winston from 'winston';
import type * as types from '@engel/types';
import App from '../structures/App';
import type { Logger } from '../types';

const loggerMap: Record<string, Logger> = {};

function getLoggerChild(logger: winston.Logger, name: string) {
        const sources = logger.defaultMeta?.sources?.length
                ? logger.defaultMeta.sources.concat()
                : [];
        sources.push(name);

        const qualName = sources.join(' ');

        if (!loggerMap[qualName]) {
                const child: Logger = Object.create(logger);
                child.defaultMeta = {};
                child.defaultMeta.sources = sources;

                loggerMap[qualName] = createLoggerProxy(child);
        }

        return loggerMap[qualName];
}

function createLoggerProxy(logger: winston.Logger): Logger {
        const proxy = new Proxy(<Logger>logger, {
                get(_, prop) {
                        if (prop === 'get') {
                                return function get(name: string) {
                                        return getLoggerChild(logger, name);
                                };
                        }
                        return Reflect.get(logger, prop);
                }
        });

        return proxy;
}

export default function createLogger(obj: App | types.StaticConfig): Logger {
        const ts = moment().format('l').replaceAll('/', '.');
        const config = obj instanceof App ? obj.staticConfig : obj;

        const formatSources = (info: { [key: string]: any }) => {
                const sources: string[] = info.source
                        ? [info.source]
                        : (info.sources ? info.sources : ['ROOT']);

                return sources.map(s => `[${s}]`).join(' ');
        };

        const options = {
                level: config.logger.level,
                format: winston.format.combine(
                        winston.format.errors({ stack: true }),
                        winston.format.colorize({ level: true }),
                        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:SSS' }),
                        winston.format.printf(info => `[${info.timestamp}] [${info.level.padEnd(15)}] ${formatSources(info)} ${info.message}`)
                ),
                transports: [
                        new winston.transports.Console(),
                        new winston.transports.File({
                                level: 'info',
                                filename: path.join(config.logger.dir, `${ts}.log`)
                        }),
                        new winston.transports.File({
                                level: 'error',
                                filename: path.join(config.logger.dir, `${ts}.error.log`)
                        })
                ]
        };

        const logger = createLoggerProxy(winston.createLogger(options));

        logger.error = function (this: Logger, err: any): Logger {
                if (err instanceof Error) {
                        this.log('error', err.stack || err);
                } else {
                        this.log('error', err);
                }

                return this;
        };

        logger.on('error', err => {
                try {
                        logger.error(err);
                } catch {
                        console.error(err);
                }
        });

        logger.debug(`Logger loaded (level=${config.logger.level}).`);

        return logger;
}

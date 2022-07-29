import * as IORedis from 'ioredis';
import type App from '../structures/App';

export default class Redis extends IORedis {
        public constructor(app: App, shouldLog: boolean = true) {
                super(
                        app.staticConfig.redis.port,
                        app.staticConfig.redis.host
                );

                if (shouldLog) {
                        const logger = app.logger.get('Redis');

                        this
                                .on('ready', () => {
                                        logger.debug('Connected.');
                                })
                                .on('close', () => {
                                        logger.debug('Disconnected.');
                                })
                                .on('error', (err: any) => {
                                        logger.debug(err);
                                });
                }
        }
}

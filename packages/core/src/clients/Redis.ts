import * as ioredis from 'ioredis';
import type App from '../structures/App';

const IORedis = ioredis;

export default function Redis(app: App, shouldLog: boolean = true): ioredis.Redis {
        const client = new IORedis(
                app.baseConfig.redis.port,
                app.baseConfig.redis.host
        );

        if (shouldLog) {
                const logger = app.logger.get('Redis');

                client
                        .on('ready', () => {
                                logger.debug('Connected.');
                        })
                        .on('close', () => {
                                logger.debug('Disconnected.');
                        })
                        .on('error', (err: any) => {
                                logger.debug(err, 'error');
                        });
        }

        return client;
}

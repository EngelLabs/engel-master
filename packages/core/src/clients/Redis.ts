import * as ioredis from 'ioredis';
import type * as types from '@engel/types';
import type App from '../structures/App';

const IORedis = ioredis;

export default function Redis(app: App, shouldLog: boolean = true): ioredis.Redis {
        const client = new IORedis(
                app.baseConfig.redis.port,
                app.baseConfig.redis.host
        );

        if (shouldLog) {
                const log = (message?: any, level?: types.LogLevels, prefix: string = 'Redis') => {
                        app.log(message, level, prefix);
                };

                client
                        .on('ready', () => {
                                log('Connected.');
                        })
                        .on('close', () => {
                                log('Disconnected.');
                        })
                        .on('error', (err: any) => {
                                log(err, 'error');
                        });
        }

        return client;
}

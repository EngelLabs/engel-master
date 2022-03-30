import * as ioredis from 'ioredis';
import type * as types from '@engel/types';
import type Core from '../structures/Core';

const IORedis = ioredis;

export default function Redis(core: Core, shouldLog: boolean = true): ioredis.Redis {
        const client = new IORedis(
                core.baseConfig.redis.port,
                core.baseConfig.redis.host
        );

        if (shouldLog) {
                const log = (message?: any, level?: types.LogLevels, prefix: string = 'Redis') => {
                        core.log(message, level, prefix);
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

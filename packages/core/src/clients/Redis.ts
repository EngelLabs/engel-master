import * as ioredis from 'ioredis';
import type * as types from '@engel/types';
import type Core from '../structures/Core';

const IORedis = ioredis;

export default function Redis(core: Core): ioredis.Redis {
        const log = (message?: any, level?: types.LogLevels, prefix: string = 'Redis') => {
                core.log(message, level, prefix);
        };

        const client = new IORedis(
                core.baseConfig.redis.port,
                core.baseConfig.redis.host
        );

        client
                .on('ready', () => {
                        log('Connected.', 'info');
                })
                .on('close', () => {
                        log('Disconnected.', 'info');
                })
                .on('error', (err: any) => {
                        log(err, 'error');
                });

        return client;
}

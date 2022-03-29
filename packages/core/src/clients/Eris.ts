import * as eris from 'eris';
import type * as types from '@engel/types';
import type Core from '../structures/Core';

export default function Eris(core: Core, options?: eris.ClientOptions): eris.Client {
        const log = (message?: any, level?: types.LogLevels, prefix: string = 'Eris') => {
                core.log(message, level, prefix);
        };

        options = Object.assign(<eris.ClientOptions>{
                intents: [],
                allowedMentions: {
                        everyone: false,
                        roles: false,
                        users: true,
                        repliedUser: true
                },
                restMode: true
        }, options);

        const client = new eris.Client(
                'Bot ' + core.baseConfig.client.token, options
        );

        client
                .on('error', (err, shard) => {
                        if (!err) return;

                        if (shard !== undefined) {
                                log(err, 'error', `Shard ${shard}`);
                        } else {
                                log(err, 'error');
                        }
                })
                .on('warn', (msg, shard) => {
                        log(msg, 'warn', `Shard ${shard}`);
                });

        return client;
}

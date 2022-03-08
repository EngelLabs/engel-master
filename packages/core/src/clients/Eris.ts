import * as eris from 'eris';
import type * as types from '@engel/types';
import type Core from '../structures/Core';

export default function Eris(core: Core): eris.Client {
        const log = (message?: any, level?: types.LogLevels, prefix: string = 'Eris') => {
                core.log(message, level, prefix);
        };

        // I have to type it as such because intents,
        // which is seen as a string[] is incompatible
        // with ClientOptions.intents (keyof Constants['Intents'])
        const options: typeof eris.Client.prototype.options = {
                intents: [
                        'directMessages',
                        'guilds',
                        'guildBans',
                        'guildEmojisAndStickers',
                        'guildInvites',
                        'guildMembers',
                        'guildMessages',
                        'guildPresences',
                        'guildVoiceStates'
                ],
                allowedMentions: {
                        everyone: false,
                        roles: false,
                        users: true,
                        repliedUser: true
                },
                autoreconnect: true,
                compress: true,
                restMode: true,
                messageLimit: 0
        };

        const client = new eris.Client(
                'Bot ' + core.baseConfig.client.token, options
        );

        client
                .on('connect', () => {
                        log('Connected.', 'info');
                })
                .on('disconnect', () => {
                        log('Disconnected.', 'info');
                })
                .on('ready', () => {
                        log('Ready.', 'info');
                })
                .on('error', (err, shard) => {
                        if (!err) return;

                        if (shard !== undefined) {
                                log(err, 'error', `Shard ${shard}`);
                        } else {
                                log(err, 'error');
                        }
                })
                .on('warn', msg => {
                        log(msg, 'warn');
                });

        return client;
}
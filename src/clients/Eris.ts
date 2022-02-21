import * as eris from 'eris';
import Core from '../structures/Core';


export default function Eris (core: Core): eris.Client {
        const log = (message?: string | Error, level?: string, prefix: string = 'Eris') => {
                core.log(message, level, prefix);
        }

        const options = {
                intents: [
                        'directMessages',
                        'guilds',
                        'guildBans',
                        'guildEmojisAndStickers',
                        'guildInvites',
                        'guildMembers',
                        'guildMessages',
                        'guildPresences',
                        'guildVoiceStates',
                ],
                allowedMentions: {
                        everyone: false,
                        roles: false,
                        users: true,
                        repliedUser: true,
                },
                autoreconnect: true,
                compress: true,
                restMode: true,
                messageLimit: 0,
        };

        const client = new eris.Client(
                // @ts-ignore
                // Client.options.intents is not typed properly I think.
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
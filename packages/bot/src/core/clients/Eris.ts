import * as core from '@engel/core';
import type * as types from '@engel/types';
import type App from '../structures/App';

export default function Eris(app: App) {
        const client = core.Eris(app, {
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
                autoreconnect: true,
                compress: true,
                messageLimit: 0,
                firstShardID: app.baseConfig.cluster.firstShard,
                lastShardID: app.baseConfig.cluster.lastShard,
                maxShards: app.baseConfig.client.shards
        });

        const log = (message: any, level: types.LogLevels, shardID?: number) => {
                app.log(message, level, shardID !== undefined ? `Shard ${shardID}` : 'Eris');
        };

        client
                .on('connect', id => {
                        log('Connected.', 'debug', id);
                })
                .on('shardDisconnect', (_, id) => {
                        log('Disconnected.', 'debug', id);
                })
                .on('shardReady', id => {
                        log('Ready.', 'debug', id);
                })
                .on('shardResume', id => {
                        log('Resumed.', 'debug', id);
                });

        return client;
}

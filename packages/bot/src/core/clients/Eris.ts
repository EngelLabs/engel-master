import * as core from '@engel/core';
import type * as types from '@engel/types';
import type Core from '../Core';

export default function Eris(_core: Core) {
        const client = core.Eris(_core, {
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
                firstShardID: _core.baseConfig.cluster.firstShard,
                lastShardID: _core.baseConfig.cluster.lastShard,
                maxShards: _core.baseConfig.client.shards
        });

        const log = (message: any, level: types.LogLevels, shardID?: number) => {
                _core.log(message, level, shardID !== undefined ? `Shard ${shardID}` : 'Eris');
        };

        client
                .on('connect', id => {
                        log('Connected.', 'info', id);
                })
                .on('shardDisconnect', (_, id) => {
                        log('Disconnected.', 'info', id);
                })
                .on('shardReady', id => {
                        log('Ready.', 'info', id);
                })
                .on('shardResume', id => {
                        log('Resumed.', 'info', id);
                });

        return client;
}

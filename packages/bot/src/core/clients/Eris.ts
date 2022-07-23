import * as core from '@engel/core';
import type App from '../structures/App';

export default function Eris(app: App) {
        const logger = app.logger.get('Eris');

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

        client
                .on('connect', id => {
                        logger.debug({ message: 'Connected.', sources: ['Eris', `Shard ${id}`] });
                })
                .on('shardDisconnect', (_, id) => {
                        logger.debug({ message: 'Disconnected.', sources: ['Eris', `Shard ${id}`] });
                })
                .on('shardReady', id => {
                        logger.debug({ message: 'Ready.', sources: ['Eris', `Shard ${id}`] });
                })
                .on('shardResume', id => {
                        logger.debug({ message: 'Resumed.', sources: ['Eris', `Shard ${id}`] });
                });

        return client;
}

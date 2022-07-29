import * as core from '@engel/core';
import type App from '../structures/App';

export default class Eris extends core.Eris {
        public constructor(app: App) {
                super(app, {
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
                        firstShardID: app.staticConfig.cluster.firstShard,
                        lastShardID: app.staticConfig.cluster.lastShard,
                        maxShards: app.staticConfig.client.shards
                });

                const logger = app.logger.get('Eris');

                this
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
        }
}

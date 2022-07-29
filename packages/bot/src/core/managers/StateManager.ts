import type * as core from '@engel/core';
import type * as types from '@engel/types';
import Base from '../structures/Base';
import type App from '../structures/App';

/**
 * Manages application state
 */
export default class StateManager extends Base {
        private _logger: core.Logger;
        private _wsEvents: number = 0;
        private _httpEvents: number = 0;
        private _messages: Record<string, types.PartialMessage> = {};
        private _uncacheInterval?: NodeJS.Timer;

        public constructor(app: App) {
                super(app);

                this._logger = app.logger.get('StateManager');

                app.events
                        .registerListener('rawWS', this.rawWS.bind(this))
                        .registerListener('rawREST', this.rawREST.bind(this))
                        .registerListener('messageCreate', this.messageCreate.bind(this))
                        .registerListener('messageUpdate', this.messageUpdate.bind(this))
                        .registerListener('messageDelete', this.messageDelete.bind(this))
                        .registerListener('guildDelete', this.guildDelete.bind(this))
                        .registerListener('channelDelete', this.channelDelete.bind(this));

                app
                        .on('config', this._configure.bind(this));

                setInterval(this._sync.bind(this), 10000);
        }

        private _sync() {
                const { staticConfig } = this;
                const { guilds, shards, users } = this.eris;

                const clusterStats: types.ClusterStats = {
                        id: staticConfig.cluster.id,
                        client: staticConfig.client.name,
                        ws: this._wsEvents,
                        http: this._httpEvents,
                        guilds: guilds.size,
                        users: users.size,
                        shards: shards.map(s => {
                                return {
                                        id: s.id,
                                        status: s.status,
                                        latency: s.latency,
                                        guilds: guilds.filter(g => g.shard.id === s.id).length
                                };
                        })
                };

                this._wsEvents = 0;
                this._httpEvents = 0;

                this.redis.hset(
                        `engel:${staticConfig.client.state}:clusters`,
                        clusterStats.id.toString(),
                        JSON.stringify(clusterStats)
                ).catch(err => this._logger.error(err));
        }

        private _configure(config: types.Config): void {
                if (config.messageCache && config.messageUncacheInterval !== this.config?.messageUncacheInterval) {
                        clearInterval(this._uncacheInterval);

                        this._uncacheInterval = setInterval(this._uncacheMessages.bind(this), config.messageUncacheInterval);
                }
        }

        private _uncacheMessages(): void {
                for (const id in this._messages) {
                        const message = this._messages[id];

                        if (message.createdAt < (Date.now() - this.config.messageMaxAge)) {
                                delete this._messages[id];
                        }
                }
        }

        /**
         * Get a message from cache
         */
        public getMessage(id: string): types.PartialMessage | undefined {
                return this._messages[id];
        }

        private rawWS() {
                this._wsEvents++;
        }

        private rawREST() {
                this._httpEvents++;
        }

        private messageCreate({ message }: types.GuildEvents['messageCreate']): void {
                if (!this.config.messageCache) return;

                if (message.author.bot) return;

                const copied = {
                        id: message.id,
                        content: message.content,
                        author: message.author,
                        channel: message.channel,
                        createdAt: message.createdAt,
                        guildID: message.guildID
                };

                this._messages[copied.id] = copied;
        }

        private messageUpdate({ message }: types.GuildEvents['messageUpdate']): void {
                const oldMessage = this._messages[message.id];

                if (message.content !== oldMessage.content) {
                        oldMessage.content = message.content;
                }
        }

        private messageDelete({ message }: types.GuildEvents['messageDelete']): void {
                delete this._messages[message.id];
        }

        private guildDelete({ guild }: types.GuildEvents['guildDelete']): void {
                for (const id in this._messages) {
                        const message = this._messages[id];

                        if (message.channel.guild.id === guild.id) {
                                delete this._messages[id];
                        }
                }
        }

        private channelDelete({ channel }: types.GuildEvents['channelDelete']): void {
                for (const id in this._messages) {
                        const message = this._messages[id];

                        if (message.channel.id === channel.id) {
                                delete this._messages[id];
                        }
                }
        }
}

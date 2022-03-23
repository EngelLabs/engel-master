import type * as types from '@engel/types';
import Base from '../structures/Base';
import type Core from '../Core';

/**
 * Manages cache of Discord objects
 */
export default class CacheManager extends Base {
        private _messages: Record<string, types.PartialMessage> = {};
        private _uncacheInterval?: NodeJS.Timer;

        public constructor(core: Core) {
                super(core);

                core.events
                        .registerListener('messageCreate', this.messageCreate.bind(this))
                        .registerListener('messageUpdate', this.messageUpdate.bind(this))
                        .registerListener('messageDelete', this.messageDelete.bind(this))
                        .registerListener('guildDelete', this.guildDelete.bind(this))
                        .registerListener('channelDelete', this.channelDelete.bind(this));

                core.on('config', this._configure.bind(this));
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

        private messageCreate({ message }: types.GuildEvents['messageCreate']): void {
                if (!this.config.messageCache) return;

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

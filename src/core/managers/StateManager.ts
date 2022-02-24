import * as eris from 'eris';
import { types } from '@engel/core';
import Bot from '../Bot';
import Base from '../structures/Base';


interface Message {
        id: string;
        content: string;
        author: eris.User;
        channel: eris.GuildChannel;
        createdAt: number;
}


/**
 * Manages cache of Discord objects
 */
export default class CacheManager extends Base {
        private _messages: Record<string, Message> = {};
        private _uncacheInterval?: NodeJS.Timer;

        public constructor(bot: Bot) {
                super(bot);

                bot.events
                        .registerListener('messageCreate', this.messageCreate.bind(this))
                        .registerListener('messageUpdate', this.messageUpdate.bind(this))
                        .registerListener('messageDelete', this.messageDelete.bind(this))
                        .registerListener('guildDelete', this.guildDelete.bind(this))
                        .registerListener('guildChannelDelete', this.guildChannelDelete.bind(this));

                bot.on('config', this._configure.bind(this));
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
        public getMessage(id: string): Message | undefined {
                return this._messages[id];
        }

        private messageCreate({ message }: { message: eris.Message }): void {
                if (!this.config.messageCache) return;

                const copied = {
                        id: message.id,
                        content: message.content,
                        author: message.author,
                        channel: message.channel,
                        createdAt: message.createdAt,
                };

                // @ts-ignore
                this._messages[copied.id] = copied;
        }

        private messageUpdate({ message }: { message: eris.Message }): void {
                const oldMessage = this._messages[message.id];

                if (message.content !== oldMessage.content) {
                        oldMessage.content = message.content;
                }
        }

        private messageDelete({ message }: { message: eris.Message }): void {
                delete this._messages[message.id];
        }

        private guildDelete({ guild }: { guild: eris.Guild }): void {
                for (const id in this._messages) {
                        const message = this._messages[id];

                        if (message.channel.guild.id === guild.id) {
                                delete this._messages[id];
                        }
                }
        }

        private guildChannelDelete({ channel }: { channel: eris.GuildChannel }): void {
                for (const id in this._messages) {
                        const message = this._messages[id];

                        if (message.channel.id === channel.id) {
                                delete this._messages[id];
                        }
                }
        }
}

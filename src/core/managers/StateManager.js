const Base = require('../structures/Base');

/**
 * Manages cache of Discord objects
 * @class CacheManager
 */
class CacheManager extends Base {
        constructor(bot) {
                super(bot);

                this._messages = {};

                this.bot.events
                        .registerListener('messageCreate', this.messageCreate.bind(this))
                        .registerListener('messageUpdate', this.messageUpdate.bind(this))
                        .registerListener('messageDelete', this.messageDelete.bind(this))
                        .registerListener('guildDelete', this.guildDelete.bind(this))
                        .registerListener('guildChannelDelete', this.guildChannelDelete.bind(this));

                setTimeout(() => {
                        for (const id in this._messageCache) {
                                const message = this._messageCache[id];

                                if (message.createdAt < (Date.now() - this.config.messageMaxAge)) {
                                        delete this._messageCache[id];
                                }
                        }
                }, 120000);
        }

        /**
         * Get a message from cache
         * @param {String} id The message's ID
         * @returns {Object|undefined}
         */
        getMessage(id) {
                return this._messages[id];
        }

        messageCreate({ message }) {
                if (!this.config.messageCache) return;

                const copied = {
                        id: message.id,
                        content: message.content,
                        author: message.author,
                        channel: message.channel,
                        createdAt: message.createdAt,
                };

                this._messages[copied.id] = copied;
        }

        messageUpdate({ message }) {
                const oldMessage = this._messages[message.id];

                if (message.content !== oldMessage.content) {
                        oldMessage.content = message.content;
                }
        }

        messageDelete({ message }) {
                delete this._messages[message.id];
        }

        guildDelete({ guild }) {
                for (const id in this._messages) {
                        const message = this._messages[id];

                        if (message.channel.guild.id === guild.id) {
                                delete this._messages[id];
                        }
                }
        }

        guildChannelDelete({ channel }) {
                for (const id in this._messages) {
                        const message = this._messages[id];

                        if (message.channel.id === channel.id) {
                                delete this._messages[id];
                        }
                }
        }
}


module.exports = CacheManager;
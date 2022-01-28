const Base = require('../structures/Base');

let EventEmitter;

try {
        EventEmitter = require('eventemitter3');
} catch {
        EventEmitter = require('events');
}


/**
 * Event dispatch manager
 * @class EventManager
 */
class EventManager extends Base {
        constructor(bot) {
                super(bot);
                EventEmitter.call(this);

                this._registeredEvents = {};
        }

        registerListener(event, execute) {
                if (!this[event]) {
                        return this.eris.addListener(event, execute);
                }

                if (!this._registeredEvents[event]) {
                        const wrapped = async (...args) => {
                                try {
                                        // pause the entire event dispatch system when all core components aren't ready.
                                        if (!this.bot.isReady) return;

                                        const payload = await this[event](...args);

                                        if (!payload) return;

                                        this.emit(event, payload);
                                } catch (err) {
                                        this.log(err, 'error');
                                }
                        }

                        this.eris.addListener(event, wrapped);
                        this._registeredEvents[event] = { handler: wrapped, listeners: [execute] };
                } else {
                        this._registeredEvents[event].listeners.push(execute);
                }

                this.addListener(event, execute);

                this.log(`Added listener for event "${event}".`);

                return this;
        }

        unregisterListener(event, execute) {
                if (!this[event]) {
                        return this.eris.removeListener(event, execute);
                }

                if (this._registeredEvents[event]) {
                        let listeners = this._registeredEvents[event].listeners.filter(l => l.execute = execute);

                        if (!listeners.length) {
                                this.eris.removeListener(event, this._registeredEvents[event].handler);
                                delete this._registeredEvents[event];
                        } else {
                                this._registeredEvents[event].listeners = listeners;
                        }
                }

                this.removeListener(event, execute);

                this.log(`Removed listener for event "${event}".`);

                return this;
        }

        async guildCreate(guild) {
                const payload = {
                        isTesting: this.bot.config.guilds.testing.includes(guild.id),
                        guilodConfig: await this.bot.guilds.getOrFetch(guild.id, { createIfNotFound: true }),
                        guild: guild,
                };

                return payload;
        }

        async guildDelete(guild) {
                const payload = {
                        isTesting: this.bot.config.guilds.testing.includes(guild.id),
                        guildConfig: await this.bot.guilds.getOrFetch(guild.id),
                        guild: guild,
                };

                return payload;
        }

        async guildChannelCreate(guild, channel) {
                const payload = {
                        isTesting: this.bot.config.guilds.testing.includes(guild.id),
                        guildConfig: await this.bot.guilds.getOrFetch(guild.id),
                        guild: guild,
                        channel: channel,
                };

                return payload;
        }

        async guildChannelUpdate(guild, channel, oldChannel) {
                const payload = {
                        isTesting: this.bot.config.guilds.testing.includes(guild.id),
                        guildConfig: await this.bot.guilds.getOrFetch(guild.id),
                        guild: guild,
                        channel: channel,
                        oldChannel: oldChannel,
                };

                return payload;
        }

        async guildChannelDelete(guild, channel) {
                const payload = {
                        isTesting: this.bot.config.guilds.testing.includes(guild.id),
                        guildConfig: await this.bot.guilds.getOrFetch(guild.id),
                        guild: guild,
                        channel: channel,
                };

                return payload;
        }

        async guildRoleCreate(guild, role) {
                const payload = {
                        isTesting: this.bot.config.guilds.testing.includes(guild.id),
                        guildConfig: await this.bot.guilds.getOrFetch(guild.id),
                        guild: guild,
                        role: role,
                };

                return payload;
        }

        async guildRoleDelete(guild, role) {
                const payload = {
                        isTesting: this.bot.config.guilds.testing.includes(guild.id),
                        guildConfig: await this.bot.guilds.getOrFetch(guild.id),
                        guild: guild,
                        role: role,
                };

                return payload;
        }

        async guildRoleUpdate(guild, role, oldRole) {
                const payload = {
                        isTesting: this.bot.config.guilds.testing.includes(guild.id),
                        guildConfig: await this.bot.guilds.getOrFetch(guild.id),
                        guild: guild,
                        role: role,
                        oldRole: oldRole,
                };

                return payload;
        }

        async messageCreate(message) {
                if (message.author.bot) return;

                const payload = {
                        isAdmin: this.helpers.permissions.isAdmin(message.author.id),
                        isTester: this.helpers.permissions.isTester(message.author.id),
                        isDM: !message.channel.guild,
                        message: message,
                };

                if (payload.isDM) return payload;

                payload.guildConfig = await this.bot.guilds.getOrFetch(message.channel.guild.id, { createIfNotFound: true });

                return payload;
        }

        async messageDelete(message) {
                message = this.bot.cache.getMessage[message.id];

                if (!message) return;

                const payload = {
                        message: message,
                        guildConfig: await this.bot.guilds.getOrFetch(message.channel.guild.id),
                };

                return payload;
        }

        async messageUpdate(message, oldMessage) {
                oldMessage = this.bot.cache.getMessage[message.id];

                if (!oldMessage) return;

                const payload = {
                        message: message,
                        oldMessage: Object.assign({}, oldMessage),
                        guildConfig: await this.bot.guilds.getOrFetch(oldMessage.channel.guild.id),
                };

                return payload;
        }
}

Object.assign(EventManager.prototype, EventEmitter.prototype);

module.exports = EventManager;
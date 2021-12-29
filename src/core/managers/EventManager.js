const Base = require('../structures/Base');

let EventEmitter;

try {
    EventEmitter = require('eventemitter3');
} catch {
    EventEmitter = require('events');
}


/**
 * Manage event dispatching
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
                    const payload = await this[event](...args);

                    if (!payload) return;

                    this.emit(event, payload);
                } catch (err) {
                    this.bot.logger.error(`[EventManager] Something went wrong.`);
                    console.error(err);
                }
            }

            this.eris.addListener(event, wrapped);
            this._registeredEvents[event] = { handler: wrapped, listeners: [execute] };
        } else {
            this._registeredEvents[event].listeners.push(execute);
        }

        this.addListener(event, execute);

        this.bot.logger.debug(`[EventManager] Added listener for event "${event}"`);

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

        this.bot.logger.debug(`[EventManager] Removed listener for event "${event}"`);

        return this;
    }

    async guildCreate(guild) {
        if (!this.bot.isReady) return;

        const payload = {
            isTesting: this.bot.config.guilds.testing.includes(guild.id),
            guilodConfig: await this.bot.guilds.getOrFetch(guild.id, { createIfNotFound: true }),
            guild: guild,
        };

        return payload;
    }

    async guildDelete(guild) {
        if (!this.bot.isReady) return;

        const payload = {
            isTesting: this.bot.config.guilds.testing.includes(guild.id),
            guildConfig: await this.bot.guilds.getOrFetch(guild.id),
            guild: guild,
        };

        return payload;
    }

    async guildChannelCreate(guild, channel) {
        if (!this.bot.isReady) return;

        const payload = {
            isTesting: this.bot.config.guilds.testing.includes(guild.id),
            guildConfig: await this.bot.guilds.getOrFetch(guild.id),
            guild: guild,
            channel: channel,
        };

        return payload;
    }

    async guildChannelUpdate(guild, channel, oldChannel) {
        if (!this.bot.isReady) return;

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
        if (!this.bot.isReady) return;

        const payload = {
            isTesting: this.bot.config.guilds.testing.includes(guild.id),
            guildConfig: await this.bot.guilds.getOrFetch(guild.id),
            guild: guild,
            channel: channel,
        };

        return payload;
    }

    async guildRoleCreate(guild, role) {
        if (!this.bot.isReady) return;

        const payload = {
            isTesting: this.bot.config.guilds.testing.includes(guild.id),
            guildConfig: await this.bot.guilds.getOrFetch(guild.id),
            guild: guild,
            role: role,
        };

        return payload;
    }

    async guildRoleDelete(guild, role) {
        if (!this.bot.isReady) return;

        const payload = {
            isTesting: this.bot.config.guilds.testing.includes(guild.id),
            guildConfig: await this.bot.guilds.getOrFetch(guild.id),
            guild: guild,
            role: role,
        };

        return payload;
    }

    async guildRoleUpdate(guild, role, oldRole) {
        if (!this.bot.isReady) return;

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
        if (!this.bot.isReady || message.author.bot) return;

        const payload = {
            isAdmin: this.bot.helpers.permissions.isAdmin(message.author.id),
            isTester: this.bot.helpers.permissions.isTester(message.author.id),
            isDM: !message.channel.guild,
            message: message,
        };

        if (payload.isDM) return payload;

        payload.guildConfig = await this.bot.guilds.getOrFetch(message.channel.guild.id, { createIfNotFound: true });

        return payload;
    }

    async messageDelete(message) {
        if (!this.bot.isReady) return;

        message = this.bot.cache.getMessage[message.id];

        if (!message) return;

        const payload = {
            message: message,
            guildConfig: await this.bot.guilds.getOrFetch(message.channel.guild.id),
        };

        return payload;
    }

    async messageUpdate(message, oldMessage) {
        if (!this.bot.isReady) return;

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
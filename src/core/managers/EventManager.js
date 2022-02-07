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

        async _guildPayload(payload, guildID, createIfNotFound = false) {
                payload.isTesting = this.bot.config.guilds.testing.includes(guildID);
                payload.guildConfig = await this.bot.guilds.getOrFetch(guildID, { createIfNotFound });

                return payload;
        }

        guildCreate(guild) {
                return this._guildPayload({ guild }, guild.id, true);
        }

        guildDelete(guild) {
                return this._guildPayload({ guild }, guild.id);
        }

        guildUpdate(guild, oldGuild) {
                return this._guildPayload({ guild, oldGuild }, guild.id);
        }

        guildChannelCreate(guild, channel) {
                return this._guildPayload({ guild, channel }, guild.id);
        }

        guildChannelDelete(guild, channel) {
                return this._guildPayload({ guild, channel }, guild.id);
        }

        guildChannelUpdate(guild, channel, oldChannel) {
                return this._guildPayload({ guild, channel, oldChannel }, guild.id);
        }

        guildRoleCreate(guild, role) {
                return this._guildPayload({ guild, role }, guild.id);
        }

        guildRoleDelete(guild, role) {
                return this._guildPayload({ guild, role }, guild.id);
        }

        guildRoleUpdate(guild, role, oldRole) {
                return this._guildPayload({ guild, role, oldRole }, guild.id);
        }

        messageCreate(message) {
                if (message.author.bot) return;

                const payload = {
                        isAdmin: this.helpers.permissions.isAdmin(message.author.id),
                        isTester: this.helpers.permissions.isTester(message.author.id),
                        isDM: !message.channel.guild,
                        message: message,
                };

                if (payload.isDM) return payload;

                return this._guildPayload(payload, message.channel.guild.id, true);
        }

        messageDelete(message) {
                message = this.bot.cache.getMessage[message.id];

                if (!message) return Promise.resolve();

                return this._guildPayload({ message }, message.channel.guild.id);
        }

        messageUpdate(message) {
                const oldMessage = this.bot.cache.getMessage(message.id);

                if (!oldMessage) return Promise.resolve();
                
                const payload = {
                        message: message,
                        oldMessage: Object.assign({}, oldMessage),
                };

                return this._guildPayload(payload, oldMessage.channel.guild.id);
        }
}

Object.assign(EventManager.prototype, EventEmitter.prototype);


module.exports = EventManager;
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

        userUpdate(user, oldUser) {
                if (!oldUser) return Promise.resolve();

                return Promise.resolve({ user, oldUser });
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

        guildBanAdd(guild, user) {
                return this._guildPayload({ guild, user }, guild.id);
        }

        guildBanRemove(guild, user) {
                return this._guildPayload({ guild, user }, guild.id);
        }

        guildEmojisUpdate(guild, emojis, oldEmojis) {
                if (!oldEmojis) return;

                return this._guildPayload({ guild, emojis, oldEmojis }, guild.id);
        }

        guildStickersUpdate(guild, stickers, oldStickers) {
                if (!oldStickers) return;

                return this._guildPayload({ guild, stickers, oldStickers }, guild.id);
        }

        guildMemberAdd(guild, member) {
                return this._guildPayload({ guild, member }, guild.id);
        }

        guildMemberRemove(guild, member) {
                return this._guildPayload({ guild, member }, guild.id);
        }

        guildMemberUpdate(guild, member, oldMember) {
                if (!oldMember) return Promise.resolve();

                return this._guildPayload({ guild, member, oldMember }, guild.id);
        }

        typingStart(channel, user, member) {
                if (!member) return Promise.resolve();

                return this._guildPayload({ channel, member }, channel.guild.id);
        }

        channelCreate(channel) {
                return this._guildPayload({ channel }, channel.guild.id);
        }

        channelDelete(channel) {
                return this._guildPayload({ channel }, channel.guild.id);
        }

        channelUpdate(channel, oldChannel) {
                if (!oldChannel) return Promise.resolve();

                return this._guildPayload({ channel, oldChannel }, channel.guild.id);
        }

        channelPinUpdate(channel, timestamp, oldTimestamp) {
                if (!channel.guild) return Promise.resolve();

                return this._guildPayload({ channel, timestamp, oldTimestamp }, channel.guild.id);
        }

        webhooksUpdate(data) {
                return this._guildPayload({ data }, data.guildID);
        }

        threadCreate(channel) {
                return this._guildPayload({ channel }, channel.guild.id);
        }

        theadDelete(channel) {
                return this._guildPayload({ channel }, channel.guild.id);
        }

        threadUpdate(channel, oldChannel) {
                if (!oldChannel) return Promise.resolve();

                return this._guildPayload({ channel, oldChannel }, channel.guild.id);
        }

        threadListSync(guild, deletedThreads, activeThreads, joinedThreadsMember) {
                return this._guildPayload({ guild, deletedThreads, activeThreads, joinedThreadsMember }, guild.id);
        }

        threadMemberUpdate(channel, member, oldMember) {
                return this._guildPayload({ channel, member, oldMember }, channel.guild.id);
        }

        threadMembersUpdate(channel, addedMembers, removedMembers) {
                return this._guildPayload({ channel, addedMembers, removedMembers }, channel.guild.id);
        }

        voiceChannelJoin(member, newChannel) {
                return this._guildPayload({ member, newChannel }, member.guild.id);
        }

        voiceChannelLeave(member, oldChannel) {
                return this._guildPayload({ member, oldChannel }, member.guild.id);
        }

        voiceChannelSwitch(member, oldChannel, newChannel) {
                return this._guildPayload({ member, oldChannel, newChannel }, member.guild.id);
        }

        voiceStateUpdate(member, oldState) {
                if (!oldState) return Promise.resolve();

                return this._guildPayload({ member, oldState }, member.guild.id);
        }

        stageInstanceCreate(stageInstance) {
                return this._guildPayload({ stageInstance }, stageInstance.guild.id);
        }

        stageInstanceDelete(stageInstance) {
                return this._guildPayload({ stageInstance }, stageInstance.guild.id);
        }

        stageInstanceUpdate(stageInstance, oldStageInstance) {
                if (!oldStageInstance) return Promise.resolve();

                return this._guildPayload({ stageInstance, oldStageInstance }, stageInstance.guild.id);
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

        interactionCreate(interaction) {
                if (!interaction.guildID) {
                        return Promise.resolve({ interaction });
                }

                return this._guildPayload({ interaction }, interaction.guildID);
        }

        inviteCreate(guild, invite) {
                return this._guildPayload({ guild, invite }, guild.id);
        }

        inviteDelete(guild, invite) {
                return this._guildPayload({ guild, invite }, guild.id);
        }

        messageCreate(message) {
                if (message.author.bot) return Promise.resolve();

                const payload = {
                        isAdmin: this.helpers.permissions.isAdmin(message.author.id),
                        isTester: this.helpers.permissions.isTester(message.author.id),
                        isDM: !message.guildID,
                        message: message,
                };

                if (payload.isDM) {
                        return Promise.resolve(payload);
                }

                return this._guildPayload(payload, message.guildID, true);
        }

        messageDelete(message) {
                message = this.bot.cache.getMessage[message.id];

                if (!message) return Promise.resolve();

                return this._guildPayload({ message }, message.channel.guild.id);
        }

        messageDeleteBulk(messages) {
                const cache = this.bot.cache;

                messages = messages.map(m => cache.getMessage(m.id)).filter(m => m);

                if (!messages.length) return Promise.resolve();

                return this._guildPayload({ messages }, messages[0].guildID);
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

        messageReactionAdd(message, emoji, reactor) {
                if (!message.guildID) return Promise.resolve();

                return this._guildPayload({ message, emoji, reactor }, message.guildID);
        }

        messageReactionRemove(message, emoji, userID) {
                if (!message.guildID) return Promise.resolve();

                return this._guildPayload({ message, emoji, userID }, message.guildID);
        }

        messageReactionRemoveAll(message) {
                if (!message.guildID) return Promise.resolve();

                return this._guildPayload({ message }, message.guildID);
        }

        messageReactionRemoveEmoji(message, emoji) {
                if (!message.guildID) return Promise.resolve();

                return this._guildPayload({ message, emoji }, message.guildID);
        }
}

Object.assign(EventManager.prototype, EventEmitter.prototype);


module.exports = EventManager;
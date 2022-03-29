"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EventEmitter = require("eventemitter3");
const eris = require("eris");
const Permission_1 = require("../helpers/Permission");
const Base_1 = require("../structures/Base");
class EventManager extends Base_1.default {
    _events;
    _permissions;
    _registeredEvents = {};
    constructor(core) {
        super(core);
        this._events = new EventEmitter();
        this._permissions = new Permission_1.default(core);
    }
    registerListener(event, execute) {
        if (!this[event]) {
            this.eris.addListener(event, execute);
            return this;
        }
        if (!this._registeredEvents[event]) {
            const wrapped = async (...args) => {
                try {
                    const payload = await this[event].apply(this, args);
                    if (!payload) {
                        return;
                    }
                    this._events.emit(event, payload);
                }
                catch (err) {
                    this.log(err, 'error');
                }
            };
            this.eris.addListener(event, wrapped);
            this._registeredEvents[event] = { handler: wrapped, listeners: [execute] };
        }
        else {
            this._registeredEvents[event].listeners.push(execute);
        }
        this._events.addListener(event, execute);
        this.log(`Added listener for event "${event}".`);
        return this;
    }
    unregisterListener(event, execute) {
        if (!this[event]) {
            this.eris.removeListener(event, execute);
            return this;
        }
        if (this._registeredEvents[event]) {
            const listeners = this._registeredEvents[event].listeners.filter(l => l === execute);
            if (!listeners.length) {
                this.eris.removeListener(event, this._registeredEvents[event].handler);
                delete this._registeredEvents[event];
            }
            else {
                this._registeredEvents[event].listeners = listeners;
            }
        }
        this._events.removeListener(event, execute);
        this.log(`Removed listener for event "${event}".`);
        return this;
    }
    waitFor(eventName, fn, timeout) {
        return new Promise((resolve, reject) => {
            if (!fn) {
                fn = (() => true);
            }
            const wrapped = (payload) => {
                if (fn(payload)) {
                    this.unregisterListener(eventName, wrapped);
                    clearTimeout(timeoutTask);
                    resolve(payload);
                }
            };
            let timeoutTask;
            if (timeout) {
                timeoutTask = setTimeout(() => {
                    this.unregisterListener(eventName, wrapped);
                    reject();
                }, timeout);
            }
            this.registerListener(eventName, wrapped);
        });
    }
    _userPayload(payload, userID) {
        const _p = payload;
        _p.isAdmin = this._permissions.isAdmin(userID);
        _p.isTester = this._permissions.isTester(userID);
        return Promise.resolve(_p);
    }
    async _guildPayload(payload, guildID, createIfNotFound = false) {
        const _p = payload;
        _p.isTesting = this.core.config.guilds.testing.includes(guildID);
        _p.guildConfig = await this.core.guilds.getOrFetch(guildID, { createIfNotFound });
        return _p;
    }
    userUpdate(user, oldUser) {
        if (!oldUser) {
            return Promise.resolve(null);
        }
        return this._userPayload({ user, oldUser }, user.id);
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
        return this._guildPayload({ guild, user }, guild.id)
            .then(payload => this._userPayload(payload, user.id));
    }
    guildBanRemove(guild, user) {
        return this._guildPayload({ guild, user }, guild.id)
            .then(payload => this._userPayload(payload, user.id));
    }
    guildEmojisUpdate(guild, emojis, oldEmojis) {
        if (!oldEmojis) {
            return Promise.resolve(null);
        }
        return this._guildPayload({ guild, emojis, oldEmojis }, guild.id);
    }
    guildStickersUpdate(guild, stickers, oldStickers) {
        if (!oldStickers) {
            return Promise.resolve(null);
        }
        return this._guildPayload({ guild, stickers, oldStickers }, guild.id);
    }
    guildMemberAdd(guild, member) {
        return this._guildPayload({ guild, member }, guild.id)
            .then(payload => this._userPayload(payload, member.id));
    }
    guildMemberRemove(guild, member) {
        return this._guildPayload({ guild, member }, guild.id)
            .then(payload => this._userPayload(payload, member.id));
    }
    async guildMemberUpdate(guild, member, oldMember) {
        if (!oldMember) {
            return Promise.resolve(null);
        }
        return this._guildPayload({ guild, member, oldMember }, guild.id)
            .then(payload => this._userPayload(payload, member.id));
    }
    typingStart(channel, user, member) {
        if (!(member instanceof eris.Member)) {
            return this._userPayload({ channel, user, member }, user.id);
        }
        return this._guildPayload({ channel, user, member }, channel.guild.id)
            .then(payload => {
            return this._userPayload(payload, user.id);
        });
    }
    channelCreate(channel) {
        return this._guildPayload({ channel }, channel.guild.id);
    }
    channelDelete(channel) {
        if (channel instanceof eris.PrivateChannel) {
            return Promise.resolve(null);
        }
        return this._guildPayload({ channel }, channel.guild.id);
    }
    channelUpdate(channel, oldChannel) {
        return this._guildPayload({ channel, oldChannel }, channel.guild.id);
    }
    channelPinUpdate(channel, timestamp, oldTimestamp) {
        if (channel instanceof eris.PrivateChannel) {
            return Promise.resolve(null);
        }
        return this._guildPayload({ channel, timestamp, oldTimestamp }, channel.guild.id);
    }
    webhooksUpdate(data) {
        return this._guildPayload({ data }, data.guildID);
    }
    threadCreate(channel) {
        return this._guildPayload({ channel }, channel.guild.id)
            .then(payload => this._userPayload(payload, channel.ownerID));
    }
    threadDelete(channel) {
        return this._guildPayload({ channel }, channel.guild.id)
            .then(payload => this._userPayload(payload, channel.ownerID));
    }
    threadUpdate(channel, oldChannel) {
        if (!oldChannel) {
            return Promise.resolve(null);
        }
        return this._guildPayload({ channel, oldChannel }, channel.guild.id)
            .then(payload => this._userPayload(payload, channel.ownerID));
    }
    threadListSync(guild, deletedThreads, activeThreads, joinedThreadsMember) {
        return this._guildPayload({ guild, deletedThreads, activeThreads, joinedThreadsMember }, guild.id);
    }
    threadMemberUpdate(channel, member, oldMember) {
        return this._guildPayload({ channel, member, oldMember }, channel.guild.id)
            .then(payload => this._userPayload(payload, member.id));
    }
    threadMembersUpdate(channel, addedMembers, removedMembers) {
        return this._guildPayload({ channel, addedMembers, removedMembers }, channel.guild.id);
    }
    voiceChannelJoin(member, channel) {
        return this._guildPayload({ member, channel }, member.guild.id)
            .then(payload => this._userPayload(payload, member.id));
    }
    voiceChannelLeave(member, channel) {
        return this._guildPayload({ member, channel }, member.guild.id)
            .then(payload => this._userPayload(payload, member.id));
    }
    voiceChannelSwitch(member, newChannel, oldChannel) {
        return this._guildPayload({ member, oldChannel, newChannel }, member.guild.id)
            .then(payload => this._userPayload(payload, member.id));
    }
    voiceStateUpdate(member, oldState) {
        if (!oldState) {
            return Promise.resolve(null);
        }
        return this._guildPayload({ member, oldState }, member.guild.id)
            .then(payload => this._userPayload(payload, member.id));
    }
    stageInstanceCreate(stageInstance) {
        return this._guildPayload({ stageInstance }, stageInstance.guild.id);
    }
    stageInstanceDelete(stageInstance) {
        return this._guildPayload({ stageInstance }, stageInstance.guild.id);
    }
    stageInstanceUpdate(stageInstance, oldStageInstance) {
        if (!oldStageInstance) {
            return Promise.resolve(null);
        }
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
        if (interaction instanceof eris.PingInteraction) {
            return Promise.resolve({ interaction });
        }
        if (interaction.guildID) {
            return this._guildPayload({ interaction }, interaction.guildID)
                .then(payload => this._userPayload(payload, interaction.user.id));
        }
        else {
            return this._userPayload({ interaction }, interaction.user.id);
        }
    }
    inviteCreate(guild, invite) {
        return this._guildPayload({ guild, invite }, guild.id);
    }
    inviteDelete(guild, invite) {
        return this._guildPayload({ guild, invite }, guild.id);
    }
    messageCreate(message) {
        if (!message.guildID) {
            return Promise.resolve({ message })
                .then(payload => this._userPayload(payload, message.author.id));
        }
        return this._guildPayload({ message }, message.guildID, true)
            .then(payload => this._userPayload(payload, message.author.id));
    }
    messageDelete(message) {
        const deletedMessage = this.core.state.getMessage(message.id);
        if (!deletedMessage) {
            return Promise.resolve(null);
        }
        return this._guildPayload({ message: deletedMessage }, deletedMessage.channel.guild.id)
            .then(payload => this._userPayload(payload, deletedMessage.author.id));
    }
    messageDeleteBulk(messages) {
        const state = this.core.state;
        const deletedMessages = messages.map(m => state.getMessage(m.id)).filter(m => m);
        if (!deletedMessages.length) {
            return Promise.resolve(null);
        }
        return this._guildPayload({ messages: deletedMessages }, messages[0].guildID);
    }
    messageUpdate(message) {
        const oldMessage = this.core.state.getMessage(message.id);
        if (!oldMessage) {
            return Promise.resolve(null);
        }
        const payload = {
            message: message,
            oldMessage: Object.assign({}, oldMessage)
        };
        return this._guildPayload(payload, oldMessage.channel.guild.id)
            .then(payload => this._userPayload(payload, oldMessage.author.id));
    }
    messageReactionAdd(message, emoji, reactor) {
        if (!message.guildID) {
            return this._userPayload({ message, emoji, reactor }, reactor.id);
        }
        return this._guildPayload({ message: this._tryMessageUpgrade(message), emoji, reactor }, message.guildID)
            .then(payload => this._userPayload(payload, reactor.id));
    }
    messageReactionRemove(message, emoji, userID) {
        if (!message.guildID) {
            return this._userPayload({ message, emoji, userID }, userID);
        }
        return this._guildPayload({ message: this._tryMessageUpgrade(message), emoji, userID }, message.guildID)
            .then(payload => this._userPayload(payload, userID));
    }
    messageReactionRemoveAll(message) {
        if (!message.guildID) {
            return Promise.resolve({ message });
        }
        return this._guildPayload({ message: this._tryMessageUpgrade(message) }, message.guildID);
    }
    messageReactionRemoveEmoji(message, emoji) {
        if (!message.guildID) {
            return Promise.resolve({ message, emoji });
        }
        return this._guildPayload({ message: this._tryMessageUpgrade(message), emoji }, message.guildID);
    }
    _tryMessageUpgrade(message) {
        if (!(message instanceof eris.Message)) {
            return this.core.state.getMessage(message.id) || message;
        }
        return message;
    }
}
exports.default = EventManager;
//# sourceMappingURL=EventManager.js.map
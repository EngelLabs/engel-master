// TODO: Type this module
import * as EventEmitter from 'eventemitter3';
import * as eris from 'eris';
import type * as core from '@engel/core';
import type * as types from '@engel/types';
import Permission from '../helpers/Permission';
import Base from '../structures/Base';
import type App from '../structures/App';

interface AnyFunc {
        (...args: any): void;
}

type EventHandler<K extends keyof types.GuildEvents | keyof types.NonGuildEvents = keyof types.GuildEvents | keyof types.NonGuildEvents> =
        K extends keyof keyof types.GuildEvents | keyof types.NonGuildEvents ? (payload?: (types.GuildEvents & types.NonGuildEvents)[K]) => any :
        K extends keyof types.GuildEvents ? (payload?: types.GuildEvents[K]) => any :
        K extends keyof types.NonGuildEvents ? (payload?: types.NonGuildEvents[K]) => any : never

/**
 * Event dispatch manager
 */
export default class EventManager extends Base {
        private _logger: core.Logger;
        private _events: EventEmitter;
        private _permissions: Permission;
        private _registeredEvents: Record<string, { handler: AnyFunc, listeners: Array<AnyFunc> }> = {};

        public constructor(app: App) {
                super(app);

                this._logger = app.logger.get('EventManager');
                this._events = new EventEmitter();
                this._permissions = new Permission(app);
        }

        public registerListener<K extends types.EventNames>(event: K, execute: EventHandler<K>): this {
                if (!this[<keyof EventManager>event]) {
                        this.eris.addListener(event, execute);

                        return this;
                }

                if (!this._registeredEvents[event]) {
                        const wrapped = async (...args: any) => {
                                try {
                                        // eslint-disable-next-line keyword-spacing
                                        const payload: any = await (<EventHandler>this[<keyof EventManager>event]).apply(this, args);

                                        if (!payload) {
                                                return;
                                        }

                                        this._events.emit(event, payload);
                                } catch (err) {
                                        this._logger.error(err);
                                }
                        };

                        this.eris.addListener(event, wrapped);
                        this._registeredEvents[event] = { handler: wrapped, listeners: [execute] };
                } else {
                        this._registeredEvents[event].listeners.push(execute);
                }

                this._events.addListener(event, execute);

                this._logger.debug(`Added listener for event "${event}".`);

                return this;
        }

        public unregisterListener<K extends types.EventNames>(event: K, execute: EventHandler<K>): this {
                if (!this[<keyof EventManager>event]) {
                        this.eris.removeListener(event, execute);

                        return this;
                }

                if (this._registeredEvents[event]) {
                        const listeners = this._registeredEvents[event].listeners.filter(l => l === execute);

                        if (!listeners.length) {
                                this.eris.removeListener(event, this._registeredEvents[event].handler);
                                delete this._registeredEvents[event];
                        } else {
                                this._registeredEvents[event].listeners = listeners;
                        }
                }

                this._events.removeListener(event, execute);

                this._logger.debug(`Removed listener for event "${event}".`);

                return this;
        }

        public waitFor<K extends types.EventNames>(
                eventName: K,
                fn: EventHandler<K>,
                timeout?: number
        ): Promise<ReturnType<EventHandler<K>>> {
                return new Promise((resolve, reject) => {
                        if (!fn) {
                                fn = <EventHandler<K>>(() => true);
                        }

                        const wrapped: any = (payload: any) => {
                                if (fn(payload)) {
                                        this.unregisterListener(eventName, wrapped);
                                        clearTimeout(timeoutTask);

                                        resolve(payload);
                                }
                        };

                        let timeoutTask: NodeJS.Timeout;

                        if (timeout) {
                                timeoutTask = setTimeout(() => {
                                        this.unregisterListener(eventName, wrapped);

                                        reject();
                                }, timeout);
                        }

                        this.registerListener(eventName, wrapped);
                });
        }

        private _userPayload<T>(
                payload: T,
                userID: string
        ): Promise<T & types.UserPayload> {
                const _p: Partial<types.UserPayload> = payload;

                _p.isAdmin = this._permissions.isAdmin(userID);
                _p.isTester = this._permissions.isTester(userID);

                return Promise.resolve(<any>_p);
        }

        private async _guildPayload<T>(
                payload: T,
                guildID: string,
                createIfNotFound: boolean = false
        ): Promise<T & types.GuildPayload> {
                const _p: Partial<types.GuildPayload> = payload;

                _p.isTesting = this.app.config.guilds.testing.includes(guildID);
                _p.guildConfig = await this.app.guilds.getOrFetch(guildID, { createIfNotFound });

                return <any>_p;
        }

        private userUpdate(
                user: eris.User,
                oldUser: eris.PartialUser | null
        ): Promise<types.NonGuildEvents['userUpdate'] | null> {
                if (!oldUser) {
                        return Promise.resolve(null);
                }

                return this._userPayload({ user, oldUser }, user.id);
        }

        private guildCreate(
                guild: eris.Guild
        ): Promise<types.GuildEvents['guildCreate']> {
                return this._guildPayload({ guild }, guild.id, true);
        }

        private guildDelete(
                guild: eris.Guild
        ): Promise<types.GuildEvents['guildDelete']> {
                return this._guildPayload({ guild }, guild.id);
        }

        private guildUpdate(
                guild: eris.Guild,
                oldGuild: eris.OldGuild
        ): Promise<types.GuildEvents['guildUpdate']> {
                return this._guildPayload({ guild, oldGuild }, guild.id);
        }

        private guildBanAdd(
                guild: eris.Guild,
                user: eris.User
        ): Promise<types.GuildEvents['guildBanAdd']> {
                return this._guildPayload({ guild, user }, guild.id)
                        .then(payload => this._userPayload(payload, user.id));
        }

        private guildBanRemove(
                guild: eris.Guild,
                user: eris.User
        ): Promise<types.GuildEvents['guildBanRemove']> {
                return this._guildPayload({ guild, user }, guild.id)
                        .then(payload => this._userPayload(payload, user.id));
        }

        private guildEmojisUpdate(
                guild: eris.Guild,
                emojis: eris.Emoji[],
                oldEmojis: eris.Emoji[] | null
        ): Promise<types.GuildEvents['guildEmojisUpdate']> {
                if (!oldEmojis) {
                        return Promise.resolve(null);
                }

                return this._guildPayload({ guild, emojis, oldEmojis }, guild.id);
        }

        private guildStickersUpdate(
                guild: eris.Guild,
                stickers: eris.Sticker[],
                oldStickers: eris.Sticker[] | null
        ): Promise<types.GuildEvents['guildStickersUpdate']> {
                if (!oldStickers) {
                        return Promise.resolve(null);
                }

                return this._guildPayload({ guild, stickers, oldStickers }, guild.id);
        }

        private guildMemberAdd(
                guild: eris.Guild,
                member: eris.Member
        ): Promise<types.GuildEvents['guildMemberAdd']> {
                return this._guildPayload({ guild, member }, guild.id)
                        .then(payload => this._userPayload(payload, member.id));
        }

        private guildMemberRemove(
                guild: eris.Guild,
                member: eris.Member
        ): Promise<types.GuildEvents['guildMemberRemove']> {
                return this._guildPayload({ guild, member }, guild.id)
                        .then(payload => this._userPayload(payload, member.id));
        }

        private async guildMemberUpdate(
                guild: eris.Guild,
                member: eris.Member,
                oldMember: eris.OldMember | null
        ): Promise<types.GuildEvents['guildMemberUpdate'] | null> {
                if (!oldMember) {
                        return Promise.resolve(null);
                }

                return this._guildPayload({ guild, member, oldMember }, guild.id)
                        .then(payload => this._userPayload(payload, member.id));
        }

        private typingStart(
                channel: eris.TextableChannel | eris.Uncached,
                user: eris.User | eris.Uncached,
                member: eris.Member | null
        ): Promise<types.Events['typingStart'] | null> {
                if (!(member instanceof eris.Member)) {
                        return this._userPayload({ channel, user, member }, user.id);
                }

                // If member is provided, then channel belongs to a guild
                return this._guildPayload({ channel, user, member }, (<eris.GuildTextableChannel>channel).guild.id)
                        .then(payload => {
                                return this._userPayload(payload, user.id);
                        });
        }

        private channelCreate(
                channel: eris.AnyGuildChannel
        ): Promise<types.GuildEvents['channelCreate']> {
                return this._guildPayload({ channel }, channel.guild.id);
        }

        private channelDelete(
                channel: eris.AnyChannel
        ): Promise<types.GuildEvents['channelDelete']> {
                if (channel instanceof eris.PrivateChannel) {
                        return Promise.resolve(null);
                }

                return this._guildPayload({ channel }, (<eris.GuildChannel>channel).guild.id);
        }

        private channelUpdate(
                channel: eris.GuildChannel,
                oldChannel: eris.OldGuildChannel | eris.OldGuildTextChannel | eris.OldGuildVoiceChannel
        ): Promise<types.GuildEvents['channelUpdate'] | null> {
                return this._guildPayload({ channel, oldChannel }, channel.guild.id);
        }

        private channelPinUpdate(
                channel: eris.GuildTextableChannel,
                timestamp: number,
                oldTimestamp: number
        ): Promise<types.GuildEvents['channelPinUpdate'] | null> {
                if (channel instanceof eris.PrivateChannel) {
                        return Promise.resolve(null);
                }

                return this._guildPayload({ channel, timestamp, oldTimestamp }, channel.guild.id);
        }

        private webhooksUpdate(
                data: eris.WebhookData
        ): Promise<types.GuildEvents['webhooksUpdate']> {
                return this._guildPayload({ data }, data.guildID);
        }

        private threadCreate(
                channel: eris.AnyThreadChannel
        ): Promise<types.GuildEvents['threadCreate']> {
                return this._guildPayload({ channel }, channel.guild.id)
                        .then(payload => this._userPayload(payload, channel.ownerID));
        }

        private threadDelete(
                channel: eris.AnyThreadChannel
        ): Promise<types.GuildEvents['threadDelete']> {
                return this._guildPayload({ channel }, channel.guild.id)
                        .then(payload => this._userPayload(payload, channel.ownerID));
        }

        private threadUpdate(
                channel: eris.AnyThreadChannel,
                oldChannel: eris.OldThread
        ): Promise<types.GuildEvents['threadUpdate'] | null> {
                if (!oldChannel) {
                        return Promise.resolve(null);
                }

                return this._guildPayload({ channel, oldChannel }, channel.guild.id)
                        .then(payload => this._userPayload(payload, channel.ownerID));
        }

        private threadListSync(
                guild: eris.Guild,
                deletedThreads: (eris.AnyThreadChannel | eris.Uncached)[],
                activeThreads: eris.AnyThreadChannel[],
                joinedThreadsMember: eris.ThreadMember[]
        ): Promise<types.GuildEvents['threadListSync']> {
                return this._guildPayload(
                        { guild, deletedThreads, activeThreads, joinedThreadsMember },
                        guild.id
                );
        }

        private threadMemberUpdate(
                channel: eris.AnyThreadChannel,
                member: eris.ThreadMember,
                oldMember: eris.OldThreadMember
        ): Promise<types.GuildEvents['threadMemberUpdate']> {
                return this._guildPayload({ channel, member, oldMember }, channel.guild.id)
                        .then(payload => this._userPayload(payload, member.id));
        }

        private threadMembersUpdate(
                channel: eris.AnyThreadChannel,
                addedMembers: eris.ThreadMember[],
                removedMembers: (eris.ThreadMember | eris.Uncached)[]
        ): Promise<types.GuildEvents['threadMembersUpdate']> {
                return this._guildPayload({ channel, addedMembers, removedMembers }, channel.guild.id);
        }

        private voiceChannelJoin(
                member: eris.Member,
                channel: eris.AnyVoiceChannel
        ): Promise<types.GuildEvents['voiceChannelJoin']> {
                return this._guildPayload({ member, channel }, member.guild.id)
                        .then(payload => this._userPayload(payload, member.id));
        }

        private voiceChannelLeave(
                member: eris.Member,
                channel: eris.AnyVoiceChannel
        ): Promise<types.GuildEvents['voiceChannelLeave']> {
                return this._guildPayload({ member, channel }, member.guild.id)
                        .then(payload => this._userPayload(payload, member.id));
        }

        private voiceChannelSwitch(
                member: eris.Member,
                newChannel: eris.AnyVoiceChannel,
                oldChannel: eris.AnyVoiceChannel
        ): Promise<types.GuildEvents['voiceChannelSwitch']> {
                return this._guildPayload({ member, oldChannel, newChannel }, member.guild.id)
                        .then(payload => this._userPayload(payload, member.id));
        }

        private voiceStateUpdate(
                member: eris.Member | eris.Uncached,
                oldState: eris.OldVoiceState | null
        ): Promise<types.GuildEvents['voiceStateUpdate'] | null> {
                if (!oldState) {
                        return Promise.resolve(null);
                }

                // https://abal.moe/Eris/docs/0.16.1/Client#event-voiceStateUpdate
                // member is eris.Member if oldState is present, else eris.Uncached.
                return this._guildPayload({ member, oldState }, (<eris.Member>member).guild.id)
                        .then(payload => this._userPayload(payload, member.id));
        }

        private stageInstanceCreate(
                stageInstance: eris.StageInstance
        ): Promise<types.GuildEvents['stageInstanceCreate']> {
                return this._guildPayload({ stageInstance }, stageInstance.guild.id);
        }

        private stageInstanceDelete(
                stageInstance: eris.StageInstance
        ): Promise<types.GuildEvents['stageInstanceDelete']> {
                return this._guildPayload({ stageInstance }, stageInstance.guild.id);
        }

        private stageInstanceUpdate(
                stageInstance: eris.StageInstance,
                oldStageInstance: eris.OldStageInstance | null
        ): Promise<types.GuildEvents['stageInstanceUpdate'] | null> {
                if (!oldStageInstance) {
                        return Promise.resolve(null);
                }

                return this._guildPayload({ stageInstance, oldStageInstance }, stageInstance.guild.id);
        }

        private guildRoleCreate(
                guild: eris.Guild,
                role: eris.Role
        ): Promise<types.GuildEvents['guildRoleCreate']> {
                return this._guildPayload({ guild, role }, guild.id);
        }

        private guildRoleDelete(
                guild: eris.Guild,
                role: eris.Role
        ): Promise<types.GuildEvents['guildRoleDelete']> {
                return this._guildPayload({ guild, role }, guild.id);
        }

        private guildRoleUpdate(
                guild: eris.Guild,
                role: eris.Role,
                oldRole: eris.OldRole
        ): Promise<types.GuildEvents['guildRoleUpdate']> {
                return this._guildPayload({ guild, role, oldRole }, guild.id);
        }

        private interactionCreate(
                interaction: eris.AnyInteraction
        ): Promise<types.Events['interactionCreate']> {
                if (interaction instanceof eris.PingInteraction) {
                        return Promise.resolve({ interaction });
                }

                if (interaction.guildID) {
                        // Guild context
                        return this._guildPayload(
                                <{ interaction: types.GuildInteraction }>{ interaction }, interaction.guildID)
                                .then(payload => this._userPayload(payload, interaction.user.id));
                } else {
                        // DM context
                        return this._userPayload(<{ interaction: types.PrivateInteraction }>{ interaction }, interaction.user.id);
                }
        }

        private inviteCreate(
                guild: eris.Guild,
                invite: eris.Invite
        ): Promise<types.GuildEvents['inviteCreate']> {
                return this._guildPayload({ guild, invite }, guild.id);
        }

        private inviteDelete(
                guild: eris.Guild,
                invite: eris.Invite
        ): Promise<types.GuildEvents['inviteDelete']> {
                return this._guildPayload({ guild, invite }, guild.id);
        }

        private messageCreate(
                message: eris.Message<eris.PossiblyUncachedTextableChannel>
        ): Promise<types.Events['messageCreate'] | null> {
                // Types are ignored here because it's a royal pita.

                if (!message.guildID) {
                        return Promise.resolve(<any>{ message })
                                .then(payload => this._userPayload(payload, message.author.id));
                }

                return this._guildPayload(<any>{ message }, message.guildID, true)
                        .then(payload => this._userPayload(payload, message.author.id));
        }

        private messageDelete(
                message: eris.PossiblyUncachedMessage
        ): Promise<types.GuildEvents['messageDelete'] | null> {
                const deletedMessage = this.app.state.getMessage(message.id);

                if (!deletedMessage) {
                        return Promise.resolve(null);
                }

                return this._guildPayload({ message: deletedMessage }, deletedMessage.channel.guild.id)
                        .then(payload => this._userPayload(payload, deletedMessage.author.id));
        }

        private messageDeleteBulk(
                messages: eris.PossiblyUncachedMessage[]
        ): Promise<types.GuildEvents['messageDeleteBulk'] | null> {
                const state = this.app.state;

                const deletedMessages = messages.map(m => state.getMessage(m.id)).filter(m => m);

                if (!deletedMessages.length) {
                        return Promise.resolve(null);
                }

                return this._guildPayload({ messages: deletedMessages }, messages[0].guildID);
        }

        private messageUpdate(
                message: eris.Message<eris.PossiblyUncachedTextableChannel>
        ): Promise<types.GuildEvents['messageUpdate']> {
                const oldMessage = this.app.state.getMessage(message.id);

                if (!oldMessage) {
                        return Promise.resolve(null);
                }

                const payload = {
                        message: <eris.Message<eris.GuildTextableChannel>>message,
                        oldMessage: Object.assign({}, oldMessage)
                };

                return this._guildPayload(payload, oldMessage.channel.guild.id)
                        .then(payload => this._userPayload(payload, oldMessage.author.id));
        }

        private messageReactionAdd(
                message: eris.PossiblyUncachedMessage,
                emoji: eris.PartialEmoji,
                reactor: eris.User | eris.Uncached
        ): Promise<types.Events['messageReactionAdd']> {
                if (!message.guildID) {
                        return this._userPayload({ message, emoji, reactor }, reactor.id);
                }

                return this._guildPayload({ message: this._tryMessageUpgrade(message), emoji, reactor }, message.guildID)
                        .then(payload => this._userPayload(payload, reactor.id));
        }

        private messageReactionRemove(
                message: eris.PossiblyUncachedMessage,
                emoji: eris.PartialEmoji,
                userID: string
        ): Promise<types.Events['messageReactionRemove']> {
                if (!message.guildID) {
                        return this._userPayload({ message, emoji, userID }, userID);
                }

                return this._guildPayload({ message: this._tryMessageUpgrade(message), emoji, userID }, message.guildID)
                        .then(payload => this._userPayload(payload, userID));
        }

        private messageReactionRemoveAll(
                message: eris.PossiblyUncachedMessage
        ): Promise<types.Events['messageReactionRemoveAll']> {
                if (!message.guildID) {
                        return Promise.resolve({ message });
                }

                return this._guildPayload({ message: this._tryMessageUpgrade(message) }, message.guildID);
        }

        private messageReactionRemoveEmoji(
                message: eris.PossiblyUncachedMessage,
                emoji: eris.PartialEmoji
        ): Promise<types.Events['messageReactionRemoveEmoji']> {
                if (!message.guildID) {
                        return Promise.resolve({ message, emoji });
                }

                return this._guildPayload({ message: this._tryMessageUpgrade(message), emoji }, message.guildID);
        }

        private _tryMessageUpgrade(
                message: eris.PossiblyUncachedMessage
        ): eris.PossiblyUncachedMessage | types.PartialMessage {
                if (!(message instanceof eris.Message)) {
                        return this.app.state.getMessage(message.id) || message;
                }

                return message;
        }
}

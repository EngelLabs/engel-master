import Core from '../structures/Core';
import * as eris from 'eris';
import type * as types from '@engel/types';

export function capitalize(str?: string): string {
        if (!str || !str.length) return '';

        return str[0].toUpperCase() + str.slice(1);
}

export function getTopRole(guild: eris.Guild | undefined): eris.Role | undefined {
        if (!guild) {
                return;
        }

        const me = guild.members.get(Core.instance.eris.user.id);

        if (!me || !me.roles.length) {
                return;
        }

        return me.roles
                .map(id => guild.roles.get(id))
                .reduce((prev, curr) => curr?.position > prev.position ? curr : prev);
}

export function sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
}

export function sendMessage(
        channel: string | eris.TextableChannel,
        content: string | types.AdvancedMessageContent,
        type?: types.ResponseType
): Promise<eris.Message | null> {
        if (!content) {
                return Promise.resolve(null);
        }

        const core = Core.instance;

        if (!type) {
                if (typeof content !== 'string' && content.embed) {
                        if (!content.embeds) {
                                content.embeds = [];
                        }

                        if (content.embed.colour && !content.embed.color) {
                                content.embed.color = content.embed.colour;
                                delete content.embed.colour;
                        }

                        content.embeds.push(content.embed);

                        delete content.embed;
                }

                if (typeof channel !== 'string' && (!(channel instanceof eris.PrivateChannel))) {
                        const permissions = channel.permissionsOf(core.eris.user.id);

                        if (typeof content !== 'string' && content.embeds && !permissions.has('embedLinks')) {
                                if (permissions.has('sendMessages')) {
                                        sendMessage(
                                                channel,
                                                "I'm missing permissions to `Embed Links` and can't display this message."
                                        );
                                }

                                return Promise.resolve(null);
                        }
                }

                if (typeof content !== 'string') {
                        var file = content.file;

                        delete content.file;
                }

                return core.eris.createMessage(typeof channel === 'string' ? channel : channel.id, content, file);
        }

        const { config } = core;

        const colour = config.colours[type];
        const emoji = config.emojis[type];

        const toSend = <types.AdvancedMessageContent>{};

        if (typeof channel !== 'string' && (!(channel instanceof eris.PrivateChannel))) {
                const perms = channel.permissionsOf(core.eris.user.id);

                if (!perms.has('sendMessages')) {
                        return Promise.resolve(null);
                }

                if (perms.has('useExternalEmojis') && !config.disableEmojis) {
                        content = `<${emoji}> ` + content;
                }

                if (perms.has('embedLinks')) {
                        toSend.embed = {
                                description: <string>content,
                                color: colour
                        };
                } else {
                        toSend.content = <string>content;
                }
        } else {
                toSend.embed = {
                        description: <string>content,
                        color: colour
                };
        }

        return sendMessage(channel, toSend);
}

export function addReaction(
        channel: string | eris.TextableChannel,
        message: string | eris.Message,
        type: types.ResponseType
): Promise<void> {
        return _messageReaction(channel, message, type, 'addMessageReaction');
}

export function removeReaction(
        channel: string | eris.TextableChannel,
        message: string | eris.Message,
        type: types.ResponseType
): Promise<void> {
        return _messageReaction(channel, message, type, 'removeMessageReaction');
}

function _messageReaction(
        channel: string | eris.TextableChannel,
        message: string | eris.Message,
        type: types.ResponseType,
        method: 'addMessageReaction' | 'removeMessageReaction'
): Promise<void> {
        const core = Core.instance;

        if (typeof channel !== 'string' && (!(channel instanceof eris.PrivateChannel))) {
                const perms = channel.permissionsOf(core.eris.user.id);

                if (perms && !perms.has('useExternalEmojis')) {
                        return Promise.resolve(null);
                }
        }

        return core.eris[method](
                typeof channel === 'string' ? channel : channel.id,
                typeof message === 'string' ? message : message.id,
                core.config.emojis[type]
        );
}

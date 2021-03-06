import * as eris from 'eris';
import Command from '../../../core/structures/Command';
import Converter from '../../../core/helpers/Converter';
import type Moderator from '..';

export default new Command<Moderator>({
        name: 'lock',
        usage: '<channel> [duration=inf] [*reason]',
        info: 'Lock a server channel',
        examples: [
                'lock #general Server is getting quite chaotic!'
        ],
        cooldown: 8000,
        requiredArgs: 1,
        requiredPermissions: [
                'manageRoles',
                'manageChannels'
        ],
        execute: async function (ctx) {
                const converter = new Converter(ctx.app);

                try {
                        var channel = await converter.textChannel(ctx.guild, ctx.args[0]);
                } catch (err) {
                        return ctx.error(err);
                }

                if (!channel) {
                        return ctx.error(`Channel \`${ctx.args[0]}\` not found.`);
                }

                const overwrite = channel.permissionOverwrites.get(ctx.guild.id);

                let allow = overwrite?.allow || BigInt(0),
                        deny = overwrite?.deny || BigInt(0);

                if (overwrite) {
                        const perms = overwrite.json;

                        if (perms.sendMessages === false || perms.voiceConnect) {
                                return ctx.error('That channel is already locked.');
                        }

                        // i'm going to be honest, i don't really have any idea
                        // how discord permissions work. i find it hard to visualize
                        if (perms.sendMessages === true) {
                                allow ^= eris.Constants.Permissions.sendMessages;
                        }
                        if (perms.addReactions === true) {
                                allow ^= eris.Constants.Permissions.addReactions;
                        }
                        if (perms.voiceConnect === true) {
                                allow ^= eris.Constants.Permissions.voiceConnect;
                        }
                        if (perms.voiceSpeak === true) {
                                allow ^= eris.Constants.Permissions.voiceSpeak;
                        }

                        if (perms.sendMessages === undefined ||
                                perms.sendMessages === true) {
                                deny |= eris.Constants.Permissions.sendMessages;
                        }
                        if (perms.addReactions === undefined ||
                                perms.addReactions === true) {
                                deny |= eris.Constants.Permissions.addReactions;
                        }
                        if (perms.voiceConnect === undefined ||
                                perms.voiceConnect === true) {
                                deny |= eris.Constants.Permissions.voiceConnect;
                        }
                        if (perms.voiceSpeak === undefined ||
                                perms.voiceSpeak === true) {
                                deny |= eris.Constants.Permissions.voiceSpeak;
                        }
                }

                ctx.args.shift();

                const duration = converter.duration(ctx.args.shift());
                const reason = ctx.args.join(' ');

                const auditReason = (reason?.length ? reason : 'No reason provided') + ` | Moderator: ${ctx.author.id}`;

                try {
                        await ctx.eris.editChannelPermission(channel.id, ctx.guild.id, allow, deny, 0, auditReason);
                } catch (err) {
                        return ctx.error(err.toString());
                }

                ctx.module.createModlog(ctx, 'lock', duration, null, reason, ctx.author, null, channel);

                ctx.module.customResponse(ctx, 'lock', null, channel);
        }
});

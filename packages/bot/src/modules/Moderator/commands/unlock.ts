import * as eris from 'eris';
import Command from '../../../core/structures/Command';
import Converter from '../../../core/helpers/Converter';
import type Moderator from '..';

export default new Command<Moderator>({
        name: 'unlock',
        usage: '<channel> [*reason]',
        info: 'Unlock a server channel',
        examples: [
                'unlock #general',
                'unlock 828196138942857218 Welcome back!'
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

                const allow = overwrite?.allow || BigInt(0);

                let deny = overwrite?.deny || BigInt(0);

                if (overwrite) {
                        const perms = overwrite.json;

                        if (perms.sendMessages === undefined ||
                                perms.sendMessages === true
                                // perms.voiceConnect === undefined ||
                                // perms.voiceConnect === true
                        ) {
                                return ctx.error('That channel is already unlocked.');
                        }

                        deny = BigInt(overwrite.deny || 0);

                        if (perms.sendMessages === false) {
                                deny ^= eris.Constants.Permissions.sendMessages;
                        }
                        if (perms.addReactions === false) {
                                deny ^= eris.Constants.Permissions.addReactions;
                        }
                        if (perms.voiceConnect === false) {
                                deny ^= eris.Constants.Permissions.voiceConnect;
                        }
                        if (perms.voiceSpeak === false) {
                                deny ^= eris.Constants.Permissions.voiceSpeak;
                        }
                } else {
                        return ctx.error('That channel is already unlocked.');
                }

                ctx.args.shift();

                const reason = ctx.args.join(' ');

                const auditReason = (reason?.length ? reason : 'No reason provided') + ` | Moderator: ${ctx.author.id}`;

                try {
                        await ctx.eris.editChannelPermission(channel.id, ctx.guild.id, allow, deny, 0, auditReason);
                } catch (err) {
                        return ctx.error(err.toString());
                }

                ctx.module.createModlog(ctx, 'unlock', null, null, reason, ctx.author, null, channel);

                ctx.module.expireModlog(ctx, 'lock', null, channel);

                ctx.module.customResponse(ctx, 'unlock', null, channel);
        }
});

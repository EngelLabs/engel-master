import * as eris from 'eris';
import Command from '../../../core/structures/Command';
import Converter from '../../../core/helpers/Converter';
import type Moderator from '..';

export default new Command<Moderator>({
        name: 'unmute',
        usage: '<member> [*reason]',
        info: 'Unmute a server member',
        examples: [
                'unmute 338082875394097153 Not a meany anymore'
        ],
        cooldown: 3000,
        requiredArgs: 1,
        requiredPermissions: ['manageRoles'],
        execute: async function (ctx) {
                if (!ctx.guildConfig.muteRole || !ctx.guild.roles.get(ctx.guildConfig.muteRole)) {
                        return ctx.error(`This server doesn't have a mute role. See \`${ctx.prefix}help muterole\` to set one up.`);
                }

                const converter = new Converter(ctx.app);

                try {
                        var user = await converter.member(ctx.guild, ctx.args[0], true) ||
                                await converter.user(ctx.args[0], true);
                } catch (err) {
                        return ctx.error(err);
                }

                if (!user) return ctx.error(`User \`${ctx.args[0]}\` not found.`);

                if (!await ctx.module.isMuted(ctx, user)) {
                        return ctx.error('That user is not muted.');
                }

                ctx.args.shift();

                const reason = ctx.args.join(' ');

                const auditReason = (reason?.length ? reason : 'No reason provided') + ` | Moderator: ${ctx.author.id}`;

                if (user instanceof eris.User) {
                        try {
                                await ctx.eris.removeGuildMemberRole(ctx.guild.id, user.id, ctx.guildConfig.muteRole, auditReason);
                        } catch (err) {
                                return ctx.error(err.toString());
                        }
                }

                ctx.module.createModlog(ctx, 'unmute', null, null, reason, ctx.author, user, null);

                ctx.module.expireModlog(ctx, 'mute', user, null);

                ctx.module.customResponse(ctx, 'unmute', user, null);
        }
});

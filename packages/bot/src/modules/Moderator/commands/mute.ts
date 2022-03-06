import * as eris from 'eris';
import Command from '../../../core/structures/Command';
import Roles from '../../../core/helpers/Roles';
import Converter from '../../../core/helpers/Converter';
import type Moderator from '..';

export default new Command<Moderator>({
        name: 'mute',
        usage: '<member> [duration=inf] [*reason]',
        info: 'Mute a server member',
        cooldown: 3000,
        requiredArgs: 1,
        requiredPermissions: ['manageRoles', 'manageChannels'],
        execute: async function (ctx) {
                const roles = new Roles(ctx.core);

                try {
                        var role = await roles.resolveMuteRole(ctx.guild, ctx.guildConfig);
                } catch (err) {
                        return ctx.error(err);
                }

                const converter = new Converter(ctx.core);

                try {
                        var user = await converter.member(ctx.guild, ctx.args[0], true) ||
                                await converter.user(ctx.args[0], true);
                } catch (err) {
                        return ctx.error(err);
                }

                if (!user) return ctx.error(`User \`${ctx.args[0]}\` not found.`);

                if (await ctx.module.isMuted(ctx, user)) {
                        return ctx.error('That user is already muted.');
                }

                if (!ctx.module.canModerate(ctx, user, 'mute')) return;

                ctx.args.shift();

                const duration = converter.duration(ctx.args[0]);

                if (duration) ctx.args.shift();

                const reason = ctx.args.join(' ');

                ctx.module.sendDM(ctx, user, `You were muted in ${ctx.guild.name}`, duration, reason);

                const auditReason = (reason?.length ? reason : 'No reason provided') + ` | Moderator: ${ctx.author.id}`;

                if (user instanceof eris.User) {
                        try {
                                await ctx.eris.addGuildMemberRole(ctx.guild.id, user.id, role.id, auditReason);
                        } catch (err) {
                                return ctx.error(err.toString());
                        }
                }

                ctx.module.createModlog(ctx, 'mute', duration, null, reason, ctx.author, user, null);

                ctx.module.customResponse(ctx, 'mute', user, null);
        }
});

import Command from '../../../core/structures/Command';
import Converter from '../../../core/helpers/Converter';
import Moderator from '..';

export default new Command<Moderator>({
        name: 'unban',
        usage: '<user> [*reason]',
        info: 'Unban a server member',
        examples: [
                'unban 769350257430626325 You are forgiven'
        ],
        cooldown: 3000,
        requiredArgs: 1,
        requiredPermissions: ['banMembers'],
        execute: async function (ctx) {
                const converter = new Converter(ctx.core);

                try {
                        var user = await converter.user(ctx.args[0], true);
                } catch (err) {
                        return ctx.error(err);
                }

                if (!user) return ctx.error(`User \`${ctx.args[0]}\` not found.`);

                ctx.args.shift();

                const reason = ctx.args.join(' ');

                const auditReason = (reason && reason.length ? reason : 'No reason provided') + ` | Moderator: ${ctx.author.id}`;

                try {
                        await ctx.eris.unbanGuildMember(ctx.guild.id, user.id, auditReason);
                } catch (err) {
                        return ctx.error(err.toString());
                }

                ctx.module.createModlog(ctx, 'unban', null, null, reason, ctx.author, user, null);

                ctx.module.expireModlog(ctx, 'ban', user, null);

                ctx.module.customResponse(ctx, 'unban', user, null);
        }
});

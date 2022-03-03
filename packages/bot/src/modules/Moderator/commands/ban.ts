import Command from '../../../core/structures/Command';
import Converter from '../../../core/helpers/Converter';
import Moderator from '..';

export default new Command<Moderator>({
        name: 'ban',
        usage: '<user> [delete message days=2] [duration=inf] [*reason]',
        info: 'Ban a server member',
        examples: [
                'ban @aerro 1d Overly toxic',
                'ban 338082875394097153 7 Spamming in chat'
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

                if (!ctx.module.canModerate(ctx, user, 'ban')) return;

                ctx.args.shift();

                let deleteMessageDays = parseInt(ctx.args[0]);

                isNaN(deleteMessageDays) ? deleteMessageDays = 2 : ctx.args.shift();

                if (deleteMessageDays < 0 || deleteMessageDays > 7) {
                        return ctx.error(`\`delete message days\` must be a value between 0 and 7, not \`${deleteMessageDays}\``);
                }

                const duration = converter.duration(ctx.args[0]);

                if (duration) ctx.args.shift();

                const reason = ctx.args.join(' ');

                const auditReason = (reason?.length ? reason : 'No reason provided') + ` | Moderator: ${ctx.author.id}`;

                ctx.module.sendDM(ctx, user, `You were banned from ${ctx.guild.name}`, duration, reason);

                try {
                        await ctx.eris.banGuildMember(ctx.guild.id, user.id, deleteMessageDays, auditReason);
                } catch (err) {
                        return ctx.error(err.toString());
                }

                ctx.module.createModlog(ctx, 'ban', duration, null, reason, ctx.author, user, null);

                ctx.module.customResponse(ctx, 'ban', user, null);
        }
});

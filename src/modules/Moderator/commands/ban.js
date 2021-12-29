const Command = require('../../../core/structures/Command');


const ban = new Command({
    name: 'ban',
    usage: '<user> [delete message days=2] [duration=inf] [*reason]',
    info: 'Ban a server member',
    examples: [
        'ban @aerro 1d Overly toxic',
        'ban 338082875394097153 7 Spamming in chat',
    ],
    cooldown: 3000,
    requiredArgs: 1,
    requiredPermissions: ['banMembers'],
    execute: async function (ctx) {
        try {
            var user = await ctx.bot.helpers.converter.user(ctx, ctx.args[0]);
        } catch (err) {
            return ctx.error(err);
        }

        if (!user) return ctx.error(`User \`${ctx.args[0]}\` not found.`);

        const err = ctx.module.userProtectedCheck(ctx, user, 'ban');

        if (err) {
            return ctx.error(err);
        }

        ctx.args.shift();

        let deleteMessageDays = parseInt(ctx.args[0]);
        if (isNaN(deleteMessageDays)) {
            deleteMessageDays = 2;
        } else {
            ctx.args.shift();
        }

        if (deleteMessageDays < 0 || deleteMessageDays > 7) {
            return ctx.error(`\`delete message days\` must be a value between 1 and 7, not \`${deleteMessageDays}\``);
        }

        const duration = ctx.bot.helpers.converter.duration(ctx.args[0]);

        if (duration) ctx.args.shift();

        const reason = ctx.args.join(' ');

        ctx.module.sendDM(ctx, user, `You were banned from ${ctx.guild.name}`, duration, reason);

        const auditReason = (reason && reason.length ? reason : 'No reason provided') + ` | Moderator: ${ctx.author.id}`;

        try {
            await ctx.eris.banGuildMember(ctx.guild.id, user.id, deleteMessageDays, auditReason);
        } catch (err) {
            return ctx.error(err.toString());
        }

        ctx.module.createModeration({
            guildConfig: ctx.guildConfig,
            mod: ctx.author,
            user: user,
            type: 'ban',
            duration: duration,
            reason: reason,
        });

        ctx.module.deleteCommand(ctx);

        return ctx.success(`User **${user.username}#${user.discriminator}** banned.`);
    }
});


module.exports = ban;
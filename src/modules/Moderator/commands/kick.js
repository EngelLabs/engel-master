const Command = require('../../../core/structures/Command');


const kick = new Command({
    name: 'kick',
    usage: '<member> [*reason]',
    info: 'Kick a server member',
    examples: [
        'kick @Bob very bob',
    ],
    cooldown: 3000,
    requiredArgs: 1,
    requiredPermissions: ['kickMembers'],
    execute: async function (ctx) {
        try {
            var user = await ctx.bot.helpers.converter.member(ctx, ctx.args[0]);
        } catch (err) {
            return ctx.error(err);
        }

        if (!user) return ctx.error(`Member \`${ctx.args[0]}\` not found.`);

        const err = ctx.module.userProtectedCheck(ctx, user, 'kick');

        if (err) {
            return ctx.error(err);
        }

        ctx.args.shift();
        const reason = ctx.args.join(' ');

        ctx.module.sendDM(ctx, user, `You were kicked from ${ctx.guild.name}`, null, reason);

        const auditReason = (reason && reason.length ? reason : 'No reason provided') + ' | ' + `Moderator: ${ctx.author.id}`;

        try {
            await user.kickGuildMember(ctx.guild.id, user.id, auditReason);
        } catch (err) {
            return ctx.error(err.toString());
        }

        ctx.module.createModeration({
            guildConfig: ctx.guildConfig,
            mod: ctx.author,
            user: user,
            type: 'kick',
            reason: reason,
        });

        ctx.module.deleteCommand(ctx);

        return ctx.success(`User **${user.username}#${user.discriminator}** kicked.`);
    }
});


module.exports = kick;
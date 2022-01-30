const Command = require('../../../core/structures/Command');


const unban = new Command({
    name: 'unban',
    usage: '<user> [*reason]',
    info: 'Unban a server member',
    examples: [
        'unban 769350257430626325 You are forgiven',
    ],
    cooldown: 3000,
    requiredArgs: 1,
    requiredPermissions: ['banMembers'],
    execute: async function (ctx) {
        try {
            var user = await ctx.helpers.converter.user(ctx.args[0], true);
        } catch (err) {
            return ctx.error(err);
        }

        if (!user) return ctx.error(`User \`${ctx.args[0]}\` not found.`);

        ctx.args.shift()

        const reason = ctx.args.join(' ');

        const auditReason = (reason && reason.length ? reason : 'No reason provided') + ` | Moderator: ${ctx.author.id}`;

        try {
            await ctx.eris.unbanGuildMember(ctx.guild.id, user.id, auditReason);
        } catch (err) {
            return ctx.error(err.toString());
        }

        ctx.module.createModeration({
            guildConfig: ctx.guildConfig,
            mod: ctx.author,
            user: user,
            type: 'unban',
            reason: reason,
        });

        ctx.module.expireModeration({
            guild: ctx.guild.id,
            user: user,
            type: 'ban',
        });

        return ctx.success(`User **${user.username}#${user.discriminator}** unbanned.`);
    }
});


module.exports = unban;
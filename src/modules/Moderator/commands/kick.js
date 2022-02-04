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
                        var user = await ctx.helpers.converter.member(ctx.guild, ctx.args[0], true);
                } catch (err) {
                        return ctx.error(err);
                }

                if (!user) return ctx.error(`Member \`${ctx.args[0]}\` not found.`);

                if (!ctx.module.canModerate(ctx, user, 'kick')) return;

                ctx.args.shift();
                const reason = ctx.args.join(' ');

                ctx.module.sendDM(ctx, user, `You were kicked from ${ctx.guild.name}`, null, reason);

                const auditReason = (reason?.length ? reason : 'No reason provided') + ' | ' + `Moderator: ${ctx.author.id}`;

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

                return ctx.success(`User **${user.username}#${user.discriminator}** kicked.`);
        }
});


module.exports = kick;
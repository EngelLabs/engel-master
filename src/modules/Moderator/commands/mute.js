const Command = require('../../../core/structures/Command');


const mute = new Command({
        name: 'mute',
        usage: '<member> [duration=inf] [*reason]',
        info: 'Mute a server member',
        cooldown: 3000,
        requiredArgs: 1,
        requiredPermissions: ['manageRoles', 'manageChannels'],
        execute: async function (ctx) {
                try {
                        var role = await ctx.helpers.moderation.resolveMuteRole(ctx.guild, ctx.guildConfig);
                } catch (err) {
                        return ctx.error(err);
                }

                try {
                        // var user = (
                        //     await ctx.helpers.converter.member(ctx.guild, ctx.args[0], true) ||
                        //     await ctx.helpers.converter.user(args.args[0], true)
                        // );
                        var user = await ctx.helpers.converter.member(ctx.guild, ctx.args[0], true);
                } catch (err) {
                        return ctx.error(err);
                }

                if (!user) return ctx.error(`Member \`${ctx.args[0]}\` not found.`);

                if (user.roles.includes(role.id) || ctx.module.isMuted(ctx.guildConfig, user)) {
                        return ctx.error('That user is already muted.');
                }

                if (!ctx.module.canModerate(ctx, user, 'mute'));

                ctx.args.shift();

                const duration = ctx.helpers.converter.duration(ctx.args[0]);

                // if (duration && duration < 300) return ctx.error('Duration must be at least 5 minutes.');

                if (duration) ctx.args.shift();

                const reason = ctx.args.join(' ');

                ctx.module.sendDM(ctx, user, `You were muted in ${ctx.guild.name}`, duration, reason);

                const auditReason = (reason && reason.length ? reason : 'No reason provided') + ` | Moderator: ${ctx.author.id}`;

                try {
                        await ctx.eris.addGuildMemberRole(ctx.guild.id, user.id, role.id, auditReason);
                } catch (err) {
                        return ctx.error(err.toString());
                }

                ctx.module.createModeration({
                        guildConfig: ctx.guildConfig,
                        mod: ctx.author,
                        user: user,
                        type: 'mute',
                        duration: duration,
                        reason: reason,
                });

                return ctx.success(`User **${user.username}#${user.discriminator}** muted.`);
        }
});


module.exports = mute;
const Command = require('../../../core/structures/Command');


const unmute = new Command({
        name: 'unmute',
        usage: '<member> [*reason]',
        info: 'Unmute a server member',
        examples: [
                'unmute 338082875394097153 Not a meany anymore',
        ],
        cooldown: 3000,
        requiredArgs: 1,
        requiredPermissions: ['manageRoles'],
        execute: async function (ctx) {
                if (!ctx.guildConfig.muteRole ||
                        !ctx.guild.roles.get(ctx.guildConfig.muteRole)) {
                        return ctx.error(`This server doesn\'t have a mute role. See \`${ctx.prefix}help muterole\` to set one up.`);
                }

                const role = ctx.guild.roles.get(ctx.guildConfig.muteRole);

                try {
                        // var user = (
                        //     await ctx.helpers.converter.member(ctx, ctx.args[0]) ||
                        //     await ctx.helpers.converter.user(ctx, ctx.args[0])
                        // );
                        var user = await ctx.helpers.converter.member(ctx, ctx.args[0]);
                } catch (err) {
                        return ctx.error(err);
                }

                if (!user) return ctx.error(`User \`${ctx.args[0]}\` not found.`);

                if (!user.roles.includes(role.id) || !ctx.module.isMuted(ctx.guildConfig, user)) {
                        return ctx.error('That user is not muted.');
                }

                ctx.args.shift();

                const reason = ctx.args.join(' ');

                const auditReason = (reason && reason.length ? reason : 'No reason provided') + ` | Moderator: ${ctx.author.id}`;

                try {
                        await ctx.eris.removeGuildMemberRole(ctx.guild.id, user.id, role.id, auditReason);
                } catch (err) {
                        return ctx.error(err.toString());
                }

                ctx.module.createModeration({
                        guildConfig: ctx.guildConfig,
                        mod: ctx.author,
                        user: user,
                        type: 'unmute',
                        reason: reason,
                });

                ctx.module.expireModeration({
                        guild: ctx.guild.id,
                        user: user,
                        type: 'mute',
                });

                return ctx.success(`User **${user.username}#${user.discriminator}** unmuted.`);
        }
});


module.exports = unmute;
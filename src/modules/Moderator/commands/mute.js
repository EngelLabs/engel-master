const { Command } = require('@timbot/core');


const mute = new Command({
        name: 'mute',
        usage: '<member> [duration=inf] [*reason]',
        info: 'Mute a server member',
        cooldown: 3000,
        requiredArgs: 1,
        requiredPermissions: ['manageRoles', 'manageChannels'],
        execute: async function (ctx) {
                let role;

                try {
                        role = await ctx.helpers.moderation.resolveMuteRole(ctx.guild, ctx.guildConfig);
                } catch (err) {
                        return ctx.error(err);
                }

                let user;

                try {
                        user = await ctx.helpers.converter.member(ctx.guild, ctx.args[0], true) ||
                                await ctx.helpers.converter.user(ctx.args[0], true);
                } catch (err) {
                        return ctx.error(err);
                }

                if (!user) return ctx.error(`User \`${ctx.args[0]}\` not found.`);

                if (await ctx.module.isMuted(ctx, user)) {
                        return ctx.error('That user is already muted.');
                }

                if (!ctx.module.canModerate(ctx, user, 'mute'));

                ctx.args.shift();

                const duration = ctx.helpers.converter.duration(ctx.args[0]);

                if (duration) ctx.args.shift();

                const reason = ctx.args.join(' ');

                ctx.module.sendDM(ctx, user, `You were muted in ${ctx.guild.name}`, duration, reason);

                const auditReason = (reason?.length ? reason : 'No reason provided') + ` | Moderator: ${ctx.author.id}`;

                if (user.user) {
                        try {
                                await ctx.eris.addGuildMemberRole(ctx.guild.id, user.id, ctx.guildConfig.muteRole, auditReason);
                        } catch (err) {
                                return ctx.error(err.toString());
                        }
                }

                ctx.module.createModlog(ctx, 'mute', duration, null, reason, ctx.author, user, null);
                
                ctx.module.customResponse(ctx, 'mute', user, null);
        }
});


module.exports = mute;
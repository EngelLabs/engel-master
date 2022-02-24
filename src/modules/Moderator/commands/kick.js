const { Command } = require('@engel/core');


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
                        await ctx.eris.kickGuildMember(ctx.guild.id, user.id, auditReason);
                } catch (err) {
                        return ctx.error(err.toString());
                }

                ctx.module.createModlog(ctx, 'kick', null, null, reason, ctx.author, user, null);

                ctx.module.customResponse(ctx, 'kick', user, null);
        }
});


module.exports = kick;
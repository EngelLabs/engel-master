const Command = require('../../../core/structures/Command');
const { Permissions } = require('eris').Constants;


module.exports = new Command({
        name: 'unblock',
        usage: '<member> [channel] [*reason]',
        info: 'Unblock a server member from a channel',
        examples: [
                'unblock @A1pha #music-cmds',
                'unblock 329768023869358081 #general He said sorry lol.',
        ],
        cooldown: 3000,
        requiredArgs: 1,
        requiredPermissions: [
                'manageRoles',
                'manageChannels',
        ],
        execute: async function (ctx) {
                let user;

                try {
                        user = await ctx.helpers.converter.member(ctx, ctx.args[0]);
                } catch (err) {
                        return ctx.error(err);
                }

                if (!user) return ctx.error(`Member \`${ctx.args[0]}\` not found.`);

                ctx.args.shift();

                let channel;

                if (ctx.args.length) {
                        let errored = false;

                        try {
                                channel = await ctx.helpers.converter.channel(ctx, ctx.args[0]);
                        } catch (err) {
                                errored = true;
                        }

                        if (!errored && !channel) return ctx.error(`Channel \`${ctx.args[0]}\` not found.`);
                        if (channel) ctx.args.shift();
                }

                channel = channel || ctx.channel;

                const overwrite = channel.permissionOverwrites.get(user.id);
                let allow = overwrite && overwrite.allow || BigInt(0),
                        deny = overwrite && overwrite.deny || BigInt(0);

                if (overwrite) {
                        const perms = overwrite.json;

                        if (perms.viewChannel === undefined || perms.viewChannel === true) {
                                return ctx.error(`That user is already unblocked from ${channel.mention}`);
                        }

                        deny ^= Permissions.viewChannel;
                } else {
                        return ctx.error(`That user is already unblocked from ${channel.mention}`);
                }

                const reason = ctx.args.join(' ');

                const auditReason = (reason && reason.length ? reason : 'No reason provided') + ` | Moderator: ${ctx.author.id}`;

                try {
                        await ctx.eris.editChannelPermission(channel.id, user.id, allow, deny, 1, auditReason);
                } catch (err) {
                        return ctx.error(err.toString());
                }

                ctx.module.createModeration({
                        guildConfig: ctx.guildConfig,
                        mod: ctx.author,
                        type: 'unblock',
                        user: user,
                        channel: channel,
                        reason: reason,
                });

                ctx.module.expireModeration({
                        guild: ctx.guild.id,
                        user: user,
                        channel: channel,
                        type: 'block'
                });

                return ctx.success(`${user.username}#${user.discriminator} unblocked from ${channel.mention}.`);
        }
});
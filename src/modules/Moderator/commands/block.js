const Command = require('../../../core/structures/Command');
const { Permissions } = require('eris').Constants;


module.exports = new Command({
    name: 'block',
    usage: '<member> [channel] [duration=inf] [*reason]',
    info: 'Block a server member from viewing a channel',
    examples: [
        'block 329768023869358081 828010464133775392 2h Being disruptive to chat',
        'block @timtoy #bot-commands 10m Going too fast!',
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
            user = await ctx.bot.helpers.converter.member(ctx, ctx.args[0]);
        } catch (err) {
            return ctx.error(err);
        }

        if (!user) return ctx.error(`Member \`${ctx.args[0]}\` not found.`);

        const err = ctx.module.userProtectedCheck(ctx, user, 'block');

        if (err) {
            return ctx.error(err);
        }

        ctx.args.shift();

        let channel;

        if (ctx.args.length) {
            let errored = false;

            try {
                channel = await ctx.bot.helpers.converter.channel(ctx, ctx.args[0]);
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

            if (perms.viewChannel === false) {
                return ctx.error(`That user is already blocked from ${channel.mention}.`);
            }

            if (perms.viewChannel === true) {
                allow ^= Permissions.viewChannel;
            } else {
                deny |= Permissions.viewChannel;
            }
        } else {
            deny = Permissions.viewChannel;
        }

        const duration = ctx.bot.helpers.converter.duration(ctx.args.shift());
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
            type: 'block',
            user: user,
            channel: channel,
            duration: duration,
            reason: reason,
        });

        ctx.module.deleteCommand(ctx);

        return ctx.success(`${user.username}#${user.discriminator} blocked from ${channel.mention}.`);
    }
})
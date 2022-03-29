"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eris = require("eris");
const Command_1 = require("../../../core/structures/Command");
const Converter_1 = require("../../../core/helpers/Converter");
exports.default = new Command_1.default({
    name: 'block',
    usage: '<member> [channel] [duration=inf] [*reason]',
    info: 'Block a server member from viewing a channel',
    examples: [
        'block 329768023869358081 828010464133775392 2h Being disruptive to chat',
        'block @timtoy #bot-commands 10m Going too fast!'
    ],
    cooldown: 3000,
    requiredArgs: 1,
    requiredPermissions: [
        'manageRoles',
        'manageChannels'
    ],
    execute: async function (ctx) {
        const converter = new Converter_1.default(ctx.core);
        try {
            var user = await converter.member(ctx.guild, ctx.args[0], true);
        }
        catch (err) {
            return ctx.error(err);
        }
        if (!user)
            return ctx.error(`Member \`${ctx.args[0]}\` not found.`);
        if (!ctx.module.canModerate(ctx, user, 'block'))
            return;
        ctx.args.shift();
        let channel;
        if (ctx.args.length) {
            let errOccured = false;
            try {
                channel = await converter.channel(ctx.guild, ctx.args[0]);
            }
            catch (err) {
                errOccured = true;
            }
            if (!errOccured && !channel)
                return ctx.error(`Channel \`${ctx.args[0]}\` not found.`);
            if (channel)
                ctx.args.shift();
        }
        channel = channel || ctx.channel;
        const overwrite = channel.permissionOverwrites.get(user.id);
        let allow = overwrite?.allow || BigInt(0), deny = overwrite?.deny || BigInt(0);
        if (overwrite) {
            const perms = overwrite.json;
            if (perms.viewChannel === false) {
                return ctx.error(`That user is already blocked from ${channel.mention}.`);
            }
            if (perms.viewChannel === true) {
                allow ^= eris.Constants.Permissions.viewChannel;
            }
            else {
                deny |= eris.Constants.Permissions.viewChannel;
            }
        }
        else {
            deny = eris.Constants.Permissions.viewChannel;
        }
        const duration = converter.duration(ctx.args[0]);
        if (duration)
            ctx.args.shift();
        const reason = ctx.args.join(' ');
        const auditReason = (reason?.length ? reason : 'No reason provided') + ` | Moderator: ${ctx.author.id}`;
        ctx.module.sendDM(ctx, user, `You were blocked from #${channel.name} in ${ctx.guild.name}`, duration, reason);
        try {
            await ctx.eris.editChannelPermission(channel.id, user.id, allow, deny, 1, auditReason);
        }
        catch (err) {
            return ctx.error(err.toString());
        }
        ctx.module.createModlog(ctx, 'block', duration, null, reason, ctx.author, user, channel);
        ctx.module.customResponse(ctx, 'block', user, channel);
    }
});
//# sourceMappingURL=block.js.map
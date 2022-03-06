import * as eris from 'eris';
import Command from '../../../core/structures/Command';
import Converter from '../../../core/helpers/Converter';
import type Moderator from '..';

export default new Command<Moderator>({
        name: 'unblock',
        usage: '<member> [channel] [*reason]',
        info: 'Unblock a server member from a channel',
        examples: [
                'unblock @A1pha #music-cmds',
                'unblock 329768023869358081 #general He said sorry lol.'
        ],
        cooldown: 3000,
        requiredArgs: 1,
        requiredPermissions: [
                'manageRoles',
                'manageChannels'
        ],
        execute: async function (ctx) {
                const converter = new Converter(ctx.core);

                try {
                        var user = await converter.member(ctx.guild, ctx.args[0], true);
                } catch (err) {
                        return ctx.error(err);
                }

                if (!user) return ctx.error(`Member \`${ctx.args[0]}\` not found.`);

                ctx.args.shift();

                if (ctx.args.length) {
                        let errored = false;

                        try {
                                var channel = await converter.channel(ctx.guild, ctx.args[0]);
                        } catch (err) {
                                errored = true;
                        }

                        if (!errored && !channel) return ctx.error(`Channel \`${ctx.args[0]}\` not found.`);
                        if (channel) ctx.args.shift();
                }

                channel = channel || (<eris.TextChannel>ctx.channel);

                const overwrite = channel.permissionOverwrites.get(user.id);

                const allow = overwrite?.allow || BigInt(0);

                let deny = overwrite?.deny || BigInt(0);

                if (overwrite) {
                        const perms = overwrite.json;

                        if (perms.viewChannel === undefined || perms.viewChannel === true) {
                                return ctx.error(`That user is already unblocked from ${channel.mention}`);
                        }

                        deny ^= eris.Constants.Permissions.viewChannel;
                } else {
                        return ctx.error(`That user is already unblocked from ${channel.mention}`);
                }

                const reason = ctx.args.join(' ');

                const auditReason = (reason?.length ? reason : 'No reason provided') + ` | Moderator: ${ctx.author.id}`;

                try {
                        await ctx.eris.editChannelPermission(channel.id, user.id, allow, deny, 1, auditReason);
                } catch (err) {
                        return ctx.error(err.toString());
                }

                ctx.module.createModlog(ctx, 'unblock', null, null, reason, ctx.author, user, channel);

                ctx.module.expireModlog(ctx, 'block', user, channel);

                ctx.module.customResponse(ctx, 'unblock', user, channel);
        }
});

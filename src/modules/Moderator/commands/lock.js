const Command = require('../../../structures/Command');
const { Permissions } = require('eris').Constants;


module.exports = new Command({
    name: 'lock',
    usage: '<channel> [duration=inf] [*reason]',
    info: 'Lock a server channel',
    examples: [
        'lock #general Server is getting quite chaotic!',
    ],
    cooldown: 8000,
    requiredArgs: 1,
    requiredPermissions: [
        'manageRoles',
        'manageChannels',
    ],
    execute: async function (ctx) {
        let channel;
        
        try {
            channel = await ctx.bot.converter.textChannel(ctx, ctx.args[0]);
        } catch (err) {
            return ctx.error(err);
        }

        if (!channel) {
            return ctx.error(`Channel \`${ctx.args[0]}\` not found.`)
        }

        const overwrite = channel.permissionOverwrites.get(ctx.guild.id);
        let allow = overwrite && overwrite.allow || BigInt(0),
            deny = overwrite && overwrite.deny || BigInt(0);

        if (overwrite) {
            const perms = overwrite.json;

            if (perms.sendMessages === false
                // perms.voiceConnect === false
                ) {
                    return ctx.error('That channel is already locked.');
                }

            // i'm going to be honest, i don't really have any idea
            // how discord permissions work. i find it hard to visualize
            if (perms.sendMessages === true) {
                allow ^= Permissions.sendMessages;
            }
            if (perms.addReactions === true) {
                allow ^= Permissions.addReactions;
            }
            if (perms.voiceConnect === true) {
                allow ^= Permissions.voiceConnect;
            }
            if (perms.voiceSpeak === true) {
                allow ^= Permissions.voiceSpeak;
            }

            if (perms.sendMessages === undefined ||
                perms.sendMessages === true) {
                deny |= Permissions.sendMessages;
            }
            if (perms.addReactions === undefined ||
                perms.addReactions === true) {
                deny |= Permissions.addReactions;
            }
            if (perms.voiceConnect === undefined ||
                perms.voiceConnect === true) {
                deny |= Permissions.voiceConnect;
            }
            if (perms.voiceSpeak === undefined ||
                perms.voiceSpeak === true) {
                deny |= Permissions.voiceSpeak;
            }
        }

        ctx.args.shift();

        const duration = ctx.bot.converter.duration(ctx.args.shift());
        const reason = ctx.args.join(' ');

        const auditReason = (reason && reason.length ? reason : 'No reason provided') + ` | Moderator: ${ctx.author.id}`;

        try {
            await ctx.eris.editChannelPermission(channel.id, ctx.guild.id, allow, deny, 0, auditReason);
        } catch (err) {
            return ctx.error(err.toString());
        }

        ctx.module.createModeration({
            guildConfig: ctx.guildConfig,
            mod: ctx.author,
            type: 'lock',
            channel: channel,
            duration: duration,
            reason: reason,
        });
        
        ctx.module.deleteCommand(ctx);

        return ctx.success(`Channel ${channel.mention} locked.`);
    }
});
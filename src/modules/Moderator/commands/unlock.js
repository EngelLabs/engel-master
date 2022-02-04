const Command = require('../../../core/structures/Command');
const { Permissions } = require('eris').Constants;


module.exports = new Command({
        name: 'unlock',
        usage: '<channel> [*reason]',
        info: 'Unlock a server channel',
        examples: [
                'unlock #general',
                'unlock 828196138942857218 Welcome back!',
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
                        channel = await ctx.helpers.converter.textChannel(ctx.guild, ctx.args[0]);
                } catch (err) {
                        return ctx.error(err);
                }

                if (!channel) {
                        return ctx.error(`Channel \`${ctx.args[0]}\` not found.`)
                }

                const overwrite = channel.permissionOverwrites.get(ctx.guild.id);
                let allow = overwrite?.allow || BigInt(0),
                        deny = overwrite?.deny || BigInt(0);

                if (overwrite) {
                        const perms = overwrite.json;

                        if (perms.sendMessages === undefined ||
                                perms.sendMessages === true
                                // perms.voiceConnect === undefined ||
                                // perms.voiceConnect === true
                        ) {
                                return ctx.error('That channel is already unlocked.');
                        }

                        deny = BigInt(overwrite.deny || 0);

                        if (perms.sendMessages === false) {
                                deny ^= Permissions.sendMessages;
                        }
                        if (perms.addReactions === false) {
                                deny ^= Permissions.addReactions;
                        }
                        if (perms.voiceConnect === false) {
                                deny ^= Permissions.voiceConnect;
                        }
                        if (perms.voiceSpeak === false) {
                                deny ^= Permissions.voiceSpeak;
                        }
                } else {
                        return ctx.error('That channel is already unlocked.');
                }

                ctx.args.shift();

                const reason = ctx.args.join(' ');

                const auditReason = (reason?.length ? reason : 'No reason provided') + ` | Moderator: ${ctx.author.id}`;

                try {
                        await ctx.eris.editChannelPermission(channel.id, ctx.guild.id, allow, deny, 0, auditReason);
                } catch (err) {
                        return ctx.error(err.toString());
                }

                ctx.module.createModeration({
                        guildConfig: ctx.guildConfig,
                        mod: ctx.author,
                        type: 'unlock',
                        channel: channel,
                        reason: reason,
                });

                ctx.module.expireModeration({
                        guild: ctx.guild.id,
                        channel: channel,
                        type: 'lock',
                });

                return ctx.success(`Channel ${channel.mention} unlocked.`);
        }
});
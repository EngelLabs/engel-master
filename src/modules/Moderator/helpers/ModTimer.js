const { Base } = require('@timbot/core');
const { Permissions } = require('eris').Constants;


/**
 * @class ModTimer
 * @extends Base
 * Moderation timer handler
 */
class ModTimer extends Base {
        constructor(bot) {
                super(bot);

                return this._handle.bind(this);
        }

        /**
         * Find and handle expired timers
         * @returns {Promise<void>}
         */
        async _handle() {
                if (!this.bot.isReady) return;

                let modlogs;

                try {
                        modlogs = await this.models.ModLog.find({ expiry: { $lte: Date.now() } });
                } catch (err) {
                        this.log(err, 'error');

                        return;
                }

                if (!modlogs || !modlogs.length) return;

                for (const modlog of modlogs) {
                        try {
                                const key = modlog.type.split(' ')[0];

                                if (this[key]) {
                                        this[key](modlog);

                                        this.log(`${key} timer handled G${modlog.guild}.`);
                                        this.models.ModLog
                                                .updateOne({ _id: modlog._id }, { $unset: { expiry: null } })
                                                .exec();
                                } else {
                                        this.log(`Skipping unknown timer ${key}`);
                                }
                        } catch (err) {
                                this.log(err, 'error');
                        }
                }
        }

        async mute({ guild, user }) {
                guild = this.eris.guilds.get(guild);

                if (!guild) return;

                if (!this.helpers.permissions.hasGuildPermissions(guild, 'manageRoles')) return;

                const guildConfig = await this.bot.guilds.getOrFetch(guild.id);
                if (!guildConfig || !this._isEnabled(guildConfig)) return;

                const muteRole = guildConfig.muteRole;
                if (!muteRole) return;

                const member = guild.members.get(user.id);
                if (!member) return;

                if (member.roles.includes(muteRole)) {
                        this.eris.removeGuildMemberRole(guild.id, member.id, muteRole, 'module: Moderator. Auto unmute')
                                .then(() => {
                                        this.helpers.moderation.createModlog(
                                                guildConfig,
                                                'unmute [Auto]',
                                                null,
                                                null,
                                                null,
                                                member,
                                                this.eris.user,
                                                null,
                                        );
                                })
                                .catch(() => false);
                }
        }

        async ban({ guild, user }) {
                guild = this.eris.guilds.get(guild);

                if (!guild) return;

                if (!this.helpers.permissions.hasGuildPermissions(guild, 'banMembers')) return;

                const guildConfig = await this.bot.guilds.getOrFetch(guild.id);

                if (!guildConfig || !this._isEnabled(guildConfig)) return;

                this.eris.unbanGuildMember(guild.id, user.id, 'module: Moderator. Auto unban')
                        .then(() => {
                                this.helpers.moderation.createModlog(
                                        guildConfig,
                                        'unban [Auto]',
                                        null,
                                        null,
                                        null,
                                        user,
                                        this.eris.user,
                                        null,
                                );
                        })
                        .catch(() => false);
        }

        async lock({ guild, channel }) {
                guild = this.eris.guilds.get(guild);

                if (!guild) return;

                channel = guild.channels.get(channel.id);

                if (!channel) return;

                if (!this.helpers.permissions.hasGuildPermissions(guild, 'manageChannels', 'manageRoles')) return;

                const guildConfig = await this.bot.guilds.getOrFetch(guild.id);

                if (!guildConfig || !this._isEnabled(guildConfig)) return;

                let overwrite = channel.permissionOverwrites.get(guild.id);
                let allow = overwrite.allow || BigInt(0),
                        deny = overwrite.deny || BigInt(0);

                if (overwrite) {
                        const perms = overwrite.json;

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
                }

                this.eris.editChannelPermission(channel.id, guild.id, allow, deny, 0, 'module: Moderator. Automatic unlock')
                        .then(() => {
                                this.helpers.moderation.createModlog(
                                        guildConfig,
                                        'unlock [Auto]',
                                        null,
                                        null,
                                        null,
                                        null,
                                        this.eris.user,
                                        channel,
                                );
                        })
                        .catch(() => false);
        }

        async block({ guild, channel, user }) {
                guild = this.eris.guilds.get(guild);

                if (!guild) return;

                channel = guild.channels.get(channel.id);

                if (!channel) return;

                if (!this.helpers.permissions.hasGuildPermissions(guild, 'manageChannels', 'manageRoles')) return;

                const guildConfig = await this.bot.guilds.getOrFetch(guild.id);

                if (!guildConfig || !this._isEnabled(guildConfig)) return;

                let overwrite = channel.permissionOverwrites.get(user.id);
                let allow = overwrite?.allow || BigInt(0),
                        deny = overwrite?.deny || BigInt(0);

                if (overwrite?.json?.viewChannel === false) {
                        deny ^= Permissions.viewChannel;
                } else {
                        return;
                }

                this.eris.editChannelPermission(channel.id, user.id, allow, deny, 1, 'module: Moderator. Automatic unblock')
                        .then(() => {
                                this.helpers.moderation.createModlog(
                                        guildConfig,
                                        'unblock [Auto]',
                                        null,
                                        null,
                                        null,
                                        user,
                                        this.eris.user,
                                        channel,
                                );
                        })
                        .catch(() => false);
        }

        _isEnabled(guildConfig) {
                if (!guildConfig.mod) {
                        return true;
                }

                return !guildConfig.mod.disabled;
        }
}


module.exports = ModTimer;
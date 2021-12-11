const Module = require('../../structures/Module');
const ModLog = require('../../models/ModLog');
const prettyMS = require('pretty-ms');
const { Permissions } = require('eris').Constants;


const hierarchyError = 'My highest role\'s position isn\'t high enough to {action} this user.';


class Moderator extends Module {
    constructor() {
        super();

        this.dbName = 'mod';
        this.aliases = ['mod', 'moderation'];
        this.info = 'Enable command-based moderation for your server';
    }

    injectHook() {
        this.tasks = [];
        this.tasks.push(
            [this.checkTimers.bind(this), 15000],
        );
    }

    commandCheck(ctx) {
        return (
            ctx.bot.checks.isOwner(ctx) ||
            ctx.bot.checks.isServerAdmin(ctx) ||
            ctx.bot.checks.canInvoke(ctx)
        );
    }

    /**
     * Find and handle expired timers
     * @returns {Promise<void>}
     */
    async checkTimers() {
        if (!this.bot.ready) return;

        let modlogs;

        try {
            modlogs = await ModLog.find({ expiry: { $lte: Date.now() } });
        } catch (err) {
            this.logger.error(err);
            return;
        }

        if (!modlogs || !modlogs.length) return;

        for (const modlog of modlogs) {
            const key = 'timer_' + modlog.type.split(' ')[0];
            if (!this[key]) continue;

            this[key](modlog);
            this.logger.info(`[Modules.Moderator] ${key} timer handled G${modlog.guild}.`);
            ModLog
                .updateOne({ _id: modlog._id }, { $unset: { expiry: null } })
                .exec();
        }
    }

    userProtectedCheck(ctx, member, action) {
        action = action || 'moderate';

        if (member.id === ctx.author.id) {
            return `You cannot ${action} yourself.`;
        }

        // apparently "protected" is a reserved word in strict mode
        const _protected = [
            ctx.guild.ownerID,
            ...ctx.config.users.protected,
        ];

        if (_protected.includes(member.id)) {
            return 'That user is protected.';
        }

        const perms = member.permissions;

        if (perms) {
            if (perms.has('manageGuild') || perms.has('administrator')) {
                return 'That user is a server admin.';
            }

            if (perms.has('banMembers') || perms.has('kickMembers')) {
                return 'That user is a server moderator.';
            }
        }

        if (member.roles && member.roles.length) {
            const roles = member.guild.roles;
            const topRole = ctx.topRole;

            if (typeof topRole !== 'undefined') {
                for (const roleId of member.roles) {
                    const role = roles.get(roleId);
                    if (role && role.position >= topRole.position) {
                        return hierarchyError.replace('{action}', action);
                    }
                }
            }

            if (ctx.commandConfig &&
                ctx.commandConfig.protectedRoles &&
                ctx.commandConfig.protectedRoles.length) {
                for (const roleId of ctx.commandConfig.protectedRoles) {
                    if (member.roles.includes(roleId)) {
                        return 'That user is protected.';
                    }
                }
            } else if (!ctx.commandConfig || !ctx.commandConfig.protectedRoles) {
                if (ctx.moduleConfig &&
                    ctx.moduleConfig.protectedRoles &&
                    ctx.moduleConfig.protectedRoles.length) {
                    for (const roleId of ctx.moduleConfig.protectedRoles) {
                        if (member.roles.includes(roleId)) {
                            return 'That user is protected.';
                        }
                    }
                }
            }
        }

        return false;
    }

    deleteCommand({ message, guildConfig, moduleConfig, commandConfig }) {
        return new Promise(resolve => {
            const del = () => {
                message.delete()
                    .then(() => resolve())
                    .catch(() => resolve());
            }

            if (commandConfig) {
                if (commandConfig.delCommand === false) return resolve();
                else if (commandConfig.delCommand === true) {
                    return del();
                }
            } else if (moduleConfig) {
                if (moduleConfig.delCommand === false) return resolve();
                else if (moduleConfig.delCommand === true) {
                    return del();
                }
            }

            if (guildConfig.delCommand === true) {
                return del();
            }

            resolve();
        });
    }

    sendDM(ctx, user, msg, duration, reason) {
        return new Promise(resolve => {
            if (ctx.moduleConfig &&
                ctx.moduleConfig.dmUser) {
                user = user.user || user;

                user.getDMChannel()
                    .then(channel => {
                        if (!channel) return resolve();

                        if (duration) {
                            msg += `\nDuration: ${prettyMS(duration * 1000, { verbose: true })}.`;
                        }

                        if (ctx.moduleConfig.includeReason && reason !== null) {
                            msg += `\nReason: ${reason && reason.length ? reason : 'N/A'}`;
                        }

                        const embed = {
                            description: msg,
                            color: this.bot.config.colours.error
                        };

                        channel.createMessage({ embeds: [embed] })
                            .then(() => {
                                this.logger.info(`[Modules.Moderator] User ${user.id} DM'ed G${ctx.guild.id}.`);
                                resolve();
                            })
                            .catch(resolve);
                    })
                    .catch(resolve);

            } else resolve();
        });
    }

    /**
     * Create a moderation
     * @param {Object} obj Param
     * @param {Object} obj.guildConfig Guild configuration
     * @param {String} obj.mod Moderator responsible for action
     * @param {String?} obj.user The user being moderated
     * @param {Channel?} obj.channel The channel being moderated
     * @param {String} obj.type The type of moderation
     * @param {Number?} obj.duration Optional duration
     * @param {String?} obj.reason Optional reason
     * @returns {Promise<any>}
     */
    createModeration({ guildConfig, mod, user, channel, type, duration, count, reason }) {
        return new Promise((resolve, reject) => {

            const caseCount = guildConfig.caseCount = guildConfig.caseCount || 0;
            guildConfig.caseCount += 1;

            this.bot.guilds.update(guildConfig.id, { $inc: { 'caseCount': 1 } });

            mod = {
                id: mod.id,
                name: mod.name || (mod.username + '#' + mod.discriminator)
            };

            if (user) {
                user = {
                    id: user.id,
                    name: user.name || (user.username + '#' + user.discriminator)
                };
            }

            if (channel) {
                channel = {
                    id: channel.id,
                    name: channel.name,
                };
            }

            const data = {
                case: caseCount,
                type: type,
                guild: guildConfig.id,
                mod: mod,
            };

            if (user) {
                data.user = user;
            }

            if (channel) {
                data.channel = channel;
            }

            if (reason && reason.length) {
                data.reason = reason;
            }

            if (count) {
                data.count = count;
            }

            if (duration) {
                data.duration = duration * 1000;
                data.expiry = Date.now() + duration * 1000;
            }

            this.logger.info(`[Modules.Moderator] Created modlog C${caseCount} G${guildConfig.id}.`);

            ModLog.create(data)
                .then(resolve)
                .catch(reject);
        });
    }

    expireModeration({ guild, user, channel, type }) {
        const filter = { guild, type };

        if (user) {
            filter['user.id'] = user.id;
        }

        if (channel) {
            filter['channel.id'] = channel.id;
        }

        return new Promise((resolve, reject) => {
            ModLog.find(filter)
                .lean()
                .exec()
                .then(modlogs => {
                    if (!modlogs || !modlogs.length) return resolve();

                    const modlog = modlogs.reduce((prev, curr) => {
                        return curr.case > prev.case ? curr : prev;
                    });

                    this.logger.info(`[Modules.Moderator] Expired moderation "${type}" U${user.id} G${guild.id}.`);

                    ModLog
                        .updateOne({ _id: modlog._id }, { $unset: { expiry: null } })
                        .exec()
                        .then(resolve)
                        .catch(reject);
                })
                .catch(reject);
        });
    }

    isMuted(guildConfig, member) {
        return (
            guildConfig.muteRole &&
            member.roles &&
            member.roles.includes(guildConfig.muteRole)
        );
    }

    async resolveMuteRole(guild, guildConfig) {
        let role;

        if (guildConfig.muteRole) {
            role = guild.roles.get(guildConfig.muteRole);

            if (role) return Promise.resolve(role);
        }

        try {
            role = await this.bot.helper.createMuteRole(guild, guildConfig);
        } catch (err) {
            return Promise.reject(err);
        }

        return Promise.resolve(role);
    }

    /**
     * Purge messages from a channel
     * @param {Object} obj Param
     * @param {Object} obj.channel Channel object
     * @param {Object} obj.type Type of purge
     * @param {Object} obj.mod Responsible moderator
     * @param {Number} obj.count Number of messages to purge
     * @param {Function<Boolean>?} obj.check Function returning boolean
     * @param {String?} obj.reason Reason for purge
     * @returns {Promise<String?>}
     */
    async purge({ guildConfig, channel, type, mod, count, before, check, reason }) {
        const limit = parseInt(count || 100, 10);

        if (isNaN(limit) || count <= 0 || count > 1000) {
            return Promise.reject(`Count \`${count}\` is invalid.`);
        }

        if (!check) check = () => true;

        const opts = { limit };

        if (before) opts.before = before;

        let messages = await this.eris.getMessages(channel.id, opts);

        messages = messages
            .filter(msg => {
                if (msg.pinned) return false;
                if (msg.timestamp &&
                    (Date.now() - msg.timestamp) > (14 * 24 * 60 * 60 * 1000)) return false;

                return check(msg);
            })
            .map(({ id }) => id);

        if (!messages.length) {
            return Promise.resolve();
        }

        type = type ? `purge [${type}]` : 'purge';
        const auditReason = (reason && reason.length ? reason : 'No reason provided') + ` | Moderator: ${mod.id}`;

        return this.eris.deleteMessages(channel.id, messages, auditReason)
            .then(() => {
                this.logger.info(`[Modules.Moderator] Purged ${count} CH${channel.id} G${guildConfig.id}.`);
                this.createModeration({
                    guildConfig: guildConfig,
                    mod: mod,
                    channel: channel,
                    type: type,
                    count: limit,
                    reason: reason
                });
            });
    }

    async timer_mute({ guild, user }) {
        guild = this.eris.guilds.get(guild);

        if (!guild) return;

        if (!this.bot.checks.hasGuildPermissions(guild, 'manageRoles')) return;

        const guildConfig = await this.bot.guilds.getOrFetch(guild.id);
        if (!guildConfig || !this.bot.checks.moduleIsEnabled(this.dbName, guildConfig)) return;

        const muteRole = guildConfig.muteRole;
        if (!muteRole) return;

        const member = guild.members.get(user.id);
        if (!member) return;

        if (member.roles.includes(muteRole)) {
            this.eris.removeGuildMemberRole(guild.id, member.id, muteRole, 'module: Moderator. Auto unmute')
                .then(() => {
                    this.createModeration({
                        guildConfig: guildConfig,
                        mod: this.eris.user,
                        user: member,
                        type: 'unmute [Auto]',
                    });
                })
                .catch(() => false);
        }
    }

    async timer_ban({ guild, user }) {
        guild = this.eris.guilds.get(guild);

        if (!guild) return;

        if (!this.bot.checks.hasGuildPermissions(guild, 'banMembers')) return;

        const guildConfig = await this.bot.guilds.getOrFetch(guild.id);

        if (!guildConfig || !this.bot.checks.moduleIsEnabled(this.dbName, guildConfig)) return;

        this.eris.unbanGuildMember(guild.id, user.id, 'module: Moderator. Auto unban')
            .then(() => {
                this.createModeration({
                    guildConfig: guildConfig,
                    mod: this.eris.user,
                    user: user,
                    type: 'unban [Auto]',
                });
            })
            .catch(() => false);
    }

    async timer_lock({ guild, channel }) {
        guild = this.eris.guilds.get(guild);

        if (!guild) return;

        channel = guild.channels.get(channel.id);

        if (!channel) return;

        if (!this.bot.checks.hasGuildPermissions(guild, 'manageChannels', 'manageRoles')) return;

        const guildConfig = await this.bot.guilds.getOrFetch(guild.id);

        if (!guildConfig || !this.bot.checks.moduleIsEnabled(this.dbName, guildConfig)) return;

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
                this.createModeration({
                    guildConfig: guildConfig,
                    mod: this.eris.user,
                    channel: channel,
                    type: 'unlock [Auto]',
                });
            })
            .catch(() => false);
    }

    async timer_block({ guild, channel, user }) {
        guild = this.eris.guilds.get(guild);

        if (!guild) return;

        channel = guild.channels.get(channel.id);

        if (!channel) return;

        if (!this.bot.checks.hasGuildPermissions(guild, 'manageChannels', 'manageRoles')) return;

        const guildConfig = await this.bot.guilds.getOrFetch(guild.id);

        if (!guildConfig || !this.bot.checks.moduleIsEnabled(this.dbName, guildConfig)) return;

        let overwrite = channel.permissionOverwrites.get(user.id);
        let allow = overwrite && overwrite.allow || BigInt(0),
            deny = overwrite && overwrite.deny || BigInt(0);

        if (overwrite && overwrite.json.viewChannel === false) {
            deny ^= Permissions.viewChannel;
        } else {
            return;
        }

        this.eris.editChannelPermission(channel.id, user.id, allow, deny, 1, 'module: Moderator. Automatic unblock')
            .then(() => {
                this.createModeration({
                    guildConfig: guildConfig,
                    mod: this.eris.user,
                    user: user,
                    channel: channel,
                    type: 'unblock [Auto]',
                });
            })
            .catch(() => false);
    }
}


module.exports = Moderator
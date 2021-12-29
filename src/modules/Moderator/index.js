const Module = require('../../core/structures/Module');
const prettyMS = require('pretty-ms');
const reload = require('require-reload')(require);
const TimerHandler = reload('./TimerHandler');


const hierarchyError = 'My highest role\'s position isn\'t high enough to {action} this user.';


class Moderator extends Module {
    constructor() {
        super();

        this.dbName = 'mod';
        this.aliases = ['mod', 'moderation'];
        this.info = 'Enable command-based moderation for your server';
    }

    injectHook() {
        const timerHandler = new TimerHandler(this);

        this.tasks = [
            [timerHandler, 15000],
        ];
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

            if (topRole) {
                if (member.roles.find(id => {
                    const r = roles.get(id);

                    if (r && r.position >= topRole.position) {
                        return true;
                    }
                })) return hierarchyError.replace('{action}', action);
            }

            if (ctx.commandConfig &&
                ctx.commandConfig.protectedRoles &&
                ctx.commandConfig.protectedRoles.length) {
                const protectedRoles = ctx.commandConfig.protectedRoles;
                if (member.roles.find(id => protectedRoles.includes(id))) {
                    return 'That user is protected.';
                }
            } else {
                if (ctx.moduleConfig &&
                    ctx.moduleConfig.protectedRoles &&
                    ctx.moduleConfig.protectedRoles.length) {
                    const protectedRoles = ctx.moduleConfig.protectedRoles;
                    if (member.roles.find(id => protectedRoles.includes(id))) {
                        return 'That user is protected.';
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

            this.models.ModLog.create(data)
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
            this.models.ModLog.find(filter)
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
            role = await this.bot.helpers.moderation.createMuteRole(guild, guildConfig);
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

    _isEnabled(guildConfig) {
        if (!guildConfig.mod) return false;

        return !guildConfig.mod.disabled;
    }
}


module.exports = Moderator;